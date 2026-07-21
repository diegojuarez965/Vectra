import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { ExerciseFeedback, Phase } from "../lib/definitions";

// Fase del ejercicio

const LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// Visibilidad mínima para considerar una articulación como "confiable" en el análisis
const VISIBILITY_THRESHOLD = 0.65;

// Función para verificar la visibilidad de una articulación
const isReliable = (landmark: NormalizedLandmark | undefined): boolean => {
  return landmark !== undefined && landmark.visibility > VISIBILITY_THRESHOLD;
};

// Función para calcular el ángulo entre tres puntos (en grados) con vértice en B
const calculateAngle = (
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark,
  width: number,
  height: number,
): number => {
  const Ax = a.x * width;
  const Ay = a.y * height;
  const Bx = b.x * width;
  const By = b.y * height;
  const Cx = c.x * width;
  const Cy = c.y * height;

  const deltaY_C = (Cy - By) * -1;
  const deltaX_C = Cx - Bx;
  const deltaY_A = (Ay - By) * -1;
  const deltaX_A = Ax - Bx;

  const angleC = Math.atan2(deltaY_C, deltaX_C);
  const angleA = Math.atan2(deltaY_A, deltaX_A);

  const radians = angleC - angleA;
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return angle;
};

export class SquatAnalyzer {
  public repetitionCounter = 0; // Contador de repeticiones
  private currentPhase: Phase = "NEUTRAL"; // Fase actual del movimiento
  private currentErrorFase: Phase | null = null; // En qué fase se detectó el error actual
  private excentricSuccess = false; // La fase excéntrica se completó correctamente
  private concentricSuccess = false; // La fase concéntrica se completó correctamente
  private prevAngle: number = 0; // Ángulo del frame anterior
  private minAngleReached: number = 180; // Máxima flexión (abajo)
  private maxAngleReached: number = 0; // Máxima extensión (arriba)
  private readonly ROM_EXTENSION_TARGET = 135; // La cadera debe subir hasta al menos 135°
  private readonly ROM_FLEXION_TARGET = 90; // La cadera debe bajar hasta al menos 90°
  private readonly MOVEMENT_THRESHOLD = 10; // Histéresis para detectar cambio de dirección
  private readonly MIN_AMPLITUDE_THRESHOLD = 40; // Mínimo 40 grados de recorrido para validar
  private kneeLocked = false; // Las rodillas no se deben bloquear
  // Variables para detectar inactividad
  private lastHipY: number | null = null; // Posición en Y de la cadera en el frame anterior
  private lastMovementTime: number = 0; // Momento en el que se detectó el último movimiento
  private readonly INACTIVITY_TIMEOUT_MS = 5000; // 5 segundos sin movimiento
  private readonly HIP_MOVEMENT_THRESHOLD = 0.05; // Umbral de movimiento en Y

  // Variables para debounce de errores
  private pendingFeedback: ExerciseFeedback | null = null; // Feedback pendiente de confirmar
  private pendingStartTime: number = 0; // Momento en el que se detectó el feedback pendiente
  private lastConfirmedFeedback: ExerciseFeedback = {
    errorType: "OK",
    message: "Perfecto",
  }; // Feedback confirmado
  private readonly DEBOUNCE_MS = 1000; // Tiempo en ms para confirmar el feedback

  // Método para confirmar el feedback
  private debounceFeedback(
    feedback: ExerciseFeedback,
    timestamp: number,
  ): ExerciseFeedback {
    if (
      this.pendingFeedback &&
      this.pendingFeedback.message === feedback.message
    ) {
      if (timestamp - this.pendingStartTime >= this.DEBOUNCE_MS) {
        this.lastConfirmedFeedback = feedback;
      }
    } else {
      this.pendingFeedback = feedback;
      this.pendingStartTime = timestamp;
    }
    return this.lastConfirmedFeedback;
  }

