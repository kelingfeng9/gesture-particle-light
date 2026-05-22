# Full Body MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the current single-hand particle page into a browser-based full-body motion stage that reacts to arms, hands, torso, legs, jumps, and dance energy.

**Architecture:** Keep Canvas as the renderer, add a MediaPipe Tasks Vision tracking layer, add a tested motion-analysis layer, and feed body-part emitters into the existing particle field. The MVP tracks one full body and up to two hands; Face Landmarker and music beat detection stay out of scope.

**Tech Stack:** Vite 8, Canvas 2D, `@mediapipe/tasks-vision`, Node test runner, GitHub Pages.

---

### File Structure

- Create `src/motion/bodyMetrics.js`: pure math for body landmarks, action classification, and demo body frames.
- Create `test/bodyMetrics.test.js`: Node tests for hands-up, clap, wave, leg lift, jump, twist, and high-energy dance classification.
- Create `src/vision/fullBodyTracker.js`: initializes Pose Landmarker and Hand Landmarker, starts camera video, throttles detections, and normalizes tracker results.
- Modify `src/main.js`: replace the hand-only camera path with full-body tracking, route body actions into `ParticleField`, add body skeleton drawing and multi-emitter particle shaping.
- Modify `src/gesture.js`: keep current hand gesture configs for compatibility, add full-body effect configs.
- Modify `index.html`: update page description and demo buttons to body-action demos.
- Modify `src/styles.css`: tune compact HUD chips and body-stage labels.
- Modify `package.json` and `package-lock.json`: add `@mediapipe/tasks-vision`.
- Modify `README.md`: document full-body controls, camera framing, and verification.

### Task 1: Motion Analysis Core

**Files:**
- Create: `src/motion/bodyMetrics.js`
- Test: `test/bodyMetrics.test.js`

- [ ] **Step 1: Write failing tests**

Add tests that call `analyzeBodyMotion(currentFrame, previousFrame)` with synthetic normalized landmarks. Assert:
- both wrists above shoulders returns `hands-up`
- hand distance sharply shrinking returns `clap`
- wrist lateral movement returns `wave`
- ankle lifted above the opposite knee returns `leg-kick`
- hip center moving up fast returns `jump`
- shoulder angle changing against hip angle returns `twist`
- high average joint speed returns `dance`

- [ ] **Step 2: Run red test**

Run: `npm test`

Expected: failure because `src/motion/bodyMetrics.js` does not exist.

- [ ] **Step 3: Implement pure motion analysis**

Create named exports:
- `POSE`
- `analyzeBodyMotion(frame, previousFrame, options)`
- `createDemoBodyFrame(actionName, point)`
- `getBodyEmitters(analysis)`

Implementation rules:
- Landmarks use normalized `{ x, y, z, visibility }`.
- Missing landmarks produce `idle-body`.
- Action precedence: `clap`, `jump`, `leg-kick`, `hands-up`, `twist`, `wave`, `dance`, `idle-body`.
- Emitters include `leftHand`, `rightHand`, `head`, `torso`, `leftFoot`, and `rightFoot` when landmarks exist.

- [ ] **Step 4: Run green test**

Run: `npm test`

Expected: all tests pass.

### Task 2: Full-Body Effect Configs

**Files:**
- Modify: `src/gesture.js`
- Test: `test/bodyMetrics.test.js`

- [ ] **Step 1: Extend failing tests**

Add assertions for `getBodyActionConfig("hands-up")`, `getBodyActionConfig("clap")`, `getBodyActionConfig("dance")`, and `getBodyActionConfig("idle-body")`. Assert each has a unique palette and the numeric fields needed by `ParticleField`.

- [ ] **Step 2: Run red test**

Run: `npm test`

Expected: failure because `getBodyActionConfig` is missing.

- [ ] **Step 3: Implement body action configs**

Add `BODY_ACTION_CONFIGS` and export `getBodyActionConfig(name)`. Reuse the existing config shape and add body-focused fields:
- `bodyMode`
- `limbTrails`
- `floorPulse`
- `bodyAura`

- [ ] **Step 4: Run green test**

Run: `npm test`

Expected: all tests pass.

### Task 3: MediaPipe Full-Body Tracker

**Files:**
- Create: `src/vision/fullBodyTracker.js`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add dependency**

Run: `npm install @mediapipe/tasks-vision --registry=https://registry.npmjs.org`

- [ ] **Step 2: Create tracker wrapper**

`FullBodyTracker` must expose:
- `initialize()`
- `start(videoElement, onFrame)`
- `stop()`

It should initialize:
- `PoseLandmarker` with `runningMode: "VIDEO"`, `numPoses: 1`, and the lite model URL
- `HandLandmarker` with `runningMode: "VIDEO"` and `numHands: 2`

- [ ] **Step 3: Build validation**

Run: `npm run build`

Expected: build succeeds with no import errors.

### Task 4: Renderer and UI Integration

**Files:**
- Modify: `src/main.js`
- Modify: `index.html`
- Modify: `src/styles.css`

- [ ] **Step 1: Replace demo chips**

Use demo actions:
- `hands-up`
- `clap`
- `wave`
- `leg-kick`
- `jump`
- `twist`
- `dance`

- [ ] **Step 2: Route camera frames**

Use `FullBodyTracker.start()` in `startCamera()`. For each frame:
- analyze body motion
- apply the body action config
- send body emitters and skeleton to the particle renderer

- [ ] **Step 3: Extend `ParticleField`**

Support `hand.emitters`:
- distribute particles across body emitters
- add limb trails between shoulder/elbow/wrist and hip/knee/ankle
- add floor pulse for jumps
- draw body skeleton overlay

- [ ] **Step 4: Browser smoke test**

Run: `npm run dev -- --port 5177`, open local page, verify no console errors and that `window.__gestureRuntime` reports the body tracker capability.

### Task 5: Documentation, Verification, and Publish

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Document:
- camera framing requirements
- supported full-body actions
- local run commands
- GitHub Pages deployment behavior

- [ ] **Step 2: Final verification**

Run:
- `npm test`
- `npm run build`
- `npm audit --registry=https://registry.npmjs.org --audit-level=moderate`
- public or local Playwright smoke test

- [ ] **Step 3: Commit and push**

Commit on `codex/full-body-mvp` and push the branch for review. Only merge to `main` after the body tracker smoke test is clean.
