import { NormalizedLandmark } from "@mediapipe/tasks-vision";

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
};

type Phase = "CONCENTRIC" | "ECCENTRIC" | "NEUTRAL";

const VISIBILITY_THRESHOLD = 0.65;

const isReliable = (landmark: NormalizedLandmark | undefined): boolean => {
  return landmark !== undefined && landmark.visibility > VISIBILITY_THRESHOLD;
};

export interface ExerciseFeedback {
  errorType: string;
  message: string;
}

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

export class BicepCurlAnalyzer {
  private prevAngle: number = 0; // Ángulo del frame anterior
  private currentPhase: Phase = "NEUTRAL"; // ¿Qué está haciendo ahora?
  private currentErrorFase: Phase | null = null; // En qué fase se detectó el error actual
  private excentricSuccess = false; // La fase excéntrica se completó correctamente
  private concentricSuccess = false; // La fase concéntrica se completó correctamente
  public repetitionCounter = 0; // Contador de repeticiones

  private minAngleReached: number = 180; // Máxima flexión (arriba)
  private maxAngleReached: number = 0; // Máxima extensión (abajo)

  private readonly ROM_EXTENSION_TARGET = 150; // El brazo debe bajar hasta al menos 150°
  private readonly ROM_FLEXION_TARGET = 70; // El brazo debe subir hasta menos de 70°
  private readonly MOVEMENT_THRESHOLD = 5; // Histéresis para detectar cambio de dirección
  private readonly MIN_AMPLITUDE_THRESHOLD = 40; // Mínimo 40 grados de recorrido para validar

  private checkPosicionCodo = (
    hip: NormalizedLandmark,
    shoulder: NormalizedLandmark,
    elbow: NormalizedLandmark,
    isFacingLeft: boolean,
    width: number,
    height: number,
  ): ExerciseFeedback | null => {
    const separationAngle = calculateAngle(hip, shoulder, elbow, width, height);
    const DRIFT_THRESHOLD = 20;

    if (separationAngle > DRIFT_THRESHOLD) {
      const shoulderX = shoulder.x * width;
      const elbowX = elbow.x * width;

      let isForward = false;

      if (isFacingLeft) {
        isForward = elbowX < shoulderX;
      } else {
        isForward = elbowX > shoulderX;
      }

      if (isForward) {
        return {
          errorType: "Técnica",
          message: "No lleves el codo hacia adelante.",
        };
      } else {
        return {
          errorType: "Técnica",
          message: "No lleves el codo hacia atrás.",
        };
      }
    }

    return null;
  };

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

    const separationAngle = calculateAngle(
      vertical,
      shoulder,
      hip,
      width,
      height,
    );
    const DRIFT_THRESHOLD = 170.0;

    if (separationAngle < DRIFT_THRESHOLD) {
      const shoulderX = shoulder.x * width;
      const hipX = hip.x * width;

      let backBalanced = false;

      if (isFacingLeft) {
        backBalanced = hipX < shoulderX;
      } else {
        backBalanced = hipX > shoulderX;
      }

      if (backBalanced) {
        return {
          errorType: "Técnica",
          message: "No te balancees hacia atrás.",
        };
      } else {
        return {
          errorType: "Técnica",
          message: "No te balancees hacia adelante.",
        };
      }
    }