  // Método para analizar el rango de movimiento (ROM) y detectar errores de amplitud en la fase concéntrica y excéntrica
  private checkROM(currentAngle: number): ExerciseFeedback | null {
    let feedback: ExerciseFeedback | null = null;

    // Modo bloqueo: gestión de errores activos
    if (this.currentErrorFase !== null) {
      if (this.currentErrorFase === "ECCENTRIC") {
        // Error: No bajó suficiente.
        // Salida: El usuario corrigió y bajó más (<= 90).
        if (currentAngle <= this.ROM_FLEXION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.excentricSuccess = true;
        } else {
          // Mantener error
          feedback = {
            errorType: "TECHNICAL",
            exercise: "SQUAT",
            error: "NO_ROM_ECCENTRIC",
            message: "Baja más la cadera",
          };
        }
      } else if (this.currentErrorFase === "CONCENTRIC") {
        // Error: No subió suficiente.
        // Salida: El usuario corrigió y subió más (>= 135).
        if (currentAngle >= this.ROM_EXTENSION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.concentricSuccess = true;
        } else {
          // Mantener error
          feedback = {
            errorType: "TECHNICAL",
            exercise: "SQUAT",
            error: "NO_ROM_CONCENTRIC",
            message: "Sube más la cadera",
          };
        }
      }

      // Mientras estamos en error, seguimos actualizando el ángulo previo
      this.prevAngle = currentAngle;
      return feedback;
    }

    // Modo normal: detección de fases

    // CASO A: Fase Concéntrica detectada
    if (currentAngle > this.prevAngle + this.MOVEMENT_THRESHOLD) {
      // Si venimos de una fase excéntrica, validamos la amplitud y posibles errores antes de cambiar a concéntrica
      if (this.currentPhase === "ECCENTRIC") {
        // Validamos la amplitud para evitar falsos positivos por pequeños movimientos o ruido
        const amplitude = Math.abs(this.maxAngleReached - this.minAngleReached);
        if (amplitude > this.MIN_AMPLITUDE_THRESHOLD) {
          // Validamos la bajada anterior
          if (this.minAngleReached > this.ROM_FLEXION_TARGET) {
            feedback = {
              errorType: "TECHNICAL",
              exercise: "SQUAT",
              error: "NO_ROM_ECCENTRIC",
              message: "Baja más la cadera",
            };
            // Activamos el bloqueo
            this.currentErrorFase = "ECCENTRIC";
          } else {
            // Éxito en la bajada
            this.excentricSuccess = true;
          }
        }
        this.maxAngleReached = currentAngle; // Actualizamos referencia
      }

      this.currentPhase = "CONCENTRIC"; // Actualizamos fase
      this.maxAngleReached = Math.max(this.maxAngleReached, currentAngle); // Actualizamos referencia
      this.prevAngle = currentAngle; // Actualizamos referencia
    }

    // CASO B: Fase Excéntrica detectada
    else if (currentAngle < this.prevAngle - this.MOVEMENT_THRESHOLD) {
      // Si venimos de una fase concéntrica, validamos la amplitud y posibles errores antes de cambiar a excéntrica
      if (this.currentPhase === "CONCENTRIC") {
        // Validamos la amplitud para evitar falsos positivos por pequeños movimientos o ruido
        const amplitude = Math.abs(this.maxAngleReached - this.minAngleReached);
        if (amplitude > this.MIN_AMPLITUDE_THRESHOLD) {
          // Validamos la subida anterior
          if (this.maxAngleReached < this.ROM_EXTENSION_TARGET) {
            feedback = {
              errorType: "TECHNICAL",
              exercise: "SQUAT",
              error: "NO_ROM_CONCENTRIC",
              message: "Sube más la cadera",
            };
            // Activamos el bloqueo
            this.currentErrorFase = "CONCENTRIC";
          } else {
            // Éxito en la subida
            this.concentricSuccess = true;
          }
        }
        this.minAngleReached = currentAngle; // Actualizamos referencia
      }

      this.currentPhase = "ECCENTRIC"; // Actualizamos fase
      this.minAngleReached = Math.min(this.minAngleReached, currentAngle); // Actualizamos referencia
      this.prevAngle = currentAngle; // Actualizamos referencia
    }

    return feedback;
  }

