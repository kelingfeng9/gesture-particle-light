export const POSE = {
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
  RIGHT_ANKLE: 28
};

const TRACKED_POINTS = [
  POSE.NOSE,
  POSE.LEFT_SHOULDER,
  POSE.RIGHT_SHOULDER,
  POSE.LEFT_ELBOW,
  POSE.RIGHT_ELBOW,
  POSE.LEFT_WRIST,
  POSE.RIGHT_WRIST,
  POSE.LEFT_HIP,
  POSE.RIGHT_HIP,
  POSE.LEFT_KNEE,
  POSE.RIGHT_KNEE,
  POSE.LEFT_ANKLE,
  POSE.RIGHT_ANKLE
];

const ACTION_COPY = {
  "idle-body": "待机：身体星图低速漂浮",
  "hands-up": "举手：双臂光柱上冲",
  clap: "拍手：中心光核爆开",
  wave: "挥臂：手臂拖出霓虹光带",
  "leg-kick": "抬腿：地面刀光划过",
  jump: "跳跃：落地点环形冲击",
  twist: "转身：躯干旋涡拉开",
  dance: "跳舞：全身高能粒子联动"
};

export function analyzeBodyMotion(frame, previousFrame = null, options = {}) {
  const landmarks = frame?.poseLandmarks;
  if (!Array.isArray(landmarks) || landmarks.length < 29) {
    return createAnalysis("idle-body", frame, previousFrame, options, {
      confidence: 0,
      motionEnergy: 0,
      intensity: 0
    });
  }

  const metrics = collectMetrics(frame, previousFrame);
  let name = "idle-body";
  let confidence = 0.42;
  let intensity = clamp(metrics.motionEnergy, 0.22, 1);
  let activeSide = null;

  if (metrics.handDistance < 0.07 && metrics.previousHandDistance - metrics.handDistance > 0.32) {
    name = "clap";
    confidence = 0.92;
    intensity = 1;
  } else if (metrics.hipUpVelocity < -0.9) {
    name = "jump";
    confidence = clamp(Math.abs(metrics.hipUpVelocity) * 0.7, 0.78, 0.98);
    intensity = clamp(Math.abs(metrics.hipUpVelocity) * 0.8, 0.72, 1);
  } else if (metrics.leftKick || metrics.rightKick) {
    name = "leg-kick";
    activeSide = metrics.leftKick ? "left" : "right";
    confidence = 0.84;
    intensity = 0.82;
  } else if (metrics.bothHandsUp) {
    name = "hands-up";
    confidence = 0.86;
    intensity = 0.78;
  } else if (Math.abs(metrics.rotation) > 0.35) {
    name = "twist";
    confidence = clamp(Math.abs(metrics.rotation) * 1.6, 0.72, 0.96);
    intensity = clamp(Math.abs(metrics.rotation) * 1.8, 0.62, 1);
  } else if (metrics.maxWristLateralSpeed > 2.2) {
    name = "wave";
    confidence = clamp(metrics.maxWristLateralSpeed * 0.24, 0.72, 0.96);
    intensity = clamp(metrics.maxWristLateralSpeed * 0.26, 0.64, 1);
    activeSide = metrics.leftWristLateralSpeed > metrics.rightWristLateralSpeed ? "left" : "right";
  } else if (metrics.motionEnergy > 0.85) {
    name = "dance";
    confidence = clamp(metrics.motionEnergy * 0.9, 0.74, 0.98);
    intensity = clamp(metrics.motionEnergy, 0.74, 1);
  }

  return createAnalysis(name, frame, previousFrame, options, {
    ...metrics,
    activeSide,
    confidence,
    intensity
  });
}