    return null;
  };

  private checkROM(
    shoulder: NormalizedLandmark,
    elbow: NormalizedLandmark,
    wrist: NormalizedLandmark,
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    // 0. Obtener el ángulo actual
    const currentAngle = calculateAngle(shoulder, elbow, wrist, width, height);

    let feedback: ExerciseFeedback | null = null;

    // --- MODO BLOQUEO: GESTIÓN DE ERRORES ACTIVOS ---
    if (this.currentErrorFase !== null) {
      if (this.currentErrorFase === "CONCENTRIC") {
        // ERROR: No subió suficiente.
        // SALIDA (ÉXITO): El usuario corrigió y subió más (< 70).
        if (currentAngle <= this.ROM_FLEXION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.concentricSuccess = true;
        } else {
          // MANTENER ERROR
          feedback = {
            errorType: "rom_incompleto_arriba",
            message: "Sube más la pesa. Contrae el bíceps completo.",
          };
        }
      } else if (this.currentErrorFase === "ECCENTRIC") {
        // ERROR: No bajó suficiente.
        // SALIDA (ÉXITO): El usuario corrigió y bajó más (> 150).
        if (currentAngle >= this.ROM_EXTENSION_TARGET) {
          this.currentErrorFase = null; // Error resuelto
          this.excentricSuccess = true;
        } else {
          // MANTENER ERROR
          feedback = {
            errorType: "rom_incompleto_abajo",
            message: "Estira el brazo completo al bajar.",
          };
        }
      }

      // Mientras estamos en error, seguimos actualizando el ángulo previo
      this.prevAngle = currentAngle;
      return feedback;
    }

    // --- MODO NORMAL: DETECCIÓN DE FASES ---

    // CASO A: Transición a BAJADA (Fase Excéntrica detectada)
    if (currentAngle > this.prevAngle + this.MOVEMENT_THRESHOLD) {
      if (this.currentPhase === "CONCENTRIC") {
        // ... (Tu lógica de amplitud se mantiene igual) ...
        const amplitude = Math.abs(this.maxAngleReached - this.minAngleReached);

        if (amplitude > this.MIN_AMPLITUDE_THRESHOLD) {
          // VALIDAR LA SUBIDA ANTERIOR
          if (this.minAngleReached > this.ROM_FLEXION_TARGET) {
            feedback = {
              errorType: "rom_incompleto_arriba",
              message: "Sube más la pesa. Contrae el bíceps completo.",
            };
            // ACTIVAMOS EL BLOQUEO
            this.currentErrorFase = "CONCENTRIC";
          } else {
            // ÉXITO EN LA SUBIDA
            this.concentricSuccess = true;
          }
        }
        this.maxAngleReached = currentAngle;
      }

      this.currentPhase = "ECCENTRIC";
      this.maxAngleReached = Math.max(this.maxAngleReached, currentAngle);
      this.prevAngle = currentAngle; // Actualizamos referencia solo al movernos
    }

    // CASO B: Transición a SUBIDA (Fase Concéntrica detectada)
    else if (currentAngle < this.prevAngle - this.MOVEMENT_THRESHOLD) {
      if (this.currentPhase === "ECCENTRIC") {
        // ... (Tu lógica de amplitud se mantiene igual) ...
        const amplitude = Math.abs(this.maxAngleReached - this.minAngleReached);

        if (amplitude > this.MIN_AMPLITUDE_THRESHOLD) {
          // VALIDAR LA BAJADA ANTERIOR
          if (this.maxAngleReached < this.ROM_EXTENSION_TARGET) {
            feedback = {
              errorType: "rom_incompleto_abajo",
              message: "Estira el brazo completo al bajar.",
            };
            // ACTIVAMOS EL BLOQUEO
            this.currentErrorFase = "ECCENTRIC";
          } else {
            // ÉXITO EN LA BAJADA
            this.excentricSuccess = true;
          }
        }
        this.minAngleReached = currentAngle;
      }

      this.currentPhase = "CONCENTRIC";
      this.minAngleReached = Math.min(this.minAngleReached, currentAngle);
      this.prevAngle = currentAngle; // Actualizamos referencia solo al movernos
    }

    return feedback;
  }

  public analyze(
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    const nose = landmarks[LANDMARKS.NOSE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

    if (
      !isReliable(nose) ||
      !isReliable(leftShoulder) ||
      !isReliable(rightShoulder)
    ) {
      return {
        errorType: "Posicionamiento",
        message: "Por favor ponte en frente de la cámara.",
      };
    }

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
      return {
        errorType: "Posicionamiento",
        message: "Por favor ponte de perfil.",
      };
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
    const rom = this.checkROM(shoulder, elbow, wrist, width, height);
    if (rom != null) {
      return rom;
    }
    if (this.concentricSuccess && this.excentricSuccess) {
      this.repetitionCounter += 1;
      this.concentricSuccess = false;
      this.excentricSuccess = false;
    }
    return null;
  }
}