  // Método para analizar el balanceo del cuerpo y detectar si se está balanceando hacia adelante o hacia atrás
  private checkBalanceo = (
    hip: NormalizedLandmark,
    shoulder: NormalizedLandmark,
    isFacingLeft: boolean,
    width: number,
    height: number,
  ): ExerciseFeedback | null => {
    const vertical: NormalizedLandmark = {
      x: shoulder.x,
      y: 0.0,
      z: 0.0,
      visibility: 1.0,
    };

    // Calcular el ángulo de separación entre la vertical y la cadera respecto al hombro
    const separationAngle = calculateAngle(
      vertical,
      shoulder,
      hip,
      width,
      height,
    );

    // Umbrales de tolerancia (180° es estar perfectamente recto)
    const FRONT_DRIFT_THRESHOLD = 135.0; // Tolera hasta 45° de inclinación hacia adelante
    const BACK_DRIFT_THRESHOLD = 170.0; // Tolera solo 10° de inclinación hacia atrás (hiperextensión)

    const shoulderX = shoulder.x * width;
    const hipX = hip.x * width;

    let backBalanced = false;

    // 1. Determinar la dirección física del balanceo usando la orientación del usuario
    if (isFacingLeft) {
      // Si mira a la izquierda, la espalda está hacia la derecha (+X).
      // Si la cadera está a la izquierda del hombro, el torso está inclinado hacia atrás.
      backBalanced = hipX < shoulderX;
    } else {
      // Si mira a la derecha, la espalda está hacia la izquierda (-X).
      backBalanced = hipX > shoulderX;
    }

    // 2. Evaluar el ángulo contra el umbral correspondiente a la dirección
    if (backBalanced) {
      // Evaluamos el balanceo hacia atrás (mucho más estricto)
      if (separationAngle < BACK_DRIFT_THRESHOLD) {
        return {
          errorType: "TECHNICAL",
          exercise: "SQUAT",
          error: "FORWARD_BACK",
          message: "No te balancees hacia atrás",
        };
      }
    } else {
      // Evaluamos el balanceo hacia adelante (más permisivo)
      if (separationAngle < FRONT_DRIFT_THRESHOLD) {
        return {
          errorType: "TECHNICAL",
          exercise: "SQUAT",
          error: "FORWARD_FRONT",
          message: "No te balancees hacia adelante",
        };
      }
    }

    return null;
  };

  // Método para analizar el bloqueo de rodillas
  private checkKneeLocked(currentAngle: number): ExerciseFeedback | null {
    // Modo bloqueo
    if (this.kneeLocked) {
      if (currentAngle < 160) {
        this.kneeLocked = false; // Desactivamos el bloqueo si la rodilla vuelve a bajar lo suficiente
        return null; // No hay error
      }
      // Si seguimos bloqueados, devolvemos error
      return {
        errorType: "TECHNICAL",
        exercise: "SQUAT",
        error: "KNEE_LOCKED",
        message: "Evita bloquear las rodillas al subir",
      };
    }
    // Modo detección de bloqueo
    else {
      // Solo advertir si estamos subiendo, estamos arriba (>170), y venimos de hacer una bajada (incluso superficial, <165)
      if (
        this.currentPhase === "CONCENTRIC" &&
        currentAngle > 170 &&
        this.minAngleReached < 165
      ) {
        this.kneeLocked = true; // Activamos el bloqueo
        return {
          errorType: "TECHNICAL",
          exercise: "SQUAT",
          error: "KNEE_LOCKED",
          message: "Evita bloquear las rodillas al subir",
        };
      }
      this.kneeLocked = false; // No detectamos bloqueo
      return null;
    }
  }

