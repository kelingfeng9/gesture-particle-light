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
  }
};

const BODY_ACTION_CONFIGS = {
  "idle-body": {
    copy: "待机：身体星图低速漂浮",
    palette: "body-dim",
    particleStyle: "body-mist",
    mode: "idle-body",
    bodyMode: "ambient",
    contraction: 0.42,
    spread: 0.5,
    vortex: 0.42,
    crescent: 0.04,
    tail: 0.12,
    ribbons: 0,
    rays: 0,
    spikes: 0,
    starfield: 0.24,
    coreIntensity: 0.24,
    turbulence: 0.22,
    limbTrails: 0.16,
    floorPulse: 0,
    bodyAura: 0.28,
    hue: 215,
    secondaryHue: 292
  },
  "hands-up": {
    copy: "举手：双臂光柱上冲",
    palette: "solar-columns",
    particleStyle: "body-columns",
    mode: "hands-up",
    bodyMode: "columns",
    contraction: 0.16,
    spread: 0.78,
    vortex: 0.5,
    crescent: 0.08,
    tail: 0.44,
    ribbons: 0.28,
    rays: 1,
    spikes: 0,
    starfield: 0.72,
    coreIntensity: 0.54,
    turbulence: 0.34,
    limbTrails: 0.68,
    floorPulse: 0.08,
    bodyAura: 0.72,
    hue: 48,
    secondaryHue: 188
  },
  clap: {
    copy: "拍手：中心光核爆开",
    palette: "white-impact",
    particleStyle: "impact-core",
    mode: "clap",
    bodyMode: "impact",
    contraction: 0.92,
    spread: 0.36,
    vortex: 1.18,
    crescent: 0.12,
    tail: 0.18,
    ribbons: 0,
    rays: 0.64,
    spikes: 0.72,
    starfield: 0.3,
    coreIntensity: 1,
    turbulence: 0.16,
    limbTrails: 0.24,
    floorPulse: 0.42,
    bodyAura: 0.64,
    hue: 315,
    secondaryHue: 56
  },
  wave: {
    copy: "挥臂：手臂拖出霓虹光带",
    palette: "aqua-ribbon",
    particleStyle: "limb-ribbon",
    mode: "wave",
    bodyMode: "ribbons",
    contraction: 0.22,
    spread: 0.82,
    vortex: 0.92,
    crescent: 0.42,
    tail: 1,
    ribbons: 1,
    rays: 0,
    spikes: 0,
    starfield: 0.44,
    coreIntensity: 0.42,
    turbulence: 0.82,
    limbTrails: 1,
    floorPulse: 0.04,
    bodyAura: 0.48,
    hue: 184,
    secondaryHue: 244
  },
  "leg-kick": {
    copy: "抬腿：地面刀光划过",
    palette: "lime-blade",
    particleStyle: "floor-blade",
    mode: "leg-kick",
    bodyMode: "blade",
    contraction: 0.3,
    spread: 0.72,
    vortex: 0.48,
    crescent: 1,
    tail: 0.7,
    ribbons: 0.12,
    rays: 0,
    spikes: 0.28,
    starfield: 0.28,
    coreIntensity: 0.48,
    turbulence: 0.54,
    limbTrails: 0.72,
    floorPulse: 0.56,
    bodyAura: 0.36,
    hue: 104,
    secondaryHue: 178
  },
  jump: {
    copy: "跳跃：落地点环形冲击",
    palette: "orange-ground",
    particleStyle: "floor-pulse",
    mode: "jump",
    bodyMode: "floor",
    contraction: 0.18,
    spread: 0.96,
    vortex: 0.34,
    crescent: 0.1,
    tail: 0.38,
    ribbons: 0,
    rays: 0.36,
    spikes: 0.38,
    starfield: 0.76,
    coreIntensity: 0.64,
    turbulence: 0.5,
    limbTrails: 0.42,
    floorPulse: 1,
    bodyAura: 0.56,
    hue: 24,
    secondaryHue: 52
  },
  twist: {
    copy: "转身：躯干旋涡拉开",
    palette: "violet-torso",
    particleStyle: "torso-vortex",
    mode: "twist",
    bodyMode: "vortex",
    contraction: 0.34,
    spread: 0.7,
    vortex: 1.42,
    crescent: 0.36,
    tail: 0.52,
    ribbons: 0.52,
    rays: 0,
    spikes: 0,
    starfield: 0.36,
    coreIntensity: 0.56,
    turbulence: 0.48,
    limbTrails: 0.48,
    floorPulse: 0.12,
    bodyAura: 0.82,
    hue: 268,
    secondaryHue: 326
  },
  dance: {
    copy: "跳舞：全身高能粒子联动",
    palette: "prism-dance",
    particleStyle: "full-body-prism",
    mode: "dance",
    bodyMode: "full-body",
    contraction: 0.12,
    spread: 1,
    vortex: 1.12,
    crescent: 0.62,
    tail: 0.86,
    ribbons: 0.74,
    rays: 0.56,
    spikes: 0.42,
    starfield: 1,
    coreIntensity: 0.76,
    turbulence: 1,
    limbTrails: 1,
    floorPulse: 0.72,
    bodyAura: 1,
    hue: 332,
    secondaryHue: 176
  }
};

const TIP_INDICES = [4, 8, 12, 16, 20];
const FINGER_TIPS = [8, 12, 16, 20];
const FINGER_BASES = [5, 9, 13, 17];

export function getGestureConfig(name) {
  return { ...GESTURE_CONFIGS[name] ?? GESTURE_CONFIGS.idle };
}

export function getBodyActionConfig(name) {
  return { ...(BODY_ACTION_CONFIGS[name] ?? BODY_ACTION_CONFIGS["idle-body"]) };
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

  let name = "idle";
  let confidence = 0.4;

  const [indexExtended, middleExtended, ringExtended, pinkyExtended] = fingerStates;

  if (thumbIndexDistance < 0.28 && middleExtended) {
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
