import "@mediapipe/camera_utils";
import "@mediapipe/hands";
import { classifyGesture, getGestureConfig, smoothGestureState } from "./gesture.js";

const MediaPipeHands = window.Hands;
const MediaPipeCamera = window.Camera;
window.__gestureRuntime = {
  hasHands: Boolean(MediaPipeHands),
  hasCamera: Boolean(MediaPipeCamera)
};

const canvas = document.querySelector("#particle-canvas");
const video = document.querySelector("#input-video");
const handOverlay = document.querySelector("#hand-overlay");
const startButton = document.querySelector("#start-camera");
const toggleVideoButton = document.querySelector("#toggle-video");
const videoMonitor = document.querySelector("#video-monitor");
const statusText = document.querySelector("#camera-status");
const signalDot = document.querySelector("#signal-dot");
const gestureName = document.querySelector("#gesture-name");
const gestureCopy = document.querySelector("#gesture-copy");
const confidenceMeter = document.querySelector("#confidence-meter");
const dockNote = document.querySelector("#dock-note");
const gestureChips = [...document.querySelectorAll("[data-demo]")];

const GESTURE_LABELS = {
  idle: "等待",
  open: "张开",
  fist: "握拳",
  pinch: "捏合",
  point: "指向",
  sweep: "挥动",
  victory: "V形",
  three: "三指",
  rock: "摇滚"
};

const ASSET_BASE = import.meta.env.BASE_URL ?? "/";

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17]
];

const pointer = {
  x: 0.52,
  y: 0.5,
  active: false,
  lastMove: performance.now()
};

const tracking = {
  live: false,
  lastCenter: null,
  lastTime: performance.now(),
  sweepUntil: 0,
  sweepDirection: 1,
  current: {
    name: "open",
    confidence: 0.82,
    center: { x: 0.52, y: 0.5 },
    indexTip: { x: 0.68, y: 0.46 },
    pinchPoint: { x: 0.52, y: 0.5 },
    config: getGestureConfig("open")
  }
};

class ParticleField {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.ctx = targetCanvas.getContext("2d");
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.state = getGestureConfig("open");
    this.target = getGestureConfig("open");
    this.hand = tracking.current;
    this.frame = 0;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const targetCount = this.width < 760 ? 920 : 1680;
    this.particles = Array.from({ length: targetCount }, (_, index) => this.createParticle(index, targetCount));
    this.ctx.fillStyle = "#020106";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  createParticle(index, total) {
    const band = index / total;
    const angle = Math.PI * 2 * fract(Math.sin(index * 91.17) * 6147.21);
    const radius = Math.pow(fract(Math.sin(index * 31.77) * 2143.19), 0.62);
    const lane = (fract(Math.sin(index * 7.41) * 991.8) - 0.5) * 2;

    return {
      x: this.width * (0.48 + Math.cos(angle) * radius * 0.24),
      y: this.height * (0.5 + Math.sin(angle) * radius * 0.22),
      vx: 0,
      vy: 0,
      angle,
      radius,
      band,
      phase: fract(Math.sin(index * 12.9898) * 43758.5453) * Math.PI * 2,
      size: 0.36 + radius * 1.35 + fract(Math.sin(index * 4.91) * 381.77) * 0.72,
      hueShift: (band - 0.5) * 34 + lane * 10,
      lane,
      depth: 0.35 + fract(Math.sin(index * 19.27) * 8712.6) * 0.9,
      sparkle: fract(Math.sin(index * 29.11) * 771.13)
    };
  }

  setGesture(gesture) {
    this.hand = gesture;
    this.target = gesture.config;
  }