  public analyze(
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
    timestamp: number,
  ): ExerciseFeedback {
    const nose = landmarks[LANDMARKS.NOSE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

    let rawFeedback: ExerciseFeedback | null = null;

    // Verificamos que las articulaciones clave para determinar la orientación del usuario sean confiables
    if (
      !isReliable(nose) ||
      !isReliable(leftShoulder) ||
      !isReliable(rightShoulder)
    ) {
      rawFeedback = {
        errorType: "POSITIONING",
        message: "Ponte en frente de la cámara",
      };
    } else {
      const noseX = nose.x * width;
      const midShoulderX = ((leftShoulder.x + rightShoulder.x) / 2) * width;
      const isFacingLeft = noseX < midShoulderX;

      let hip, knee, ankle, shoulder;

      if (isFacingLeft) {
        hip = landmarks[LANDMARKS.LEFT_HIP];
        knee = landmarks[LANDMARKS.LEFT_KNEE];
        ankle = landmarks[LANDMARKS.LEFT_ANKLE];
        shoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
      } else {
        hip = landmarks[LANDMARKS.RIGHT_HIP];
        knee = landmarks[LANDMARKS.RIGHT_KNEE];
        ankle = landmarks[LANDMARKS.RIGHT_ANKLE];
        shoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
      }

      if (
        !isReliable(hip) ||
        !isReliable(knee) ||
        !isReliable(ankle) ||
        !isReliable(shoulder)
      ) {
        this.lastHipY = null; // Reiniciar inactividad si se pierde el tracking
        rawFeedback = { errorType: "POSITIONING", message: "Ponte de perfil" };
      } else {
        // Comprobación de inactividad
        if (this.lastHipY === null) {
          this.lastHipY = hip.y;
          this.lastMovementTime = timestamp;
        } else {
          if (Math.abs(hip.y - this.lastHipY) > this.HIP_MOVEMENT_THRESHOLD) {
            this.lastHipY = hip.y;
            this.lastMovementTime = timestamp;
          } else if (
            timestamp - this.lastMovementTime >
            this.INACTIVITY_TIMEOUT_MS
          ) {
            rawFeedback = {
              errorType: "POSITIONING",
              message: "No se detecta movimiento",
            };
          }
        }

        // Si no detectamos ningún error de posicionamiento, pasamos a detectar errores técnicos por orden de prioridad
        if (rawFeedback === null) {
          const currentAngle = calculateAngle(hip, knee, ankle, width, height);
          // 1. ROM
          const rom = this.checkROM(currentAngle);
          if (rom != null) {
            this.lastConfirmedFeedback = rom;
            this.pendingFeedback = rom;
            return rom;
          }
          // 2. Balanceo (debounced)
          const balanceo = this.checkBalanceo(
            hip,
            shoulder,
            isFacingLeft,
            width,
            height,
          );
          if (balanceo != null) {
            rawFeedback = balanceo;
          } else {
            // 3. Knee locked
            const kneeLocked = this.checkKneeLocked(currentAngle);
            if (kneeLocked != null) {
              this.lastConfirmedFeedback = kneeLocked;
              this.pendingFeedback = kneeLocked;
              return kneeLocked;
            }
          }
        }
      }
    }

    // No detectamos ningún error, debounceamos OK
    if (rawFeedback === null) {
      rawFeedback = { errorType: "OK", message: "Perfecto" };
    }
    const confirmed = this.debounceFeedback(rawFeedback, timestamp);
    // Si el feedback confirmado es OK, comprobamos si se ha completado una repetición
    if (confirmed.errorType === "OK") {
      if (this.concentricSuccess && this.excentricSuccess) {
        this.repetitionCounter += 1;
        this.concentricSuccess = false; // Reseteamos el flag de éxito
        this.excentricSuccess = false; // Reseteamos el flag de éxito
      }
    } else if (rawFeedback.errorType !== "OK") {
      // Penalizamos el progreso si venimos de un error confirmado y seguimos cometiendo errores
      this.concentricSuccess = false; // Reseteamos el flag de éxito
      this.excentricSuccess = false; // Reseteamos el flag de éxito
    }
    return confirmed;
  }
}

export class BicepCurlAnalyzer {
  private prevAngle: number = 0; // Ángulo del frame anterior
  private currentPhase: Phase = "NEUTRAL"; // Fase actual del movimiento
  private currentErrorFase: Phase | null = null; // En qué fase se detectó el error actual
  private excentricSuccess = false; // La fase excéntrica se completó correctamente
  private concentricSuccess = false; // La fase concéntrica se completó correctamente
  public repetitionCounter = 0; // Contador de repeticiones
  private minAngleReached: number = 180; // Máxima flexión (arriba)
  private maxAngleReached: number = 0; // Máxima extensión (abajo)
  private readonly ROM_EXTENSION_TARGET = 135; // El brazo debe bajar hasta al menos 135°
  private readonly ROM_FLEXION_TARGET = 75; // El brazo debe subir hasta al menos 75°
  private readonly MOVEMENT_THRESHOLD = 10; // Histéresis para detectar cambio de dirección
  private readonly MIN_AMPLITUDE_THRESHOLD = 40; // Mínimo 40 grados de recorrido para validar

  // Variables para detectar inactividad
  private lastWristY: number | null = null;
  private lastMovementTime: number = 0;
  private readonly INACTIVITY_TIMEOUT_MS = 5000; // 5 segundos sin movimiento
  private readonly WRIST_MOVEMENT_THRESHOLD = 0.05; // Umbral de movimiento en Y

