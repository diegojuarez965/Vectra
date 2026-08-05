import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { ExerciseFeedback, Phase } from "../lib/definitions";

const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
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

// Tiempo en ms para confirmar el feedback
const DEBOUNCE_MS = 500;

// Constantes de inactividad
const INACTIVITY_TIMEOUT_MS = 5000;
const MOVEMENT_THRESHOLD = 0.05;

export type TechnicalAnalysisResult =
  | { feedback: ExerciseFeedback; shouldDebounce: boolean }
  | null;

export abstract class BaseExerciseAnalyzer {
  public repetitionCounter = 0; // Contador de repeticiones
  protected excentricSuccess = false; // La fase excéntrica se completó correctamente
  protected concentricSuccess = false; // La fase concéntrica se completó correctamente

  // Variables para debounce de errores
  protected pendingFeedback: ExerciseFeedback | null = null; // Feedback pendiente de confirmar
  protected pendingStartTime: number = 0; // Momento en el que se detectó el feedback pendiente
  protected lastConfirmedFeedback: ExerciseFeedback = {
    errorType: "OK",
    message: "Perfecto",
  }; // Feedback confirmado

  // Variables de estado para inactividad
  protected lastReferenceValue: number | null = null;
  protected lastMovementTime: number = 0;

  // Métodos abstractos (Hooks) que cada ejercicio específico debe definir
  // Método para obtener las articulaciones requeridas para el ejercicio
  protected abstract getRequiredJoints(): string[];

  // Método para obtener la articulación de referencia para el cálculo de inactividad
  protected abstract getInactivityReference(joints: Record<string, NormalizedLandmark>): number;

  // Método para analizar los errores técnicos del ejercicio
  protected abstract analyzeTechnical(
    joints: Record<string, NormalizedLandmark>,
    facingLeft: boolean,
    width: number,
    height: number,
  ): TechnicalAnalysisResult;

  // Template Method: Orquesta todo el flujo del análisis
  public analyze(
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
    timestamp: number,
  ): ExerciseFeedback {
    const result = this.getOrientedLandmarks(landmarks, this.getRequiredJoints());

    let feedbackToDebounce: ExerciseFeedback | null = null;

    if (result === null) {
      feedbackToDebounce = { errorType: "POSITIONING", message: "Ponte de perfil" };
    } else {
      const { facingLeft, joints } = result;

      // Comprobación de inactividad genérica
      const referenceValue = this.getInactivityReference(joints);
      feedbackToDebounce = this.checkInactivity(referenceValue, timestamp);

      // Ejecución de reglas técnicas específicas del ejercicio
      if (feedbackToDebounce === null) {
        const techResult = this.analyzeTechnical(joints, facingLeft, width, height);
        if (techResult !== null) {
          if (techResult.shouldDebounce) {
            feedbackToDebounce = techResult.feedback;
          } else {
            // Bypass debouncing: actualiza el estado inmediatamente y lo retorna
            this.lastConfirmedFeedback = techResult.feedback;
            this.pendingFeedback = techResult.feedback;
            return techResult.feedback;
          }
        }
      }
    }

    // No detectamos ningún error, debounceamos OK
    if (feedbackToDebounce === null) {
      feedbackToDebounce = { errorType: "OK", message: "Perfecto" };
    }

    const confirmed = this.debounceFeedback(feedbackToDebounce, timestamp);

    // Gestión del contador de repeticiones común
    if (confirmed.errorType === "OK") {
      if (this.concentricSuccess && this.excentricSuccess) {
        this.repetitionCounter += 1;
        this.concentricSuccess = false; // Reseteamos el flag de éxito
        this.excentricSuccess = false; // Reseteamos el flag de éxito
      }
    } else if (feedbackToDebounce.errorType !== "OK") {
      // Penalizamos el progreso si venimos de un error confirmado y seguimos cometiendo errores
      this.concentricSuccess = false; // Reseteamos el flag de éxito
      this.excentricSuccess = false; // Reseteamos el flag de éxito
    }

    return confirmed;
  }

