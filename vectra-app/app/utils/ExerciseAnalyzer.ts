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
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
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
  private minAngleReached: number = 180; // Máxima extensión (arriba)
  private maxAngleReached: number = 0; // Máxima flexión (abajo)
  private readonly ROM_EXTENSION_TARGET = 140; // La cadera debe subir hasta al menos 140°
  private readonly ROM_FLEXION_TARGET = 95; // La cadera debe bajar hasta al menos 95°
  private readonly MOVEMENT_THRESHOLD = 10; // Histéresis para detectar cambio de dirección
  private readonly MIN_AMPLITUDE_THRESHOLD = 40; // Mínimo 40 grados de recorrido para validar

  // Variables para detectar inactividad
  private lastHipY: number | null = null;
  private lastMovementTime: number = 0;
  private readonly INACTIVITY_TIMEOUT_MS = 5000; // 5 segundos sin movimiento
  private readonly HIP_MOVEMENT_THRESHOLD = 0.05; // Umbral de movimiento en Y

  // Método para analizar el rango de movimiento (ROM) y detectar errores de amplitud en la fase concéntrica y excéntrica
  private checkROM(
    currentAngle: number,
  ): ExerciseFeedback | null {
    // Calculamos el ángulo entre la cadera y el tobillo con vértice en la rodilla para determinar la flexión de la pierna

    let feedback: ExerciseFeedback | null = null;

    // Modo bloqueo: gestión de errores activos
    if (this.currentErrorFase !== null) {
      if (this.currentErrorFase === "CONCENTRIC") {
        // Error: No bajó suficiente.
        // Salida: El usuario corrigió y bajó más (< 95).
        if (currentAngle < this.ROM_FLEXION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.concentricSuccess = true;
        } else {
          // Mantener error
          feedback = {
            errorType: "TECHNICAL",
            exercise: "SQUAT",
            error: "NO_ROM_CONCENTRIC",
            message: "Baja más la cadera",
          };
        }
      } else if (this.currentErrorFase === "ECCENTRIC") {
        // Error: No subió suficiente.
        // Salida: El usuario corrigió y subió más (> 140).
        if (currentAngle > this.ROM_EXTENSION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.excentricSuccess = true;
        } else {
          // Mantener error
          feedback = {
            errorType: "TECHNICAL",
            exercise: "SQUAT",
            error: "NO_ROM_ECCENTRIC",
            message: "Sube más la cadera",
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
          // Validamos la bajada anterior
          if (this.minAngleReached >= this.ROM_FLEXION_TARGET) {
            feedback = {
              errorType: "TECHNICAL",
              exercise: "SQUAT",
              error: "NO_ROM_CONCENTRIC",
              message: "Baja más la cadera",
            };
            // Activamos el bloqueo
            this.currentErrorFase = "CONCENTRIC";
          } else {
            // Éxito en la bajada
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
          // Validamos la subida anterior
          if (this.maxAngleReached <= this.ROM_EXTENSION_TARGET) {
            feedback = {
              errorType: "TECHNICAL",
              exercise: "SQUAT",
              error: "NO_ROM_ECCENTRIC",
              message: "Sube más la cadera",
            };
            // Activamos el bloqueo
            this.currentErrorFase = "ECCENTRIC";
          } else {
            // Éxito en la subida
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
    const DRIFT_THRESHOLD = 130.0;

    // Si el ángulo de separación es menor a 130 grados, consideramos que el cuerpo se está moviendo fuera del plano ideal
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
          exercise: "SQUAT",
          error: "FORWARD_BACK",
          message: "No te balancees hacia atrás",
        };
      } else {
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

  // Método para analizar levantamiento de talones
  private checkHeelLift(
    heel: NormalizedLandmark,
    foot: NormalizedLandmark,
  ): ExerciseFeedback | null {
    const heelY = heel.y;
    const footY = foot.y;

    const umbral = 0.05;

    if (heelY < footY - umbral) {
      return {
        errorType: "TECHNICAL",
        exercise: "SQUAT",
        error: "HEEL_UP",
        message: "No levantes los talones",
      };
    }
    return null;
  }

  // Método para analizar el bloqueo de rodillas
  private checkKneeLocked(currentAngle: number): ExerciseFeedback | null {
    if (this.concentricSuccess && currentAngle > 170) {
      return {
        errorType: "TECHNICAL",
        exercise: "SQUAT",
        error: "KNEE_LOCKED",
        message: "Evita bloquear las rodillas al subir",
      };
    }
    return null;
  }

  public analyze(
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    const nose = landmarks[LANDMARKS.NOSE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

    // Verificamos que las articulaciones clave para determinar la orientación del usuario sean confiables
    if (
      !isReliable(nose) ||
      !isReliable(leftShoulder) ||
      !isReliable(rightShoulder)
    ) {
      return {
        errorType: "POSITIONING",
        message: "Ponte en frente de la cámara",
      };
    }

    const noseX = nose.x * width;
    const midShoulderX = ((leftShoulder.x + rightShoulder.x) / 2) * width;

    // Determinamos la orientación del usuario (mirando a la izquierda o a la derecha) para analizar el brazo correcto y dar feedback adecuado
    const isFacingLeft = noseX < midShoulderX;

    let hip, knee, ankle, heel, foot, shoulder;

    if (isFacingLeft) {
      hip = landmarks[LANDMARKS.LEFT_HIP];
      knee = landmarks[LANDMARKS.LEFT_KNEE];
      ankle = landmarks[LANDMARKS.LEFT_ANKLE];
      heel = landmarks[LANDMARKS.LEFT_HEEL];
      foot = landmarks[LANDMARKS.LEFT_FOOT_INDEX];
      shoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    } else {
      hip = landmarks[LANDMARKS.RIGHT_HIP];
      knee = landmarks[LANDMARKS.RIGHT_KNEE];
      ankle = landmarks[LANDMARKS.RIGHT_ANKLE];
      heel = landmarks[LANDMARKS.RIGHT_HEEL];
      foot = landmarks[LANDMARKS.RIGHT_FOOT_INDEX];
      shoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    }

    /* Verificamos que las articulaciones clave para el ejercicio sean confiables antes de realizar cualquier 
    análisis para evitar dar feedback erróneo por una mala detección */
    if (
      !isReliable(hip) ||
      !isReliable(knee) ||
      !isReliable(ankle) ||
      !isReliable(heel) ||
      !isReliable(foot) ||
      !isReliable(shoulder)
    ) {
      this.lastHipY = null; // Reiniciar inactividad si se pierde el tracking
      return {
        errorType: "POSITIONING",
        message: "Ponte de perfil",
      };
    }
    // Comprobación de inactividad (sin movimiento por x segundos)
    if (this.lastHipY === null) {
      this.lastHipY = hip.y;
      this.lastMovementTime = Date.now();
    } else {
      if (Math.abs(hip.y - this.lastHipY) > this.HIP_MOVEMENT_THRESHOLD) {
        this.lastHipY = hip.y;
        this.lastMovementTime = Date.now();
      } else if (Date.now() - this.lastMovementTime > this.INACTIVITY_TIMEOUT_MS) {
        return {
          errorType: "POSITIONING",
          message: "No se detecta movimiento",
        };
      }
    }

    const currentAngle = calculateAngle(hip, knee, ankle, width, height);
    /* Realizamos la comprobación de levantamiento de talones, ROM, balanceo y rodillas bloqueadas en orden de prioridad para dar el 
     feedback más relevante al usuario */

    const heelLift = this.checkHeelLift(heel, foot);
    if (heelLift != null) {
      return heelLift;
    }

    const rom = this.checkROM(currentAngle);
    if (rom != null) {
      return rom;
    }
    const balanceo = this.checkBalanceo(hip, shoulder, isFacingLeft, width, height);
    if (balanceo != null) {
      return balanceo;
    }

    const kneeLocked = this.checkKneeLocked(currentAngle);
    if (kneeLocked != null) {
      return kneeLocked;
    }
    // Si no hay errores activos y se completaron correctamente ambas fases, contamos una repetición
    if (this.concentricSuccess && this.excentricSuccess) {
      this.repetitionCounter += 1;
      this.concentricSuccess = false;
      this.excentricSuccess = false;
    }
    return null;
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
  private readonly ROM_EXTENSION_TARGET = 140; // El brazo debe bajar hasta al menos 140°
  private readonly ROM_FLEXION_TARGET = 75; // El brazo debe subir hasta al menos 75°
  private readonly MOVEMENT_THRESHOLD = 10; // Histéresis para detectar cambio de dirección
  private readonly MIN_AMPLITUDE_THRESHOLD = 40; // Mínimo 40 grados de recorrido para validar

  // Variables para detectar inactividad
  private lastWristY: number | null = null;
  private lastMovementTime: number = 0;
  private readonly INACTIVITY_TIMEOUT_MS = 5000; // 5 segundos sin movimiento
  private readonly WRIST_MOVEMENT_THRESHOLD = 0.05; // Umbral de movimiento en Y

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
        // Salida: El usuario corrigió y subió más (< 75).
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
        // Salida: El usuario corrigió y bajó más (> 140).
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
  ): ExerciseFeedback | null {

    const nose = landmarks[LANDMARKS.NOSE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

    // Verificamos que las articulaciones clave para determinar la orientación del usuario sean confiables
    if (
      !isReliable(nose) ||
      !isReliable(leftShoulder) ||
      !isReliable(rightShoulder)
    ) {
      return {
        errorType: "POSITIONING",
        message: "Ponte en frente de la cámara",
      };
    }

    const noseX = nose.x * width;
    const midShoulderX = ((leftShoulder.x + rightShoulder.x) / 2) * width;

    // Determinamos la orientación del usuario (mirando a la izquierda o a la derecha) para analizar el brazo correcto y dar feedback adecuado
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

    /* Verificamos que las articulaciones clave para el ejercicio sean confiables antes de realizar cualquier 
    análisis para evitar dar feedback erróneo por una mala detección */
    if (
      !isReliable(hip) ||
      !isReliable(shoulder) ||
      !isReliable(elbow) ||
      !isReliable(wrist)
    ) {
      this.lastWristY = null; // Reiniciar inactividad si se pierde el tracking
      return {
        errorType: "POSITIONING",
        message: "Ponte de perfil",
      };
    }

    // Comprobación de inactividad (sin movimiento por x segundos)
    if (this.lastWristY === null) {
      this.lastWristY = wrist.y;
      this.lastMovementTime = Date.now();
    } else {
      if (Math.abs(wrist.y - this.lastWristY) > this.WRIST_MOVEMENT_THRESHOLD) {
        this.lastWristY = wrist.y;
        this.lastMovementTime = Date.now();
      } else if (Date.now() - this.lastMovementTime > this.INACTIVITY_TIMEOUT_MS) {
        return {
          errorType: "POSITIONING",
          message: "No se detecta movimiento",
        };
      }
    }

    /* Realizamos la comprobación de ROM, balanceo y posicion del codo en orden de prioridad para dar el 
     feedback más relevante al usuario */
    const rom = this.checkROM(shoulder, elbow, wrist, width, height);
    if (rom != null) {
      return rom;
    }
    const balanceo = this.checkBalanceo(
      hip,
      shoulder,
      isFacingLeft,
      width,
      height,
    );
    if (balanceo != null) {
      return balanceo;
    }
    const posicionCodo = this.checkPosicionCodo(
      hip,
      shoulder,
      elbow,
      isFacingLeft,
      width,
      height,
    );
    if (posicionCodo != null) {
      return posicionCodo;
    }
    // Si no hay errores activos y se completaron correctamente ambas fases, contamos una repetición
    if (this.concentricSuccess && this.excentricSuccess) {
      this.repetitionCounter += 1;
      this.concentricSuccess = false;
      this.excentricSuccess = false;
    }
    return null;
  }
}