  // Variables para debounce de errores
  private pendingFeedback: ExerciseFeedback | null = null; // Feedback pendiente de confirmación
  private pendingStartTime: number = 0; // Tiempo en el que se detectó el feedback pendiente
  private lastConfirmedFeedback: ExerciseFeedback = {
    errorType: "OK",
    message: "Perfecto",
  }; // Feedback confirmado
  private readonly DEBOUNCE_MS = 1000; // Tiempo mínimo para confirmar un feedback

  // Método para aplicar debounce a los feedbacks
  private debounceFeedback(
    feedback: ExerciseFeedback,
    timestamp: number,
  ): ExerciseFeedback {
    if (
      this.pendingFeedback &&
      this.pendingFeedback.message === feedback.message
    ) {
      if (timestamp - this.pendingStartTime >= this.DEBOUNCE_MS) {
        this.lastConfirmedFeedback = feedback;
      }
    } else {
      this.pendingFeedback = feedback;
      this.pendingStartTime = timestamp;
    }
    return this.lastConfirmedFeedback;
  }

  // Método para analizar el rango de movimiento (ROM) y detectar errores de amplitud en la fase concéntrica y excéntrica
  private checkROM(
    shoulder: NormalizedLandmark,
    elbow: NormalizedLandmark,
    wrist: NormalizedLandmark,
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    // Calculamos el ángulo entre el hombro y la muñeca con vértice en el codo para determinar la flexión del brazo
    const currentAngle = calculateAngle(shoulder, elbow, wrist, width, height);

    let feedback: ExerciseFeedback | null = null;

    // Modo bloqueo: gestión de errores activos
    if (this.currentErrorFase !== null) {
      if (this.currentErrorFase === "CONCENTRIC") {
        // Error: No subió suficiente.
        // Salida: El usuario corrigió y subió más (<= 75).
        if (currentAngle <= this.ROM_FLEXION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.concentricSuccess = true;
        } else {
          // Mantener error
          feedback = {
            errorType: "TECHNICAL",
            exercise: "BICEP_CURL",
            error: "NO_ROM_CONCENTRIC",
            message: "Sube más la pesa",
          };
        }
      } else if (this.currentErrorFase === "ECCENTRIC") {
        // Error: No bajó suficiente.
        // Salida: El usuario corrigió y bajó más (>= 135).
        if (currentAngle >= this.ROM_EXTENSION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.excentricSuccess = true;
        } else {
          // Mantener error
          feedback = {
            errorType: "TECHNICAL",
            exercise: "BICEP_CURL",
            error: "NO_ROM_ECCENTRIC",
            message: "Baja más la pesa",
          };
        }
      }

      // Mientras estamos en error, seguimos actualizando el ángulo previo
      this.prevAngle = currentAngle;
      return feedback;
    }

    // Modo normal: detección de fases

    // CASO A: Fase Excéntrica detectada
    if (currentAngle > this.prevAngle + this.MOVEMENT_THRESHOLD) {
      // Si venimos de una fase concéntrica, validamos la amplitud y posibles errores antes de cambiar a excéntrica
      if (this.currentPhase === "CONCENTRIC") {
        // Validamos la amplitud para evitar falsos positivos por pequeños movimientos o ruido
        const amplitude = Math.abs(this.maxAngleReached - this.minAngleReached);
        if (amplitude > this.MIN_AMPLITUDE_THRESHOLD) {
          // Validamos la subida anterior
          if (this.minAngleReached > this.ROM_FLEXION_TARGET) {
            feedback = {
              errorType: "TECHNICAL",
              exercise: "BICEP_CURL",
              error: "NO_ROM_CONCENTRIC",
              message: "Sube más la pesa",
            };
            // Activamos el bloqueo
            this.currentErrorFase = "CONCENTRIC";
          } else {
            // Éxito en la subida
            this.concentricSuccess = true;
          }
        }
        this.maxAngleReached = currentAngle; // Actualizamos referencia
      }

      this.currentPhase = "ECCENTRIC"; // Actualizamos fase
      this.maxAngleReached = Math.max(this.maxAngleReached, currentAngle); // Actualizamos referencia
      this.prevAngle = currentAngle; // Actualizamos referencia
    }

    // CASO B: Fase Concéntrica detectada
    else if (currentAngle < this.prevAngle - this.MOVEMENT_THRESHOLD) {
      // Si venimos de una fase excéntrica, validamos la amplitud y posibles errores antes de cambiar a concéntrica
      if (this.currentPhase === "ECCENTRIC") {
        // Validamos la amplitud para evitar falsos positivos por pequeños movimientos o ruido
        const amplitude = Math.abs(this.maxAngleReached - this.minAngleReached);
        if (amplitude > this.MIN_AMPLITUDE_THRESHOLD) {
          // Validamos la bajada anterior
          if (this.maxAngleReached < this.ROM_EXTENSION_TARGET) {
            feedback = {
              errorType: "TECHNICAL",
              exercise: "BICEP_CURL",
              error: "NO_ROM_ECCENTRIC",
              message: "Baja más la pesa",
            };
            // Activamos el bloqueo
            this.currentErrorFase = "ECCENTRIC";
          } else {
            // Éxito en la bajada
            this.excentricSuccess = true;
          }
        }
        this.minAngleReached = currentAngle; // Actualizamos referencia
      }

      this.currentPhase = "CONCENTRIC"; // Actualizamos fase
      this.minAngleReached = Math.min(this.minAngleReached, currentAngle); // Actualizamos referencia
      this.prevAngle = currentAngle; // Actualizamos referencia
    }

    return feedback;
  }