export function createDemoBodyFrame(actionName, point = { x: 0.5, y: 0.52 }) {
  const timestamp = 1000;
  const landmarks = makeBasePose(point);
  const previous = makeBasePose(point);

  if (actionName === "hands-up") {
    landmarks[POSE.LEFT_WRIST] = p(point.x - 0.17, point.y - 0.32);
    landmarks[POSE.RIGHT_WRIST] = p(point.x + 0.17, point.y - 0.32);
  }

  if (actionName === "clap") {
    previous[POSE.LEFT_WRIST] = p(point.x - 0.34, point.y - 0.08);
    previous[POSE.RIGHT_WRIST] = p(point.x + 0.34, point.y - 0.08);
    landmarks[POSE.LEFT_WRIST] = p(point.x - 0.015, point.y - 0.08);
    landmarks[POSE.RIGHT_WRIST] = p(point.x + 0.015, point.y - 0.08);
  }

  if (actionName === "wave") {
    previous[POSE.LEFT_WRIST] = p(point.x - 0.34, point.y - 0.08);
    landmarks[POSE.LEFT_WRIST] = p(point.x + 0.04, point.y - 0.08);
  }

  if (actionName === "leg-kick") {
    landmarks[POSE.LEFT_KNEE] = p(point.x - 0.07, point.y + 0.18);
    landmarks[POSE.LEFT_ANKLE] = p(point.x + 0.14, point.y - 0.02);
  }

  if (actionName === "jump") {
    previous[POSE.LEFT_HIP] = p(point.x - 0.06, point.y + 0.15);
    previous[POSE.RIGHT_HIP] = p(point.x + 0.06, point.y + 0.15);
    landmarks[POSE.LEFT_HIP] = p(point.x - 0.06, point.y + 0.02);
    landmarks[POSE.RIGHT_HIP] = p(point.x + 0.06, point.y + 0.02);
  }

  if (actionName === "twist") {
    landmarks[POSE.LEFT_SHOULDER] = p(point.x - 0.12, point.y - 0.26);
    landmarks[POSE.RIGHT_SHOULDER] = p(point.x + 0.13, point.y - 0.11);
  }

  if (actionName === "dance") {
    previous[POSE.LEFT_ELBOW] = p(point.x - 0.1, point.y + 0.12);
    previous[POSE.RIGHT_ELBOW] = p(point.x + 0.1, point.y - 0.12);
    previous[POSE.LEFT_KNEE] = p(point.x - 0.14, point.y + 0.2);
    previous[POSE.RIGHT_KNEE] = p(point.x + 0.14, point.y + 0.34);
    previous[POSE.LEFT_ANKLE] = p(point.x - 0.12, point.y + 0.34);
    previous[POSE.RIGHT_ANKLE] = p(point.x + 0.12, point.y + 0.46);
    landmarks[POSE.LEFT_ELBOW] = p(point.x - 0.24, point.y - 0.04);
    landmarks[POSE.RIGHT_ELBOW] = p(point.x + 0.24, point.y + 0.06);
    landmarks[POSE.LEFT_KNEE] = p(point.x + 0.02, point.y + 0.34);
    landmarks[POSE.RIGHT_KNEE] = p(point.x - 0.02, point.y + 0.18);
    landmarks[POSE.LEFT_ANKLE] = p(point.x + 0.08, point.y + 0.44);
    landmarks[POSE.RIGHT_ANKLE] = p(point.x - 0.08, point.y + 0.32);
  }

  return {
    poseLandmarks: landmarks,
    previousPoseLandmarks: previous,
    timestamp,
    previousTimestamp: timestamp - 100,
    demoAction: actionName
  };
}

export function getBodyEmitters(analysis) {
  if (!analysis?.points) return [];

  return [
    emitter("leftHand", analysis.points.leftWrist, 1),
    emitter("rightHand", analysis.points.rightWrist, 1),
    emitter("head", analysis.points.head, 0.8),
    emitter("torso", analysis.points.torso, 0.9),
    emitter("leftFoot", analysis.points.leftAnkle, 0.72),
    emitter("rightFoot", analysis.points.rightAnkle, 0.72)
  ].filter((item) => item.point);
}

