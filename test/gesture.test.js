import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyGesture,
  getGestureConfig,
  smoothGestureState
} from "../src/gesture.js";

const landmark = (x, y, z = 0) => ({ x, y, z });

const makeHand = ({ thumb, index, middle, ring, pinky, wrist = landmark(0.5, 0.86) }) => {
  const hand = Array.from({ length: 21 }, () => landmark(0.5, 0.5));
  hand[0] = wrist;
  hand[4] = thumb;
  hand[5] = landmark(0.46, 0.58);
  hand[8] = index;
  hand[9] = landmark(0.5, 0.58);
  hand[12] = middle;
  hand[13] = landmark(0.54, 0.58);
  hand[16] = ring;
  hand[17] = landmark(0.58, 0.58);
  hand[20] = pinky;
  return hand;
};

const openPalm = makeHand({
  thumb: landmark(0.34, 0.42),
  index: landmark(0.43, 0.18),
  middle: landmark(0.5, 0.12),
  ring: landmark(0.57, 0.18),
  pinky: landmark(0.66, 0.28)
});

const fist = makeHand({
  thumb: landmark(0.49, 0.62),
  index: landmark(0.48, 0.66),
  middle: landmark(0.52, 0.67),
  ring: landmark(0.55, 0.66),
  pinky: landmark(0.58, 0.65)
});

test("classifies an open palm as expansion", () => {
  const result = classifyGesture(openPalm);
  assert.equal(result.name, "open");
  assert.equal(result.mode, "expand");
  assert.ok(result.confidence > 0.8);
});

test("classifies a fist as contraction", () => {
  const result = classifyGesture(fist);
  assert.equal(result.name, "fist");
  assert.equal(result.mode, "collapse");
  assert.ok(result.confidence > 0.65);
});

test("classifies thumb and index pinch as nucleus mode", () => {
  const pinched = makeHand({
    thumb: landmark(0.48, 0.34),
    index: landmark(0.5, 0.35),
    middle: landmark(0.52, 0.17),
    ring: landmark(0.58, 0.25),
    pinky: landmark(0.66, 0.33)
  });

  const result = classifyGesture(pinched);
  assert.equal(result.name, "pinch");
  assert.equal(result.mode, "nucleus");
});

test("classifies victory, three fingers, and rock as distinct single-hand gestures", () => {
  const victory = makeHand({
    thumb: landmark(0.47, 0.66),
    index: landmark(0.44, 0.18),
    middle: landmark(0.52, 0.14),
    ring: landmark(0.56, 0.67),
    pinky: landmark(0.61, 0.68)
  });
  const three = makeHand({
    thumb: landmark(0.47, 0.66),
    index: landmark(0.43, 0.18),
    middle: landmark(0.5, 0.13),
    ring: landmark(0.57, 0.2),
    pinky: landmark(0.64, 0.68)
  });
  const rock = makeHand({
    thumb: landmark(0.46, 0.64),
    index: landmark(0.43, 0.18),
    middle: landmark(0.51, 0.67),
    ring: landmark(0.56, 0.68),
    pinky: landmark(0.65, 0.24)
  });

  assert.equal(classifyGesture(victory).name, "victory");
  assert.equal(classifyGesture(three).name, "three");
  assert.equal(classifyGesture(rock).name, "rock");
});

test("maps each gesture to a particle behavior config", () => {
  assert.equal(getGestureConfig("open").copy, "张开：星尘向外铺开");
  assert.equal(getGestureConfig("open").palette, "gold-dust");
  assert.equal(getGestureConfig("open").starfield, 1);
  assert.equal(getGestureConfig("fist").contraction, 0.98);
  assert.equal(getGestureConfig("fist").coreIntensity, 1);
  assert.equal(getGestureConfig("pinch").vortex, 1.45);
  assert.equal(getGestureConfig("point").crescent, 1);
  assert.equal(getGestureConfig("sweep").tail, 1);
  assert.equal(getGestureConfig("victory").palette, "electric-double");
  assert.equal(getGestureConfig("victory").ribbons, 1);
  assert.equal(getGestureConfig("three").palette, "solar-triad");
  assert.equal(getGestureConfig("three").rays, 1);
  assert.equal(getGestureConfig("rock").palette, "storm-spike");
  assert.equal(getGestureConfig("rock").spikes, 1);
});

test("keeps each visible gesture visually distinct", () => {
  const names = ["open", "fist", "pinch", "point", "sweep", "victory", "three", "rock"];
  const palettes = new Set(names.map((name) => getGestureConfig(name).palette));
  const styles = new Set(names.map((name) => getGestureConfig(name).particleStyle));

  assert.equal(palettes.size, names.length);
  assert.ok(styles.size >= 6);
});

test("smooths target state without overshooting", () => {
  const current = { contraction: 0.2, vortex: 0.1, crescent: 0 };
  const target = { contraction: 0.9, vortex: 0.7, crescent: 1 };
  const next = smoothGestureState(current, target, 0.25);

  assert.equal(Number(next.contraction.toFixed(3)), 0.375);
  assert.equal(Number(next.vortex.toFixed(3)), 0.25);
  assert.equal(Number(next.crescent.toFixed(3)), 0.25);
});

test("preserves non-numeric visual fields while smoothing numbers", () => {
  const next = smoothGestureState(
    { contraction: 0.2, palette: "old" },
    { contraction: 0.6, palette: "violet-nebula" },
    0.5
  );

  assert.equal(next.contraction, 0.4);
  assert.equal(next.palette, "violet-nebula");
});