  // Método para analizar el balanceo del cuerpo y detectar si se está balanceando hacia adelante o hacia atrás
  private checkBalanceo = (
    hip: NormalizedLandmark,
    shoulder: NormalizedLandmark,
    isFacingLeft: boolean,
    width: number,
    height: number,
  ): ExerciseFeedback | null => {
    const vertical: NormalizedLandmark = {
      x: shoulder.x,
      y: 0.0,
      z: 0.0,
      visibility: 1.0,
    };

    // Calcular el ángulo de separación entre la vertical y la cadera respecto al hombro
    const separationAngle = calculateAngle(
      vertical,
      shoulder,
      hip,
      width,
      height,
    );
    const DRIFT_THRESHOLD = 170.0;

    // Si el ángulo de separación es menor a 170 grados, consideramos que el cuerpo se está moviendo fuera del plano ideal
    if (separationAngle < DRIFT_THRESHOLD) {
      const shoulderX = shoulder.x * width;
      const hipX = hip.x * width;

      let backBalanced = false;

      if (isFacingLeft) {
        backBalanced = hipX < shoulderX; // Si el usuario mira a la izquierda, el balanceo hacia atrás es cuando la coordenada X de la cadera es menor que la del hombro
      } else {
        backBalanced = hipX > shoulderX; // Si el usuario mira a la derecha, el balanceo hacia atrás es cuando la coordenada X de la cadera es mayor que la del hombro
      }

      if (backBalanced) {
        return {
          errorType: "TECHNICAL",
          exercise: "BICEP_CURL",
          error: "FORWARD_BACK",
          message: "No te balancees hacia atrás",
        };
      } else {
        return {
          errorType: "TECHNICAL",
          exercise: "BICEP_CURL",
          error: "FORWARD_FRONT",
          message: "No te balancees hacia adelante",
        };
      }
    }

    return null;
  };

  // Método para analizar la posición del codo y detectar si se está llevando hacia adelante o hacia atrás
  private checkPosicionCodo = (
    hip: NormalizedLandmark,
    shoulder: NormalizedLandmark,
    elbow: NormalizedLandmark,
    isFacingLeft: boolean,
    width: number,
    height: number,
  ): ExerciseFeedback | null => {
    // Calcular el ángulo de separación entre la cadera y el codo respecto al hombro
    const separationAngle = calculateAngle(hip, shoulder, elbow, width, height);
    const DRIFT_THRESHOLD = 22.5;
    // Si el ángulo de separación es mayor a 22.5 grados, consideramos que el codo se está moviendo fuera del plano ideal
    if (separationAngle > DRIFT_THRESHOLD) {
      const shoulderX = shoulder.x * width;
      const elbowX = elbow.x * width;

      let isForward = false;

      if (isFacingLeft) {
        isForward = elbowX < shoulderX; // Si el usuario mira a la izquierda, el codo adelante es cuando su coordenada X es menor que la del hombro
      } else {
        isForward = elbowX > shoulderX; // Si el usuario mira a la derecha, el codo adelante es cuando su coordenada X es mayor que la del hombro
      }

      if (isForward) {
        return {
          errorType: "TECHNICAL",
          exercise: "BICEP_CURL",
          error: "ELBOW_FRONT",
          message: "No lleves el codo hacia adelante",
        };
      } else {
        return {
          errorType: "TECHNICAL",
          exercise: "BICEP_CURL",
          error: "ELBOW_BACK",
          message: "No lleves el codo hacia atrás",
        };
      }
    }

    return null;
  };