  render(now) {
    this.frame += 1;
    const time = now * 0.001;
    this.state = smoothGestureState(this.state, this.target, 0.075);
    this.fadeCanvas();
    this.drawAtmosphere(time);

    const center = toScreen(this.hand.center ?? pointer);
    const indexTip = toScreen(this.hand.indexTip ?? { x: pointer.x + 0.16, y: pointer.y - 0.02 });
    const pinchPoint = toScreen(this.hand.pinchPoint ?? pointer);
    const beamVector = normalize({
      x: indexTip.x - center.x || tracking.sweepDirection,
      y: indexTip.y - center.y || 0
    });
    const maxRadius = Math.min(this.width, this.height) * (0.16 + this.state.spread * 0.42);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";

    for (const particle of this.particles) {
      const collapse = this.state.contraction * 0.94;
      const swirlSpeed = time * (0.2 + this.state.vortex * 0.68) * (particle.band > 0.5 ? 1 : -1);
      const spiralAngle = particle.angle + particle.radius * (2.1 + this.state.vortex * 2.5) + swirlSpeed;
      const noise = Math.sin(time * 0.86 + particle.phase) * this.state.turbulence;
      const ringRadius = maxRadius * (0.08 + particle.radius * (0.28 + this.state.spread * 0.92));
      const radius = ringRadius * (1 - collapse) + (5 + particle.radius * 20) * collapse;
      let targetX = center.x + Math.cos(spiralAngle + noise * 0.36) * radius * (1.04 + particle.lane * 0.07);
      let targetY = center.y + Math.sin(spiralAngle + noise * 0.24) * radius * (0.68 + particle.depth * 0.08);

      if (this.state.starfield > 0.08) {
        const dustRadius = maxRadius * (0.34 + particle.radius * 1.18);
        const dustAngle = particle.angle + Math.sin(particle.phase + time * 0.28) * 0.42;
        const dustX = center.x + Math.cos(dustAngle) * dustRadius * (1.08 + particle.depth * 0.24);
        const dustY = center.y + Math.sin(dustAngle) * dustRadius * (0.58 + particle.depth * 0.22);
        const starMix = this.state.starfield * (1 - this.state.contraction * 0.62);
        targetX = mix(targetX, dustX, starMix * 0.72);
        targetY = mix(targetY, dustY, starMix * 0.72);
      }

      if (this.hand.name === "pinch") {
        const nucleusAngle = spiralAngle * 1.7 + time * 0.65;
        targetX = mix(targetX, pinchPoint.x + Math.cos(nucleusAngle) * radius * 0.26, 0.76);
        targetY = mix(targetY, pinchPoint.y + Math.sin(nucleusAngle) * radius * 0.26, 0.76);
      }

      if (this.state.ribbons > 0.05) {
        const helixSpan = (particle.band - 0.5) * maxRadius * 1.55;
        const helixSide = (particle.sparkle > 0.5 ? 1 : -1) * Math.sin(particle.band * Math.PI * 8 + time * 3.4 + particle.phase * 0.25);
        const ribbonX = center.x + beamVector.x * helixSpan - beamVector.y * helixSide * maxRadius * 0.2;
        const ribbonY = center.y + beamVector.y * helixSpan + beamVector.x * helixSide * maxRadius * 0.2;
        targetX = mix(targetX, ribbonX, this.state.ribbons * 0.86);
        targetY = mix(targetY, ribbonY, this.state.ribbons * 0.86);
      }

      if (this.state.rays > 0.05) {
        const ray = Math.floor(particle.band * 3);
        const local = fract(particle.band * 3);
        const rayAngle = -Math.PI / 2 + ray * Math.PI * 2 / 3 + Math.sin(time * 0.4) * 0.05;
        const rayRadius = maxRadius * (0.14 + local * 0.98);
        const side = particle.lane * (9 + local * 24);
        const rayX = center.x + Math.cos(rayAngle) * rayRadius - Math.sin(rayAngle) * side;
        const rayY = center.y + Math.sin(rayAngle) * rayRadius + Math.cos(rayAngle) * side;
        targetX = mix(targetX, rayX, this.state.rays * 0.9);
        targetY = mix(targetY, rayY, this.state.rays * 0.9);
      }

      if (this.state.spikes > 0.05) {
        const spikeCount = 11;
        const spike = Math.floor(particle.band * spikeCount);
        const local = fract(particle.band * spikeCount);
        const spikeAngle = -Math.PI * 0.92 + spike * Math.PI * 1.84 / (spikeCount - 1) + Math.sin(time * 8 + particle.phase) * 0.08;
        const spikeRadius = maxRadius * (0.2 + local * (0.64 + particle.sparkle * 0.42));
        const jag = Math.sin(local * Math.PI * 5 + time * 9 + particle.phase) * (18 + this.state.turbulence * 18);
        const spikeX = center.x + Math.cos(spikeAngle) * spikeRadius - Math.sin(spikeAngle) * jag;
        const spikeY = center.y + Math.sin(spikeAngle) * spikeRadius + Math.cos(spikeAngle) * jag;
        targetX = mix(targetX, spikeX, this.state.spikes * 0.88);
        targetY = mix(targetY, spikeY, this.state.spikes * 0.88);
      }

      if (this.state.crescent > 0.05) {
        const arcProgress = particle.band * 0.86 + 0.07;
        const arcAngle = -Math.PI * 0.78 + arcProgress * Math.PI * 1.52 + Math.sin(particle.phase) * 0.04;
        const arcRadius = maxRadius * (0.54 + this.state.spread * 0.28 + particle.lane * 0.025);
        const arcCenterX = center.x + beamVector.x * maxRadius * 0.18;
        const arcCenterY = center.y + beamVector.y * maxRadius * 0.18;
        const arcX = arcCenterX + Math.cos(arcAngle) * arcRadius;
        const arcY = arcCenterY + Math.sin(arcAngle) * arcRadius * 0.92;
        targetX = mix(targetX, arcX, this.state.crescent * 0.9);
        targetY = mix(targetY, arcY, this.state.crescent * 0.9);
      }

      if (this.state.tail > 0.08) {
        targetX += tracking.sweepDirection * particle.lane * this.state.tail * 90;
        targetY += Math.sin(time * 2.3 + particle.phase) * this.state.tail * 34;
      }

      const pull = 0.01 + this.state.contraction * 0.022 + this.state.vortex * 0.004;
      particle.vx += (targetX - particle.x) * pull;
      particle.vy += (targetY - particle.y) * pull;
      particle.vx *= 0.84;
      particle.vy *= 0.84;
      particle.x += particle.vx;
      particle.y += particle.vy;

      const speedGlow = Math.min(Math.hypot(particle.vx, particle.vy) * 0.032, 0.52);
      const sparkleBoost = particle.sparkle > 0.82 ? 0.18 + this.state.starfield * 0.18 : 0;
      const hue = this.state.hue + particle.hueShift + Math.sin(time + particle.phase) * 9;
      const alpha = 0.06 + this.hand.confidence * 0.22 + speedGlow + sparkleBoost;
      const lineBoost = this.state.ribbons * 0.14 + this.state.rays * 0.18 + this.state.spikes * 0.22;
      const lightness = 54 + speedGlow * 30 + particle.sparkle * 9 + this.state.rays * 10;

      if (this.state.tail > 0.12 || this.state.ribbons > 0.08 || this.state.rays > 0.08 || this.state.spikes > 0.08 || speedGlow > 0.1) {
        this.ctx.strokeStyle = `hsla(${hue}, 98%, ${lightness}%, ${Math.min(alpha * (0.5 + lineBoost), 0.5)})`;
        this.ctx.lineWidth = Math.max(0.6, particle.size * 0.7);
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x - particle.vx * (2.5 + this.state.tail * 3.8 + this.state.spikes * 3), particle.y - particle.vy * (2.5 + this.state.tail * 3.8 + this.state.spikes * 3));
        this.ctx.lineTo(particle.x, particle.y);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = `hsla(${hue}, 98%, ${lightness}%, ${Math.min(alpha, 0.82)})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size + speedGlow * 1.7, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.drawSpecialOverlays(center, beamVector, time, maxRadius);
    this.drawCrescent(center, beamVector, time, maxRadius);
    this.drawCore(center, pinchPoint, time);
    this.drawHandTrace(this.hand);
    this.ctx.restore();
    requestAnimationFrame((nextNow) => this.render(nextNow));
  }

  fadeCanvas() {
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = `rgba(2, 1, 6, ${0.22 - Math.min(this.state.tail * 0.06, 0.06)})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawAtmosphere(time) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    const hazeCenterX = this.width * (0.5 + Math.sin(time * 0.18) * 0.015);
    const hazeCenterY = this.height * (0.44 + Math.cos(time * 0.16) * 0.018);
    const hazeRadius = Math.min(this.width, this.height) * (0.34 + this.state.spread * 0.12);
    const haze = this.ctx.createRadialGradient(hazeCenterX, hazeCenterY, 0, hazeCenterX, hazeCenterY, hazeRadius);
    haze.addColorStop(0, `hsla(${this.state.secondaryHue}, 84%, 70%, ${0.1 + this.state.starfield * 0.03})`);
    haze.addColorStop(0.38, `hsla(${this.state.hue}, 95%, 58%, ${0.055 + this.state.coreIntensity * 0.02})`);
    haze.addColorStop(1, "rgba(0, 0, 0, 0)");
    this.ctx.fillStyle = haze;
    this.ctx.beginPath();
    this.ctx.arc(hazeCenterX, hazeCenterY, hazeRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawCrescent(center, beamVector, time, maxRadius) {
    if (this.state.crescent < 0.16) return;

    const angle = Math.atan2(beamVector.y, beamVector.x);
    const radius = maxRadius * (0.58 + this.state.spread * 0.16);
    const arcCenterX = center.x + beamVector.x * maxRadius * 0.18;
    const arcCenterY = center.y + beamVector.y * maxRadius * 0.18;
    const start = angle - Math.PI * 0.78;
    const end = angle + Math.PI * 0.78;
    const alpha = this.state.crescent;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i += 1) {
      this.ctx.strokeStyle = `hsla(${this.state.hue + i * 7}, 100%, ${58 + i * 8}%, ${alpha * (0.18 - i * 0.028)})`;
      this.ctx.lineWidth = 18 - i * 4;
      this.ctx.beginPath();
      this.ctx.arc(arcCenterX, arcCenterY, radius + i * 3 + Math.sin(time + i) * 2, start, end);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = `hsla(${this.state.hue + 12}, 100%, 62%, ${alpha * 0.72})`;
    this.ctx.lineWidth = 2.2;
    this.ctx.beginPath();
    this.ctx.arc(arcCenterX, arcCenterY, radius, start + 0.04, end - 0.04);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawSpecialOverlays(center, beamVector, time, maxRadius) {
    if (this.state.ribbons > 0.08) {
      this.drawRibbons(center, beamVector, time, maxRadius);
    }
    if (this.state.rays > 0.08) {
      this.drawRays(center, time, maxRadius);
    }
    if (this.state.spikes > 0.08) {
      this.drawSpikes(center, time, maxRadius);
    }
  }

  drawRibbons(center, beamVector, time, maxRadius) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    for (let ribbon = 0; ribbon < 2; ribbon += 1) {
      this.ctx.strokeStyle = `hsla(${ribbon ? this.state.secondaryHue : this.state.hue}, 100%, 66%, ${0.32 * this.state.ribbons})`;
      this.ctx.lineWidth = 3.8 - ribbon;
      this.ctx.beginPath();
      for (let i = 0; i <= 84; i += 1) {
        const t = i / 84;
        const along = (t - 0.5) * maxRadius * 1.65;
        const wave = Math.sin(t * Math.PI * 8 + time * 3.4 + ribbon * Math.PI) * maxRadius * 0.18;
        const x = center.x + beamVector.x * along - beamVector.y * wave;
        const y = center.y + beamVector.y * along + beamVector.x * wave;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawRays(center, time, maxRadius) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    for (let ray = 0; ray < 3; ray += 1) {
      const angle = -Math.PI / 2 + ray * Math.PI * 2 / 3 + Math.sin(time * 0.4) * 0.05;
      const gradient = this.ctx.createLinearGradient(
        center.x,
        center.y,
        center.x + Math.cos(angle) * maxRadius,
        center.y + Math.sin(angle) * maxRadius
      );
      gradient.addColorStop(0, `hsla(${this.state.secondaryHue}, 100%, 80%, ${0.52 * this.state.rays})`);
      gradient.addColorStop(1, `hsla(${this.state.hue}, 100%, 58%, 0)`);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 13;
      this.ctx.beginPath();
      this.ctx.moveTo(center.x, center.y);
      this.ctx.lineTo(center.x + Math.cos(angle) * maxRadius * 0.92, center.y + Math.sin(angle) * maxRadius * 0.92);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawSpikes(center, time, maxRadius) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.lineWidth = 2.2;
    for (let spike = 0; spike < 7; spike += 1) {
      const base = -Math.PI * 0.86 + spike * Math.PI * 1.72 / 6;
      this.ctx.strokeStyle = `hsla(${spike % 2 ? this.state.secondaryHue : this.state.hue}, 100%, 62%, ${0.42 * this.state.spikes})`;
      this.ctx.beginPath();
      for (let i = 0; i <= 6; i += 1) {
        const t = i / 6;
        const radius = maxRadius * (0.16 + t * 0.72);
        const jag = Math.sin(time * 10 + spike * 1.7 + i * 2.4) * 0.12;
        const angle = base + jag;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawCore(center, pinchPoint, time) {
    const pulse = 1 + Math.sin(time * (3.2 + this.state.vortex)) * 0.08;
    const coreRadius = 8 + this.state.coreIntensity * 44 + this.state.contraction * 22;
    const coreX = this.hand.name === "pinch" ? pinchPoint.x : center.x;
    const coreY = this.hand.name === "pinch" ? pinchPoint.y : center.y;
    const gradient = this.ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreRadius * 3.4);
    gradient.addColorStop(0, `hsla(${this.state.hue}, 100%, 78%, ${0.36 + this.state.coreIntensity * 0.32})`);
    gradient.addColorStop(0.18, `hsla(${this.state.secondaryHue}, 100%, 66%, ${0.12 + this.state.coreIntensity * 0.12})`);
    gradient.addColorStop(0.42, `hsla(${this.state.hue + 22}, 100%, 54%, ${0.08 + this.state.vortex * 0.06})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(coreX, coreY, coreRadius * 3.4 * pulse, 0, Math.PI * 2);
    this.ctx.fill();

    if (this.hand.name === "pinch") {
      this.ctx.strokeStyle = `hsla(${this.state.hue}, 100%, 68%, 0.7)`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(pinchPoint.x, pinchPoint.y, coreRadius * 0.92, time, time + Math.PI * 1.62);
      this.ctx.stroke();
    }
  }

  drawHandTrace(gesture) {
    if (!gesture.landmarks) return;

    this.ctx.save();
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeStyle = "rgba(255, 47, 210, 0.24)";
    this.ctx.fillStyle = "rgba(215, 255, 72, 0.56)";

    for (const [from, to] of HAND_CONNECTIONS) {
      const a = toScreen(gesture.landmarks[from]);
      const b = toScreen(gesture.landmarks[to]);
      this.ctx.beginPath();
      this.ctx.moveTo(a.x, a.y);
      this.ctx.lineTo(b.x, b.y);
      this.ctx.stroke();
    }

    for (const mark of gesture.landmarks) {
      const p = toScreen(mark);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }
}

const field = new ParticleField(canvas);
requestAnimationFrame((now) => field.render(now));
applyGesture(tracking.current);

startButton.addEventListener("click", startCamera);
toggleVideoButton.addEventListener("click", () => {
  const visible = !videoMonitor.classList.contains("is-visible");
  videoMonitor.classList.toggle("is-visible", visible);
  toggleVideoButton.setAttribute("aria-pressed", String(visible));
  toggleVideoButton.textContent = visible ? "隐藏画面" : "显示画面";
});

gestureChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const name = chip.dataset.demo;
    pointer.active = true;
    const stablePoint = tracking.current.center ?? pointer;
    applyGesture(createDemoGesture(name, stablePoint));
  });
});

window.addEventListener("pointermove", (event) => {
  if (event.target.closest("button, .hud-panel, .control-dock, .gesture-strip, .signal-readout")) {
    return;
  }

  pointer.x = clamp(event.clientX / window.innerWidth, 0.02, 0.98);
  pointer.y = clamp(event.clientY / window.innerHeight, 0.04, 0.96);
  pointer.active = true;
  pointer.lastMove = performance.now();

  if (!tracking.live) {
    const activeChip = document.querySelector(".gesture-chip.active");
    const demoName = activeChip?.dataset.demo ?? "open";
    applyGesture(createDemoGesture(demoName, pointer));
  }
});

async function startCamera() {
  startButton.disabled = true;
  statusText.textContent = "正在加载手部识别";
  dockNote.textContent = "浏览器弹出权限提示时请选择允许。";

  try {
    await waitForMediaPipe();
    const hands = new MediaPipeHands({
      locateFile: (file) => `${ASSET_BASE}mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.68,
      minTrackingConfidence: 0.62
    });

    hands.onResults(onHandResults);

    const camera = new MediaPipeCamera(video, {
      width: 960,
      height: 540,
      onFrame: async () => {
        await hands.send({ image: video });
      }
    });

    await camera.start();
    tracking.live = true;
    signalDot.classList.add("is-live");
    statusText.textContent = "摄像头识别中";
    dockNote.textContent = "单手张开、握拳、捏合、指向、V形、三指、摇滚，或快速左右挥动。";
    startButton.textContent = "识别已启动";
  } catch (error) {
    startButton.disabled = false;
    signalDot.classList.remove("is-live");
    statusText.textContent = "摄像头不可用";
    dockNote.textContent = "无法启动摄像头，已保留鼠标演示模式。请确认浏览器摄像头权限。";
    console.error(error);
  }
}

function onHandResults(results) {
  drawVideoOverlay(results);

  if (!results.multiHandLandmarks?.length) {
    if (performance.now() - tracking.lastTime > 900) {
      applyGesture(createDemoGesture("idle", pointer));
    }
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const classified = classifyGesture(landmarks);
  classified.landmarks = landmarks;

  const now = performance.now();
  const center = classified.center;
  if (tracking.lastCenter) {
    const dt = Math.max((now - tracking.lastTime) / 1000, 0.016);
    const velocityX = (center.x - tracking.lastCenter.x) / dt;
    if (Math.abs(velocityX) > 0.8 && classified.name === "open") {
      tracking.sweepUntil = now + 520;
      tracking.sweepDirection = velocityX > 0 ? -1 : 1;
    }
  }

  tracking.lastCenter = center;
  tracking.lastTime = now;

  if (now < tracking.sweepUntil) {
    classified.name = "sweep";
    classified.mode = "sweep";
    classified.config = getGestureConfig("sweep");
    classified.indexTip = {
      x: clamp(classified.center.x - tracking.sweepDirection * 0.24, 0.04, 0.96),
      y: classified.center.y
    };
  }

  applyGesture(classified);
}

function applyGesture(gesture) {
  tracking.current = gesture;
  field.setGesture(gesture);

  gestureName.textContent = GESTURE_LABELS[gesture.name] ?? GESTURE_LABELS.idle;
  gestureCopy.textContent = gesture.config.copy;
  confidenceMeter.style.width = `${Math.round((gesture.confidence ?? 0.4) * 100)}%`;

  for (const chip of gestureChips) {
    chip.classList.toggle("active", chip.dataset.demo === gesture.name);
  }
}

function createDemoGesture(name, point) {
  const config = getGestureConfig(name);
  const center = { x: point.x, y: point.y };
  const indexTip = name === "point" || name === "sweep" || name === "victory" || name === "three" || name === "rock"
    ? { x: clamp(point.x + 0.2, 0.02, 0.98), y: clamp(point.y - 0.04, 0.02, 0.98) }
    : { x: clamp(point.x + 0.08, 0.02, 0.98), y: clamp(point.y - 0.1, 0.02, 0.98) };

  return {
    name,
    mode: config.mode,
    confidence: name === "idle" ? 0.28 : 0.78,
    center,
    indexTip,
    pinchPoint: { x: point.x, y: point.y },
    config
  };
}

function drawVideoOverlay(results) {
  const context = handOverlay.getContext("2d");
  const width = handOverlay.clientWidth;
  const height = handOverlay.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  handOverlay.width = Math.floor(width * dpr);
  handOverlay.height = Math.floor(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const landmarks = results.multiHandLandmarks?.[0];
  if (!landmarks) return;

  context.strokeStyle = "rgba(255, 47, 210, 0.72)";
  context.lineWidth = 2;
  context.fillStyle = "rgba(215, 255, 72, 0.9)";

  for (const [from, to] of HAND_CONNECTIONS) {
    const a = landmarks[from];
    const b = landmarks[to];
    context.beginPath();
    context.moveTo((1 - a.x) * width, a.y * height);
    context.lineTo((1 - b.x) * width, b.y * height);
    context.stroke();
  }

  for (const mark of landmarks) {
    context.beginPath();
    context.arc((1 - mark.x) * width, mark.y * height, 2.8, 0, Math.PI * 2);
    context.fill();
  }
}

function waitForMediaPipe() {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const check = () => {
      if (MediaPipeHands && MediaPipeCamera) {
        resolve();
        return;
      }
      if (performance.now() - started > 10000) {
        reject(new Error("MediaPipe scripts timed out"));
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

function toScreen(point) {
  return {
    x: (1 - point.x) * window.innerWidth,
    y: point.y * window.innerHeight
  };
}

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

function mix(a, b, amount) {
  return a + (b - a) * amount;
}

function fract(value) {
  return value - Math.floor(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
