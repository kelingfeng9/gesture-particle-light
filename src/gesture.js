const GESTURE_CONFIGS = {
  idle: {
    copy: "等待：暗场低速呼吸",
    palette: "dim-ambient",
    particleStyle: "mist",
    mode: "idle",
    contraction: 0.5,
    spread: 0.42,
    vortex: 0.58,
    crescent: 0.04,
    tail: 0.12,
    ribbons: 0,
    rays: 0,
    spikes: 0,
    starfield: 0.22,
    coreIntensity: 0.28,
    turbulence: 0.24,
    hue: 292,
    secondaryHue: 214
  },
  open: {
    copy: "张开：星尘向外铺开",
    palette: "gold-dust",
    particleStyle: "dust",
    mode: "expand",
    contraction: 0.1,
    spread: 1,
    vortex: 0.72,
    crescent: 0.12,
    tail: 0.38,
    ribbons: 0,
    rays: 0,
    spikes: 0,
    starfield: 1,
    coreIntensity: 0.34,
    turbulence: 0.62,
    hue: 48,
    secondaryHue: 23
  },
  fist: {
    copy: "握拳：星尘压缩成亮点",
    palette: "cyan-core",
    particleStyle: "core",
    mode: "collapse",
    contraction: 0.98,
    spread: 0.06,
    vortex: 1.08,
    crescent: 0.02,
    tail: 0.08,
    ribbons: 0,
    rays: 0,
    spikes: 0,
    starfield: 0.06,
    coreIntensity: 1,
    turbulence: 0.05,
    hue: 174,
    secondaryHue: 300
  },
  pinch: {
    copy: "捏合：紫色光核高速旋转",
    palette: "magenta-vortex",
    particleStyle: "vortex",
    mode: "nucleus",
    contraction: 0.68,
    spread: 0.24,
    vortex: 1.45,
    crescent: 0.18,
    tail: 0.18,
    ribbons: 0,
    rays: 0,
    spikes: 0,
    starfield: 0.2,
    coreIntensity: 0.86,
    turbulence: 0.14,
    hue: 304,
    secondaryHue: 326
  },
  point: {
    copy: "指向：月牙光轨被拉出",
    palette: "rose-crescent",
    particleStyle: "crescent",
    mode: "beam",
    contraction: 0.48,
    spread: 0.5,
    vortex: 0.38,
    crescent: 1,
    tail: 0.34,
    ribbons: 0,
    rays: 0,
    spikes: 0,
    starfield: 0.14,
    coreIntensity: 0.5,
    turbulence: 0.08,
    hue: 305,
    secondaryHue: 330
  },
  sweep: {
    copy: "挥动：拖尾穿过暗场",
    palette: "blue-comet",
    particleStyle: "stream",
    mode: "sweep",
    contraction: 0.28,
    spread: 0.86,
    vortex: 0.95,
    crescent: 0.72,
    tail: 1,
    ribbons: 0,
    rays: 0,
    spikes: 0,
    starfield: 0.58,
    coreIntensity: 0.45,
    turbulence: 0.95,
    hue: 300,
    secondaryHue: 236
  },
  victory: {
    copy: "V形：双螺旋电蓝光带",
    palette: "electric-double",
    particleStyle: "ribbon",
    mode: "double-helix",
    contraction: 0.32,
    spread: 0.62,
    vortex: 1.18,
    crescent: 0.08,
    tail: 0.42,
    ribbons: 1,
    rays: 0,
    spikes: 0,
    starfield: 0.34,
    coreIntensity: 0.58,
    turbulence: 0.22,
    hue: 205,
    secondaryHue: 274
  },
  three: {
    copy: "三指：三束金白放射",
    palette: "solar-triad",
    particleStyle: "rays",
    mode: "triad",
    contraction: 0.4,
    spread: 0.72,
    vortex: 0.42,
    crescent: 0.06,
    tail: 0.18,
    ribbons: 0,
    rays: 1,
    spikes: 0,
    starfield: 0.42,
    coreIntensity: 0.7,
    turbulence: 0.12,
    hue: 45,
    secondaryHue: 12
  },
  rock: {
    copy: "摇滚：红蓝锯齿闪电",
    palette: "storm-spike",
    particleStyle: "spikes",
    mode: "storm",
    contraction: 0.26,
    spread: 0.68,
    vortex: 0.7,
    crescent: 0.18,
    tail: 0.74,
    ribbons: 0,
    rays: 0,
    spikes: 1,
    starfield: 0.18,
    coreIntensity: 0.62,
    turbulence: 1,
    hue: 352,
    secondaryHue: 222
  },
  ok: {
    copy: "OK：绿金光环层层弹开",
    palette: "lime-ring",
    particleStyle: "rings",
    mode: "ok-rings",
    contraction: 0.34,
    spread: 0.62,
    vortex: 0.56,
    crescent: 0.06,
    tail: 0.16,
    rings: 1,
    starfield: 0.34,
    coreIntensity: 0.62,
    turbulence: 0.18,
    hue: 92,
    secondaryHue: 48
  },
  thumb: {
    copy: "点赞：青白光柱向上拉升",
    palette: "aqua-pillar",
    particleStyle: "pillar",
    mode: "thumb-pillar",
    contraction: 0.3,
    spread: 0.5,
    vortex: 0.34,
    crescent: 0.08,
    tail: 0.28,
    pillar: 1,
    starfield: 0.24,
    coreIntensity: 0.68,
    turbulence: 0.16,
    hue: 186,
    secondaryHue: 62
  },
  call: {
    copy: "电话：橙蓝信号波向外扩散",
    palette: "radio-signal",
    particleStyle: "signal",
    mode: "signal-wave",
    contraction: 0.36,
    spread: 0.66,
    vortex: 0.64,
    crescent: 0.08,
    tail: 0.46,
    signal: 1,
    starfield: 0.32,
    coreIntensity: 0.52,
    turbulence: 0.36,
    hue: 24,
    secondaryHue: 206
  },
  "l-shape": {
    copy: "L形：直角光束切开暗场",
    palette: "laser-corner",
    particleStyle: "corner",
    mode: "corner-beam",
    contraction: 0.42,
    spread: 0.5,
    vortex: 0.24,
    crescent: 0.34,
    tail: 0.22,
    cornerBeam: 1,
    starfield: 0.16,
    coreIntensity: 0.48,
    turbulence: 0.07,
    hue: 332,
    secondaryHue: 58
  },
  "double-open": {
    copy: "双掌：两团星云同时外扩",
    palette: "twin-nebula",
    particleStyle: "dual-dust",
    mode: "dual-expand",
    contraction: 0.12,
    spread: 1,
    vortex: 0.68,
    crescent: 0.08,
    tail: 0.34,
    dual: 1,
    starfield: 1,
    coreIntensity: 0.42,
    turbulence: 0.58,
    hue: 52,
    secondaryHue: 196
  },
  "double-fist": {
    copy: "双拳：双光核向中线压缩",
    palette: "binary-core",
    particleStyle: "dual-core",
    mode: "dual-collapse",
    contraction: 0.94,
    spread: 0.08,
    vortex: 1.12,
    crescent: 0.04,
    tail: 0.08,
    dual: 1,
    shockwave: 1,
    starfield: 0.08,
    coreIntensity: 1,
    turbulence: 0.05,
    hue: 176,
    secondaryHue: 286
  },
  "double-pinch": {
    copy: "双捏合：掌心之间生成能量球",
    palette: "fusion-orb",
    particleStyle: "bridge-orb",
    mode: "fusion",
    contraction: 0.56,
    spread: 0.32,
    vortex: 1.28,
    crescent: 0.12,
    tail: 0.18,
    dual: 1,
    bridge: 1,
    starfield: 0.28,
    coreIntensity: 0.96,
    turbulence: 0.12,
    hue: 284,
    secondaryHue: 166
  },
  "double-victory": {
    copy: "双V：镜像双螺旋光带",
    palette: "mirror-electric",
    particleStyle: "mirror-ribbon",
    mode: "mirror-helix",
    contraction: 0.3,
    spread: 0.66,
    vortex: 1.12,
    crescent: 0.08,
    tail: 0.38,
    dual: 1,
    ribbons: 1,
    mirrors: 1,
    starfield: 0.38,
    coreIntensity: 0.58,
    turbulence: 0.22,
    hue: 208,
    secondaryHue: 296
  },
  clap: {
    copy: "合掌：中心冲击波瞬间爆开",
    palette: "impact-white",
    particleStyle: "shockwave",
    mode: "impact",
    contraction: 0.24,
    spread: 0.9,
    vortex: 0.82,
    crescent: 0.18,
    tail: 0.54,
    dual: 1,
    shockwave: 1.2,
    starfield: 0.5,
    coreIntensity: 0.92,
    turbulence: 0.7,
    hue: 8,
    secondaryHue: 54
  }
};

