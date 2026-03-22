# IsoTrack

IsoTrack is a static prototype for a camera-guided therapeutic exercise platform focused on guided home care. It combines assessment, camera-based session guidance, clinician reporting, and rewards into a single browser experience for adaptive isometric programs.

## What It Includes

- `Overview`, `Assessment`, `Session Lab`, `Clinician`, and `Rewards` tabs
- Personalized exercise-plan generation from the assessment form
- Camera-first session workflow with limb-only tracking
- Automatic multi-step calibration:
  - Neutral stance
  - Arm reach
  - Heel raise
- Large on-screen guidance for far-view readability
- Guided demo flow before the working session starts
- Simple clinician summary and adherence/reward mockups

## Project Structure

- [index.html](/Users/ignatiusho/Documents/IsoTrack/index.html): page structure and UI layout
- [styles.css](/Users/ignatiusho/Documents/IsoTrack/styles.css): visual design, responsive layout, overlays
- [script.js](/Users/ignatiusho/Documents/IsoTrack/script.js): app state, calibration flow, pose logic, demo/session behavior
- [assets/prototype.png](/Users/ignatiusho/Documents/IsoTrack/assets/prototype.png): hero image
- [assets/isotrack-logo.svg](/Users/ignatiusho/Documents/IsoTrack/assets/isotrack-logo.svg): top-left logo
- [assets/muscle-model.jpeg](/Users/ignatiusho/Documents/IsoTrack/assets/muscle-model.jpeg): legacy visual asset

## Running Locally

This is a plain HTML/CSS/JS site. No build step is required.

Start a local server from the project folder with any static server, for example:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

## Camera And Tracking Notes

- The camera flow depends on browser camera permission.
- Pose tracking uses MediaPipe loaded from a CDN at runtime, so the browser needs internet access for first load.
- Calibration is automatic, but a `Manual Capture` fallback button is still available.

## Current Calibration Flow

1. Start the camera.
2. Step into the bright calibration outline.
3. Hold each calibration pose steady until it auto-saves.
4. Start the guided demo.
5. Begin the working session after demo completion.

## Authors
- Ignatius Ho
- Dong Jin
- Hrish Dave
- Djordje Spasovic
