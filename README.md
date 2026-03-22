# IsoTrack

IsoTrack is a browser-based therapeutic exercise prototype for guided home care. It combines account access, assessment-driven exercise planning, camera-guided calibration, prescribed session flow, clinician-facing trends, and a monthly rewards model in one static web app.

## Live Demo

- Production URL: [https://iggy1119.github.io/IsoTrack/](https://iggy1119.github.io/IsoTrack/)
- Vidoe Demo: https://www.canva.com/design/DAHEr-UXkJY/e1XAqcS_HW5ABp7uH_04RQ/edit?utm_content=DAHEr-UXkJY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
- Presentation Link: https://www.canva.com/design/DAHEl7OaD-o/LtmzysWI8sjnTTsCoJkIrA/edit

## Current Product Flow

1. Open the app on `Overview`
2. Create an account or sign in
3. Complete the in-app 2FA verification step
4. Go to `Assessment` and generate a personalized plan
5. Move into `Session Lab`
6. Complete calibration, review the prescribed exercise carousel, run the guided session, submit RPE, and finish
7. Review clinician trends and rewards

## Main Features

- `Overview`, `Assessment`, `Session Lab`, `Demos`, `Clinician`, and `Rewards` sections
- Local account creation and sign-in prototype
- In-app 6-digit 2FA verification prototype
- Locked guided-care flow until authentication is complete
- Assessment-driven exercise prescription
- Session Lab that now depends on the saved assessment instead of generic defaults
- Prescribed exercise carousel showing all exercises for the session
- Automatic multi-step camera calibration:
  - Neutral stance
  - T-shape arms
  - Heel raise
- Camera-guided demo and working flow with pose matching
- User-submitted RPE flow
- Clinician graph for time under tension and user-entered RPE
- Monthly earn-back wallet model tied to planned reps

## Session Lab Layout

The Session Lab is currently ordered as:

1. Calibration
2. Demo carousel and prescribed exercise brief
3. Camera tracking and session controls
4. RPE submission
5. Metrics

The camera overlay and tracking presentation are centered within the video panel, and the prescribed exercise carousel can be previewed page by page while the active exercise order remains enforced by the plan.

## Authentication Note

The authentication flow is a frontend prototype only.

- Accounts are stored locally in browser state
- 2FA codes are generated in-app for demo purposes
- No backend, email provider, SMS provider, or secure credential service is connected yet

## Project Structure

- [README.md](/Users/ignatiusho/Documents/IsoTrack/README.md): project overview and usage notes
- [index.html](/Users/ignatiusho/Documents/IsoTrack/index.html): page structure, auth UI, tabs, and Session Lab layout
- [styles.css](/Users/ignatiusho/Documents/IsoTrack/styles.css): visual system, responsive layout, camera presentation, carousel styling
- [script.js](/Users/ignatiusho/Documents/IsoTrack/script.js): app state, auth flow, calibration logic, prescribed-session behavior, reporting, and rewards
- [assets/](/Users/ignatiusho/Documents/IsoTrack/assets): static images, logos, and demo media
- [assets/Demos](/Users/ignatiusho/Documents/IsoTrack/assets/Demos): exercise MP4 demo library used by the app

## Running Locally

This is a plain HTML/CSS/JS site. No build step is required.

Run a static server from the project directory, for example:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```
or

```text
https://iggy1119.github.io/IsoTrack/
```


## Camera And Tracking Notes

- Camera access depends on browser permission
- Pose tracking uses MediaPipe from a CDN at runtime
- Internet access is needed for the first MediaPipe load
- Calibration is auto-guided with a visible `3, 2, 1` countdown per step
- Session completion is tied to the prescribed exercises generated from the assessment

## Authors

- Ignatius Ho
- Djordje Spasovic
- Dong Jin
- Hrish Dave