function collectMetrics(frame, previousFrame) {
  const landmarks = frame.poseLandmarks;
  const previousLandmarks = frame.previousPoseLandmarks ?? previousFrame?.poseLandmarks;
  const timestamp = frame.timestamp ?? performanceNowFallback();
  const previousTimestamp = frame.previousTimestamp ?? previousFrame?.timestamp ?? timestamp - 100;
  const dt = Math.max((timestamp - previousTimestamp) / 1000, 0.016);

  const leftShoulder = point(landmarks, POSE.LEFT_SHOULDER);
  const rightShoulder = point(landmarks, POSE.RIGHT_SHOULDER);
  const leftWrist = point(landmarks, POSE.LEFT_WRIST);
  const rightWrist = point(landmarks, POSE.RIGHT_WRIST);
  const leftHip = point(landmarks, POSE.LEFT_HIP);
  const rightHip = point(landmarks, POSE.RIGHT_HIP);
  const leftKnee = point(landmarks, POSE.LEFT_KNEE);
  const rightKnee = point(landmarks, POSE.RIGHT_KNEE);
  const leftAnkle = point(landmarks, POSE.LEFT_ANKLE);
  const rightAnkle = point(landmarks, POSE.RIGHT_ANKLE);
  const head = point(landmarks, POSE.NOSE);
  const torso = averagePoints([leftShoulder, rightShoulder, leftHip, rightHip]);

  const previousLeftWrist = point(previousLandmarks, POSE.LEFT_WRIST);
  const previousRightWrist = point(previousLandmarks, POSE.RIGHT_WRIST);
  const previousLeftHip = point(previousLandmarks, POSE.LEFT_HIP);
  const previousRightHip = point(previousLandmarks, POSE.RIGHT_HIP);
  const previousTorso = averagePoints([
    point(previousLandmarks, POSE.LEFT_SHOULDER),
    point(previousLandmarks, POSE.RIGHT_SHOULDER),
    previousLeftHip,
    previousRightHip
  ]);

  const handDistance = distance(leftWrist, rightWrist);
  const previousHandDistance = distance(previousLeftWrist, previousRightWrist) || handDistance;
  const shoulderY = Math.min(leftShoulder?.y ?? 1, rightShoulder?.y ?? 1);
  const bothHandsUp = Boolean(leftWrist && rightWrist && leftWrist.y < shoulderY - 0.08 && rightWrist.y < shoulderY - 0.08);
  const leftKick = Boolean(leftAnkle && leftKnee && leftAnkle.y < leftKnee.y - 0.12);
  const rightKick = Boolean(rightAnkle && rightKnee && rightAnkle.y < rightKnee.y - 0.12);
  const hipCenter = averagePoints([leftHip, rightHip]);
  const previousHipCenter = averagePoints([previousLeftHip, previousRightHip]);
  const hipUpVelocity = hipCenter && previousHipCenter ? (hipCenter.y - previousHipCenter.y) / dt : 0;
  const leftWristLateralSpeed = velocity(leftWrist, previousLeftWrist, dt).xAbs;
  const rightWristLateralSpeed = velocity(rightWrist, previousRightWrist, dt).xAbs;
  const maxWristLateralSpeed = Math.max(leftWristLateralSpeed, rightWristLateralSpeed);
  const currentRotation = angle(leftShoulder, rightShoulder) - angle(leftHip, rightHip);
  const previousRotation = angle(point(previousLandmarks, POSE.LEFT_SHOULDER), point(previousLandmarks, POSE.RIGHT_SHOULDER)) -
    angle(previousLeftHip, previousRightHip);
  const rotation = currentRotation - previousRotation;
  const pointSpeeds = TRACKED_POINTS.map((index) => {
    const current = point(landmarks, index);
    const previous = point(previousLandmarks, index);
    return vectorSpeed(current, previous, dt);
  }).filter(Number.isFinite);
  const averageEnergy = average(pointSpeeds.map((speed) => Math.min(speed / 2.6, 1.25)));
  const activeEnergy = average(
    [...pointSpeeds]
      .sort((a, b) => b - a)
      .slice(0, 6)
      .map((speed) => Math.min(speed / 1.7, 1.25))
  );
  const motionEnergy = clamp(Math.max(averageEnergy, activeEnergy), 0, 1.25);

  return {
    handDistance,
    previousHandDistance,
    bothHandsUp,
    leftKick,
    rightKick,
    hipUpVelocity,
    leftWristLateralSpeed,
    rightWristLateralSpeed,
    maxWristLateralSpeed,
    rotation,
    motionEnergy,
    points: {
      head,
      leftShoulder,
      rightShoulder,
      leftWrist,
      rightWrist,
      leftHip,
      rightHip,
      torso: torso ?? previousTorso,
      leftKnee,
      rightKnee,
      leftAnkle,
      rightAnkle
    }
  };
}

