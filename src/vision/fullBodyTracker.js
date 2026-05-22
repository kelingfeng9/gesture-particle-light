import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker
} from "@mediapipe/tasks-vision";

const TASKS_VERSION = "0.10.35";
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;
const POSE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";

export class FullBodyTracker {
  constructor({ maxFps = 24 } = {}) {
    this.maxFps = maxFps;
    this.poseLandmarker = null;
    this.handLandmarker = null;
    this.stream = null;
    this.running = false;
    this.lastDetect = 0;
    this.frameHandle = 0;
  }

  async initialize() {
    if (this.poseLandmarker && this.handLandmarker) {
      return;
    }

    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    const baseOptions = {
      delegate: "GPU"
    };

    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        ...baseOptions,
        modelAssetPath: POSE_MODEL
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      outputSegmentationMasks: false
    });

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        ...baseOptions,
        modelAssetPath: HAND_MODEL
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.52,
      minHandPresenceConfidence: 0.52,
      minTrackingConfidence: 0.52
    });
  }

  async start(videoElement, onFrame) {
    await this.initialize();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      }
    });

    videoElement.srcObject = this.stream;
    await videoElement.play();

    this.running = true;
    this.lastDetect = 0;

    const tick = (now) => {
      if (!this.running) return;

      const minFrameTime = 1000 / this.maxFps;
      if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && now - this.lastDetect >= minFrameTime) {
        this.lastDetect = now;
        onFrame(this.detect(videoElement, now));
      }

      this.frameHandle = requestAnimationFrame(tick);
    };

    this.frameHandle = requestAnimationFrame(tick);
  }

  detect(videoElement, timestamp) {
    const pose = this.poseLandmarker.detectForVideo(videoElement, timestamp);
    const hands = this.handLandmarker.detectForVideo(videoElement, timestamp);

    return {
      timestamp,
      poseLandmarks: pose.landmarks?.[0] ?? [],
      poseWorldLandmarks: pose.worldLandmarks?.[0] ?? [],
      handLandmarks: hands.landmarks ?? [],
      handedness: hands.handednesses ?? []
    };
  }

  stop() {
    this.running = false;
    if (this.frameHandle) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = 0;
    }
    for (const track of this.stream?.getTracks() ?? []) {
      track.stop();
    }
    this.stream = null;
  }
}

export const fullBodyTrackerRuntime = {
  tasksVersion: TASKS_VERSION,
  wasmBase: WASM_BASE,
  poseModel: POSE_MODEL,
  handModel: HAND_MODEL
};
