import test from "node:test";
import assert from "node:assert/strict";
import {
  POSE,
  analyzeBodyMotion,
  createDemoBodyFrame,
  getBodyEmitters
} from "../src/motion/bodyMetrics.js";
import { getBodyActionConfig } from "../src/gesture.js";

const landmark = (x, y, z = 0, visibility = 0.94) => ({ x, y, z, visibility });

function makeFrame(overrides = {}, timestamp = 1000) {
  const points = Array.from({ length: 33 }, () => landmark(0.5, 0.5, 0, 0.1));
  points[POSE.NOSE] = landmark(0.5, 0.18);
  points[POSE.LEFT_SHOULDER] = landmark(0.42, 0.34);
  points[POSE.RIGHT_SHOULDER] = landmark(0.58, 0.34);
  points[POSE.LEFT_ELBOW] = landmark(0.38, 0.48);
  points[POSE.RIGHT_ELBOW] = landmark(0.62, 0.48);
  points[POSE.LEFT_WRIST] = landmark(0.36, 0.62);
  points[POSE.RIGHT_WRIST] = landmark(0.64, 0.62);
  points[POSE.LEFT_HIP] = landmark(0.44, 0.62);
  points[POSE.RIGHT_HIP] = landmark(0.56, 0.62);
  points[POSE.LEFT_KNEE] = landmark(0.44, 0.78);
  points[POSE.RIGHT_KNEE] = landmark(0.56, 0.78);
  points[POSE.LEFT_ANKLE] = landmark(0.44, 0.92);
  points[POSE.RIGHT_ANKLE] = landmark(0.56, 0.92);

  for (const [index, value] of Object.entries(overrides)) {
    points[Number(index)] = value;
  }

  return {
    poseLandmarks: points,
    timestamp
  };
}

test("detects both hands raised above shoulders", () => {
  const frame = makeFrame({
    [POSE.LEFT_WRIST]: landmark(0.36, 0.2),
    [POSE.RIGHT_WRIST]: landmark(0.64, 0.2)
  });

  const result = analyzeBodyMotion(frame);

  assert.equal(result.name, "hands-up");
  assert.equal(result.copy, "举手：双臂光柱上冲");
  assert.ok(result.confidence > 0.7);
});

test("detects clap when hand distance collapses quickly", () => {
  const previous = makeFrame({
    [POSE.LEFT_WRIST]: landmark(0.22, 0.42),
    [POSE.RIGHT_WRIST]: landmark(0.78, 0.42)
  }, 900);
  const current = makeFrame({
    [POSE.LEFT_WRIST]: landmark(0.49, 0.42),
    [POSE.RIGHT_WRIST]: landmark(0.51, 0.42)
  }, 1000);

  const result = analyzeBodyMotion(current, previous);

  assert.equal(result.name, "clap");
  assert.equal(result.intensity, 1);
});

test("detects broad arm wave from wrist lateral speed", () => {
  const previous = makeFrame({
    [POSE.LEFT_WRIST]: landmark(0.26, 0.48),
    [POSE.RIGHT_WRIST]: landmark(0.64, 0.62)
  }, 900);
  const current = makeFrame({
    [POSE.LEFT_WRIST]: landmark(0.56, 0.48),
    [POSE.RIGHT_WRIST]: landmark(0.64, 0.62)
  }, 1000);

  const result = analyzeBodyMotion(current, previous);

  assert.equal(result.name, "wave");
  assert.ok(result.motionEnergy > 0.2);
});

test("detects leg kick when ankle rises above knee", () => {
  const frame = makeFrame({
    [POSE.LEFT_KNEE]: landmark(0.45, 0.68),
    [POSE.LEFT_ANKLE]: landmark(0.58, 0.48)
  });

  const result = analyzeBodyMotion(frame);

  assert.equal(result.name, "leg-kick");
  assert.equal(result.activeSide, "left");
});

test("detects jump from fast upward hip movement", () => {
  const previous = makeFrame({
    [POSE.LEFT_HIP]: landmark(0.44, 0.66),
    [POSE.RIGHT_HIP]: landmark(0.56, 0.66)
  }, 900);
  const current = makeFrame({
    [POSE.LEFT_HIP]: landmark(0.44, 0.54),
    [POSE.RIGHT_HIP]: landmark(0.56, 0.54)
  }, 1000);

  const result = analyzeBodyMotion(current, previous);

  assert.equal(result.name, "jump");
  assert.ok(result.intensity > 0.8);
});

test("detects torso twist from shoulder rotation against hips", () => {
  const previous = makeFrame({}, 900);
  const current = makeFrame({
    [POSE.LEFT_SHOULDER]: landmark(0.4, 0.29),
    [POSE.RIGHT_SHOULDER]: landmark(0.6, 0.4)
  }, 1000);

  const result = analyzeBodyMotion(current, previous);

  assert.equal(result.name, "twist");
  assert.ok(result.rotation > 0.35);
});

test("detects dance mode from distributed body energy", () => {
  const previous = makeFrame({
    [POSE.LEFT_ELBOW]: landmark(0.4, 0.62),
    [POSE.RIGHT_ELBOW]: landmark(0.6, 0.34),
    [POSE.LEFT_KNEE]: landmark(0.36, 0.72),
    [POSE.RIGHT_KNEE]: landmark(0.64, 0.86),
    [POSE.LEFT_ANKLE]: landmark(0.38, 0.86),
    [POSE.RIGHT_ANKLE]: landmark(0.62, 0.98)
  }, 900);
  const current = makeFrame({
    [POSE.LEFT_ELBOW]: landmark(0.32, 0.44),
    [POSE.RIGHT_ELBOW]: landmark(0.68, 0.54),
    [POSE.LEFT_KNEE]: landmark(0.52, 0.86),
    [POSE.RIGHT_KNEE]: landmark(0.48, 0.7),
    [POSE.LEFT_ANKLE]: landmark(0.54, 0.96),
    [POSE.RIGHT_ANKLE]: landmark(0.46, 0.84)
  }, 1000);

  const result = analyzeBodyMotion(current, previous);

  assert.equal(result.name, "dance");
  assert.ok(result.motionEnergy > 0.85);
});

test("creates body emitters for main tracked body parts", () => {
  const analysis = analyzeBodyMotion(makeFrame());
  const emitters = getBodyEmitters(analysis);

  assert.deepEqual(emitters.map((emitter) => emitter.id), [
    "leftHand",
    "rightHand",
    "head",
    "torso",
    "leftFoot",
    "rightFoot"
  ]);
});

test("creates demo body frames for every visible action", () => {
  const names = ["hands-up", "clap", "wave", "leg-kick", "jump", "twist", "dance"];

  for (const name of names) {
    const result = analyzeBodyMotion(createDemoBodyFrame(name, { x: 0.5, y: 0.52 }));
    assert.equal(result.name, name);
  }
});

test("maps body actions to distinct effect configs", () => {
  const names = ["idle-body", "hands-up", "clap", "wave", "leg-kick", "jump", "twist", "dance"];
  const palettes = new Set(names.map((name) => getBodyActionConfig(name).palette));

  assert.equal(palettes.size, names.length);
  assert.equal(getBodyActionConfig("hands-up").bodyMode, "columns");
  assert.equal(getBodyActionConfig("clap").coreIntensity, 1);
  assert.equal(getBodyActionConfig("jump").floorPulse, 1);
  assert.equal(getBodyActionConfig("dance").limbTrails, 1);
});