function createAnalysis(name, frame, previousFrame, options, metrics) {
  return {
    name: frame?.demoAction ?? name,
    mode: frame?.demoAction ?? name,
    copy: ACTION_COPY[frame?.demoAction ?? name] ?? ACTION_COPY["idle-body"],
    timestamp: frame?.timestamp ?? 0,
    confidence: metrics.confidence ?? 0.4,
    intensity: metrics.intensity ?? 0.4,
    activeSide: metrics.activeSide ?? null,
    motionEnergy: metrics.motionEnergy ?? 0,
    rotation: metrics.rotation ?? 0,
    points: metrics.points ?? null,
    poseLandmarks: frame?.poseLandmarks ?? [],
    previousPoseLandmarks: frame?.previousPoseLandmarks ?? previousFrame?.poseLandmarks ?? [],
    options
  };
}

function makeBasePose(point) {
  const points = Array.from({ length: 33 }, () => p(point.x, point.y, 0.1));
  points[POSE.NOSE] = p(point.x, point.y - 0.34);
  points[POSE.LEFT_SHOULDER] = p(point.x - 0.11, point.y - 0.18);
  points[POSE.RIGHT_SHOULDER] = p(point.x + 0.11, point.y - 0.18);
  points[POSE.LEFT_ELBOW] = p(point.x - 0.16, point.y - 0.02);
  points[POSE.RIGHT_ELBOW] = p(point.x + 0.16, point.y - 0.02);
  points[POSE.LEFT_WRIST] = p(point.x - 0.18, point.y + 0.12);
  points[POSE.RIGHT_WRIST] = p(point.x + 0.18, point.y + 0.12);
  points[POSE.LEFT_HIP] = p(point.x - 0.06, point.y + 0.1);
  points[POSE.RIGHT_HIP] = p(point.x + 0.06, point.y + 0.1);
  points[POSE.LEFT_KNEE] = p(point.x - 0.06, point.y + 0.28);
  points[POSE.RIGHT_KNEE] = p(point.x + 0.06, point.y + 0.28);
  points[POSE.LEFT_ANKLE] = p(point.x - 0.06, point.y + 0.44);
  points[POSE.RIGHT_ANKLE] = p(point.x + 0.06, point.y + 0.44);
  return points;
}

function emitter(id, point, weight) {
  return point ? { id, point, weight } : null;
}

function point(landmarks, index) {
  const value = landmarks?.[index];
  if (!value || (value.visibility ?? 1) < 0.18) return null;
  return value;
}

function p(x, y, visibility = 0.94) {
  return {
    x: clamp(x, 0.02, 0.98),
    y: clamp(y, 0.02, 0.98),
    z: 0,
    visibility
  };
}

function averagePoints(points) {
  const visible = points.filter(Boolean);
  if (!visible.length) return null;
  return {
    x: average(visible.map((item) => item.x)),
    y: average(visible.map((item) => item.y)),
    z: average(visible.map((item) => item.z ?? 0)),
    visibility: average(visible.map((item) => item.visibility ?? 1))
  };
}

function distance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

function angle(a, b) {
  if (!a || !b) return 0;
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function velocity(current, previous, dt) {
  if (!current || !previous) return { x: 0, y: 0, xAbs: 0, yAbs: 0 };
  const x = (current.x - previous.x) / dt;
  const y = (current.y - previous.y) / dt;
  return {
    x,
    y,
    xAbs: Math.abs(x),
    yAbs: Math.abs(y)
  };
}

function vectorSpeed(current, previous, dt) {
  if (!current || !previous) return 0;
  return distance(current, previous) / dt;
}

function average(values) {
  const clean = values.filter(Number.isFinite);
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function performanceNowFallback() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}
