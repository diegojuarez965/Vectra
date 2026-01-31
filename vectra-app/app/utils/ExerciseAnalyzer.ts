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

const VISIBILITY_THRESHOLD = 0.65;

export interface ExerciseFeedback {
  errorType: string;
  message: string;
}

const isReliable = (landmark: NormalizedLandmark | undefined): boolean => {
  return landmark !== undefined && landmark.visibility > VISIBILITY_THRESHOLD;
};

export const calculateAngle = (
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

export const checkPosicionCodo = (
  hip: NormalizedLandmark,
  shoulder: NormalizedLandmark,
  elbow: NormalizedLandmark,
  isFacingLeft: boolean,
  width: number,
  height: number,
): ExerciseFeedback | null => {
  const separationAngle = calculateAngle(hip, shoulder, elbow, width, height);
  const DRIFT_THRESHOLD = 20.0;

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
        errorType: "codo_adelantado",
        message:
          "Mantén el codo pegado al cuerpo. No lo lleves hacia adelante.",
      };
    } else {
      return {
        errorType: "codo_atrasado",
        message: "El codo se está yendo hacia atrás. Alinéalo con tu torso.",
      };
    }
  }

  return null;
};

export class BicepCurlAnalyzer {
  public analyze(
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
  ): ExerciseFeedback | null {
    const nose = landmarks[LANDMARKS.NOSE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

    if (!isReliable(nose)) {
      return {
        errorType: "cuerpo_no_visible",
        message:
          "Por favor, colócate de perfil para que la cámara vea tu rostro.",
      };
    }

    const noseX = nose.x * width;
    const midShoulderX = ((leftShoulder.x + rightShoulder.x) / 2) * width;

    const isFacingLeft = noseX < midShoulderX;

    let hip, shoulder, elbow;

    if (isFacingLeft) {
      hip = landmarks[LANDMARKS.LEFT_HIP];
      shoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
      elbow = landmarks[LANDMARKS.LEFT_ELBOW];
    } else {
      hip = landmarks[LANDMARKS.RIGHT_HIP];
      shoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
      elbow = landmarks[LANDMARKS.RIGHT_ELBOW];
    }

    if (!isReliable(hip) || !isReliable(shoulder) || !isReliable(elbow)) {
      return {
        errorType: "brazo_no_visible",
        message: "Asegúrate de que tu cadera, hombro y codo sean visibles.",
      };
    }

    return checkPosicionCodo(hip, shoulder, elbow, isFacingLeft, width, height);
  }
}