  /**
   * Comprueba si el usuario está inactivo basándose en la posición Y de una articulación de referencia.
   */
  protected checkInactivity(
    referenceValue: number,
    timestamp: number,
  ): ExerciseFeedback | null {
    if (this.lastReferenceValue === null) {
      this.lastReferenceValue = referenceValue;
      this.lastMovementTime = timestamp;
      return null;
    }

    if (Math.abs(referenceValue - this.lastReferenceValue) > MOVEMENT_THRESHOLD) {
      this.lastReferenceValue = referenceValue;
      this.lastMovementTime = timestamp;
    } else if (timestamp - this.lastMovementTime > INACTIVITY_TIMEOUT_MS) {
      return {
        errorType: "POSITIONING",
        message: "No se detecta movimiento",
      };
    }
    return null;
  }

  // Función para verificar la visibilidad de una articulación
  protected isReliable(landmark: NormalizedLandmark | undefined): boolean {
    return landmark !== undefined && landmark.visibility > VISIBILITY_THRESHOLD;
  }

  // Función para obtener la orientación del usuario y landmarks relevantes
  protected getOrientedLandmarks<T extends string>(
    landmarks: NormalizedLandmark[],
    relevantJoints: T[],
  ): {
    facingLeft: boolean;
    joints: { [K in Lowercase<T>]: NormalizedLandmark };
  } | null {
    const nose = landmarks[LANDMARKS.NOSE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

    if (!this.isReliable(nose) || !this.isReliable(leftShoulder) || !this.isReliable(rightShoulder)) {
      this.lastReferenceValue = null; // Reiniciar inactividad si se pierde el tracking
      return null;
    }
    const facingLeft = nose.x < (leftShoulder.x + rightShoulder.x) / 2;

    const joints = {} as { [K in Lowercase<T>]: NormalizedLandmark };
    for (const joint of relevantJoints) {
      const key = `${facingLeft ? "LEFT" : "RIGHT"}_${joint}` as keyof typeof LANDMARKS;
      const landmark = landmarks[LANDMARKS[key]];
      if (!this.isReliable(landmark)) {
        this.lastReferenceValue = null; // Reiniciar inactividad si se pierde el tracking
        return null;
      }
      const lowerKey = joint.toLowerCase() as Lowercase<T>;
      joints[lowerKey] = landmark;
    }

    return { facingLeft, joints };
  }

  // Función para calcular el ángulo entre tres puntos (en grados) con vértice en B
  protected calculateAngle(
    a: NormalizedLandmark,
    b: NormalizedLandmark,
    c: NormalizedLandmark,
    width: number,
    height: number,
  ): number {
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
  }

  // Método para confirmar el feedback
  protected debounceFeedback(
    feedback: ExerciseFeedback,
    timestamp: number,
  ): ExerciseFeedback {
    if (
      this.pendingFeedback &&
      this.pendingFeedback.message === feedback.message
    ) {
      if (timestamp - this.pendingStartTime >= DEBOUNCE_MS) {
        this.lastConfirmedFeedback = feedback;
      }
    } else {
      this.pendingFeedback = feedback;
      this.pendingStartTime = timestamp;
    }
    return this.lastConfirmedFeedback;
  }
}

export class DeadliftAnalyzer extends BaseExerciseAnalyzer {
  private currentPhase: Phase = "NEUTRAL"; // Fase actual del movimiento
  private currentErrorFase: Phase | null = null; // En qué fase se detectó el error actual
  private prevAngle: number = 0; // Ángulo del frame anterior
  private minAngleReached: number = 180; // Máxima flexión (abajo)
  private maxAngleReached: number = 0; // Máxima extensión (arriba)
  private barErrorActive: boolean = false; // Indica si la barra está alejada del cuerpo
  private lumbarErrorActive: boolean = false; // Indica si hay hiperextensión lumbar
  private kneeOverflexionActive: boolean = false; // Indica si hay sobre-flexión de rodillas
  private readonly ROM_EXTENSION_TARGET = 160; // El torso debe subir hasta al menos 160°
  private readonly ROM_FLEXION_TARGET = 90; // El torso debe bajar hasta al menos 90°
  private readonly MOVEMENT_THRESHOLD = 10; // Histéresis para detectar cambio de dirección
  private readonly MIN_AMPLITUDE_THRESHOLD = 40; // Mínimo 40 grados de recorrido para validar

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
            exercise: "DEADLIFT",
            error: "NO_ROM_ECCENTRIC",
            message: "Baja más el torso",
          };
        }
      } else if (this.currentErrorFase === "CONCENTRIC") {
        // Error: No subió suficiente.
        // Salida: El usuario corrigió y subió más (>= 160).
        if (currentAngle >= this.ROM_EXTENSION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.concentricSuccess = true;
        } else {
          // Mantener error
          feedback = {
            errorType: "TECHNICAL",
            exercise: "DEADLIFT",
            error: "NO_ROM_CONCENTRIC",
            message: "Sube más el torso",
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
              exercise: "DEADLIFT",
              error: "NO_ROM_ECCENTRIC",
              message: "Baja más el torso",
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
              exercise: "DEADLIFT",
              error: "NO_ROM_CONCENTRIC",
              message: "Sube más el torso",
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

  // Método para verificar la posición de la barra respecto al cuerpo
  private checkBarPosition(
    shoulder: NormalizedLandmark,
    hip: NormalizedLandmark,
    knee: NormalizedLandmark,
    wrist: NormalizedLandmark,
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    // 1. Calcular longitud del torso como referencia de escala
    const dx = (shoulder.x - hip.x) * width;
    const dy = (shoulder.y - hip.y) * height;
    const torsoLength = Math.sqrt(dx * dx + dy * dy);

    // 2. Calcular la distancia horizontal en píxeles entre la muñeca y la rodilla
    const driftDistance = Math.abs(wrist.x - knee.x) * width;

    // 3. Definir umbrales dinámicos basados en la longitud del torso
    const MAX_DRIFT_THRESHOLD = torsoLength * 0.22; // Umbral de alerta (22% del torso)
    const MIN_DRIFT_THRESHOLD = torsoLength * 0.15; // Umbral de histéresis para apagar la alerta

    // Modo bloqueo
    if (this.barErrorActive) {
      if (driftDistance < MIN_DRIFT_THRESHOLD) {
        this.barErrorActive = false;
        return null;
      }
      return {
        errorType: "TECHNICAL",
        exercise: "DEADLIFT",
        error: "BAR_DRIFT",
        message: "Mantén la barra cerca de tus piernas",
      };
    }
    // Modo detección de bloqueo
    else {
      // Si la barra se separa demasiado del cuerpo durante el movimiento activo, activamos el bloqueo
      if (
        (this.currentPhase === "CONCENTRIC" || this.currentPhase === "ECCENTRIC") &&
        driftDistance > MAX_DRIFT_THRESHOLD
      ) {
        this.barErrorActive = true;
        return {
          errorType: "TECHNICAL",
          exercise: "DEADLIFT",
          error: "BAR_DRIFT",
          message: "Mantén la barra cerca de tus piernas",
        };
      }
      this.barErrorActive = false; // No detectamos bloqueo
      return null;
    }
  }

  // Método para analizar la hiperextensión lumbar
  private checkLumbarHyperextension(
    currentAngle: number,
    shoulder: NormalizedLandmark,
    hip: NormalizedLandmark,
    facingLeft: boolean,
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    // Calculamos la longitud del torso en píxeles
    const dx = (shoulder.x - hip.x) * width;
    const dy = (shoulder.y - hip.y) * height;
    const torsoLength = Math.sqrt(dx * dx + dy * dy);
    // Definimos el umbral dinámico como el 15% de la longitud del torso
    const threshold = torsoLength * 0.15;

    const shoulderX = shoulder.x * width;
    const hipX = hip.x * width;

    // Evaluamos si el torso está arqueado hacia atrás
    const isLeaningBack = facingLeft
      ? (shoulderX > hipX + threshold)
      : (shoulderX < hipX - threshold);

    // Modo bloqueo
    if (this.lumbarErrorActive) {
      // Desactivamos el bloqueo si el torso vuelve a una posición segura o baja lo suficiente en fase excéntrica
      if (!isLeaningBack || (this.currentPhase === "ECCENTRIC" && this.minAngleReached < 150)) {
        this.lumbarErrorActive = false;
        return null;
      }
      // Sino devolvemos el error
      return {
        errorType: "TECHNICAL",
        exercise: "DEADLIFT",
        error: "LUMBAR_HYPEREXTENSION",
        message: "No te eches para atrás al subir",
      };
    }
    // Modo detección de bloqueo
    else {
      // Si estamos subiendo, angle > 170 y venimos de hacer una bajada (incluso superficial, <165)
      if (
        this.currentPhase === "CONCENTRIC" &&
        currentAngle > 170 &&
        this.minAngleReached < 165
      ) {
        // Si además está arqueado hacia atrás, activamos el bloqueo
        if (isLeaningBack) {
          this.lumbarErrorActive = true;
          return {
            errorType: "TECHNICAL",
            exercise: "DEADLIFT",
            error: "LUMBAR_HYPEREXTENSION",
            message: "No te eches para atrás al subir",
          };
        }
      }
      this.lumbarErrorActive = false; // No detectamos bloqueo
      return null;
    }
  }

  // Método para analizar la flexión de rodillas
  private checkKneeOverflexion(
    hip: NormalizedLandmark,
    knee: NormalizedLandmark,
    ankle: NormalizedLandmark,
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    // Calculamos el ángulo entre la cadera, la rodilla y el tobillo
    const currentAngle = this.calculateAngle(hip, knee, ankle, width, height);

    // Modo bloqueo
    if (this.kneeOverflexionActive) {
      // Desactivamos el bloqueo si las rodillas se extienden lo suficiente (> 160°)
      if (currentAngle > 160) {
        this.kneeOverflexionActive = false;
        return null;
      }
      // Sino devolvemos el error
      return {
        errorType: "TECHNICAL",
        exercise: "DEADLIFT",
        error: "KNEE_OVERFLEXION",
        message: "No flexiones tanto las rodillas",
      };
    }
    // Modo detección de bloqueo
    else {
      // Si la rodilla se flexiona demasiado durante las fases activas, activamos el bloqueo
      if (
        (this.currentPhase === "CONCENTRIC" || this.currentPhase === "ECCENTRIC") &&
        currentAngle < 95
      ) {
        this.kneeOverflexionActive = true;
        return {
          errorType: "TECHNICAL",
          exercise: "DEADLIFT",
          error: "KNEE_OVERFLEXION",
          message: "No flexiones tanto las rodillas",
        };
      }
      this.kneeOverflexionActive = false; // No detectamos bloqueo
      return null;
    }
  }

  protected getRequiredJoints(): string[] {
    return ["SHOULDER", "WRIST", "HIP", "KNEE", "ANKLE"];
  }

  protected getInactivityReference(joints: Record<string, NormalizedLandmark>): number {
    return joints.wrist.y;
  }

  protected analyzeTechnical(
    joints: Record<string, NormalizedLandmark>,
    facingLeft: boolean,
    width: number,
    height: number,
  ): TechnicalAnalysisResult {
    const { shoulder, wrist, hip, knee, ankle } = joints;
    const currentAngle = this.calculateAngle(shoulder, hip, knee, width, height);

    // 1. ROM
    const rom = this.checkROM(currentAngle);
    if (rom != null) {
      return { feedback: rom, shouldDebounce: false };
    }

    // 2. Check Lumbar Hyperextension
    const lumbarHyperextension = this.checkLumbarHyperextension(
      currentAngle,
      shoulder,
      hip,
      facingLeft,
      width,
      height,
    );
    if (lumbarHyperextension != null) {
      return { feedback: lumbarHyperextension, shouldDebounce: true };
    }

    // 3. Check Bar Position
    const barPosition = this.checkBarPosition(shoulder, hip, knee, wrist, width, height);
    if (barPosition != null) {
      return { feedback: barPosition, shouldDebounce: true };
    }

    // 4. Check Knee Overflexion
    const kneeOverflexion = this.checkKneeOverflexion(hip, knee, ankle, width, height);
    if (kneeOverflexion != null) {
      return { feedback: kneeOverflexion, shouldDebounce: true };
    }

    return null;
  }
}

export class SquatAnalyzer extends BaseExerciseAnalyzer {
  private currentPhase: Phase = "NEUTRAL"; // Fase actual del movimiento
  private currentErrorFase: Phase | null = null; // En qué fase se detectó el error actual
  private prevAngle: number = 0; // Ángulo del frame anterior
  private minAngleReached: number = 180; // Máxima flexión (abajo)
  private maxAngleReached: number = 0; // Máxima extensión (arriba)
  private readonly ROM_EXTENSION_TARGET = 135; // La cadera debe subir hasta al menos 135°
  private readonly ROM_FLEXION_TARGET = 90; // La cadera debe bajar hasta al menos 90°
  private readonly MOVEMENT_THRESHOLD = 10; // Histéresis para detectar cambio de dirección
  private readonly MIN_AMPLITUDE_THRESHOLD = 40; // Mínimo 40 grados de recorrido para validar
  private kneeLocked = false; // Las rodillas no se deben bloquear

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
    const separationAngle = this.calculateAngle(
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

  protected getRequiredJoints(): string[] {
    return ["HIP", "KNEE", "ANKLE", "SHOULDER"];
  }

  protected getInactivityReference(joints: Record<string, NormalizedLandmark>): number {
    return joints.hip.y;
  }

  protected analyzeTechnical(
    joints: Record<string, NormalizedLandmark>,
    facingLeft: boolean,
    width: number,
    height: number,
  ): TechnicalAnalysisResult {
    const { hip, knee, ankle, shoulder } = joints;
    const currentAngle = this.calculateAngle(hip, knee, ankle, width, height);

    // 1. ROM
    const rom = this.checkROM(currentAngle);
    if (rom != null) {
      return { feedback: rom, shouldDebounce: false };
    }

    // 2. Balanceo
    const balanceo = this.checkBalanceo(hip, shoulder, facingLeft, width, height);
    if (balanceo != null) {
      return { feedback: balanceo, shouldDebounce: true };
    }

    // 3. Knee locked
    const kneeLocked = this.checkKneeLocked(currentAngle);
    if (kneeLocked != null) {
      return { feedback: kneeLocked, shouldDebounce: false };
    }

    return null;
  }
}

export class BicepCurlAnalyzer extends BaseExerciseAnalyzer {
  private prevAngle: number = 0; // Ángulo del frame anterior
  private currentPhase: Phase = "NEUTRAL"; // Fase actual del movimiento
  private currentErrorFase: Phase | null = null; // En qué fase se detectó el error actual
  private minAngleReached: number = 180; // Máxima flexión (arriba)
  private maxAngleReached: number = 0; // Máxima extensión (abajo)
  private readonly ROM_EXTENSION_TARGET = 135; // El brazo debe bajar hasta al menos 135°
  private readonly ROM_FLEXION_TARGET = 75; // El brazo debe subir hasta al menos 75°
  private readonly MOVEMENT_THRESHOLD = 10; // Histéresis para detectar cambio de dirección
  private readonly MIN_AMPLITUDE_THRESHOLD = 40; // Mínimo 40 grados de recorrido para validar

  // Método para analizar el rango de movimiento (ROM) y detectar errores de amplitud en la fase concéntrica y excéntrica
  private checkROM(
    shoulder: NormalizedLandmark,
    elbow: NormalizedLandmark,
    wrist: NormalizedLandmark,
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    // Calculamos el ángulo entre el hombro y la muñeca con vértice en el codo para determinar la flexión del brazo
    const currentAngle = this.calculateAngle(shoulder, elbow, wrist, width, height);

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
    const separationAngle = this.calculateAngle(
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
    const separationAngle = this.calculateAngle(hip, shoulder, elbow, width, height);
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

  protected getRequiredJoints(): string[] {
    return ["HIP", "SHOULDER", "ELBOW", "WRIST"];
  }

  protected getInactivityReference(joints: Record<string, NormalizedLandmark>): number {
    return joints.wrist.y;
  }

  protected analyzeTechnical(
    joints: Record<string, NormalizedLandmark>,
    facingLeft: boolean,
    width: number,
    height: number,
  ): TechnicalAnalysisResult {
    const { shoulder, elbow, wrist, hip } = joints;

    // 1. ROM
    const rom = this.checkROM(shoulder, elbow, wrist, width, height);
    if (rom != null) {
      return { feedback: rom, shouldDebounce: false };
    }

    // 2. Balanceo (debounced)
    const balanceo = this.checkBalanceo(
      hip,
      shoulder,
      facingLeft,
      width,
      height,
    );
    if (balanceo != null) {
      return { feedback: balanceo, shouldDebounce: true };
    }

    // 3. Codo (debounced)
    const posicionCodo = this.checkPosicionCodo(
      hip,
      shoulder,
      elbow,
      facingLeft,
      width,
      height,
    );
    if (posicionCodo != null) {
      return { feedback: posicionCodo, shouldDebounce: true };
    }

    return null;
  }
}