  public analyze(
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
    timestamp: number,
  ): ExerciseFeedback {
    const nose = landmarks[LANDMARKS.NOSE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

    let rawFeedback: ExerciseFeedback | null = null;

    // Verificamos que las articulaciones clave para determinar la orientación del usuario sean confiables
    if (
      !isReliable(nose) ||
      !isReliable(leftShoulder) ||
      !isReliable(rightShoulder)
    ) {
      rawFeedback = {
        errorType: "POSITIONING",
        message: "Ponte en frente de la cámara",
      };
    } else {
      const noseX = nose.x * width;
      const midShoulderX = ((leftShoulder.x + rightShoulder.x) / 2) * width;
      const isFacingLeft = noseX < midShoulderX;

      let hip, shoulder, elbow, wrist;

      if (isFacingLeft) {
        hip = landmarks[LANDMARKS.LEFT_HIP];
        shoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
        elbow = landmarks[LANDMARKS.LEFT_ELBOW];
        wrist = landmarks[LANDMARKS.LEFT_WRIST];
      } else {
        hip = landmarks[LANDMARKS.RIGHT_HIP];
        shoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
        elbow = landmarks[LANDMARKS.RIGHT_ELBOW];
        wrist = landmarks[LANDMARKS.RIGHT_WRIST];
      }

      if (
        !isReliable(hip) ||
        !isReliable(shoulder) ||
        !isReliable(elbow) ||
        !isReliable(wrist)
      ) {
        this.lastWristY = null; // Reiniciar inactividad si se pierde el tracking
        rawFeedback = { errorType: "POSITIONING", message: "Ponte de perfil" };
      } else {
        // Comprobación de inactividad
        if (this.lastWristY === null) {
          this.lastWristY = wrist.y;
          this.lastMovementTime = timestamp;
        } else {
          if (
            Math.abs(wrist.y - this.lastWristY) > this.WRIST_MOVEMENT_THRESHOLD
          ) {
            this.lastWristY = wrist.y;
            this.lastMovementTime = timestamp;
          } else if (
            timestamp - this.lastMovementTime >
            this.INACTIVITY_TIMEOUT_MS
          ) {
            rawFeedback = {
              errorType: "POSITIONING",
              message: "No se detecta movimiento",
            };
          }
        }

        if (rawFeedback === null) {
          // 1. ROM
          const rom = this.checkROM(shoulder, elbow, wrist, width, height);
          if (rom != null) {
            this.lastConfirmedFeedback = rom;
            this.pendingFeedback = rom;
            return rom;
          }
          // 2. Balanceo (debounced)
          const balanceo = this.checkBalanceo(
            hip,
            shoulder,
            isFacingLeft,
            width,
            height,
          );
          if (balanceo != null) {
            rawFeedback = balanceo;
          } else {
            // 3. Codo (debounced)
            const posicionCodo = this.checkPosicionCodo(
              hip,
              shoulder,
              elbow,
              isFacingLeft,
              width,
              height,
            );
            if (posicionCodo != null) {
              rawFeedback = posicionCodo;
            }
          }
        }
      }
    }

    // No detectamos ningún error, debounceamos OK
    if (rawFeedback === null) {
      rawFeedback = { errorType: "OK", message: "Perfecto" };
    }
    const confirmed = this.debounceFeedback(rawFeedback, timestamp);
    // Si el error confirmado es OK, comprobamos si hemos completado una repetición
    if (confirmed.errorType === "OK") {
      if (this.concentricSuccess && this.excentricSuccess) {
        this.repetitionCounter += 1;
        this.concentricSuccess = false; // Reseteamos el flag de éxito
        this.excentricSuccess = false; // Reseteamos el flag de éxito
      }
    } else if (rawFeedback.errorType !== "OK") {
      // Penalizamos el progreso si venimos de un error confirmado y seguimos cometiendo errores
      this.concentricSuccess = false; // Reseteamos el flag de éxito
      this.excentricSuccess = false; // Reseteamos el flag de éxito
    }
    return confirmed;
  }
}