const TIP_INDICES = [4, 8, 12, 16, 20];
const FINGER_TIPS = [8, 12, 16, 20];
const FINGER_BASES = [5, 9, 13, 17];

export function getGestureConfig(name) {
  return { ...GESTURE_CONFIGS[name] ?? GESTURE_CONFIGS.idle };
}

export function smoothGestureState(current, target, amount = 0.16) {
  const next = {};
  const keys = new Set([...Object.keys(current), ...Object.keys(target)]);

  for (const key of keys) {
    const from = current[key];
    const to = target[key];

    if (Number.isFinite(Number(from)) && Number.isFinite(Number(to))) {
      next[key] = Number(from) + (Number(to) - Number(from)) * amount;
    } else {
      next[key] = to ?? from;
    }
  }

  return next;
}

export function classifyGesture(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) {
    return {
      name: "idle",
      mode: "idle",
      confidence: 0,
      config: getGestureConfig("idle")
    };
  }

  const wrist = landmarks[0];
  const palmCenter = averagePoints([landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]]);
  const palmSize = Math.max(distance(landmarks[0], landmarks[9]), distance(landmarks[5], landmarks[17]), 0.001);
  const thumbIndexDistance = distance(landmarks[4], landmarks[8]) / palmSize;
  const fingerStates = FINGER_TIPS.map((tip, i) => {
    const base = FINGER_BASES[i];
    return landmarks[tip].y < landmarks[base].y - palmSize * 0.22;
  });
  const extendedCount = fingerStates.filter(Boolean).length;
  const avgTipToWrist = average(TIP_INDICES.map((index) => distance(landmarks[index], wrist))) / palmSize;
  const thumbAway = distance(landmarks[4], landmarks[9]) / palmSize > 0.44;
  const thumbUp = landmarks[4].y < landmarks[5].y - palmSize * 0.35;

  let name = "idle";
  let confidence = 0.4;

  const [indexExtended, middleExtended, ringExtended, pinkyExtended] = fingerStates;

  if (thumbIndexDistance < 0.22 && !indexExtended && middleExtended && ringExtended && pinkyExtended) {
    name = "ok";
    confidence = clamp(0.92 - thumbIndexDistance, 0.74, 0.96);
  } else if (thumbUp && extendedCount === 0) {
    name = "thumb";
    confidence = 0.84;
  } else if (thumbAway && !indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    name = "call";
    confidence = 0.82;
  } else if (thumbAway && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    name = "l-shape";
    confidence = 0.82;
  } else if (thumbIndexDistance < 0.28 && middleExtended) {
    name = "pinch";
    confidence = clamp(1 - thumbIndexDistance * 1.8, 0.65, 0.98);
  } else if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    name = "rock";
    confidence = 0.82;
  } else if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
    name = "three";
    confidence = 0.84;
  } else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    name = "victory";
    confidence = 0.84;
  } else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    name = "point";
    confidence = 0.82;
  } else if (extendedCount >= 3 && thumbAway) {
    name = "open";
    confidence = clamp(0.62 + extendedCount * 0.08 + (thumbAway ? 0.08 : 0), 0, 0.98);
  } else if (extendedCount <= 1 && avgTipToWrist < 0.9) {
    name = "fist";
    confidence = clamp(1 - avgTipToWrist * 0.28, 0.66, 0.94);
  }

  const config = getGestureConfig(name);

  return {
    name,
    mode: config.mode,
    confidence,
    center: palmCenter,
    pinchPoint: averagePoints([landmarks[4], landmarks[8]]),
    indexTip: landmarks[8],
    landmarks,
    palmSize,
    extended: {
      index: fingerStates[0],
      middle: fingerStates[1],
      ring: fingerStates[2],
      pinky: fingerStates[3]
    },
    config
  };
}

