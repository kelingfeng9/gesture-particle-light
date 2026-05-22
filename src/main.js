import { getBodyActionConfig, smoothGestureState } from "./gesture.js";
import {
  POSE,
  analyzeBodyMotion,
  createDemoBodyFrame,
  getBodyEmitters
} from "./motion/bodyMetrics.js";
import { FullBodyTracker, fullBodyTrackerRuntime } from "./vision/fullBodyTracker.js";

window.__gestureRuntime = {
  mode: "full-body-mvp",
  hasPose: true,
  hasHands: true,
  trackerReady: false,
  tasksVision: fullBodyTrackerRuntime.tasksVersion
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

const ACTION_LABELS = {
  "idle-body": "待机",
  "hands-up": "举手",
  clap: "拍手",
  wave: "挥臂",
  "leg-kick": "抬腿",
  jump: "跳跃",
  twist: "转身",
  dance: "跳舞"
};

const BODY_CONNECTIONS = [
  [POSE.LEFT_SHOULDER, POSE.RIGHT_SHOULDER],
  [POSE.LEFT_SHOULDER, POSE.LEFT_ELBOW],
  [POSE.LEFT_ELBOW, POSE.LEFT_WRIST],
  [POSE.RIGHT_SHOULDER, POSE.RIGHT_ELBOW],
  [POSE.RIGHT_ELBOW, POSE.RIGHT_WRIST],
  [POSE.LEFT_SHOULDER, POSE.LEFT_HIP],
  [POSE.RIGHT_SHOULDER, POSE.RIGHT_HIP],
  [POSE.LEFT_HIP, POSE.RIGHT_HIP],
  [POSE.LEFT_HIP, POSE.LEFT_KNEE],
  [POSE.LEFT_KNEE, POSE.LEFT_ANKLE],
  [POSE.RIGHT_HIP, POSE.RIGHT_KNEE],
  [POSE.RIGHT_KNEE, POSE.RIGHT_ANKLE]
];

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

const bodyTracker = new FullBodyTracker({ maxFps: 24 });
let previousBodyFrame = null;

const tracking = {
  live: false,
  lastTime: performance.now(),
  current: createBodyGesture(
    analyzeBodyMotion(createDemoBodyFrame("hands-up", { x: 0.52, y: 0.5 }))
  )
};

class ParticleField {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.ctx = targetCanvas.getContext("2d");
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.state = getBodyActionConfig("hands-up");
    this.target = getBodyActionConfig("hands-up");
    this.scene = tracking.current;
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

    const targetCount = this.width < 760 ? 980 : 1900;
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
      size: 0.34 + radius * 1.4 + fract(Math.sin(index * 4.91) * 381.77) * 0.76,
      hueShift: (band - 0.5) * 40 + lane * 14,
      lane,
      depth: 0.35 + fract(Math.sin(index * 19.27) * 8712.6) * 0.9,
      sparkle: fract(Math.sin(index * 29.11) * 771.13)
    };
  }

  setScene(scene) {
    this.scene = scene;
    this.target = scene.config;
  }

  render(now) {
    this.frame += 1;
    const time = now * 0.001;
    this.state = smoothGestureState(this.state, this.target, 0.075);
    this.fadeCanvas();
    this.drawAtmosphere(time);

    const center = toScreen(this.scene.center ?? pointer);
    const head = toScreen(this.scene.head ?? { x: pointer.x, y: pointer.y - 0.16 });
    const beamVector = normalize({
      x: head.x - center.x || 0.1,
      y: head.y - center.y || -1
    });
    const emitters = this.screenEmitters();
    const maxRadius = Math.min(this.width, this.height) * (0.16 + this.state.spread * 0.42);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";

    for (const particle of this.particles) {
      const collapse = this.state.contraction * 0.88;
      const swirlSpeed = time * (0.22 + this.state.vortex * 0.7) * (particle.band > 0.5 ? 1 : -1);
      const spiralAngle = particle.angle + particle.radius * (2.1 + this.state.vortex * 2.5) + swirlSpeed;
      const noise = Math.sin(time * 0.86 + particle.phase) * this.state.turbulence;
      const ringRadius = maxRadius * (0.08 + particle.radius * (0.28 + this.state.spread * 0.92));
      const radius = ringRadius * (1 - collapse) + (5 + particle.radius * 20) * collapse;
      let targetX = center.x + Math.cos(spiralAngle + noise * 0.36) * radius * (1.04 + particle.lane * 0.07);
      let targetY = center.y + Math.sin(spiralAngle + noise * 0.24) * radius * (0.68 + particle.depth * 0.08);

      if (emitters.length) {
        const emitter = emitters[Math.min(emitters.length - 1, Math.floor(particle.band * emitters.length))];
        const emitterRadius = maxRadius * (0.035 + particle.radius * (0.16 + this.state.spread * 0.18));
        let bodyX = emitter.x + Math.cos(spiralAngle + particle.lane) * emitterRadius;
        let bodyY = emitter.y + Math.sin(spiralAngle + particle.depth) * emitterRadius * 0.72;

        if (this.state.bodyMode === "columns" && emitter.id.includes("Hand")) {
          bodyX = emitter.x + particle.lane * 18 + Math.sin(time * 4 + particle.phase) * 8;
          bodyY = emitter.y - particle.radius * maxRadius * 1.1;
        }

        if (this.state.bodyMode === "impact") {
          const impactRadius = maxRadius * (0.1 + particle.radius * 0.9);
          bodyX = center.x + Math.cos(spiralAngle) * impactRadius;
          bodyY = center.y + Math.sin(spiralAngle) * impactRadius * 0.7;
        }

        if (this.state.bodyMode === "floor" && emitter.id.includes("Foot")) {
          bodyX = emitter.x + Math.cos(spiralAngle) * maxRadius * particle.radius * 0.52;
          bodyY = Math.max(emitter.y, this.height * 0.76) + Math.sin(spiralAngle) * 18;
        }

        targetX = mix(targetX, bodyX, 0.42 + this.state.bodyAura * 0.28);
        targetY = mix(targetY, bodyY, 0.42 + this.state.bodyAura * 0.28);
      }

      if (this.state.starfield > 0.08) {
        const dustRadius = maxRadius * (0.34 + particle.radius * 1.18);
        const dustAngle = particle.angle + Math.sin(particle.phase + time * 0.28) * 0.42;
        const dustX = center.x + Math.cos(dustAngle) * dustRadius * (1.08 + particle.depth * 0.24);
        const dustY = center.y + Math.sin(dustAngle) * dustRadius * (0.58 + particle.depth * 0.22);
        const starMix = this.state.starfield * (1 - this.state.contraction * 0.62);
        targetX = mix(targetX, dustX, starMix * 0.44);
        targetY = mix(targetY, dustY, starMix * 0.44);
      }

      if (this.state.ribbons > 0.05) {
        const helixSpan = (particle.band - 0.5) * maxRadius * 1.55;
        const helixSide = (particle.sparkle > 0.5 ? 1 : -1) * Math.sin(particle.band * Math.PI * 8 + time * 3.4 + particle.phase * 0.25);
        const ribbonX = center.x + beamVector.x * helixSpan - beamVector.y * helixSide * maxRadius * 0.2;
        const ribbonY = center.y + beamVector.y * helixSpan + beamVector.x * helixSide * maxRadius * 0.2;
        targetX = mix(targetX, ribbonX, this.state.ribbons * 0.34);
        targetY = mix(targetY, ribbonY, this.state.ribbons * 0.34);
      }

      if (this.state.crescent > 0.05) {
        const arcProgress = particle.band * 0.86 + 0.07;
        const arcAngle = -Math.PI * 0.78 + arcProgress * Math.PI * 1.52 + Math.sin(particle.phase) * 0.04;
        const arcRadius = maxRadius * (0.54 + this.state.spread * 0.28 + particle.lane * 0.025);
        const arcCenterX = center.x + beamVector.x * maxRadius * 0.18;
        const arcCenterY = center.y + beamVector.y * maxRadius * 0.18;
        targetX = mix(targetX, arcCenterX + Math.cos(arcAngle) * arcRadius, this.state.crescent * 0.38);
        targetY = mix(targetY, arcCenterY + Math.sin(arcAngle) * arcRadius * 0.92, this.state.crescent * 0.38);
      }

      if (this.state.tail > 0.08) {
        targetX += particle.lane * this.state.tail * 76;
        targetY += Math.sin(time * 2.3 + particle.phase) * this.state.tail * 32;
      }

      const pull = 0.01 + this.state.contraction * 0.02 + this.state.vortex * 0.004;
      particle.vx += (targetX - particle.x) * pull;
      particle.vy += (targetY - particle.y) * pull;
      particle.vx *= 0.84;
      particle.vy *= 0.84;
      particle.x += particle.vx;
      particle.y += particle.vy;

      const speedGlow = Math.min(Math.hypot(particle.vx, particle.vy) * 0.032, 0.54);
      const sparkleBoost = particle.sparkle > 0.82 ? 0.18 + this.state.starfield * 0.18 : 0;
      const hue = this.state.hue + particle.hueShift + Math.sin(time + particle.phase) * 12;
      const alpha = 0.06 + this.scene.confidence * 0.22 + speedGlow + sparkleBoost;
      const lineBoost = this.state.limbTrails * 0.12 + this.state.floorPulse * 0.1 + this.state.ribbons * 0.12;
      const lightness = 54 + speedGlow * 30 + particle.sparkle * 9 + this.state.rays * 8;

      if (this.state.tail > 0.12 || this.state.limbTrails > 0.4 || this.state.spikes > 0.08 || speedGlow > 0.1) {
        this.ctx.strokeStyle = `hsla(${hue}, 98%, ${lightness}%, ${Math.min(alpha * (0.5 + lineBoost), 0.52)})`;
        this.ctx.lineWidth = Math.max(0.6, particle.size * 0.72);
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x - particle.vx * (2.6 + this.state.tail * 3.8), particle.y - particle.vy * (2.6 + this.state.tail * 3.8));
        this.ctx.lineTo(particle.x, particle.y);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = `hsla(${hue}, 98%, ${lightness}%, ${Math.min(alpha, 0.84)})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size + speedGlow * 1.7, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.drawSpecialOverlays(center, beamVector, time, maxRadius);
    this.drawBodyLimbTrails(time);
    this.drawFloorPulse(time, maxRadius);
    this.drawCrescent(center, beamVector, time, maxRadius);
    this.drawCore(center, time);
    this.drawBodyTrace(this.scene);
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
      this.ctx.strokeStyle = `hsla(${ribbon ? this.state.secondaryHue : this.state.hue}, 100%, 66%, ${0.28 * this.state.ribbons})`;
      this.ctx.lineWidth = 4 - ribbon;
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
      gradient.addColorStop(0, `hsla(${this.state.secondaryHue}, 100%, 80%, ${0.46 * this.state.rays})`);
      gradient.addColorStop(1, `hsla(${this.state.hue}, 100%, 58%, 0)`);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 12;
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
      this.ctx.strokeStyle = `hsla(${spike % 2 ? this.state.secondaryHue : this.state.hue}, 100%, 62%, ${0.38 * this.state.spikes})`;
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
      this.ctx.strokeStyle = `hsla(${this.state.hue + i * 7}, 100%, ${58 + i * 8}%, ${alpha * (0.16 - i * 0.026)})`;
      this.ctx.lineWidth = 18 - i * 4;
      this.ctx.beginPath();
      this.ctx.arc(arcCenterX, arcCenterY, radius + i * 3 + Math.sin(time + i) * 2, start, end);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawCore(center, time) {
    const pulse = 1 + Math.sin(time * (3.2 + this.state.vortex)) * 0.08;
    const coreRadius = 8 + this.state.coreIntensity * 42 + this.state.contraction * 20;
    const gradient = this.ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, coreRadius * 3.4);
    gradient.addColorStop(0, `hsla(${this.state.hue}, 100%, 78%, ${0.28 + this.state.coreIntensity * 0.3})`);
    gradient.addColorStop(0.18, `hsla(${this.state.secondaryHue}, 100%, 66%, ${0.1 + this.state.coreIntensity * 0.12})`);
    gradient.addColorStop(0.42, `hsla(${this.state.hue + 22}, 100%, 54%, ${0.07 + this.state.vortex * 0.05})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, coreRadius * 3.4 * pulse, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawBodyLimbTrails(time) {
    if (!this.scene.poseLandmarks?.length || this.state.limbTrails < 0.12) return;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    for (const [from, to] of BODY_CONNECTIONS) {
      const a = this.scene.poseLandmarks[from];
      const b = this.scene.poseLandmarks[to];
      if (!visible(a) || !visible(b)) continue;
      const start = toScreen(a);
      const end = toScreen(b);
      const gradient = this.ctx.createLinearGradient(start.x, start.y, end.x, end.y);
      gradient.addColorStop(0, `hsla(${this.state.hue}, 100%, 66%, ${0.08 + this.state.limbTrails * 0.16})`);
      gradient.addColorStop(1, `hsla(${this.state.secondaryHue}, 100%, 64%, ${0.04 + this.state.limbTrails * 0.1})`);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 4 + this.state.limbTrails * 7 + Math.sin(time * 6) * 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawFloorPulse(time, maxRadius) {
    if (this.state.floorPulse < 0.08) return;

    const feet = this.screenEmitters().filter((emitter) => emitter.id.includes("Foot"));
    if (!feet.length) return;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    for (const foot of feet) {
      const pulse = 0.65 + Math.sin(time * 5.2) * 0.12;
      this.ctx.strokeStyle = `hsla(${this.state.secondaryHue}, 100%, 64%, ${0.18 * this.state.floorPulse})`;
      this.ctx.lineWidth = 2.4;
      this.ctx.beginPath();
      this.ctx.ellipse(foot.x, Math.max(foot.y, this.height * 0.78), maxRadius * 0.32 * pulse, maxRadius * 0.07 * pulse, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawBodyTrace(scene) {
    if (!scene.poseLandmarks?.length) return;

    this.ctx.save();
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    this.ctx.fillStyle = "rgba(215, 255, 72, 0.46)";

    for (const [from, to] of BODY_CONNECTIONS) {
      const a = scene.poseLandmarks[from];
      const b = scene.poseLandmarks[to];
      if (!visible(a) || !visible(b)) continue;
      const start = toScreen(a);
      const end = toScreen(b);
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    }

    for (const mark of scene.poseLandmarks) {
      if (!visible(mark)) continue;
      const p = toScreen(mark);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 1.9, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  screenEmitters() {
    return (this.scene.emitters ?? [])
      .map((emitter) => ({
        ...emitter,
        ...toScreen(emitter.point)
      }))
      .filter((emitter) => Number.isFinite(emitter.x) && Number.isFinite(emitter.y));
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
  pointer.y = clamp(event.clientY / window.innerHeight, 0.08, 0.82);
  pointer.active = true;
  pointer.lastMove = performance.now();

  if (!tracking.live) {
    const activeChip = document.querySelector(".gesture-chip.active");
    const demoName = activeChip?.dataset.demo ?? "hands-up";
    applyGesture(createDemoGesture(demoName, pointer));
  }
});

async function startCamera() {
  startButton.disabled = true;
  statusText.textContent = "正在加载全身识别";
  dockNote.textContent = "请后退一点，让摄像头看到头、双手、躯干和腿。";

  try {
    await bodyTracker.initialize();
    window.__gestureRuntime.trackerReady = true;
    await bodyTracker.start(video, onBodyFrame);
    tracking.live = true;
    signalDot.classList.add("is-live");
    statusText.textContent = "全身动作识别中";
    dockNote.textContent = "举手、拍手、挥臂、抬腿、跳跃、转身或跳舞，粒子会绑定到身体部位。";
    startButton.textContent = "识别已启动";
  } catch (error) {
    startButton.disabled = false;
    signalDot.classList.remove("is-live");
    statusText.textContent = "摄像头不可用";
    dockNote.textContent = "无法启动摄像头，已保留鼠标演示模式。请确认浏览器摄像头权限。";
    console.error(error);
  }
}

function onBodyFrame(frame) {
  drawVideoOverlay(frame);

  if (!frame.poseLandmarks?.length) {
    if (performance.now() - tracking.lastTime > 900) {
      applyGesture(createDemoGesture("idle-body", pointer));
    }
    return;
  }

  const analysis = analyzeBodyMotion(frame, previousBodyFrame);
  previousBodyFrame = frame;
  tracking.lastTime = performance.now();
  applyGesture(createBodyGesture(analysis));
}

function applyGesture(gesture) {
  tracking.current = gesture;
  field.setScene(gesture);

  gestureName.textContent = ACTION_LABELS[gesture.name] ?? ACTION_LABELS["idle-body"];
  gestureCopy.textContent = gesture.copy;
  confidenceMeter.style.width = `${Math.round((gesture.confidence ?? 0.4) * 100)}%`;

  for (const chip of gestureChips) {
    chip.classList.toggle("active", chip.dataset.demo === gesture.name);
  }
}

function createBodyGesture(analysis) {
  const config = getBodyActionConfig(analysis.name);
  const emitters = getBodyEmitters(analysis);
  const center = analysis.points?.torso ?? pointer;
  const head = analysis.points?.head ?? { x: center.x, y: center.y - 0.18 };

  return {
    name: analysis.name,
    mode: config.mode,
    copy: `${config.copy} · 能量 ${Math.round(clamp(analysis.motionEnergy ?? 0, 0, 1) * 100)}`,
    confidence: analysis.confidence ?? 0.4,
    center,
    head,
    config,
    emitters,
    poseLandmarks: analysis.poseLandmarks ?? [],
    bodyAnalysis: analysis
  };
}

function createDemoGesture(name, point) {
  const frame = createDemoBodyFrame(name, point);
  const analysis = analyzeBodyMotion(frame, {
    poseLandmarks: frame.previousPoseLandmarks,
    timestamp: frame.previousTimestamp
  });
  return createBodyGesture(analysis);
}

function drawVideoOverlay(frame) {
  const context = handOverlay.getContext("2d");
  const width = handOverlay.clientWidth;
  const height = handOverlay.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  handOverlay.width = Math.floor(width * dpr);
  handOverlay.height = Math.floor(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  context.strokeStyle = "rgba(255, 47, 210, 0.72)";
  context.lineWidth = 2;
  context.fillStyle = "rgba(215, 255, 72, 0.9)";

  for (const [from, to] of BODY_CONNECTIONS) {
    const a = frame.poseLandmarks?.[from];
    const b = frame.poseLandmarks?.[to];
    if (!visible(a) || !visible(b)) continue;
    context.beginPath();
    context.moveTo((1 - a.x) * width, a.y * height);
    context.lineTo((1 - b.x) * width, b.y * height);
    context.stroke();
  }

  for (const mark of frame.poseLandmarks ?? []) {
    if (!visible(mark)) continue;
    context.beginPath();
    context.arc((1 - mark.x) * width, mark.y * height, 2.8, 0, Math.PI * 2);
    context.fill();
  }

  context.strokeStyle = "rgba(68, 255, 244, 0.72)";
  for (const hand of frame.handLandmarks ?? []) {
    for (const [from, to] of HAND_CONNECTIONS) {
      const a = hand[from];
      const b = hand[to];
      context.beginPath();
      context.moveTo((1 - a.x) * width, a.y * height);
      context.lineTo((1 - b.x) * width, b.y * height);
      context.stroke();
    }
  }
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

function visible(point) {
  return point && (point.visibility ?? 1) > 0.18;
}