export function classifyHandScene(handLandmarks) {
  if (!Array.isArray(handLandmarks) || handLandmarks.length === 0) {
    return {
      name: "idle",
      mode: "idle",
      confidence: 0,
      config: getGestureConfig("idle")
    };
  }

  const hands = handLandmarks
    .filter((landmarks) => Array.isArray(landmarks) && landmarks.length >= 21)
    .map((landmarks) => classifyGesture(landmarks))
    .sort((a, b) => a.center.x - b.center.x);

  if (hands.length < 2) {
    return hands[0] ?? {
      name: "idle",
      mode: "idle",
      confidence: 0,
      config: getGestureConfig("idle")
    };
  }

  const [left, right] = hands;
  const palmDistance = distance(left.center, right.center) / Math.max((left.palmSize + right.palmSize) / 2, 0.001);
  let name = "idle";
  let confidence = average([left.confidence, right.confidence]);

  if (left.name === "open" && right.name === "open" && palmDistance < 0.62) {
    name = "clap";
    confidence = clamp(0.9 - palmDistance * 0.2, 0.72, 0.96);
  } else if (left.name === "open" && right.name === "open") {
    name = "double-open";
    confidence = clamp(confidence + 0.06, 0.72, 0.96);
  } else if (left.name === "fist" && right.name === "fist") {
    name = "double-fist";
    confidence = clamp(confidence + 0.06, 0.72, 0.96);
  } else if (left.name === "pinch" && right.name === "pinch") {
    name = "double-pinch";
    confidence = clamp(confidence + 0.06, 0.72, 0.96);
  } else if (left.name === "victory" && right.name === "victory") {
    name = "double-victory";
    confidence = clamp(confidence + 0.06, 0.72, 0.96);
  } else {
    return right.confidence > left.confidence ? right : left;
  }

  const config = getGestureConfig(name);
  const center = averagePoints([left.center, right.center]);

  return {
    name,
    mode: config.mode,
    confidence,
    center,
    pinchPoint: averagePoints([left.pinchPoint, right.pinchPoint]),
    indexTip: averagePoints([left.indexTip, right.indexTip]),
    palmSize: average([left.palmSize, right.palmSize]),
    hands,
    landmarks: left.landmarks,
    config
  };
}

function averagePoints(points) {
  const total = points.reduce(
    (sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
      z: sum.z + (point.z ?? 0)
    }),
    { x: 0, y: 0, z: 0 }
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
    z: total.z / points.length
  };
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.hypot(dx, dy, dz);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
