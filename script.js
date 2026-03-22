const STORAGE_KEY = "isotrack-demo-state";
const CALIBRATION_SEQUENCE = [
  { key: "neutral", title: "Neutral stance" },
  { key: "arms", title: "T-shape arms" },
  { key: "knee", title: "Heel raise" },
];
const PRIMARY_LIMB_POINTS = [
  ["leftShoulder", 11],
  ["rightShoulder", 12],
  ["leftElbow", 13],
  ["rightElbow", 14],
  ["leftWrist", 15],
  ["rightWrist", 16],
  ["leftHip", 23],
  ["rightHip", 24],
  ["leftKnee", 25],
  ["rightKnee", 26],
  ["leftAnkle", 27],
  ["rightAnkle", 28],
];
const EXTENDED_LIMB_POINTS = [
  ...PRIMARY_LIMB_POINTS,
  ["leftHeel", 29],
  ["rightHeel", 30],
  ["leftFootIndex", 31],
  ["rightFootIndex", 32],
];
const LIMB_CONNECTIONS = [
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["leftAnkle", "leftHeel"],
  ["leftHeel", "leftFootIndex"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
  ["rightAnkle", "rightHeel"],
  ["rightHeel", "rightFootIndex"],
];
const LIMB_VISIBILITY_THRESHOLD = 0.58;
const LIMB_CAPTURE_THRESHOLD = 6;
const DEFAULT_PROGRAM_VALUE = 15;
const DEFAULT_REIMBURSEMENT_SESSIONS = 12;
const MONTHLY_SUBSCRIPTION_FEE = 15;
const CALIBRATION_FALLBACK_GUIDE = {
  points: {
    leftShoulder: { x: 0.45, y: 0.33 },
    rightShoulder: { x: 0.55, y: 0.33 },
    leftHip: { x: 0.465, y: 0.55 },
    rightHip: { x: 0.535, y: 0.55 },
    leftKnee: { x: 0.47, y: 0.73 },
    rightKnee: { x: 0.53, y: 0.73 },
    leftAnkle: { x: 0.47, y: 0.9 },
    rightAnkle: { x: 0.53, y: 0.9 },
  },
  emphasis: ["leftShoulder", "rightShoulder", "leftHip", "rightHip"],
};
const CALIBRATION_GUIDE_CONNECTIONS = [
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftHip", "leftKnee"],
  ["rightHip", "rightKnee"],
  ["leftKnee", "leftAnkle"],
  ["rightKnee", "rightAnkle"],
  ["leftAnkle", "leftHeel"],
  ["leftHeel", "leftFootIndex"],
  ["rightAnkle", "rightHeel"],
  ["rightHeel", "rightFootIndex"],
];

function getRewardPeriodKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

const state = {
  activeTab: "session",
  auth: {
    mode: "signup",
    account: null,
    authenticated: false,
    stage: "credentials",
    pendingCode: "",
    pendingEmail: "",
    pendingName: "",
    pendingPassword: "",
    feedback: "Create an account or sign in to unlock Assessment, Session Lab, Clinician, and Rewards.",
  },
  plan: null,
  rewards: {
    cashback: 0,
    streak: 0,
    tier: "Flat $15 plan",
    targetValue: DEFAULT_PROGRAM_VALUE,
    periodKey: getRewardPeriodKey(),
  },
  report: null,
  reportView: "daily",
  sessionHistory: [],
  session: {
    cameraReady: false,
    running: false,
    holdActive: false,
    reps: 0,
    holdSeconds: 0,
    totalTension: 0,
    motionScore: 0,
    intensityLabel: "Not started",
    selectedDemo: 0,
    previewDemoIndex: 0,
    librarySelectedDemo: 0,
    completed: false,
    preRpe: 4,
    postRpe: 4,
    preRpeDraft: 4,
    postRpeDraft: 4,
    rpeDirty: false,
    rpeStatus: "Enter values and submit them.",
    exerciseReps: 0,
    exerciseHoldSeconds: 0,
    exerciseTension: 0,
    completedExercises: [],
    trackedJoints: 0,
    trackingStatus: "Limb tracking offline",
    trackingQuality: 0,
    calibrated: false,
    baseline: null,
    calibrationShots: {
      neutral: null,
      arms: null,
      knee: null,
    },
    currentCalibrationStep: 0,
    demoActive: false,
    demoCompleted: false,
    demoProgress: 0,
    smoothedMotionScore: 0,
    pendingMotionLabel: "idle",
    pendingMotionFrames: 0,
    exerciseMatchState: "idle",
    exerciseMatchScore: 0,
  },
};

const DEFAULT_DEMO_FOCUSES = ["Shoulders", "Core", "Hips", "Quadriceps", "Ankles", "Grip"];
const exerciseLibrary = {
  Shoulders: {
    main: {
      title: "Supported shoulder flexion hold",
      summary: "Assisted reach to a comfortable shoulder-height hold.",
      cue: "Keep shoulders low and stop before the motion feels strained.",
      setup: "Sit or stand tall with light chair or wall support and elbows soft.",
      equipment: "Chair or wall support",
      videoBrief: "Open with the start posture, show one controlled lift and hold, then explain the stop cue for fatigue or shoulder hiking.",
      steps: [
        "Frame the full upper body and show the neutral start position.",
        "Lift both arms to the chosen height and pause for a calm two-count.",
        "Lower slowly and explain when to stop or reduce the range.",
      ],
      movementPattern: "upperHold",
      workflowPrompt: "Raise both arms into the supported hold shown in the demo.",
      startPrompt: "Demo started. Match the supported shoulder hold and stay steady.",
    },
    alt: {
      title: "Towel-assisted shoulder reach",
      summary: "Short-range shoulder reach using assistance to reduce effort.",
      cue: "Let the towel help the lift instead of forcing extra height.",
      setup: "Stay seated, hold a towel with both hands, and keep ribs stacked over hips.",
      equipment: "Chair and towel",
      videoBrief: "Show the towel grip, the shortened range, and how the assist keeps the movement smooth on low-energy days.",
      steps: [
        "Show the towel grip and how far apart the hands should be.",
        "Lift only to the comfortable range and keep the neck relaxed.",
        "Finish by reminding the viewer that a shorter range still counts.",
      ],
      movementPattern: "upperHold",
      workflowPrompt: "Lift into the towel-assisted reach and hold the comfortable range.",
      startPrompt: "Demo started. Follow the assisted reach and pause in the easiest strong position.",
    },
  },
  Core: {
    main: {
      title: "Seated reach-and-brace hold",
      summary: "Gentle forward reach paired with paced breathing and trunk control.",
      cue: "Exhale into the reach and keep the ribcage quiet.",
      setup: "Sit near the front of the chair with both feet grounded and chest lifted.",
      equipment: "Chair",
      videoBrief: "Record a front view that shows posture, inhale before the reach, and the slower return to the chair-backed start.",
      steps: [
        "Show both feet planted and the tall seated posture before moving.",
        "Reach forward with both hands while breathing out through the hold.",
        "Return slowly and remind the viewer to reset between reps.",
      ],
      movementPattern: "upperHold",
      workflowPrompt: "Reach forward gently while keeping the brace soft and steady.",
      startPrompt: "Demo started. Match the reach-and-brace hold and keep the breath calm.",
    },
    alt: {
      title: "Breath-paced forward press",
      summary: "Shorter-range core engagement with a smaller supported reach.",
      cue: "Match the reach to the breath instead of pushing farther.",
      setup: "Sit tall with forearms parallel and only a small distance between hands and chest.",
      equipment: "Chair",
      videoBrief: "Use a shorter clip that focuses on the breathing rhythm, the smaller reach, and the recovery pause between efforts.",
      steps: [
        "Start with hands close to the chest and shoulders relaxed.",
        "Press forward a small amount during one slow exhale.",
        "Pause to show the recovery breath before the next repetition.",
      ],
      movementPattern: "upperHold",
      workflowPrompt: "Press forward into the smaller reach and hold for one slow breath.",
      startPrompt: "Demo started. Follow the smaller forward press and stay relaxed through the exhale.",
    },
  },
  Hips: {
    main: {
      title: "Supported seated hip march",
      summary: "Single-leg march with posture support and controlled lowering.",
      cue: "Lift only as high as you can lower with control.",
      setup: "Sit tall with hands resting lightly on the chair edges for balance.",
      equipment: "Chair",
      videoBrief: "Show one knee lift from the front, hold briefly at the top, and explain the slow lowering pattern.",
      steps: [
        "Center the pelvis and show both feet flat before the lift.",
        "Lift one knee with a short pause while staying upright.",
        "Lower with control and explain how small range is still acceptable.",
      ],
      movementPattern: "lowerLift",
      workflowPrompt: "Lift one knee into the seated march position and hold.",
      startPrompt: "Demo started. Match the seated hip march and control the lift.",
    },
    alt: {
      title: "Sit-to-stand weight shift hold",
      summary: "Partial rise or forward shift used to practice hip loading without full standing effort.",
      cue: "Let the hips move first and keep the shift small.",
      setup: "Scoot forward on the chair and keep hands ready on the seat or armrests.",
      equipment: "Chair or armrests",
      videoBrief: "Film the forward shift, pause at the strongest supported point, and explain that a partial rise is enough for the demo.",
      steps: [
        "Show the foot placement and slight forward lean from the chair.",
        "Shift weight into the feet and pause at the supported high point.",
        "Return gently and explain how to reduce the range if needed.",
      ],
      movementPattern: "lowerLift",
      workflowPrompt: "Shift forward or lift slightly into the supported hip hold.",
      startPrompt: "Demo started. Follow the hip weight shift and pause at the supported top point.",
    },
  },
  Quadriceps: {
    main: {
      title: "Long-arc quad extension",
      summary: "Seated knee extension with a clear pause at the top.",
      cue: "Prioritize a clean stop at the top over a bigger range.",
      setup: "Sit tall with one foot planted and the working leg ready to extend.",
      equipment: "Chair",
      videoBrief: "Capture the side or front view of the knee extending, the brief hold, and the soft return to the floor.",
      steps: [
        "Show the grounded leg and steady seated posture first.",
        "Extend one knee to the comfortable height and pause for control.",
        "Lower slowly and mention that shaking is a cue to shorten the range.",
      ],
      movementPattern: "lowerLift",
      workflowPrompt: "Lift and extend one leg into the top quad position and hold.",
      startPrompt: "Demo started. Match the leg extension hold and stay smooth.",
    },
    alt: {
      title: "Wall-supported mini squat hold",
      summary: "Short squat or chair-hover hold with external support.",
      cue: "Aim for a stable hover instead of a deeper bend.",
      setup: "Stand near a wall or counter with feet under hips and hands ready for support.",
      equipment: "Wall or counter support",
      videoBrief: "Show the stance, the small bend into the hover, and the steady return without dropping quickly.",
      steps: [
        "Set the feet under the hips and show where the support hand goes.",
        "Bend slightly into the hover and pause while the chest stays lifted.",
        "Rise slowly and explain how to shorten the bend on low-energy days.",
      ],
      movementPattern: "lowerLift",
      workflowPrompt: "Move into the small supported squat hold and stay tall.",
      startPrompt: "Demo started. Follow the mini squat hold and keep the range small.",
    },
  },
  Ankles: {
    main: {
      title: "Counter-supported calf raise pulse",
      summary: "Small heel lift with support for balance and ankle control.",
      cue: "Think up-and-soft instead of pushing hard into the floor.",
      setup: "Stand at a counter or sturdy surface with even weight through both feet.",
      equipment: "Counter or sturdy support",
      videoBrief: "Show the hands on support, the gentle heel lift, and the slow return so the ankle motion reads clearly on camera.",
      steps: [
        "Frame both ankles and show the light grip on the support surface.",
        "Lift the heels a small amount and pause without rocking forward.",
        "Lower quietly and explain that the pulse should stay narrow.",
      ],
      movementPattern: "lowerLift",
      workflowPrompt: "Lift the heels into the supported calf raise and hold the top softly.",
      startPrompt: "Demo started. Match the calf raise pulse and keep the weight shifts small.",
    },
    alt: {
      title: "Seated ankle dorsiflexion set",
      summary: "Toe lift from the chair to rehearse ankle control with less whole-body load.",
      cue: "Lift from the ankle without pulling the hips back.",
      setup: "Sit tall with heels grounded and knees comfortable under the chair.",
      equipment: "Chair",
      videoBrief: "Record a close front view that shows the toes lifting, the brief pause, and the reset between repetitions.",
      steps: [
        "Show the seated setup with heels planted under the knees.",
        "Lift the forefoot or toes and pause without leaning backward.",
        "Lower slowly and remind the viewer that the movement should stay small.",
      ],
      movementPattern: "lowerLift",
      workflowPrompt: "Lift the toes into the dorsiflexion hold and stay centered.",
      startPrompt: "Demo started. Follow the ankle lift and keep the movement precise.",
    },
  },
  Grip: {
    main: {
      title: "Reach-and-squeeze hold",
      summary: "Light forward reach with a towel squeeze to pair posture and hand work.",
      cue: "Keep the squeeze light enough that the shoulders stay relaxed.",
      setup: "Sit tall holding a folded towel with elbows soft and hands shoulder-width apart.",
      equipment: "Chair and towel",
      videoBrief: "Show the towel grip, the light forward reach, and explain that the squeeze should never drive shoulder tension.",
      steps: [
        "Show the towel folded in the hands with elbows slightly bent.",
        "Reach forward a short distance and add a gentle squeeze at the pause.",
        "Return to the chest and explain how to relax fully between efforts.",
      ],
      movementPattern: "upperHold",
      workflowPrompt: "Reach forward into the light squeeze hold and keep the shoulders quiet.",
      startPrompt: "Demo started. Match the reach-and-squeeze hold and stay easy through the neck and shoulders.",
    },
    alt: {
      title: "Supported towel isometric set",
      summary: "Short-interval squeeze with the elbows supported close to the body.",
      cue: "Let the hands work while the rest of the body stays quiet.",
      setup: "Sit with elbows tucked near the ribs and forearms supported if needed.",
      equipment: "Chair, towel, optional arm support",
      videoBrief: "Use a closer shot that shows elbow support, the smaller squeeze, and the short recovery after each hold.",
      steps: [
        "Position the elbows near the ribs and show any forearm support being used.",
        "Squeeze the towel lightly for one calm hold without shrugging.",
        "Release fully and explain that the reset is part of the rep.",
      ],
      movementPattern: "upperHold",
      workflowPrompt: "Press into the supported squeeze hold and stay relaxed through the shoulders.",
      startPrompt: "Demo started. Follow the supported squeeze hold and keep the effort light.",
    },
  },
};

const demoCatalog = [
  {
    title: "Ankle Eversion",
    helperTip: "Perform against a wall to ensure stability!",
    purpose: "Train ankle mobility and ankle strength during eversion.",
    focus: "Ankles",
    movementPattern: "lowerLift",
    poseVariant: "ankleEversion",
    videoPath: "assets/Demos/Ankle Eversion Compress.mp4",
  },
  {
    title: "Ankle Inversion",
    helperTip: "Perform against a wall to ensure stability!",
    purpose: "Train ankle mobility and ankle strength during inversion.",
    focus: "Ankles",
    movementPattern: "lowerLift",
    poseVariant: "ankleInversion",
    videoPath: "assets/Demos/Ankle Inversion Compress.mp4",
  },
  {
    title: "Anterior Deltoid Isometric",
    helperTip: "Imagine performing a front raise, toward the sky!",
    purpose: "Train shoulder stability, and contribute to shoulder abduction.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "anteriorDeltoid",
    videoPath: "assets/Demos/Anterior Deltoid Isometric Compress.mp4",
  },
  {
    title: "Ball Grip Isometric",
    helperTip: "Think about driving your fingers toward the base of your palm!",
    purpose: "Train grip strength and distal forearm muscle endurance.",
    focus: "Grip",
    movementPattern: "upperHold",
    poseVariant: "ballGrip",
    videoPath: "assets/Demos/Ball Grip Isometric Compress.mp4",
  },
  {
    title: "Bicep Isometric",
    helperTip: "Focus on the mind-muscle connection to the bicep!",
    purpose: "Train biceps to assist during pulling exercises and stability of arm.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "bicepCurl",
    videoPath: "assets/Demos/Bicep Isometric Compress.mp4",
  },
  {
    title: "Calf Raise Isometric",
    helperTip: "Rise onto your toes, hold against a wall to ensure stability!",
    purpose: "Train stability during walking to minimize falls.",
    focus: "Ankles",
    movementPattern: "lowerLift",
    poseVariant: "calfRaise",
    videoPath: "assets/Demos/Calf Raise Isometric Compress.mp4",
  },
  {
    title: "Cat Cow Lower Back Mobility",
    helperTip: "Move slowly to focus on spinal flexion and extension!",
    purpose: "Train spinal mobility and reduce back stiffness.",
    focus: "Core",
    movementPattern: "upperHold",
    poseVariant: "catCow",
    videoPath: "assets/Demos/Cat Cow Lower Back Mobility Compress.mp4",
  },
  {
    title: "Door Pull Lats Isometric",
    helperTip: "Imagine the movement of pulling a door!",
    purpose: "Train latissimus dorsi muscles for upper body stability and pulling strength.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "doorPull",
    videoPath: "assets/Demos/Door Pull Lats Isometric Compress.mp4",
  },
  {
    title: "Foot Dorsiflexion",
    helperTip: "Imagine pulling your toes toward your forehead, keeping your heel planted.",
    purpose: "Improve the tibialis anterior to minimize foot drop.",
    focus: "Ankles",
    movementPattern: "lowerLift",
    poseVariant: "dorsiflexion",
    videoPath: "assets/Demos/Foot Dorsiflexion Compress.mp4",
  },
  {
    title: "Forearm Flexion",
    helperTip: "Rest your forearms on a table or your legs for stability!",
    purpose: "Prevent loss of grip-related strength.",
    focus: "Grip",
    movementPattern: "upperHold",
    poseVariant: "forearmFlexion",
    videoPath: "assets/Demos/Forearm Flexion Compress.mp4",
  },
  {
    title: "Glute Bridge",
    helperTip: "Squeeze your glutes at the top, avoid arching the lower back and keep the pelvis forward!",
    purpose: "Improve hip stability, glutes contribute to walking ability.",
    focus: "Hips",
    movementPattern: "lowerLift",
    poseVariant: "gluteBridge",
    videoPath: "assets/Demos/Glute Bridge Compress.mp4",
  },
  {
    title: "Hamstring Isometric",
    helperTip: "Dig your heel into the seat and imagine bringing it to the floor.",
    purpose: "Improve knee joint stability.",
    focus: "Hips",
    movementPattern: "lowerLift",
    poseVariant: "hamstringPress",
    videoPath: "assets/Demos/Hamstring Isometric Compress.mp4",
  },
  {
    title: "Hollow Body Holds",
    helperTip: "Keep your lower back pressed into the ground.",
    purpose: "Improve core strength for stability.",
    focus: "Core",
    movementPattern: "upperHold",
    poseVariant: "hollowBody",
    videoPath: "assets/Demos/Hollow Body Holds Compress.mp4",
  },
  {
    title: "Lateral Deltoid Isometric",
    helperTip: "Think about bringing your shoulder toward your ear in an arc.",
    purpose: "Prevent loss of shoulder abduction ability.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "lateralDeltoid",
    videoPath: "assets/Demos/Lateral Deltoid Isometric Compress.mp4",
  },
  {
    title: "Pecs Isometric",
    helperTip: "Imagine mind muscle connection and feel your pecs squeezing.",
    purpose: "Improve pecs for maintaining pushing abilities.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "pecPress",
    videoPath: "assets/Demos/Pecs Isometric Compress.mp4",
  },
  {
    title: "Rotator Cuff Internal Rotation",
    helperTip: "Perform rotation slowly, to prevent damage.",
    purpose: "Improve shoulder joint stability.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "internalRotation",
    videoPath: "assets/Demos/Rotator Cuff Internal Rotation Compress.mp4",
  },
  {
    title: "Shrug Isometric",
    helperTip: "Lift your shoulders toward your ear.",
    purpose: "Prevents loss of grip strength, strengthens traps for neck/shoulder stability.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "shrug",
    videoPath: "assets/Demos/Shrug Isometric Compress.mp4",
  },
  {
    title: "Tricep Kickback Isometric",
    helperTip: "Imagine mind muscle connection and feeling your triceps contracting.",
    purpose: "Improve elbow stability, prevent loss of pushing motion ability.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "tricepKickback",
    videoPath: "assets/Demos/Tricep Kickback Isometric Compress.mp4",
  },
  {
    title: "Wall Calf Stretch + Tibialis Hold",
    helperTip: "Lift your toes on the front foot.",
    purpose: "Strengthen Tibialis Anterior to minimize foot drop.",
    focus: "Ankles",
    movementPattern: "lowerLift",
    poseVariant: "tibialisWall",
    videoPath: "assets/Demos/Wall Calf Stretch+Tibialis Hold Compress.mp4",
  },
  {
    title: "Wall Sits Quads",
    helperTip: "Put a chair under you to prevent awkward failing positions.",
    purpose: "Improve quadriceps endurance for staying mobile.",
    focus: "Quadriceps",
    movementPattern: "lowerLift",
    poseVariant: "wallSit",
    videoPath: "assets/Demos/Wall Sits Quads Compress.mp4",
  },
  {
    title: "Wall Slides",
    helperTip: "Keep as much of your arm in contact with the wall as possible.",
    purpose: "Improve shoulder mobility.",
    focus: "Shoulders",
    movementPattern: "upperHold",
    poseVariant: "wallSlide",
    videoPath: "assets/Demos/Wall Slides Compress.mp4",
  },
  {
    title: "Wall Supported Lunge",
    helperTip: "Use the wall for balance!",
    purpose: "Strengthen unilateral balance and stability.",
    focus: "Hips",
    movementPattern: "lowerLift",
    poseVariant: "supportedLunge",
    videoPath: "assets/Demos/Wall Supported Lunge Hold Compress.mp4",
  },
];

const els = {
  form: document.querySelector("#assessment-form"),
  authForm: document.querySelector("#auth-form"),
  authModeButtons: Array.from(document.querySelectorAll("[data-auth-mode]")),
  authNameField: document.querySelector("#auth-name-field"),
  authName: document.querySelector("#auth-name"),
  authEmail: document.querySelector("#auth-email"),
  authPassword: document.querySelector("#auth-password"),
  authSubmit: document.querySelector("#auth-submit"),
  authLogout: document.querySelector("#auth-logout"),
  authFeedback: document.querySelector("#auth-feedback"),
  authSessionStatus: document.querySelector("#auth-session-status"),
  authVerifyPanel: document.querySelector("#auth-verify-panel"),
  authVerifyCopy: document.querySelector("#auth-verify-copy"),
  authCode: document.querySelector("#auth-code"),
  verify2fa: document.querySelector("#verify-2fa"),
  resend2fa: document.querySelector("#resend-2fa"),
  authDemoNote: document.querySelector("#auth-demo-note"),
  fatigue: document.querySelector("#fatigue"),
  fatigueValue: document.querySelector("#fatigue-value"),
  confidence: document.querySelector("#confidence"),
  confidenceValue: document.querySelector("#confidence-value"),
  preRpe: document.querySelector("#pre-rpe"),
  preRpeValue: document.querySelector("#pre-rpe-value"),
  postRpe: document.querySelector("#post-rpe"),
  postRpeValue: document.querySelector("#post-rpe-value"),
  submitRpe: document.querySelector("#submit-rpe"),
  rpeSubmitStatus: document.querySelector("#rpe-submit-status"),
  progressValue: document.querySelector("#selection-progress-value"),
  progressBar: document.querySelector("#selection-progress-bar"),
  progressSummary: document.querySelector("#selection-summary"),
  tabButtons: Array.from(document.querySelectorAll("[data-tab-target]")),
  tabPanels: Array.from(document.querySelectorAll("[data-tab-panel]")),
  tabJumpButtons: Array.from(document.querySelectorAll("[data-tab-jump]")),
  formInputs: Array.from(document.querySelectorAll("#assessment-form input, #assessment-form select")),
  choiceCards: Array.from(document.querySelectorAll(".choice-card")),
  planEmpty: document.querySelector("#plan-empty"),
  planContent: document.querySelector("#plan-content"),
  planPatient: document.querySelector("#plan-patient"),
  planDiagnosis: document.querySelector("#plan-diagnosis"),
  planGoal: document.querySelector("#plan-goal"),
  planCadence: document.querySelector("#plan-cadence"),
  planReward: document.querySelector("#plan-reward"),
  careNote: document.querySelector("#care-note"),
  planStatus: document.querySelector("#plan-status"),
  programList: document.querySelector("#program-list"),
  alternateList: document.querySelector("#alternate-list"),
  sessionPlanTitle: document.querySelector("#session-plan-title"),
  sessionPlanNote: document.querySelector("#session-plan-note"),
  allDemoList: document.querySelector("#all-demo-list"),
  camera: document.querySelector("#camera"),
  trackingCanvas: document.querySelector("#tracking-canvas"),
  analysisCanvas: document.querySelector("#analysis-canvas"),
  startCamera: document.querySelector("#start-camera"),
  stopCamera: document.querySelector("#stop-camera"),
  cameraPermissionModal: document.querySelector("#camera-permission-modal"),
  cameraPermissionCancel: document.querySelector("#camera-permission-cancel"),
  cameraPermissionContinue: document.querySelector("#camera-permission-continue"),
  cameraPermissionTitle: document.querySelector("#camera-permission-title"),
  cameraPermissionCopy: document.querySelector("#camera-permission-copy"),
  captureCalibration: document.querySelector("#capture-calibration"),
  resetCalibration: document.querySelector("#reset-calibration"),
  startDemo: document.querySelector("#start-demo"),
  toggleSession: document.querySelector("#toggle-session"),
  toggleHold: document.querySelector("#toggle-hold"),
  manualRep: document.querySelector("#manual-rep"),
  completeSession: document.querySelector("#complete-session"),
  cameraStatus: document.querySelector("#camera-status"),
  sessionFeedback: document.querySelector("#session-feedback"),
  selectedDemoTitle: document.querySelector("#selected-demo-title"),
  selectedDemoCopy: document.querySelector("#selected-demo-copy"),
  selectedDemoVideoStatus: document.querySelector("#selected-demo-video-status"),
  selectedDemoPlayer: document.querySelector("#selected-demo-player"),
  sessionCarouselTrack: document.querySelector("#session-carousel-track"),
  sessionCarouselPrev: document.querySelector("#session-carousel-prev"),
  sessionCarouselNext: document.querySelector("#session-carousel-next"),
  sessionCarouselStatus: document.querySelector("#session-carousel-status"),
  selectedDemoFocus: document.querySelector("#selected-demo-focus"),
  selectedDemoVariant: document.querySelector("#selected-demo-variant"),
  selectedDemoTarget: document.querySelector("#selected-demo-target"),
  selectedDemoSetup: document.querySelector("#selected-demo-setup"),
  selectedDemoScript: document.querySelector("#selected-demo-script"),
  selectedDemoSteps: document.querySelector("#selected-demo-steps"),
  libraryDemoTitle: document.querySelector("#library-demo-title"),
  libraryDemoStatus: document.querySelector("#library-demo-status"),
  libraryDemoPlayer: document.querySelector("#library-demo-player"),
  libraryDemoCopy: document.querySelector("#library-demo-copy"),
  libraryDemoFocus: document.querySelector("#library-demo-focus"),
  libraryDemoTarget: document.querySelector("#library-demo-target"),
  libraryDemoFile: document.querySelector("#library-demo-file"),
  libraryDemoTip: document.querySelector("#library-demo-tip"),
  libraryDemoPurpose: document.querySelector("#library-demo-purpose"),
  trackingState: document.querySelector("#tracking-state"),
  trackedJoints: document.querySelector("#tracked-joints"),
  workflowTitle: document.querySelector("#workflow-title"),
  workflowCheckPrimary: document.querySelector("#workflow-check-primary"),
  workflowCheckSecondary: document.querySelector("#workflow-check-secondary"),
  workflowStepCamera: document.querySelector("#step-camera"),
  workflowStepCalibration: document.querySelector("#step-calibration"),
  workflowStepDemo: document.querySelector("#step-demo"),
  workflowStepSession: document.querySelector("#step-session"),
  cameraPrimaryControls: document.querySelector("#camera-primary-controls"),
  cameraSecondaryControls: document.querySelector("#camera-secondary-controls"),
  calibrationCountdown: document.querySelector("#calibration-countdown"),
  calibrationCount: document.querySelector("#calibration-count"),
  calibrationProgressBar: document.querySelector("#calibration-progress-bar"),
  calibrationStageNeutral: document.querySelector("#cal-stage-neutral"),
  calibrationStageArms: document.querySelector("#cal-stage-arms"),
  calibrationStageKnee: document.querySelector("#cal-stage-knee"),
  calibrationStageNeutralStatus: document.querySelector("#cal-stage-neutral-status"),
  calibrationStageArmsStatus: document.querySelector("#cal-stage-arms-status"),
  calibrationStageKneeStatus: document.querySelector("#cal-stage-knee-status"),
  motionBar: document.querySelector("#motion-bar"),
  motionScore: document.querySelector("#motion-score"),
  demoProgress: document.querySelector("#demo-progress"),
  repCount: document.querySelector("#rep-count"),
  holdTime: document.querySelector("#hold-time"),
  tutTotal: document.querySelector("#tut-total"),
  reportAdherence: document.querySelector("#report-adherence"),
  reportFatigue: document.querySelector("#report-fatigue"),
  reportIntensity: document.querySelector("#report-intensity"),
  reportStatus: document.querySelector("#report-status"),
  reportText: document.querySelector("#report-text"),
  reportChart: document.querySelector("#report-chart"),
  reportViewButtons: Array.from(document.querySelectorAll("[data-report-view]")),
  walletTotal: document.querySelector("#wallet-total"),
  walletStreak: document.querySelector("#wallet-streak"),
  walletTier: document.querySelector("#wallet-tier"),
  walletRemaining: document.querySelector("#wallet-remaining"),
  walletProgress: document.querySelector("#wallet-progress"),
  walletNote: document.querySelector("#wallet-note"),
  walletNextUnlock: document.querySelector("#wallet-next-unlock"),
  walletTierCopy: document.querySelector("#wallet-tier-copy"),
  walletTierBar: document.querySelector("#wallet-tier-bar"),
  walletMonthlyGoal: document.querySelector("#wallet-monthly-goal"),
  walletMonthlyGoalCopy: document.querySelector("#wallet-monthly-goal-copy"),
  walletSubscriptionStatus: document.querySelector("#wallet-subscription-status"),
  walletSubscriptionSummary: document.querySelector("#wallet-subscription-summary"),
};

let mediaStream;
let motionFrameId;
let holdIntervalId;
let sessionStartedAt = 0;
let previousFrame;
let repCooldown = 0;
let lastFeedbackMessage = "";
let lastFeedbackAt = 0;
let poseInstance;
let poseBusy = false;
let latestPoseLandmarks;
let demoHoldStartedAt = 0;
let revealObserver;
const FEEDBACK_COOLDOWN_MS = 1800;
const MOTION_CONFIRMATION_FRAMES = 18;
const AUTO_CALIBRATION_READY_FRAMES = 8;
const AUTO_CALIBRATION_HOLD_MS = 1200;
const AUTO_CALIBRATION_STEADY_CAPTURE_MS = 3600;
const AUTO_CALIBRATION_STEADY_MOVEMENT_THRESHOLD = 0.018;
const CALIBRATION_HOLD_GRACE_MS = 240;
const ARM_CALIBRATION_TARGET_SCALE = 0.8;
const FIRST_CALIBRATION_HOLD_MS = 2200;
const FIRST_CALIBRATION_STEP_DELAY_MS = 3000;
const FOLLOWUP_CALIBRATION_STEP_DELAY_MS = 3000;
let calibrationMatchFrames = 0;
let calibrationHoldStartedAt = 0;
let calibrationStepReadyAt = 0;
let calibrationLastMatchedAt = 0;
let calibrationSamples = [];
let calibrationSteadyStartedAt = 0;
let calibrationSteadySnapshot = null;
let exerciseMatchStartedAt = 0;
let exerciseMatchCarryMs = 0;

bootstrap();

function bootstrap() {
  restoreState();
  state.activeTab = "overview";
  bindEvents();
  renderAuth();
  renderActiveTab();
  renderSelectedCards();
  renderSelectionProgress();
  renderPlan();
  renderSessionDemos();
  renderAllDemos();
  renderSession();
  renderControlStates();
  renderCalibration();
  renderWorkflow();
  renderReport();
  renderRewards();
  syncSliderLabels();
  initMotionDesign();
}

function bindEvents() {
  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!requestProtectedAccess(button.dataset.tabTarget)) return;
      state.activeTab = button.dataset.tabTarget;
      renderActiveTab();
      persistState();
    });
  });

  els.tabJumpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!requestProtectedAccess(button.dataset.tabJump)) return;
      state.activeTab = button.dataset.tabJump;
      renderActiveTab();
      persistState();
    });
  });

  els.formInputs.forEach((input) => {
    input.addEventListener("input", () => {
      syncSliderLabels();
      renderSelectedCards();
      renderSelectionProgress();
    });

    input.addEventListener("change", () => {
      syncSliderLabels();
      renderSelectedCards();
      renderSelectionProgress();
    });
  });

  els.authModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.auth.mode = button.dataset.authMode || "signup";
      state.auth.stage = "credentials";
      state.auth.pendingCode = "";
      state.auth.feedback = state.auth.mode === "signup"
        ? "Create an account to unlock the care workflow."
        : "Sign in and complete 2FA to continue.";
      renderAuth();
      persistState();
    });
  });

  els.authForm?.addEventListener("submit", handleAuthSubmit);
  [els.authName, els.authEmail, els.authPassword].forEach((input) => {
    input?.addEventListener("input", () => {
      if (state.auth.stage !== "verify") return;
      syncPendingAuthFieldsFromInputs();
      renderAuth();
      persistState();
    });
  });
  els.verify2fa?.addEventListener("click", verifyTwoFactorCode);
  els.resend2fa?.addEventListener("click", resendTwoFactorCode);
  els.authLogout?.addEventListener("click", logoutAccount);

  els.form.addEventListener("submit", handleAssessmentSubmit);
  els.startCamera.addEventListener("click", startCamera);
  els.stopCamera.addEventListener("click", stopCamera);
  els.cameraPermissionCancel?.addEventListener("click", cancelCameraPermissionModal);
  els.cameraPermissionContinue?.addEventListener("click", requestCameraAccess);
  els.captureCalibration.addEventListener("click", captureCalibration);
  els.resetCalibration.addEventListener("click", resetCalibration);
  els.startDemo.addEventListener("click", startDemoWalkthrough);
  els.preRpe.addEventListener("input", handleRpeInput);
  els.postRpe.addEventListener("input", handleRpeInput);
  els.submitRpe?.addEventListener("click", () => submitRpe());
  els.sessionCarouselPrev?.addEventListener("click", () => {
    state.session.previewDemoIndex = Math.max(0, (state.session.previewDemoIndex || 0) - 1);
    renderSessionDemos();
    persistState();
  });
  els.sessionCarouselNext?.addEventListener("click", () => {
    const maxIndex = Math.max(0, buildSessionDemoLibrary().length - 1);
    state.session.previewDemoIndex = Math.min(maxIndex, (state.session.previewDemoIndex || 0) + 1);
    renderSessionDemos();
    persistState();
  });
  els.toggleSession.addEventListener("click", toggleSession);
  els.toggleHold.addEventListener("click", toggleHold);
  els.manualRep.addEventListener("click", () => {
    registerExerciseRep(1, 8, "Manual rep logged. Keep the movement slow and repeatable.");
  });
  els.completeSession.addEventListener("click", completeSession);

  els.reportViewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.reportView = button.dataset.reportView || "daily";
      renderReport();
      persistState();
    });
  });
}

function renderActiveTab() {
  if (!state.auth.authenticated && state.activeTab !== "overview") {
    state.activeTab = "overview";
  }

  els.tabButtons.forEach((button) => {
    const active = button.dataset.tabTarget === state.activeTab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    const protectedTab = button.dataset.tabTarget !== "overview";
    button.classList.toggle("is-disabled", protectedTab && !state.auth.authenticated);
  });

  els.tabPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.tabPanel === state.activeTab);
  });

  refreshRevealElements();
}

function requestProtectedAccess(target) {
  if (state.auth.authenticated || target === "overview") return true;
  state.activeTab = "overview";
  state.auth.feedback = "Create an account and verify 2FA first to unlock the guided care workflow.";
  renderAuth();
  renderActiveTab();
  return false;
}

function generateTwoFactorCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function handleAuthSubmit(event) {
  event.preventDefault();

  const mode = state.auth.mode || "signup";
  const name = String(els.authName?.value || "").trim();
  const email = String(els.authEmail?.value || "").trim().toLowerCase();
  const password = String(els.authPassword?.value || "");

  if (mode === "signup" && !name) {
    state.auth.feedback = "Enter a full name to create the account.";
    renderAuth();
    return;
  }

  if (!email) {
    state.auth.feedback = "Enter an email address.";
    renderAuth();
    return;
  }

  if (password.length < 8) {
    state.auth.feedback = "Use a password with at least 8 characters.";
    renderAuth();
    return;
  }

  if (mode === "signup") {
    state.auth.pendingName = name;
    state.auth.pendingEmail = email;
    state.auth.pendingPassword = password;
  } else {
    const account = state.auth.account;
    if (!account || account.email !== email || account.password !== password) {
      state.auth.feedback = "Account details not recognized. Create an account first or try the saved credentials.";
      renderAuth();
      return;
    }

    state.auth.pendingName = account.name;
    state.auth.pendingEmail = account.email;
    state.auth.pendingPassword = account.password;
  }

  issueTwoFactorChallenge(mode);
}

function syncPendingAuthFieldsFromInputs() {
  const mode = state.auth.mode || "signup";
  const name = String(els.authName?.value || "").trim();
  const email = String(els.authEmail?.value || "").trim().toLowerCase();
  const password = String(els.authPassword?.value || "");

  if (mode === "signup" && name) {
    state.auth.pendingName = name;
  }

  if (email) {
    state.auth.pendingEmail = email;
  }

  if (password) {
    state.auth.pendingPassword = password;
  }
}

function issueTwoFactorChallenge(mode = state.auth.mode || "signup") {
  syncPendingAuthFieldsFromInputs();
  state.auth.stage = "verify";
  state.auth.pendingCode = generateTwoFactorCode();
  state.auth.feedback = mode === "signup"
    ? `Account created for ${state.auth.pendingEmail}. Enter the demo 2FA code to finish setup.`
    : `2FA challenge sent to ${state.auth.pendingEmail}. Enter the demo code to sign in.`;
  if (els.authCode) els.authCode.value = "";
  renderAuth();
  persistState();
}

function verifyTwoFactorCode() {
  syncPendingAuthFieldsFromInputs();
  const submittedCode = String(els.authCode?.value || "").trim();
  if (!submittedCode) {
    state.auth.feedback = "Enter the 6-digit verification code.";
    renderAuth();
    return;
  }

  if (submittedCode !== state.auth.pendingCode) {
    state.auth.feedback = "That code does not match. Try again or resend a new code.";
    renderAuth();
    return;
  }

  state.auth.account = {
    name: state.auth.pendingName || "IsoTrack User",
    email: state.auth.pendingEmail,
    password: state.auth.pendingPassword,
    verifiedAt: new Date().toISOString(),
  };
  state.auth.authenticated = true;
  state.auth.stage = "credentials";
  state.auth.pendingCode = "";
  state.auth.feedback = `Signed in as ${state.auth.account.name}. Assessment and Session Lab are now unlocked.`;
  state.activeTab = "assessment";
  renderAuth();
  renderActiveTab();
  persistState();
}

function resendTwoFactorCode() {
  syncPendingAuthFieldsFromInputs();
  if (!state.auth.pendingEmail) {
    state.auth.feedback = "Enter your account details first.";
    renderAuth();
    return;
  }

  issueTwoFactorChallenge(state.auth.mode || "signin");
}

function logoutAccount() {
  state.auth.authenticated = false;
  state.auth.stage = "credentials";
  state.auth.pendingCode = "";
  state.auth.feedback = "Signed out. Sign in again and complete 2FA to continue.";
  state.activeTab = "overview";
  renderAuth();
  renderActiveTab();
  persistState();
}

function renderAuth() {
  const mode = state.auth.mode || "signup";
  const verifying = state.auth.stage === "verify";
  const authenticated = Boolean(state.auth.authenticated);
  if (verifying) syncPendingAuthFieldsFromInputs();

  els.authModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.authMode === mode);
  });

  if (els.authNameField) {
    els.authNameField.classList.toggle("hidden", mode !== "signup");
  }

  if (els.authSubmit) {
    els.authSubmit.textContent = mode === "signup" ? "Create Account" : "Send 2FA Code";
    els.authSubmit.disabled = verifying;
  }

  if (els.authLogout) {
    els.authLogout.hidden = !authenticated;
  }

  if (els.authFeedback) {
    els.authFeedback.textContent = state.auth.feedback;
  }

  if (els.authSessionStatus) {
    els.authSessionStatus.textContent = authenticated
      ? `Verified • ${state.auth.account?.email || "Account"}`
      : verifying
        ? "2FA pending"
        : "Signed out";
  }

  if (els.authVerifyPanel) {
    els.authVerifyPanel.classList.toggle("hidden", !verifying);
  }

  if (els.authVerifyCopy) {
    els.authVerifyCopy.textContent = verifying
      ? `Enter the 6-digit code for ${state.auth.pendingEmail}.`
      : "Enter the 6-digit verification code.";
  }

  if (els.authDemoNote) {
    els.authDemoNote.textContent = verifying
      ? `Prototype code: ${state.auth.pendingCode || "------"}`
      : "Prototype note: verification codes are shown in-app for this demo.";
  }

  if (els.authName && mode === "signup" && !els.authName.value) {
    els.authName.value = state.auth.account?.name || "";
  }

  if (els.authEmail && !els.authEmail.value) {
    els.authEmail.value = state.auth.account?.email || "";
  }
}

function initMotionDesign() {
  if (!("IntersectionObserver" in window)) return;
  if (revealObserver) return;

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  });

  refreshRevealElements();
  window.addEventListener("scroll", handleWindowScroll, { passive: true });
  handleWindowScroll();
}

function refreshRevealElements() {
  if (!revealObserver) return;

  const revealTargets = document.querySelectorAll(
    ".hero-copy, .hero-visual, .tab-rail, .tab-panel.is-active .panel, .tab-panel.is-active .feature-card, .site-footer"
  );

  revealTargets.forEach((element, index) => {
    if (!element.classList.contains("reveal-on-scroll")) {
      element.classList.add("reveal-on-scroll");
      element.style.setProperty("--reveal-delay", `${Math.min(index * 45, 220)}ms`);
    }

    if (!element.classList.contains("is-visible")) {
      revealObserver.observe(element);
    }
  });
}

function handleWindowScroll() {
  const tabRail = document.querySelector(".tab-rail");
  if (!tabRail) return;
  tabRail.classList.toggle("is-scrolled", window.scrollY > 24);
}

function syncSliderLabels() {
  els.fatigueValue.textContent = els.fatigue.value;
  els.confidenceValue.textContent = els.confidence.value;
  if (els.preRpe) {
    const preRpe = clampRpe(state.session.preRpeDraft ?? state.session.preRpe ?? Number(els.preRpe.value));
    els.preRpe.value = String(preRpe);
    els.preRpeValue.textContent = String(preRpe);
  }
  if (els.postRpe) {
    const postRpe = clampRpe(state.session.postRpeDraft ?? state.session.postRpe ?? Number(els.postRpe.value));
    els.postRpe.value = String(postRpe);
    els.postRpeValue.textContent = String(postRpe);
  }
}

function handleRpeInput() {
  state.session.preRpeDraft = clampRpe(els.preRpe.value);
  state.session.postRpeDraft = clampRpe(els.postRpe.value);
  state.session.rpeDirty = true;
  state.session.rpeStatus = "Changes not submitted yet.";
  syncSliderLabels();
  renderSession();
  renderControlStates();
  persistState();
}

function getRpeSubmitLabel() {
  if (state.session.completed || (!state.session.running && (state.session.reps > 0 || state.session.totalTension > 0))) {
    return "Submit Post-Session RPE";
  }
  if (state.session.running) return "Update Session RPE";
  return "Submit Starting RPE";
}

function getRpeStatusLabel() {
  if (state.session.rpeDirty) return "Changes not submitted yet.";
  return state.session.rpeStatus || "Enter values and submit them.";
}

function submitRpe({ feedback = true } = {}) {
  state.session.preRpe = clampRpe(state.session.preRpeDraft ?? els.preRpe?.value ?? state.session.preRpe);
  state.session.postRpe = clampRpe(state.session.postRpeDraft ?? els.postRpe?.value ?? state.session.postRpe);
  state.session.rpeDirty = false;
  state.session.rpeStatus = state.session.completed || (!state.session.running && (state.session.reps > 0 || state.session.totalTension > 0))
    ? `Post-session RPE saved at ${state.session.postRpe}/10.`
    : state.session.running
      ? `RPE update saved at ${state.session.postRpe}/10.`
      : `Starting RPE saved at ${state.session.preRpe}/10.`;
  syncSliderLabels();
  renderSession();
  renderControlStates();
  persistState();
  if (feedback) setFeedback(state.session.rpeStatus);
}

function clampRpe(value) {
  const normalized = Number.parseInt(value, 10);
  if (!Number.isFinite(normalized)) return 4;
  return Math.min(10, Math.max(1, normalized));
}

function getMonthlyRepTarget(plan) {
  const weeklyReps = Number(plan?.weeklyReps || 24);
  return Math.max(1, weeklyReps * 4);
}

function getMonthlyRewardRate(plan) {
  return Number((MONTHLY_SUBSCRIPTION_FEE / getMonthlyRepTarget(plan)).toFixed(3));
}

function ensureRewardPeriod() {
  const currentPeriodKey = getRewardPeriodKey();
  if (state.rewards.periodKey === currentPeriodKey) return;

  state.rewards.periodKey = currentPeriodKey;
  state.rewards.cashback = 0;
  state.rewards.targetValue = MONTHLY_SUBSCRIPTION_FEE;
}

function normalizePlanSubscription(plan) {
  if (!plan) return null;
  plan.programValue = MONTHLY_SUBSCRIPTION_FEE;
  plan.rewardRate = getMonthlyRewardRate(plan);
  return plan;
}

function getCalibrationStepDelayMs() {
  return state.session.currentCalibrationStep === 0
    ? FIRST_CALIBRATION_STEP_DELAY_MS
    : FOLLOWUP_CALIBRATION_STEP_DELAY_MS;
}

function getCalibrationHoldMs() {
  return state.session.currentCalibrationStep === 0
    ? FIRST_CALIBRATION_HOLD_MS
    : AUTO_CALIBRATION_HOLD_MS;
}

function getCalibrationReadyFrames() {
  const currentStep = CALIBRATION_SEQUENCE[state.session.currentCalibrationStep];
  return currentStep?.key === "neutral" ? AUTO_CALIBRATION_READY_FRAMES : 2;
}

function hasReliablePoint(point, minVisibility = 0.42) {
  return Boolean(
    point
    && typeof point.x === "number"
    && typeof point.y === "number"
    && (point.visibility ?? 1) >= minVisibility
  );
}

function buildCalibrationAssessment(checks, threshold, fallbackHint, fallbackShortHint = "Adjust pose") {
  const passedCount = checks.filter((check) => check.pass).length;
  const firstFailed = checks.find((check) => !check.pass);

  return {
    matched: passedCount >= threshold,
    score: checks.length ? passedCount / checks.length : 0,
    hint: firstFailed?.hint || fallbackHint,
    shortHint: firstFailed?.shortHint || fallbackShortHint,
  };
}

function getMeanNormalizedGuideOffset(pointPairs, normalizer) {
  const offsets = pointPairs
    .map(([livePoint, guidePoint]) => {
      if (!livePoint || !guidePoint || !normalizer) return null;
      return distance(livePoint, guidePoint) / normalizer;
    })
    .filter((offset) => typeof offset === "number" && Number.isFinite(offset));

  if (!offsets.length) return Infinity;
  return offsets.reduce((sum, offset) => sum + offset, 0) / offsets.length;
}

function getLiftDelta(fromPoint, toPoint) {
  if (!fromPoint || !toPoint) return 0;
  return fromPoint.y - toPoint.y;
}

function renderSelectedCards() {
  els.choiceCards.forEach((card) => {
    const input = card.querySelector("input");
    card.classList.toggle("is-selected", Boolean(input?.checked));
  });
}

function renderSelectionProgress() {
  const formData = new FormData(els.form);
  const hasDiagnosis = Boolean(formData.get("diagnosis"));
  const hasWeeklyTarget = Boolean(formData.get("weeklyReps"));
  const hasEnergy = Boolean(formData.get("energy"));
  const focusCount = formData.getAll("focus").length;
  const hasPatientName = String(formData.get("patientName") || "").trim().length > 0;

  const completed = [
    hasDiagnosis,
    hasWeeklyTarget && hasEnergy,
    focusCount > 0,
    true,
    hasPatientName,
  ].filter(Boolean).length;

  const percent = Math.round((completed / 5) * 100);
  els.progressValue.textContent = `${percent}%`;
  els.progressBar.style.width = `${percent}%`;

  if (percent < 60) {
    els.progressSummary.textContent = "Choose a condition, weekly target, and focus area.";
  } else if (percent < 100) {
    els.progressSummary.textContent = `${focusCount} focus area${focusCount === 1 ? "" : "s"} selected. Add a patient name to finish.`;
  } else {
    els.progressSummary.textContent = "Assessment complete. Generate the plan.";
  }
}

function handleAssessmentSubmit(event) {
  event.preventDefault();
  if (!state.auth.authenticated) {
    requestProtectedAccess("assessment");
    return;
  }
  const formData = new FormData(els.form);
  const focus = formData.getAll("focus");
  const patientName = String(formData.get("patientName") || "").trim() || "Jordan Lee";
  const diagnosis = String(formData.get("diagnosis"));
  const weeklyReps = Number(formData.get("weeklyReps") || 24);
  const energy = String(formData.get("energy"));
  const fatigue = Number(formData.get("fatigue"));
  const confidence = Number(formData.get("confidence"));

  const protectedMode = fatigue >= 7 || confidence <= 4 || energy === "fragile";
  const sessionsPerWeek = protectedMode ? 3 : weeklyReps >= 48 ? 4 : 3;
  const cadence = `${weeklyReps} reps/week | ${sessionsPerWeek} sessions`;
  const holdSeconds = protectedMode ? 15 : confidence >= 8 ? 30 : 22;
  const baseSets = protectedMode ? 2 : weeklyReps >= 48 ? 4 : 3;
  const programValue = MONTHLY_SUBSCRIPTION_FEE;
  const rewardRate = getMonthlyRewardRate({ weeklyReps });
  const reimbursementSessions = sessionsPerWeek * 4;
  const focuses = focus.length ? focus : ["Shoulders", "Core"];

  state.plan = {
    patientName,
    diagnosis,
    weeklyReps,
    energy,
    fatigue,
    confidence,
    protectedMode,
    cadence,
    sessionsPerWeek,
    holdSeconds,
    baseSets,
    rewardRate,
    programValue,
    reimbursementSessions,
    focuses,
  };
  state.rewards.cashback = 0;
  state.rewards.targetValue = MONTHLY_SUBSCRIPTION_FEE;
  state.rewards.periodKey = getRewardPeriodKey();

  state.report = null;
  state.session.reps = 0;
  state.session.holdSeconds = 0;
  state.session.totalTension = 0;
  state.session.motionScore = 0;
  state.session.smoothedMotionScore = 0;
  state.session.running = false;
  state.session.holdActive = false;
  state.session.intensityLabel = protectedMode ? "Protected mode" : "Moderate guided mode";
  state.session.selectedDemo = 0;
  state.session.previewDemoIndex = 0;
  state.session.librarySelectedDemo = 0;
  state.session.completed = false;
  state.session.preRpe = clampRpe(els.preRpe?.value ?? state.session.preRpe);
  state.session.postRpe = clampRpe(els.postRpe?.value ?? state.session.postRpe);
  state.session.preRpeDraft = state.session.preRpe;
  state.session.postRpeDraft = state.session.postRpe;
  state.session.rpeDirty = false;
  state.session.rpeStatus = "Enter values and submit them.";
  state.session.exerciseReps = 0;
  state.session.exerciseHoldSeconds = 0;
  state.session.exerciseTension = 0;
  state.session.completedExercises = [];
  state.session.calibrated = false;
  state.session.baseline = null;
  state.session.calibrationShots = {
    neutral: null,
    arms: null,
    knee: null,
  };
  state.session.currentCalibrationStep = 0;
  state.session.demoActive = false;
  state.session.demoCompleted = false;
  state.session.demoProgress = 0;
  state.session.pendingMotionLabel = "idle";
  state.session.pendingMotionFrames = 0;
  state.session.exerciseMatchState = "idle";
  state.session.exerciseMatchScore = 0;
  sessionStartedAt = 0;
  demoHoldStartedAt = 0;
  resetAutoCalibrationTracking();
  resetExerciseHoldTracking();
  scheduleCalibrationStepDelay();
  els.toggleSession.textContent = "Start Session";
  els.toggleHold.textContent = "Auto Hold";
  updateCalibrationButtonLabel();
  syncSliderLabels();

  setFeedback("Plan created. Session Lab is ready.");
  renderPlan();
  renderSessionDemos();
  renderSession();
  renderControlStates();
  renderCalibration();
  renderWorkflow();
  renderReport();
  state.activeTab = "assessment";
  renderActiveTab();
  persistState();
}

function getDefaultPlan() {
  return {
    patientName: "Jordan Lee",
    diagnosis: "Duchenne muscular dystrophy",
    weeklyReps: 24,
    energy: "variable",
    protectedMode: true,
    cadence: "24 reps/week | 3 sessions",
    sessionsPerWeek: 3,
    holdSeconds: 18,
    baseSets: 2,
    rewardRate: getMonthlyRewardRate({ weeklyReps: 24 }),
    programValue: MONTHLY_SUBSCRIPTION_FEE,
    reimbursementSessions: DEFAULT_REIMBURSEMENT_SESSIONS,
    focuses: ["Shoulders", "Core", "Hips"],
  };
}

function getActivePlan() {
  return normalizePlanSubscription(state.plan || getDefaultPlan());
}

function buildProgramItem(focus, variant, plan, sessionLabel = "") {
  const library = exerciseLibrary[focus] || exerciseLibrary.Core;
  const exercise = library[variant];
  const setCount = variant === "main" ? plan.baseSets : Math.max(1, plan.baseSets - 1);
  const holdSeconds = variant === "main" ? plan.holdSeconds : Math.max(8, plan.holdSeconds - 8);

  return {
    focus,
    title: variant === "main" && sessionLabel ? `${sessionLabel}: ${exercise.title}` : exercise.title,
    description: variant === "main"
      ? `${setCount} sets, ${holdSeconds} sec holds, ${plan.weeklyReps} reps per week, adapted for a ${plan.energy} energy profile.`
      : `Use on low-energy days. ${setCount} sets with ${holdSeconds} sec holds and a smaller movement range.`,
    cue: exercise.cue,
    summary: exercise.summary,
    setup: exercise.setup,
    equipment: exercise.equipment,
    videoBrief: exercise.videoBrief,
    steps: exercise.steps,
    movementPattern: exercise.movementPattern,
    workflowPrompt: exercise.workflowPrompt,
    startPrompt: exercise.startPrompt,
    typeLabel: variant === "main" ? "Primary demo" : "Low-energy option",
    statusLabel: "MP4 pending",
    targetLabel: `${setCount} sets x ${holdSeconds} sec`,
  };
}

function buildProgramItems() {
  const plan = getActivePlan();
  const sessionNames = ["Calibrate", "Train", "Report"];

  const main = plan.focuses.map((focus, index) => {
    return buildProgramItem(focus, "main", plan, sessionNames[index % sessionNames.length]);
  });

  const alt = plan.focuses.map((focus) => {
    return buildProgramItem(focus, "alt", plan);
  });

  return { main, alt };
}

function getPerSessionRepTarget(plan = getActivePlan()) {
  return Math.max(2, Math.ceil((plan.weeklyReps || 24) / Math.max(1, plan.sessionsPerWeek || 3)));
}

function chooseDemoForFocus(focus, index = 0) {
  const matches = demoCatalog.filter((item) => item.focus === focus);
  if (matches.length) return matches[index % matches.length];
  return demoCatalog[index % demoCatalog.length] || demoCatalog[0];
}

function buildSessionDemoLibrary() {
  if (!state.plan) return [];

  const plan = getActivePlan();
  const focuses = (plan.focuses?.length ? plan.focuses : DEFAULT_DEMO_FOCUSES.slice(0, 3)).slice(0, 3);
  const perSessionRepTarget = getPerSessionRepTarget(plan);
  const exerciseCount = Math.max(1, focuses.length);

  return focuses.map((focus, index) => {
    const variant = plan.protectedMode && index === focuses.length - 1 ? "alt" : "main";
    const prescription = buildProgramItem(focus, variant, plan, `Exercise ${index + 1}`);
    const videoDemo = chooseDemoForFocus(focus, index);
    const holdTarget = Math.max(
      plan.holdSeconds,
      prescription.movementPattern === "upperHold"
        ? plan.baseSets * plan.holdSeconds
        : Math.round(Math.max(plan.holdSeconds, plan.baseSets * plan.holdSeconds * 0.6))
    );
    const repTarget = prescription.movementPattern === "lowerLift"
      ? Math.max(2, Math.ceil(perSessionRepTarget / exerciseCount))
      : Math.max(2, Math.ceil(perSessionRepTarget / (exerciseCount * 2)));

    return {
      ...videoDemo,
      demoTitle: videoDemo.title,
      title: prescription.title,
      description: prescription.description,
      summary: `${prescription.summary} Prescribed from the assessment plan.`,
      cue: videoDemo.helperTip || prescription.cue,
      setup: prescription.setup,
      equipment: prescription.equipment,
      videoBrief: videoDemo.videoPath,
      workflowPrompt: prescription.workflowPrompt,
      startPrompt: prescription.startPrompt,
      typeLabel: plan.protectedMode ? "Protected prescription" : "Adaptive prescription",
      statusLabel: `Exercise ${index + 1} of ${exerciseCount}`,
      targetLabel: `${repTarget} reps or ${holdTarget}s TUT`,
      instructionSteps: prescription.steps,
      purpose: videoDemo.purpose,
      poseVariant: videoDemo.poseVariant || getDemoPoseVariant(videoDemo),
      repTarget,
      holdTarget,
      sessionIndex: index,
      setTargetLabel: `${plan.baseSets} sets x ${plan.holdSeconds} sec`,
    };
  });
}

function getSelectedDemo() {
  const demos = buildSessionDemoLibrary();
  if (!demos.length) return null;
  const maxIndex = Math.max(0, demos.length - 1);
  state.session.selectedDemo = Math.min(Math.max(0, state.session.selectedDemo || 0), maxIndex);
  return demos[state.session.selectedDemo] || demos[0];
}

function getSelectedLibraryDemo() {
  const maxIndex = Math.max(0, demoCatalog.length - 1);
  state.session.librarySelectedDemo = Math.min(Math.max(0, state.session.librarySelectedDemo || 0), maxIndex);
  return demoCatalog[state.session.librarySelectedDemo] || demoCatalog[0];
}

function isCurrentExerciseComplete(selectedDemo = getSelectedDemo()) {
  if (!selectedDemo) return false;
  return state.session.completedExercises.includes(selectedDemo.sessionIndex);
}

function isCurrentExerciseTargetMet(selectedDemo = getSelectedDemo()) {
  if (!selectedDemo) return false;
  return state.session.exerciseReps >= selectedDemo.repTarget
    || state.session.exerciseHoldSeconds >= selectedDemo.holdTarget;
}

function isPrescribedSessionComplete(demos = buildSessionDemoLibrary()) {
  return demos.length > 0 && state.session.completedExercises.length >= demos.length;
}

function resetCurrentExerciseProgress() {
  state.session.exerciseReps = 0;
  state.session.exerciseHoldSeconds = 0;
  state.session.exerciseTension = 0;
  resetExerciseHoldTracking();
}

function getCurrentExerciseProgressLabel(selectedDemo = getSelectedDemo()) {
  if (!selectedDemo) return "No prescribed exercise selected.";
  if (isCurrentExerciseComplete(selectedDemo)) return "Complete. Move on when ready.";
  return `${state.session.exerciseReps}/${selectedDemo.repTarget} reps • ${state.session.exerciseHoldSeconds}/${selectedDemo.holdTarget}s TUT`;
}

function advancePrescribedExercise() {
  const demos = buildSessionDemoLibrary();
  const current = getSelectedDemo();
  if (!current) return;

  if (!state.session.completedExercises.includes(current.sessionIndex)) {
    state.session.completedExercises = [...state.session.completedExercises, current.sessionIndex].sort((a, b) => a - b);
  }

  state.session.running = false;
  state.session.holdActive = false;
  state.session.demoActive = false;
  demoHoldStartedAt = 0;
  els.toggleSession.textContent = "Start Session";

  const nextIndex = current.sessionIndex + 1;
  if (nextIndex < demos.length) {
    state.session.selectedDemo = nextIndex;
    state.session.previewDemoIndex = nextIndex;
    state.session.demoCompleted = false;
    state.session.demoProgress = 0;
    state.session.exerciseMatchState = "idle";
    state.session.exerciseMatchScore = 0;
    resetCurrentExerciseProgress();
    setFeedback(`${current.title} complete. Run the next prescribed demo: ${demos[nextIndex].title}.`);
  } else {
    state.session.previewDemoIndex = current.sessionIndex;
    state.session.demoCompleted = true;
    state.session.demoProgress = 100;
    state.session.exerciseMatchState = "matched";
    state.session.exerciseMatchScore = 1;
    setFeedback("Prescribed session complete. Submit post-session RPE and finish the session.");
  }

  renderSessionDemos();
  renderSession();
  renderControlStates();
  renderWorkflow();
  persistState();
}

function checkCurrentExerciseCompletion() {
  if (!state.session.running || isPrescribedSessionComplete()) return;
  if (!isCurrentExerciseTargetMet()) return;
  advancePrescribedExercise();
}

function renderPlan() {
  if (!state.plan) {
    els.planEmpty.classList.remove("hidden");
    els.planContent.classList.add("hidden");
    return;
  }

  const { main, alt } = buildProgramItems();
  const weeklyReps = state.plan.weeklyReps || 24;
  els.planEmpty.classList.add("hidden");
  els.planContent.classList.remove("hidden");

  els.planPatient.textContent = state.plan.patientName;
  els.planDiagnosis.textContent = state.plan.diagnosis;
  els.planGoal.textContent = `${weeklyReps} reps / week`;
  els.planCadence.textContent = state.plan.cadence;
  els.planReward.textContent = `$${MONTHLY_SUBSCRIPTION_FEE} monthly subscription with earn-back tracking`;
  els.planStatus.textContent = state.plan.protectedMode ? "Protected plan active" : "Adaptive plan ready";
  els.careNote.textContent = `${state.plan.patientName} starts with a ${state.plan.protectedMode ? "conservative" : "moderate"} program focused on ${state.plan.focuses.join(", ")} with a weekly target of ${weeklyReps} reps. Prioritize clean movement and stable breathing.`;

  els.programList.innerHTML = main
    .map((item) => `<li><strong>${item.title}</strong><span>${item.description}</span></li>`)
    .join("");

  els.alternateList.innerHTML = alt
    .map((item) => `<li><strong>${item.title}</strong><span>${item.description}</span></li>`)
    .join("");
}

function renderSessionDemos() {
  const demos = buildSessionDemoLibrary();
  const planLabel = state.plan ? `${state.plan.patientName}'s session lab` : "Session lab";
  const completedCount = state.session.completedExercises.length;
  const currentExerciseIndex = Math.min(state.session.selectedDemo || 0, Math.max(0, demos.length - 1));

  els.sessionPlanTitle.textContent = planLabel;
  if (!demos.length) {
    els.sessionPlanNote.textContent = "Assessment required";
    if (els.sessionCarouselStatus) els.sessionCarouselStatus.textContent = "Assessment required";
    if (els.sessionCarouselTrack) {
      els.sessionCarouselTrack.innerHTML = `
        <article class="session-carousel-page session-carousel-page-empty">
          <strong>Assessment needed</strong>
          <p>Generate a plan first, then Session Lab will show every prescribed exercise here as carousel pages.</p>
        </article>
      `;
    }
    if (els.sessionCarouselPrev) els.sessionCarouselPrev.disabled = true;
    if (els.sessionCarouselNext) els.sessionCarouselNext.disabled = true;
    els.selectedDemoTitle.textContent = "Complete Assessment First";
    els.selectedDemoCopy.textContent = "Session Lab builds the exercise flow directly from the assessment plan.";
    els.selectedDemoVideoStatus.textContent = "Locked";
    if (els.selectedDemoPlayer) {
      els.selectedDemoPlayer.removeAttribute("src");
      els.selectedDemoPlayer.load();
    }
    els.selectedDemoFocus.textContent = "Plan needed";
    els.selectedDemoVariant.textContent = "Assessment-gated";
    els.selectedDemoTarget.textContent = "No prescription yet";
    els.selectedDemoSetup.textContent = "Finish the assessment and generate a plan to populate the prescribed session exercises.";
    els.selectedDemoScript.textContent = "After assessment, Session Lab will load the patient-specific exercise order, targets, and demo videos.";
    els.selectedDemoSteps.innerHTML = `
      <article class="demo-step">
        <span>01</span>
        <p>Open the Assessment tab.</p>
      </article>
      <article class="demo-step">
        <span>02</span>
        <p>Choose diagnosis, focus areas, energy profile, and weekly rep target.</p>
      </article>
      <article class="demo-step">
        <span>03</span>
        <p>Generate the plan, then return to Session Lab for the prescribed exercise flow.</p>
      </article>
    `;
    renderDemoPreview(null);
    return;
  }

  els.sessionPlanNote.textContent = isPrescribedSessionComplete(demos)
    ? "Prescribed session complete"
    : `Current exercise ${currentExerciseIndex + 1} of ${Math.max(1, demos.length)} • ${completedCount} done`;

  if (state.session.demoActive || state.session.running) {
    state.session.previewDemoIndex = currentExerciseIndex;
  }

  const previewIndex = Math.min(state.session.previewDemoIndex ?? state.session.selectedDemo ?? 0, Math.max(0, demos.length - 1));
  state.session.selectedDemo = Math.max(0, currentExerciseIndex);
  state.session.previewDemoIndex = Math.max(0, previewIndex);

  if (els.sessionCarouselStatus) {
    els.sessionCarouselStatus.textContent = `Page ${previewIndex + 1} of ${demos.length}`;
  }

  if (els.sessionCarouselPrev) {
    els.sessionCarouselPrev.disabled = previewIndex <= 0 || state.session.demoActive || state.session.running;
  }

  if (els.sessionCarouselNext) {
    els.sessionCarouselNext.disabled = previewIndex >= demos.length - 1 || state.session.demoActive || state.session.running;
  }

  if (els.sessionCarouselTrack) {
    els.sessionCarouselTrack.innerHTML = `
      <div class="session-carousel-strip" style="transform:translateX(-${previewIndex * 100}%);">
        ${demos.map((item, index) => {
          const isCurrent = index === currentExerciseIndex;
          const isComplete = state.session.completedExercises.includes(item.sessionIndex);
          const status = isComplete ? "Done" : isCurrent ? "Current" : "Queued";
          return `
            <article class="session-carousel-page ${isCurrent ? "is-current" : ""} ${isComplete ? "is-complete" : ""}">
              <div class="session-carousel-page-head">
                <span class="demo-chip">Exercise ${index + 1}</span>
                <span class="demo-chip">${status}</span>
              </div>
              <strong>${item.title}</strong>
              <p>${item.summary}</p>
              <div class="demo-card-tags">
                <span class="demo-chip">${item.focus}</span>
                <span class="demo-chip">${item.targetLabel}</span>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  const selected = demos[previewIndex];
  if (selected) {
    els.selectedDemoTitle.textContent = selected.title;
    els.selectedDemoCopy.textContent = selected.summary;
    els.selectedDemoVideoStatus.textContent = previewIndex === currentExerciseIndex ? selected.statusLabel : `Preview • ${selected.statusLabel}`;
    if (els.selectedDemoPlayer) {
      els.selectedDemoPlayer.src = selected.videoPath || "";
      els.selectedDemoPlayer.poster = "";
      els.selectedDemoPlayer.load();
    }
    els.selectedDemoFocus.textContent = `${selected.focus} focus`;
    els.selectedDemoVariant.textContent = selected.typeLabel;
    els.selectedDemoTarget.textContent = selected.targetLabel;
    els.selectedDemoSetup.textContent = `Helpful Tip: ${selected.cue}`;
    els.selectedDemoScript.textContent = `Plan target: ${selected.setTargetLabel}. Demo file: ${selected.videoBrief}`;
    const progressStatus = isCurrentExerciseComplete(selected)
      ? "Status: Complete."
      : previewIndex === currentExerciseIndex
        ? `Current progress: ${getCurrentExerciseProgressLabel(selected)}.`
        : "Status: Queued until earlier prescribed exercises are complete.";
    const prescribedSteps = [
      `Prescribed block ${selected.sessionIndex + 1} of ${demos.length} for ${selected.focus}.`,
      `Complete ${selected.repTarget} reps or ${selected.holdTarget} seconds of time under tension to clear this exercise.`,
      progressStatus,
      ...selected.instructionSteps,
      `Purpose: ${selected.purpose}`,
    ];
    els.selectedDemoSteps.innerHTML = prescribedSteps
      .map((step, index) => `
        <article class="demo-step">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <p>${step}</p>
        </article>
      `)
      .join("");
  }

  renderDemoPreview(selected);
}

function renderAllDemos() {
  const demos = demoCatalog.map((item) => ({
    ...item,
    description: item.purpose,
    summary: item.purpose,
    cue: item.helperTip,
    statusLabel: "MP4 ready",
    targetLabel: item.movementPattern === "lowerLift" ? "Lower-body demo" : "Upper-body demo",
  }));

  const selectedIndex = Math.min(Math.max(0, state.session.librarySelectedDemo || 0), Math.max(0, demos.length - 1));
  state.session.librarySelectedDemo = selectedIndex;
  const selected = demos[selectedIndex] || demos[0];

  if (selected) {
    if (els.libraryDemoTitle) els.libraryDemoTitle.textContent = selected.title;
    if (els.libraryDemoStatus) els.libraryDemoStatus.textContent = selected.statusLabel;
    if (els.libraryDemoPlayer) {
      els.libraryDemoPlayer.src = selected.videoPath || "";
      els.libraryDemoPlayer.poster = "";
      els.libraryDemoPlayer.load();
    }
    if (els.libraryDemoCopy) els.libraryDemoCopy.textContent = selected.summary;
    if (els.libraryDemoFocus) els.libraryDemoFocus.textContent = `${selected.focus} focus`;
    if (els.libraryDemoTarget) els.libraryDemoTarget.textContent = selected.targetLabel;
    if (els.libraryDemoFile) {
      const fileName = String(selected.videoPath || "").split("/").pop() || "MP4 file";
      els.libraryDemoFile.textContent = fileName;
    }
    if (els.libraryDemoTip) els.libraryDemoTip.textContent = `Helpful Tip: ${selected.cue}`;
    if (els.libraryDemoPurpose) els.libraryDemoPurpose.textContent = `Purpose: ${selected.summary}`;
  }

  if (!els.allDemoList) return;
  els.allDemoList.innerHTML = demos
    .map((item, index) => `
      <article class="demo-card ${index === selectedIndex ? "is-selected" : ""}" data-demo-index="${index}">
        <div class="demo-card-top">
          <span class="demo-card-kicker">${item.focus}</span>
          <span class="demo-card-status">${item.statusLabel}</span>
        </div>
        <strong>${item.title}</strong>
        <p>${item.summary}</p>
        <div class="demo-card-tags">
          <span class="demo-chip">${item.targetLabel}</span>
          <span class="demo-chip">${String(item.videoPath || "").split("/").pop() || "MP4"}</span>
        </div>
      </article>
    `)
    .join("");

  els.allDemoList.querySelectorAll(".demo-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.session.librarySelectedDemo = Number(card.dataset.demoIndex);
      renderAllDemos();
      persistState();
    });
  });
}

function renderDemoPreview(selectedDemo = getSelectedDemo()) {
  return selectedDemo;
}

function getDemoDisplayLabel(demo) {
  return demo?.demoTitle || demo?.title || "Current exercise";
}

function getDemoPoseVariant(demo) {
  if (demo?.poseVariant) return demo.poseVariant;
  const label = `${demo?.demoTitle || ""} ${demo?.title || ""}`.toLowerCase();

  if (label.includes("ankle eversion")) return "ankleEversion";
  if (label.includes("ankle inversion")) return "ankleInversion";
  if (label.includes("foot dorsiflexion")) return "dorsiflexion";
  if (label.includes("wall calf stretch")) return "tibialisWall";
  if (label.includes("calf raise")) return "calfRaise";
  if (label.includes("wall sits")) return "wallSit";
  if (label.includes("wall supported lunge")) return "supportedLunge";
  if (label.includes("glute bridge")) return "gluteBridge";
  if (label.includes("hamstring")) return "hamstringPress";
  if (label.includes("cat cow")) return "catCow";
  if (label.includes("hollow body")) return "hollowBody";
  if (label.includes("wall slides")) return "wallSlide";
  if (label.includes("lateral deltoid")) return "lateralDeltoid";
  if (label.includes("anterior deltoid")) return "anteriorDeltoid";
  if (label.includes("bicep")) return "bicepCurl";
  if (label.includes("door pull")) return "doorPull";
  if (label.includes("rotator cuff")) return "internalRotation";
  if (label.includes("shrug")) return "shrug";
  if (label.includes("tricep kickback")) return "tricepKickback";
  if (label.includes("ball grip")) return "ballGrip";
  if (label.includes("forearm flexion")) return "forearmFlexion";
  if (label.includes("pecs")) return "pecPress";
  if (demo?.movementPattern === "lowerLift") return "calfRaise";
  if (demo?.focus === "Shoulders") return "lateralDeltoid";
  return "ballGrip";
}

function buildDemoPreviewFigureMarkup({ poseVariant }) {
  const template = getDemoPoseTemplate(poseVariant);
  const points = template.points || {};
  const shadow = template.shadow === false
    ? ""
    : `<ellipse class="figure-shadow" cx="${template.shadow?.cx ?? 80}" cy="${template.shadow?.cy ?? 167}" rx="${template.shadow?.rx ?? 42}" ry="${template.shadow?.ry ?? 10}"></ellipse>`;
  const lineMarkup = (template.connections || DEMO_PREVIEW_CONNECTIONS)
    .map(([from, to]) => {
      const start = points[from];
      const end = points[to];
      if (!start || !end) return "";
      return `<path class="figure-line" d="M${start.x} ${start.y} L${end.x} ${end.y}"></path>`;
    })
    .join("");
  const jointMarkup = (template.joints || DEMO_PREVIEW_JOINTS)
    .map((name) => {
      const point = points[name];
      if (!point) return "";
      return `<circle class="figure-joint" cx="${point.x}" cy="${point.y}" r="${name.includes("Shoulder") || name.includes("Hip") ? 5.5 : 4.5}"></circle>`;
    })
    .join("");
  const headMarkup = points.head
    ? `<circle class="figure-joint" cx="${points.head.x}" cy="${points.head.y}" r="${template.headRadius ?? 10}"></circle>`
    : "";

  return `
    <svg viewBox="${template.viewBox || "0 0 160 180"}" role="presentation">
      ${template.backdrop || ""}
      ${shadow}
      ${lineMarkup}
      ${jointMarkup}
      ${headMarkup}
    </svg>
  `;
}

const DEMO_PREVIEW_CONNECTIONS = [
  ["neck", "leftShoulder"],
  ["neck", "rightShoulder"],
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
];

const DEMO_PREVIEW_JOINTS = [
  "leftShoulder",
  "rightShoulder",
  "leftElbow",
  "rightElbow",
  "leftWrist",
  "rightWrist",
  "leftHip",
  "rightHip",
  "leftKnee",
  "rightKnee",
  "leftAnkle",
  "rightAnkle",
];

function buildStandingPose(overrides = {}, options = {}) {
  const base = {
    head: { x: 80, y: 20 },
    neck: { x: 80, y: 38 },
    leftShoulder: { x: 58, y: 52 },
    rightShoulder: { x: 102, y: 52 },
    leftElbow: { x: 44, y: 78 },
    rightElbow: { x: 116, y: 78 },
    leftWrist: { x: 36, y: 100 },
    rightWrist: { x: 124, y: 100 },
    leftHip: { x: 68, y: 98 },
    rightHip: { x: 92, y: 98 },
    leftKnee: { x: 64, y: 136 },
    rightKnee: { x: 96, y: 136 },
    leftAnkle: { x: 60, y: 160 },
    rightAnkle: { x: 100, y: 160 },
  };

  return {
    viewBox: "0 0 160 180",
    shadow: { cx: 80, cy: 168, rx: 44, ry: 10 },
    points: mergePosePoints(base, overrides),
    ...options,
  };
}

function buildFloorPose(overrides = {}, options = {}) {
  const base = {
    head: { x: 48, y: 116 },
    neck: { x: 60, y: 114 },
    leftShoulder: { x: 74, y: 112 },
    rightShoulder: { x: 82, y: 112 },
    leftElbow: { x: 58, y: 126 },
    rightElbow: { x: 90, y: 126 },
    leftWrist: { x: 46, y: 142 },
    rightWrist: { x: 102, y: 142 },
    leftHip: { x: 92, y: 114 },
    rightHip: { x: 100, y: 114 },
    leftKnee: { x: 116, y: 124 },
    rightKnee: { x: 126, y: 124 },
    leftAnkle: { x: 138, y: 136 },
    rightAnkle: { x: 146, y: 136 },
  };

  return {
    viewBox: "0 0 160 180",
    shadow: false,
    backdrop: `<path class="figure-line" style="opacity:0.14" d="M22 150 L138 150"></path>`,
    points: mergePosePoints(base, overrides),
    ...options,
  };
}

const GUIDE_DRIVEN_ISOMETRIC_VARIANTS = new Set([
  "anteriorDeltoid",
  "ballGrip",
  "bicepCurl",
  "lateralDeltoid",
  "tricepKickback",
  "frontRaise",
  "curlHold",
  "lateralRaise",
  "wallSlide",
  "doorPull",
  "internalRotation",
  "shrug",
  "kickback",
  "gripHold",
  "forearmFlexion",
  "pecPress",
]);

function mergePosePoints(base, overrides) {
  const merged = { ...base };
  Object.entries(overrides || {}).forEach(([key, value]) => {
    merged[key] = { ...(base[key] || {}), ...(value || {}) };
  });
  return merged;
}

function getDemoPoseTemplate(poseVariant) {
  switch (poseVariant) {
    case "ankleEversion":
      return buildStandingPose({
        rightHip: { x: 94, y: 98 },
        rightKnee: { x: 104, y: 136 },
        rightAnkle: { x: 116, y: 158 },
      });
    case "ankleInversion":
      return buildStandingPose({
        rightHip: { x: 90, y: 98 },
        rightKnee: { x: 92, y: 136 },
        rightAnkle: { x: 84, y: 158 },
      });
    case "dorsiflexion":
      return buildStandingPose({
        rightKnee: { x: 100, y: 134 },
        rightAnkle: { x: 104, y: 156 },
        leftElbow: { x: 42, y: 82 },
        rightElbow: { x: 118, y: 82 },
      });
    case "tibialisWall":
      return buildStandingPose({
        leftHip: { x: 70, y: 98 },
        rightHip: { x: 92, y: 96 },
        leftKnee: { x: 66, y: 132 },
        rightKnee: { x: 106, y: 126 },
        leftAnkle: { x: 62, y: 158 },
        rightAnkle: { x: 118, y: 154 },
        leftWrist: { x: 32, y: 98 },
        rightWrist: { x: 128, y: 98 },
      }, {
        backdrop: `<path class="figure-line" style="opacity:0.14" d="M136 22 L136 156"></path>`,
      });
    case "calfRaise":
      return buildStandingPose({
        leftElbow: { x: 48, y: 82 },
        rightElbow: { x: 112, y: 82 },
        leftWrist: { x: 40, y: 102 },
        rightWrist: { x: 120, y: 102 },
        leftAnkle: { x: 62, y: 154 },
        rightAnkle: { x: 98, y: 154 },
      });
    case "wallSit":
      return buildStandingPose({
        head: { x: 88, y: 22 },
        neck: { x: 88, y: 40 },
        leftShoulder: { x: 72, y: 54 },
        rightShoulder: { x: 104, y: 54 },
        leftElbow: { x: 60, y: 82 },
        rightElbow: { x: 114, y: 82 },
        leftWrist: { x: 56, y: 104 },
        rightWrist: { x: 118, y: 104 },
        leftHip: { x: 74, y: 106 },
        rightHip: { x: 96, y: 106 },
        leftKnee: { x: 106, y: 106 },
        rightKnee: { x: 122, y: 106 },
        leftAnkle: { x: 106, y: 142 },
        rightAnkle: { x: 122, y: 142 },
      }, {
        backdrop: `<path class="figure-line" style="opacity:0.14" d="M128 18 L128 150"></path>`,
      });
    case "supportedLunge":
    case "lunge":
      return buildStandingPose({
        leftHip: { x: 70, y: 98 },
        rightHip: { x: 92, y: 96 },
        leftKnee: { x: 66, y: 136 },
        rightKnee: { x: 108, y: 126 },
        leftAnkle: { x: 62, y: 160 },
        rightAnkle: { x: 120, y: 156 },
        leftWrist: { x: 36, y: 96 },
        rightWrist: { x: 124, y: 96 },
      }, poseVariant === "supportedLunge"
        ? {
          backdrop: `<path class="figure-line" style="opacity:0.14" d="M22 24 L22 156"></path>`,
        }
        : undefined);
    case "gluteBridge":
    case "bridge":
      return buildFloorPose({
        head: { x: 42, y: 118 },
        neck: { x: 56, y: 114 },
        leftShoulder: { x: 70, y: 112 },
        rightShoulder: { x: 78, y: 114 },
        leftElbow: { x: 56, y: 128 },
        rightElbow: { x: 88, y: 128 },
        leftWrist: { x: 44, y: 144 },
        rightWrist: { x: 98, y: 144 },
        leftHip: { x: 92, y: 92 },
        rightHip: { x: 102, y: 92 },
        leftKnee: { x: 118, y: 108 },
        rightKnee: { x: 128, y: 110 },
        leftAnkle: { x: 128, y: 144 },
        rightAnkle: { x: 138, y: 146 },
      });
    case "hamstringPress":
      return buildFloorPose({
        head: { x: 42, y: 120 },
        neck: { x: 56, y: 116 },
        leftShoulder: { x: 70, y: 114 },
        rightShoulder: { x: 78, y: 116 },
        leftElbow: { x: 56, y: 130 },
        rightElbow: { x: 88, y: 130 },
        leftWrist: { x: 44, y: 146 },
        rightWrist: { x: 98, y: 146 },
        leftHip: { x: 90, y: 108 },
        rightHip: { x: 100, y: 108 },
        leftKnee: { x: 112, y: 118 },
        rightKnee: { x: 122, y: 118 },
        leftAnkle: { x: 112, y: 146 },
        rightAnkle: { x: 122, y: 146 },
      });
    case "catCow":
      return buildFloorPose({
        head: { x: 120, y: 78 },
        neck: { x: 104, y: 82 },
        leftShoulder: { x: 88, y: 84 },
        rightShoulder: { x: 100, y: 88 },
        leftElbow: { x: 72, y: 104 },
        rightElbow: { x: 86, y: 108 },
        leftWrist: { x: 58, y: 124 },
        rightWrist: { x: 74, y: 128 },
        leftHip: { x: 76, y: 104 },
        rightHip: { x: 90, y: 106 },
        leftKnee: { x: 60, y: 134 },
        rightKnee: { x: 76, y: 138 },
        leftAnkle: { x: 52, y: 158 },
        rightAnkle: { x: 68, y: 162 },
      });
    case "hollowBody":
      return buildFloorPose({
        head: { x: 44, y: 118 },
        neck: { x: 58, y: 114 },
        leftShoulder: { x: 74, y: 110 },
        rightShoulder: { x: 82, y: 110 },
        leftElbow: { x: 94, y: 100 },
        rightElbow: { x: 102, y: 98 },
        leftWrist: { x: 116, y: 90 },
        rightWrist: { x: 126, y: 86 },
        leftHip: { x: 92, y: 118 },
        rightHip: { x: 100, y: 118 },
        leftKnee: { x: 116, y: 124 },
        rightKnee: { x: 126, y: 122 },
        leftAnkle: { x: 138, y: 132 },
        rightAnkle: { x: 146, y: 130 },
      });
    case "wallSlide":
      return buildStandingPose({
        leftElbow: { x: 50, y: 58 },
        rightElbow: { x: 110, y: 58 },
        leftWrist: { x: 48, y: 30 },
        rightWrist: { x: 112, y: 30 },
      }, {
        backdrop: `<path class="figure-line" style="opacity:0.14" d="M132 20 L132 154"></path>`,
      });
    case "anteriorDeltoid":
    case "frontRaise":
      return buildStandingPose({
        leftElbow: { x: 70, y: 74 },
        rightElbow: { x: 90, y: 74 },
        leftWrist: { x: 68, y: 42 },
        rightWrist: { x: 92, y: 42 },
      });
    case "bicepCurl":
    case "curlHold":
      return buildStandingPose({
        leftElbow: { x: 64, y: 86 },
        rightElbow: { x: 96, y: 86 },
        leftWrist: { x: 58, y: 56 },
        rightWrist: { x: 102, y: 56 },
      });
    case "doorPull":
      return buildStandingPose({
        leftElbow: { x: 48, y: 76 },
        rightElbow: { x: 112, y: 76 },
        leftWrist: { x: 40, y: 98 },
        rightWrist: { x: 120, y: 98 },
      });
    case "internalRotation":
      return buildStandingPose({
        leftElbow: { x: 66, y: 82 },
        rightElbow: { x: 94, y: 82 },
        leftWrist: { x: 74, y: 104 },
        rightWrist: { x: 86, y: 104 },
      });
    case "shrug":
      return buildStandingPose({
        neck: { x: 80, y: 34 },
        leftShoulder: { x: 58, y: 46 },
        rightShoulder: { x: 102, y: 46 },
      });
    case "tricepKickback":
    case "kickback":
      return buildStandingPose({
        head: { x: 92, y: 22 },
        neck: { x: 86, y: 40 },
        leftShoulder: { x: 70, y: 56 },
        rightShoulder: { x: 92, y: 58 },
        leftElbow: { x: 100, y: 74 },
        rightElbow: { x: 116, y: 76 },
        leftWrist: { x: 126, y: 68 },
        rightWrist: { x: 140, y: 70 },
        leftHip: { x: 74, y: 96 },
        rightHip: { x: 96, y: 98 },
        leftKnee: { x: 70, y: 136 },
        rightKnee: { x: 98, y: 138 },
        leftAnkle: { x: 66, y: 160 },
        rightAnkle: { x: 100, y: 162 },
      });
    case "ballGrip":
    case "gripHold":
      return buildStandingPose({
        leftElbow: { x: 66, y: 78 },
        rightElbow: { x: 94, y: 78 },
        leftWrist: { x: 70, y: 64 },
        rightWrist: { x: 90, y: 64 },
      });
    case "forearmFlexion":
      return buildStandingPose({
        leftElbow: { x: 66, y: 80 },
        rightElbow: { x: 94, y: 80 },
        leftWrist: { x: 62, y: 66 },
        rightWrist: { x: 98, y: 66 },
      });
    case "pecPress":
      return buildStandingPose({
        leftElbow: { x: 62, y: 70 },
        rightElbow: { x: 98, y: 70 },
        leftWrist: { x: 50, y: 60 },
        rightWrist: { x: 110, y: 60 },
      });
    case "lateralDeltoid":
    case "lateralRaise":
    default:
      return buildStandingPose({
        leftElbow: { x: 40, y: 58 },
        rightElbow: { x: 120, y: 58 },
        leftWrist: { x: 22, y: 58 },
        rightWrist: { x: 138, y: 58 },
      });
  }
}

function buildExercisePoseGuideFromBaseline(selectedDemo, baseline, landmarks) {
  const poseVariant = selectedDemo?.poseVariant || getDemoPoseVariant(selectedDemo);
  if (!baseline || !GUIDE_DRIVEN_ISOMETRIC_VARIANTS.has(poseVariant)) return null;

  const template = getDemoPoseTemplate(poseVariant)?.points;
  const reference = buildStandingPose().points;
  if (!template || !reference || !baseline.leftShoulder || !baseline.rightShoulder || !baseline.leftHip || !baseline.rightHip) {
    return null;
  }

  const liveLeftShoulder = landmarks?.[11];
  const liveRightShoulder = landmarks?.[12];
  const liveLeftHip = landmarks?.[23];
  const liveRightHip = landmarks?.[24];
  const hasLiveUpperAnchor = hasReliablePoint(liveLeftShoulder, 0.28) && hasReliablePoint(liveRightShoulder, 0.28);
  const hasLiveLowerAnchor = hasReliablePoint(liveLeftHip, 0.24) && hasReliablePoint(liveRightHip, 0.24);

  const baselineShoulderCenter = {
    x: average(baseline.leftShoulder.x, baseline.rightShoulder.x),
    y: average(baseline.leftShoulder.y, baseline.rightShoulder.y),
  };
  const baselineHipCenter = {
    x: average(baseline.leftHip.x, baseline.rightHip.x),
    y: average(baseline.leftHip.y, baseline.rightHip.y),
  };
  const currentShoulderCenter = hasLiveUpperAnchor
    ? { x: average(liveLeftShoulder.x, liveRightShoulder.x), y: average(liveLeftShoulder.y, liveRightShoulder.y) }
    : baselineShoulderCenter;
  const currentHipCenter = hasLiveLowerAnchor
    ? { x: average(liveLeftHip.x, liveRightHip.x), y: average(liveLeftHip.y, liveRightHip.y) }
    : baselineHipCenter;
  const offsetX = average(currentShoulderCenter.x - baselineShoulderCenter.x, currentHipCenter.x - baselineHipCenter.x);
  const offsetY = average(currentShoulderCenter.y - baselineShoulderCenter.y, currentHipCenter.y - baselineHipCenter.y);

  const liveShoulderWidth = hasLiveUpperAnchor
    ? Math.max(0.09, distance(liveLeftShoulder, liveRightShoulder))
    : Math.max(0.09, distance(baseline.leftShoulder, baseline.rightShoulder));
  const baselineTorsoHeight = Math.max(0.12, baselineHipCenter.y - baselineShoulderCenter.y);
  const liveTorsoHeight = hasLiveLowerAnchor
    ? Math.max(0.12, currentHipCenter.y - currentShoulderCenter.y)
    : baselineTorsoHeight;
  const referenceShoulderWidth = Math.max(1, distance(reference.leftShoulder, reference.rightShoulder));
  const referenceTorsoHeight = Math.max(1, average(reference.leftHip.y, reference.rightHip.y) - average(reference.leftShoulder.y, reference.rightShoulder.y));

  const points = {};
  Object.entries(template).forEach(([name, point]) => {
    const baselinePoint = baseline[name];
    const referencePoint = reference[name] || point;
    if (!baselinePoint) return;

    const deltaX = ((point.x - referencePoint.x) / referenceShoulderWidth) * liveShoulderWidth;
    const deltaY = ((point.y - referencePoint.y) / referenceTorsoHeight) * liveTorsoHeight;
    points[name] = {
      x: baselinePoint.x + offsetX + deltaX,
      y: baselinePoint.y + offsetY + deltaY,
    };
  });

  return {
    points,
    emphasis: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist"],
  };
}

function getGuideDrivenIsometricPairs(poseVariant, landmarks, guidePoints) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const pairs = [];

  if (poseVariant === "shrug") {
    pairs.push(
      [leftShoulder, guidePoints?.leftShoulder],
      [rightShoulder, guidePoints?.rightShoulder]
    );
  }

  pairs.push(
    [leftElbow, guidePoints?.leftElbow],
    [rightElbow, guidePoints?.rightElbow],
    [leftWrist, guidePoints?.leftWrist],
    [rightWrist, guidePoints?.rightWrist]
  );

  return pairs;
}

function openCameraPermissionModal() {
  if (!els.cameraPermissionModal) {
    requestCameraAccess();
    return;
  }

  els.cameraPermissionModal.classList.remove("hidden");
  els.cameraPermissionModal.setAttribute("aria-hidden", "false");
  if (els.cameraPermissionTitle) {
    els.cameraPermissionTitle.textContent = "Allow camera access to begin calibration";
  }
  if (els.cameraPermissionCopy) {
    els.cameraPermissionCopy.textContent = "Press Continue, then choose Allow in the browser camera popup.";
  }
  if (els.cameraPermissionContinue) {
    els.cameraPermissionContinue.disabled = false;
    els.cameraPermissionContinue.textContent = "Continue";
  }
  setFeedback("Open the permission dialog, then continue to trigger the browser camera prompt.");
}

function closeCameraPermissionModal() {
  if (!els.cameraPermissionModal) return;
  els.cameraPermissionModal.classList.add("hidden");
  els.cameraPermissionModal.setAttribute("aria-hidden", "true");
}

function cancelCameraPermissionModal() {
  closeCameraPermissionModal();
  setFeedback("Camera start paused. Click Start Camera whenever you're ready.");
}

function startCamera() {
  if (state.session.cameraReady) return;
  requestCameraAccess();
}

function resetCalibrationSequenceForCameraStart() {
  state.session.calibrated = false;
  state.session.baseline = null;
  state.session.calibrationShots = {
    neutral: null,
    arms: null,
    knee: null,
  };
  state.session.currentCalibrationStep = 0;
  state.session.demoActive = false;
  state.session.demoCompleted = false;
  state.session.demoProgress = 0;
  demoHoldStartedAt = 0;
  resetAutoCalibrationTracking();
  updateCalibrationButtonLabel();
}

async function requestCameraAccess() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setFeedback("Camera access is unavailable in this browser.");
    return;
  }

  try {
    setFeedback("Waiting for camera permission...");
    if (els.cameraPermissionTitle) {
      els.cameraPermissionTitle.textContent = "Allow camera access in your browser";
    }
    if (els.cameraPermissionCopy) {
      els.cameraPermissionCopy.textContent = "The browser popup is now opening. Choose Allow to continue into calibration.";
    }
    if (els.cameraPermissionContinue) {
      els.cameraPermissionContinue.disabled = true;
      els.cameraPermissionContinue.textContent = "Waiting...";
    }
    const videoProfiles = [
      {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    ];
    let lastError;

    for (const video of videoProfiles) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!mediaStream) {
      throw lastError || new Error("Camera access unavailable");
    }

    els.camera.srcObject = mediaStream;
    await els.camera.play();
    closeCameraPermissionModal();
    resetCalibrationSequenceForCameraStart();
    state.session.cameraReady = true;
    state.session.trackingStatus = "Camera live";
    await ensurePoseTracking();
    scheduleCalibrationStepDelay();
    setFeedback("Camera ready. Neutral calibration begins in 3 seconds.");
    renderSession();
    renderControlStates();
    renderCalibration();
    renderWorkflow();
    startMotionAnalysis();
    persistState();
  } catch (error) {
    if (els.cameraPermissionModal) {
      els.cameraPermissionModal.classList.remove("hidden");
      els.cameraPermissionModal.setAttribute("aria-hidden", "false");
    }
    if (els.cameraPermissionTitle) {
      els.cameraPermissionTitle.textContent = "Camera access is still needed";
    }
    if (els.cameraPermissionCopy) {
      els.cameraPermissionCopy.textContent = "Allow camera access in the browser popup or browser address bar, then press Continue again.";
    }
    if (els.cameraPermissionContinue) {
      els.cameraPermissionContinue.disabled = false;
      els.cameraPermissionContinue.textContent = "Try Again";
    }
    setFeedback("Camera permission was denied or unavailable.");
    console.error(error);
  }
}

async function ensurePoseTracking() {
  if (poseInstance) return;
  if (!window.Pose) {
    state.session.trackingStatus = "Tracking library unavailable";
    return;
  }

  poseInstance = new window.Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  poseInstance.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  poseInstance.onResults(handlePoseResults);
}

function handlePoseResults(results) {
  const canvas = els.trackingCanvas;
  const ctx = canvas.getContext("2d");
  const width = els.camera.videoWidth || 960;
  const height = els.camera.videoHeight || 720;

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  latestPoseLandmarks = results.poseLandmarks || null;

  if (!results.poseLandmarks?.length) {
    state.session.trackedJoints = 0;
    state.session.trackingStatus = state.session.cameraReady ? "Camera live • step into frame" : "Tracking off";
    state.session.trackingQuality = 0;
    updateExerciseMatchState(null);
    renderDemoPreview();
    drawCalibrationGuide(ctx, canvas.width, canvas.height, null);
    renderSession();
    renderCalibration();
    renderWorkflow();
    return;
  }

  const joints = countVisibleLimbPoints(results.poseLandmarks);
  state.session.trackedJoints = joints;
  state.session.trackingQuality = Math.round((joints / PRIMARY_LIMB_POINTS.length) * 100);
  state.session.trackingStatus = joints >= 10 ? "Tracking live" : joints >= LIMB_CAPTURE_THRESHOLD ? "Partial tracking" : "Align body";

  if (shouldDrawBaselineGhost()) {
    drawBaselineGhost(ctx, state.session.baseline, canvas.width, canvas.height);
  }

  drawCalibrationGuide(ctx, canvas.width, canvas.height, results.poseLandmarks);
  drawTrackedLimbOverlay(ctx, results.poseLandmarks, canvas.width, canvas.height);
  updateAutoCalibration(results.poseLandmarks);

  updateExerciseMatchState(results.poseLandmarks);
  updateDemoProgress(results.poseLandmarks);
  renderDemoPreview();
  renderSession();
  renderCalibration();
  renderWorkflow();
}

function shouldDrawBaselineGhost() {
  if (!state.session.baseline) return false;
  return state.session.calibrated || state.session.demoActive || state.session.demoCompleted || state.session.running;
}

function drawBaselineGhost(ctx, baseline, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(216, 166, 161, 0.45)";
  ctx.fillStyle = "rgba(216, 166, 161, 0.5)";
  ctx.lineWidth = 3;
  LIMB_CONNECTIONS.forEach(([from, to]) => {
    const a = baseline[from];
    const b = baseline[to];
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  });

  Object.values(baseline).forEach((point) => {
    if (!point || typeof point.x !== "number") return;
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawCalibrationGuide(ctx, width, height, landmarks) {
  if (!state.session.cameraReady || state.session.calibrated || state.session.demoActive || state.session.running) {
    return;
  }

  const currentStep = CALIBRATION_SEQUENCE[state.session.currentCalibrationStep];
  const guide = currentStep ? buildCalibrationGuide(currentStep.key, landmarks, state.session.baseline) : null;
  if (!guide) return;

  const pulse = calibrationHoldStartedAt
    ? 1
    : 0.82 + (Math.sin(performance.now() / 240) * 0.08);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const guideConnections = guide.connections || CALIBRATION_GUIDE_CONNECTIONS;

  guideConnections.forEach(([from, to]) => {
    const a = guide.points[from];
    const b = guide.points[to];
    if (!a || !b) return;

    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.lineWidth = calibrationHoldStartedAt ? 16 : 14;
    ctx.strokeStyle = calibrationHoldStartedAt
      ? `rgba(255, 196, 107, ${0.34 * pulse})`
      : `rgba(255, 196, 107, ${0.28 * pulse})`;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.lineWidth = calibrationHoldStartedAt ? 10 : 8;
    ctx.strokeStyle = calibrationHoldStartedAt
      ? `rgba(255, 196, 107, ${0.98 * pulse})`
      : `rgba(255, 176, 82, ${0.96 * pulse})`;
    ctx.shadowBlur = 18;
    ctx.shadowColor = calibrationHoldStartedAt ? "rgba(255, 196, 107, 0.52)" : "rgba(255, 176, 82, 0.48)";
    ctx.stroke();
  });

  Object.entries(guide.points).forEach(([name, point]) => {
    const emphasized = guide.emphasis.includes(name);
    const outerRadius = emphasized ? 18 : 14;
    const innerRadius = emphasized ? 11 : 8;
    const x = point.x * width;
    const y = point.y * height;

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = calibrationHoldStartedAt ? "rgba(255, 196, 107, 0.3)" : "rgba(255, 176, 82, 0.22)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, innerRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(11, 11, 11, 0.92)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = calibrationHoldStartedAt ? "#ffc46b" : "#ffb052";
    ctx.shadowBlur = 20;
    ctx.shadowColor = calibrationHoldStartedAt ? "rgba(255, 196, 107, 0.64)" : "rgba(255, 176, 82, 0.58)";
    ctx.fill();
  });

  ctx.restore();
}

function buildCalibrationGuide(stepKey, landmarks, baseline) {
  if (stepKey === "neutral") {
    return buildNeutralGuide(landmarks);
  }

  if (!baseline) return buildNeutralGuide(landmarks);

  if (stepKey === "arms") {
    return buildArmsGuideFromBaseline(baseline, landmarks);
  }

  if (stepKey === "knee") {
    return buildHeelRaiseGuideFromBaseline(baseline, landmarks);
  }

  return buildNeutralGuide(landmarks);
}

function buildNeutralGuide(landmarks) {
  if (!landmarks?.length) {
    return CALIBRATION_FALLBACK_GUIDE;
  }

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
    return CALIBRATION_FALLBACK_GUIDE;
  }

  const shoulderCenterX = average(leftShoulder.x, rightShoulder.x);
  const shoulderY = average(leftShoulder.y, rightShoulder.y);
  const hipCenterX = average(leftHip.x, rightHip.x);
  const hipY = average(leftHip.y, rightHip.y);
  const torsoCenterX = average(shoulderCenterX, hipCenterX);
  const shoulderHalfWidth = Math.max(0.05, Math.abs(rightShoulder.x - leftShoulder.x) / 2);
  const hipHalfWidth = Math.max(0.035, Math.abs(rightHip.x - leftHip.x) / 2);
  const upperArmLength = average(distance(leftShoulder, leftElbow), distance(rightShoulder, rightElbow)) || 0.14;
  const forearmLength = average(distance(leftElbow, leftWrist), distance(rightElbow, rightWrist)) || 0.14;
  const thighLength = average(distance(leftHip, leftKnee), distance(rightHip, rightKnee)) || 0.18;
  const shinLength = average(distance(leftKnee, leftAnkle), distance(rightKnee, rightAnkle)) || 0.18;

  const points = {
    leftShoulder: { x: torsoCenterX - shoulderHalfWidth, y: shoulderY },
    rightShoulder: { x: torsoCenterX + shoulderHalfWidth, y: shoulderY },
    leftElbow: { x: torsoCenterX - shoulderHalfWidth * 1.05, y: shoulderY + upperArmLength * 0.92 },
    rightElbow: { x: torsoCenterX + shoulderHalfWidth * 1.05, y: shoulderY + upperArmLength * 0.92 },
    leftWrist: { x: torsoCenterX - shoulderHalfWidth * 1.08, y: shoulderY + upperArmLength * 0.92 + forearmLength * 0.94 },
    rightWrist: { x: torsoCenterX + shoulderHalfWidth * 1.08, y: shoulderY + upperArmLength * 0.92 + forearmLength * 0.94 },
    leftHip: { x: torsoCenterX - hipHalfWidth, y: hipY },
    rightHip: { x: torsoCenterX + hipHalfWidth, y: hipY },
    leftKnee: { x: torsoCenterX - hipHalfWidth * 0.78, y: hipY + thighLength * 0.98 },
    rightKnee: { x: torsoCenterX + hipHalfWidth * 0.78, y: hipY + thighLength * 0.98 },
    leftAnkle: { x: torsoCenterX - hipHalfWidth * 0.72, y: hipY + thighLength * 0.98 + shinLength * 0.98 },
    rightAnkle: { x: torsoCenterX + hipHalfWidth * 0.72, y: hipY + thighLength * 0.98 + shinLength * 0.98 },
  };

  return {
    points,
    emphasis: ["leftShoulder", "rightShoulder", "leftHip", "rightHip"],
  };
}

function buildArmsGuideFromBaseline(baseline, landmarks) {
  const liveLeftShoulder = landmarks?.[11];
  const liveRightShoulder = landmarks?.[12];
  const liveLeftHip = landmarks?.[23];
  const liveRightHip = landmarks?.[24];
  const baselineShoulderWidth = Math.max(0.08, distance(baseline.leftShoulder, baseline.rightShoulder));
  const liveShoulderWidth = liveLeftShoulder && liveRightShoulder
    ? Math.max(0.08, distance(liveLeftShoulder, liveRightShoulder))
    : baselineShoulderWidth;
  const scale = ARM_CALIBRATION_TARGET_SCALE * Math.min(1.14, Math.max(0.88, liveShoulderWidth / baselineShoulderWidth));
  const shoulderCenterX = liveLeftShoulder && liveRightShoulder
    ? average(liveLeftShoulder.x, liveRightShoulder.x)
    : average(baseline.leftShoulder.x, baseline.rightShoulder.x);
  const shoulderY = liveLeftShoulder && liveRightShoulder
    ? average(liveLeftShoulder.y, liveRightShoulder.y)
    : average(baseline.leftShoulder.y, baseline.rightShoulder.y);
  const hipCenterY = liveLeftHip && liveRightHip
    ? average(liveLeftHip.y, liveRightHip.y)
    : average(baseline.leftHip.y, baseline.rightHip.y);
  const targetY = Math.min(shoulderY + 0.022, hipCenterY - 0.12);
  const halfShoulderWidth = liveShoulderWidth / 2;
  const leftShoulder = {
    x: shoulderCenterX - halfShoulderWidth,
    y: targetY,
  };
  const rightShoulder = {
    x: shoulderCenterX + halfShoulderWidth,
    y: targetY,
  };
  const leftAvailableReach = Math.max(0.22, leftShoulder.x - 0.04);
  const rightAvailableReach = Math.max(0.22, 0.96 - rightShoulder.x);
  const leftUpperArmLength = Math.min(
    Math.max(0.08, distance(baseline.leftShoulder, baseline.leftElbow) * scale),
    leftAvailableReach * 0.56
  );
  const rightUpperArmLength = Math.min(
    Math.max(0.08, distance(baseline.rightShoulder, baseline.rightElbow) * scale),
    rightAvailableReach * 0.56
  );
  const leftForearmLength = Math.min(
    Math.max(0.08, distance(baseline.leftElbow, baseline.leftWrist) * scale),
    leftAvailableReach * 0.44
  );
  const rightForearmLength = Math.min(
    Math.max(0.08, distance(baseline.rightElbow, baseline.rightWrist) * scale),
    rightAvailableReach * 0.44
  );
  const leftElbow = {
    x: Math.max(0.08, leftShoulder.x - leftUpperArmLength),
    y: targetY,
  };
  const rightElbow = {
    x: Math.min(0.92, rightShoulder.x + rightUpperArmLength),
    y: targetY,
  };
  const leftWrist = {
    x: Math.max(0.04, leftElbow.x - leftForearmLength),
    y: targetY,
  };
  const rightWrist = {
    x: Math.min(0.96, rightElbow.x + rightForearmLength),
    y: targetY,
  };

  return {
    points: {
      leftShoulder,
      rightShoulder,
      leftElbow,
      rightElbow,
      leftWrist,
      rightWrist,
    },
    emphasis: ["leftWrist", "rightWrist", "leftElbow", "rightElbow"],
    connections: [
      ["leftShoulder", "rightShoulder"],
      ["leftShoulder", "leftElbow"],
      ["leftElbow", "leftWrist"],
      ["rightShoulder", "rightElbow"],
      ["rightElbow", "rightWrist"],
    ],
  };
}

function buildHeelRaiseGuideFromBaseline(baseline, activeSideOrLandmarks = "right") {
  const ankleLift = Math.max(
    0.012,
    average(distance(baseline.leftKnee, baseline.leftAnkle), distance(baseline.rightKnee, baseline.rightAnkle)) * 0.08
  );
  const heelLift = Math.max(
    0.024,
    average(distance(baseline.leftAnkle, baseline.leftHeel), distance(baseline.rightAnkle, baseline.rightHeel)) * 0.85
  );
  const footLift = Math.max(
    0.018,
    average(distance(baseline.leftHeel, baseline.leftFootIndex), distance(baseline.rightHeel, baseline.rightFootIndex)) * 0.72
  );
  const activeSide = resolveHeelRaiseGuideSide(baseline, activeSideOrLandmarks);
  const points = {
    ...baseline,
  };

  if (activeSide === "left") {
    points.leftAnkle = { ...baseline.leftAnkle, y: baseline.leftAnkle.y - ankleLift };
    points.leftHeel = baseline.leftHeel ? { ...baseline.leftHeel, y: baseline.leftHeel.y - heelLift } : undefined;
    points.leftFootIndex = baseline.leftFootIndex ? { ...baseline.leftFootIndex, y: baseline.leftFootIndex.y - footLift } : undefined;
  } else {
    points.rightAnkle = { ...baseline.rightAnkle, y: baseline.rightAnkle.y - ankleLift };
    points.rightHeel = baseline.rightHeel ? { ...baseline.rightHeel, y: baseline.rightHeel.y - heelLift } : undefined;
    points.rightFootIndex = baseline.rightFootIndex ? { ...baseline.rightFootIndex, y: baseline.rightFootIndex.y - footLift } : undefined;
  }

  return {
    points,
    emphasis: activeSide === "left"
      ? ["leftAnkle", "leftHeel", "leftFootIndex"]
      : ["rightAnkle", "rightHeel", "rightFootIndex"],
  };
}

function resolveHeelRaiseGuideSide(baseline, activeSideOrLandmarks) {
  if (activeSideOrLandmarks === "left" || activeSideOrLandmarks === "right") {
    return activeSideOrLandmarks;
  }

  const landmarks = Array.isArray(activeSideOrLandmarks) ? activeSideOrLandmarks : null;
  if (!landmarks?.length) return "right";

  const leftLift = Math.max(
    getLiftDelta(baseline.leftHeel, landmarks[29]),
    getLiftDelta(baseline.leftAnkle, landmarks[27]),
    getLiftDelta(baseline.leftFootIndex, landmarks[31])
  );
  const rightLift = Math.max(
    getLiftDelta(baseline.rightHeel, landmarks[30]),
    getLiftDelta(baseline.rightAnkle, landmarks[28]),
    getLiftDelta(baseline.rightFootIndex, landmarks[32])
  );

  if (leftLift > rightLift + 0.004) return "left";
  if (rightLift > leftLift + 0.004) return "right";
  return "right";
}

function getPoseSnapshot(landmarks) {
  if (!landmarks?.length) return null;
  return Object.fromEntries(
    EXTENDED_LIMB_POINTS.map(([name, index]) => [name, copyPoint(landmarks[index])])
  );
}

function copyPoint(point) {
  return { x: point.x, y: point.y, visibility: point.visibility ?? 0 };
}

function averageCalibrationSamples(samples) {
  if (!samples.length) return null;

  const pointNames = Object.keys(samples[0]);
  return Object.fromEntries(pointNames.map((name) => {
    const points = samples.map((sample) => sample[name]).filter(Boolean);
    if (!points.length) return [name, null];

    return [name, {
      x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
      y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
      visibility: points.reduce((sum, point) => sum + (point.visibility ?? 0), 0) / points.length,
    }];
  }));
}

function captureCalibration() {
  if (!state.session.cameraReady) {
    setFeedback("Start the camera before calibrating.");
    return;
  }

  if (getCalibrationCountdownSeconds() > 0) {
    setFeedback("Wait for the countdown to finish.");
    return;
  }

  if (!latestPoseLandmarks || state.session.trackedJoints < LIMB_CAPTURE_THRESHOLD) {
    setFeedback("Stand fully in frame before capturing calibration.");
    return;
  }

  const currentStep = CALIBRATION_SEQUENCE[state.session.currentCalibrationStep];
  if (!currentStep) return;

  if (!matchesCalibrationPose(currentStep.key, latestPoseLandmarks, state.session.baseline)) {
    setFeedback(getCalibrationInstruction(currentStep.key));
    return;
  }

  saveCalibrationStep(currentStep, latestPoseLandmarks, true);
}

function saveCalibrationStep(currentStep, landmarks, manualCapture = false) {
  const snapshot = averageCalibrationSamples(calibrationSamples) || getPoseSnapshot(landmarks);
  state.session.calibrationShots[currentStep.key] = snapshot;
  if (currentStep.key === "neutral") {
    state.session.baseline = snapshot;
  }

  state.session.currentCalibrationStep += 1;
  state.session.calibrated = state.session.currentCalibrationStep >= CALIBRATION_SEQUENCE.length;
  state.session.demoActive = false;
  state.session.demoCompleted = false;
  state.session.demoProgress = 0;
  demoHoldStartedAt = 0;
  resetAutoCalibrationTracking();
  if (!state.session.calibrated) scheduleCalibrationStepDelay();
  updateCalibrationButtonLabel();
  const nextStep = CALIBRATION_SEQUENCE[state.session.currentCalibrationStep];
  const nextDelaySeconds = Math.round(getCalibrationStepDelayMs() / 1000);
  setFeedback(
    state.session.calibrated
      ? "Calibration complete. Start the guided demo next."
      : `${currentStep.title} saved. ${nextStep?.title || "Next step"} begins in ${nextDelaySeconds} seconds.`
  );
  renderCalibration();
  renderWorkflow();
  renderControlStates();
  persistState();
}

function resetCalibration() {
  state.session.calibrated = false;
  state.session.baseline = null;
  state.session.calibrationShots = {
    neutral: null,
    arms: null,
    knee: null,
  };
  state.session.currentCalibrationStep = 0;
  state.session.demoActive = false;
  state.session.demoCompleted = false;
  state.session.demoProgress = 0;
  demoHoldStartedAt = 0;
  resetAutoCalibrationTracking();
  scheduleCalibrationStepDelay();
  updateCalibrationButtonLabel();
  setFeedback("Calibration reset. Neutral stance begins in 3 seconds.");
  renderCalibration();
  renderWorkflow();
  renderControlStates();
  persistState();
}

function startDemoWalkthrough() {
  if (!state.session.cameraReady) {
    setFeedback("Start the camera first.");
    return;
  }

  if (!state.session.calibrated || !state.session.baseline) {
    setFeedback("Capture calibration before starting the demo.");
    return;
  }

  if (isPrescribedSessionComplete()) {
    setFeedback("The prescribed session is already complete. Finish the session to send the report.");
    return;
  }

  state.session.demoActive = true;
  state.session.demoCompleted = false;
  state.session.demoProgress = 0;
  state.session.exerciseMatchState = "off";
  state.session.exerciseMatchScore = 0;
  demoHoldStartedAt = 0;
  resetExerciseHoldTracking();
  setFeedback(getSelectedDemo()?.startPrompt || "Demo started. Follow the selected drill and hold the target position.");
  renderWorkflow();
  renderControlStates();
  persistState();
}

function resetAutoCalibrationTracking() {
  calibrationMatchFrames = 0;
  calibrationHoldStartedAt = 0;
  calibrationLastMatchedAt = 0;
  calibrationSamples = [];
  calibrationSteadyStartedAt = 0;
  calibrationSteadySnapshot = null;
}

function scheduleCalibrationStepDelay() {
  calibrationStepReadyAt = performance.now() + getCalibrationStepDelayMs();
}

function getCalibrationCountdownSeconds() {
  if (!calibrationStepReadyAt) return 0;
  return Math.max(0, Math.ceil((calibrationStepReadyAt - performance.now()) / 1000));
}

function renderCalibrationCountdown() {
  if (!els.calibrationCountdown) return;

  const seconds = getCalibrationCountdownSeconds();
  const currentStep = CALIBRATION_SEQUENCE[state.session.currentCalibrationStep];
  if (!state.session.cameraReady || state.session.calibrated || !currentStep || calibrationHoldStartedAt || seconds <= 0) {
    els.calibrationCountdown.classList.add("hidden");
    els.calibrationCountdown.dataset.label = "";
    return;
  }

  els.calibrationCountdown.classList.remove("hidden");
  els.calibrationCountdown.textContent = String(seconds);
  els.calibrationCountdown.dataset.label = currentStep.key === "neutral"
    ? "NEUTRAL CALIBRATION"
    : currentStep.title.toUpperCase();
}

function updateAutoCalibration(landmarks) {
  if (!state.session.cameraReady || state.session.calibrated || state.session.demoActive || state.session.running) {
    resetAutoCalibrationTracking();
    return;
  }

  const currentStep = CALIBRATION_SEQUENCE[state.session.currentCalibrationStep];
  if (!currentStep) {
    resetAutoCalibrationTracking();
    return;
  }

  if (state.session.trackedJoints < LIMB_CAPTURE_THRESHOLD) {
    resetAutoCalibrationTracking();
    return;
  }

  if (performance.now() < calibrationStepReadyAt) {
    resetAutoCalibrationTracking();
    return;
  }

  const now = performance.now();
  const assessment = getCalibrationPoseAssessment(currentStep.key, landmarks, state.session.baseline);
  const matched = assessment.matched;
  if (!matched) {
    if (updateSteadyCalibrationFallback(currentStep, landmarks, assessment, now)) {
      return;
    }

    if (calibrationHoldStartedAt && now - calibrationLastMatchedAt <= CALIBRATION_HOLD_GRACE_MS) {
      return;
    }

    if (!calibrationHoldStartedAt && calibrationMatchFrames > 0) {
      calibrationMatchFrames = Math.max(0, calibrationMatchFrames - 2);
      calibrationSamples = [];
      return;
    }

    resetAutoCalibrationTracking();
    return;
  }

  calibrationLastMatchedAt = now;
  calibrationSteadyStartedAt = 0;
  calibrationSteadySnapshot = null;
  calibrationMatchFrames += 1;
  if (calibrationMatchFrames < getCalibrationReadyFrames()) return;

  if (!calibrationHoldStartedAt) {
    calibrationHoldStartedAt = now;
    calibrationSamples = [];
    const firstSnapshot = getPoseSnapshot(landmarks);
    if (firstSnapshot) calibrationSamples.push(firstSnapshot);
    setFeedback(`${currentStep.title} detected. Hold steady.`);
    return;
  }

  const snapshot = getPoseSnapshot(landmarks);
  if (snapshot) calibrationSamples.push(snapshot);

  if (now - calibrationHoldStartedAt >= getCalibrationHoldMs()) {
    saveCalibrationStep(currentStep, landmarks, false);
  }
}

function updateSteadyCalibrationFallback(currentStep, landmarks, assessment, now) {
  const snapshot = getPoseSnapshot(landmarks);
  if (!snapshot) {
    calibrationSteadyStartedAt = 0;
    calibrationSteadySnapshot = null;
    return false;
  }

  const threshold = getSteadyCalibrationScoreThreshold(currentStep.key);
  if (assessment.score < threshold) {
    calibrationSteadyStartedAt = 0;
    calibrationSteadySnapshot = null;
    return false;
  }

  if (!calibrationSteadyStartedAt || !calibrationSteadySnapshot) {
    calibrationSteadyStartedAt = now;
    calibrationSteadySnapshot = snapshot;
    calibrationSamples = [snapshot];
    return false;
  }

  const movement = getCalibrationSnapshotMovement(currentStep.key, calibrationSteadySnapshot, snapshot);
  if (movement > getSteadyCalibrationMovementThreshold(currentStep.key)) {
    calibrationSteadyStartedAt = now;
    calibrationSteadySnapshot = snapshot;
    calibrationSamples = [snapshot];
    return false;
  }

  calibrationSteadySnapshot = snapshot;
  calibrationSamples.push(snapshot);

  if (now - calibrationSteadyStartedAt < getSteadyCalibrationCaptureMs(currentStep.key)) {
    return false;
  }

  setFeedback(`${currentStep.title} held steady. Saving calibration.`);
  saveCalibrationStep(currentStep, landmarks, false);
  return true;
}

function getSteadyCalibrationScoreThreshold(stepKey) {
  if (stepKey === "arms") return 0.36;
  if (stepKey === "knee") return 0.34;
  return 0.55;
}

function getSteadyCalibrationCaptureMs(stepKey) {
  if (stepKey === "arms") return 3000;
  if (stepKey === "knee") return 2800;
  return AUTO_CALIBRATION_STEADY_CAPTURE_MS;
}

function getSteadyCalibrationMovementThreshold(stepKey) {
  if (stepKey === "arms") return 0.028;
  if (stepKey === "knee") return 0.026;
  return AUTO_CALIBRATION_STEADY_MOVEMENT_THRESHOLD;
}

function getCalibrationSnapshotMovement(stepKey, previousSnapshot, nextSnapshot) {
  const pointNames = getCalibrationMovementPointNames(stepKey);
  const deltas = pointNames
    .map((name) => {
      const previousPoint = previousSnapshot?.[name];
      const nextPoint = nextSnapshot?.[name];
      if (!previousPoint || !nextPoint) return null;
      return distance(previousPoint, nextPoint);
    })
    .filter((delta) => typeof delta === "number");

  if (!deltas.length) return Infinity;
  return deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
}

function getCalibrationMovementPointNames(stepKey) {
  if (stepKey === "arms") {
    return ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist"];
  }

  if (stepKey === "knee") {
    return ["leftShoulder", "rightShoulder", "leftHip", "rightHip", "leftAnkle", "rightAnkle", "leftHeel", "rightHeel"];
  }

  return ["leftShoulder", "rightShoulder", "leftHip", "rightHip", "leftWrist", "rightWrist"];
}

function getCalibrationPoseAssessment(stepKey, landmarks, baseline) {
  if (!landmarks?.length) {
    return {
      matched: false,
      score: 0,
      hint: "Step into the bright outline so your full body is visible.",
      shortHint: "Find outline",
    };
  }

  if (stepKey === "neutral") {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const visibleCore = [
      leftShoulder,
      rightShoulder,
      leftHip,
      rightHip,
      leftWrist,
      rightWrist,
      leftElbow,
      rightElbow,
    ].every((point) => hasReliablePoint(point, 0.3));

    if (!visibleCore) {
      return {
        matched: false,
        score: 0,
        hint: "Step back until shoulders and hips are clearly inside the outline.",
        shortHint: "Step back",
      };
    }

    const shouldersLevel = Math.abs(leftShoulder.y - rightShoulder.y) < 0.08;
    const hipsLevel = Math.abs(leftHip.y - rightHip.y) < 0.08;
    const armsDown = leftWrist.y > leftElbow.y && rightWrist.y > rightElbow.y;
    const centered = average(leftShoulder.x, rightShoulder.x) > 0.25 && average(leftShoulder.x, rightShoulder.x) < 0.75;

    return buildCalibrationAssessment([
      {
        pass: shouldersLevel,
        hint: "Keep your shoulders level inside the outline.",
        shortHint: "Level shoulders",
      },
      {
        pass: hipsLevel,
        hint: "Square your hips so both sides stay level.",
        shortHint: "Square hips",
      },
      {
        pass: armsDown,
        hint: "Relax both arms by your sides.",
        shortHint: "Arms down",
      },
      {
        pass: centered,
        hint: "Shift so your body is centered in the outline.",
        shortHint: "Re-center",
      },
    ], 4, "Hold the neutral stance to save this step.", "Hold steady");
  }

  if (stepKey === "arms") {
    if (!baseline?.leftShoulder || !baseline?.rightShoulder) {
      return {
        matched: false,
        score: 0,
        hint: "Save the neutral stance first so IsoTrack can size your arm target.",
        shortHint: "Save neutral",
      };
    }

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const baselineLeftWrist = baseline.leftWrist;
    const baselineRightWrist = baseline.rightWrist;
    const armGuide = buildArmsGuideFromBaseline(baseline, landmarks)?.points;

    if (![leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist].every((point) => hasReliablePoint(point, 0.35))) {
      return {
        matched: false,
        score: 0,
        hint: "Keep both arms fully visible so the wrists and elbows stay inside the frame.",
        shortHint: "Arms in frame",
      };
    }

    const shoulderWidth = Math.max(0.09, distance(leftShoulder, rightShoulder));
    const shouldersLevel = Math.abs(leftShoulder.y - rightShoulder.y) < 0.09;
    const wristsNearHeight =
      Math.abs(leftWrist.y - average(leftShoulder.y, rightShoulder.y)) < 0.22 &&
      Math.abs(rightWrist.y - average(leftShoulder.y, rightShoulder.y)) < 0.22;
    const wristsRaisedFromBaseline =
      (baselineLeftWrist.y - leftWrist.y) > 0.09 &&
      (baselineRightWrist.y - rightWrist.y) > 0.09;
    const wristHeightReady = wristsNearHeight || wristsRaisedFromBaseline;
    const wristsMatched = Math.abs(leftWrist.y - rightWrist.y) < 0.24;
    const elbowsMatched = Math.abs(leftElbow.y - rightElbow.y) < 0.24;
    const meanGuideOffset = getMeanNormalizedGuideOffset([
      [leftElbow, armGuide?.leftElbow],
      [rightElbow, armGuide?.rightElbow],
      [leftWrist, armGuide?.leftWrist],
      [rightWrist, armGuide?.rightWrist],
    ], shoulderWidth);
    const armGuideReady = meanGuideOffset < 0.9;
    const armGuideTight = meanGuideOffset < 0.72;
    const armLevelReady = wristsMatched || elbowsMatched || armGuideTight;

    const assessment = buildCalibrationAssessment([
      {
        pass: armGuideReady,
        hint: "Match the bright arm outline and hold there.",
        shortHint: "Match outline",
      },
      {
        pass: wristHeightReady || armGuideTight,
        hint: "Lift both arms into the T-shape outline.",
        shortHint: "Lift arms",
      },
      {
        pass: shouldersLevel,
        hint: "Keep your shoulders level while the arms stay up.",
        shortHint: "Level shoulders",
      },
      {
        pass: armLevelReady,
        hint: "Keep both arms even with the outline.",
        shortHint: "Even hands",
      },
    ], 3, "Hold the T-shape to save this step.", "Hold steady");

    return assessment;
  }

  if (stepKey === "knee") {
    if (!baseline?.leftHeel || !baseline?.rightHeel || !baseline?.leftAnkle || !baseline?.rightAnkle) {
      return {
        matched: false,
        score: 0,
        hint: "Save the neutral stance first so IsoTrack can compare your feet.",
        shortHint: "Save neutral",
      };
    }

    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftHeel = landmarks[29];
    const rightHeel = landmarks[30];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHeelRaiseGuide = buildHeelRaiseGuideFromBaseline(baseline, "left")?.points;
    const rightHeelRaiseGuide = buildHeelRaiseGuideFromBaseline(baseline, "right")?.points;

    if (![leftHip, rightHip, leftAnkle, rightAnkle, leftHeel, rightHeel, leftShoulder, rightShoulder].every((point) => hasReliablePoint(point, 0.28))) {
      return {
        matched: false,
        score: 0,
        hint: "Step back slightly so both ankles and heels stay visible.",
        shortHint: "Feet in frame",
      };
    }

    const leftLift = Math.max(
      getLiftDelta(baseline.leftHeel, leftHeel),
      getLiftDelta(baseline.leftAnkle, leftAnkle) * 1.15
    );
    const rightLift = Math.max(
      getLiftDelta(baseline.rightHeel, rightHeel),
      getLiftDelta(baseline.rightAnkle, rightAnkle) * 1.15
    );
    const bestLift = Math.max(leftLift, rightLift);
    const shouldersLevel = Math.abs(leftShoulder.y - rightShoulder.y) < 0.1;
    const hipsLevel = Math.abs(leftHip.y - rightHip.y) < 0.1;
    const centered = average(leftShoulder.x, rightShoulder.x) > 0.22 && average(leftShoulder.x, rightShoulder.x) < 0.78;
    const lowerBodyScale = Math.max(
      0.12,
      average(distance(baseline.leftHip, baseline.leftAnkle), distance(baseline.rightHip, baseline.rightAnkle))
    );
    const leftGuideOffset = getMeanNormalizedGuideOffset([
      [leftAnkle, leftHeelRaiseGuide?.leftAnkle],
      [leftHeel, leftHeelRaiseGuide?.leftHeel],
      [landmarks[31], leftHeelRaiseGuide?.leftFootIndex],
    ], lowerBodyScale);
    const rightGuideOffset = getMeanNormalizedGuideOffset([
      [rightAnkle, rightHeelRaiseGuide?.rightAnkle],
      [rightHeel, rightHeelRaiseGuide?.rightHeel],
      [landmarks[32], rightHeelRaiseGuide?.rightFootIndex],
    ], lowerBodyScale);
    const leftHeelReady = leftGuideOffset < 0.34 || leftLift > 0.014;
    const rightHeelReady = rightGuideOffset < 0.34 || rightLift > 0.014;
    const heelGuideReady = leftHeelReady || rightHeelReady;

    const assessment = buildCalibrationAssessment([
      {
        pass: heelGuideReady || bestLift > 0.014,
        hint: "Lift either heel toward the bright outline.",
        shortHint: "Lift either heel",
      },
      {
        pass: shouldersLevel,
        hint: "Keep your shoulders level and avoid leaning.",
        shortHint: "No leaning",
      },
      {
        pass: hipsLevel || centered,
        hint: "Stay tall and centered while you lift one heel.",
        shortHint: "Stay centered",
      },
    ], 2, "Hold the heel raise to save this step.", "Hold steady");

    return assessment;
  }

  return {
    matched: false,
    score: 0,
    hint: "Match the highlighted outline and hold still.",
    shortHint: "Adjust pose",
  };
}

function matchesCalibrationPose(stepKey, landmarks, baseline) {
  return getCalibrationPoseAssessment(stepKey, landmarks, baseline).matched;
}

function getCalibrationInstruction(stepKey, landmarks = latestPoseLandmarks, baseline = state.session.baseline) {
  const assessment = getCalibrationPoseAssessment(stepKey, landmarks, baseline);
  if (assessment.hint) return assessment.hint;

  if (stepKey === "neutral") return "Match the bright outline with arms relaxed and shoulders level.";
  if (stepKey === "arms") return "Raise both arms straight out to the side in a T-shape and hold steady.";
  return "Lift either heel slightly while staying aligned to the bright outline.";
}

function getCalibrationSummary(stepKey, landmarks = latestPoseLandmarks, baseline = state.session.baseline) {
  const assessment = getCalibrationPoseAssessment(stepKey, landmarks, baseline);
  if (assessment.hint) return assessment.hint;

  if (stepKey === "neutral") return "Match the bright outline with arms relaxed and shoulders level.";
  if (stepKey === "arms") return "Raise both arms straight out to the side in a steady T-shape.";
  return "Stay tall and lift either heel slightly while matching the outline.";
}

function updateDemoProgress(landmarks) {
  if (!state.session.demoActive || !state.session.baseline || !landmarks?.length) return;

  const selectedDemo = getSelectedDemo();
  const assessment = getExerciseMatchAssessment(landmarks, selectedDemo, state.session.baseline);

  if (assessment.active) {
    if (!demoHoldStartedAt) demoHoldStartedAt = performance.now();
    const heldMs = performance.now() - demoHoldStartedAt;
    state.session.demoProgress = Math.min(100, Math.round((heldMs / 1800) * 100));

    if (heldMs >= 1800) {
      state.session.demoActive = false;
      state.session.demoCompleted = true;
      state.session.demoProgress = 100;
      setFeedback("Demo complete. Working session unlocked.");
      renderWorkflow();
      renderControlStates();
      persistState();
    }
  } else {
    demoHoldStartedAt = 0;
    state.session.demoProgress = 0;
  }
}

function updateExerciseMatchState(landmarks) {
  if (!state.session.baseline || (!state.session.demoActive && !state.session.running && !state.session.demoCompleted)) {
    state.session.exerciseMatchState = "idle";
    state.session.exerciseMatchScore = 0;
    resetExerciseHoldTracking();
    return;
  }

  const assessment = getExerciseMatchAssessment(landmarks);
  state.session.exerciseMatchState = assessment.state;
  state.session.exerciseMatchScore = assessment.score;

  if (!state.session.running) {
    resetExerciseHoldTracking();
    return;
  }

  updateExerciseHoldTracking(assessment.active);
}

function updateExerciseHoldTracking(active) {
  if (!state.session.running || !active) {
    resetExerciseHoldTracking();
    return;
  }

  const now = performance.now();
  if (!exerciseMatchStartedAt) {
    exerciseMatchStartedAt = now;
    exerciseMatchCarryMs = 0;
    return;
  }

  exerciseMatchCarryMs += now - exerciseMatchStartedAt;
  exerciseMatchStartedAt = now;

  const earnedSeconds = Math.floor(exerciseMatchCarryMs / 1000);
  if (earnedSeconds <= 0) return;

  exerciseMatchCarryMs -= earnedSeconds * 1000;
  state.session.holdSeconds += earnedSeconds;
  state.session.exerciseHoldSeconds += earnedSeconds;
  state.session.exerciseTension += earnedSeconds;
  state.session.totalTension += earnedSeconds;
  state.session.completed = false;
  checkCurrentExerciseCompletion();
  persistState();
}

function resetExerciseHoldTracking() {
  exerciseMatchStartedAt = 0;
  exerciseMatchCarryMs = 0;
}

function registerExerciseRep(count = 1, tensionEarned = 0, feedbackMessage = "") {
  state.session.reps += count;
  state.session.exerciseReps += count;
  state.session.totalTension += tensionEarned;
  state.session.exerciseTension += tensionEarned;
  state.session.completed = false;
  if (feedbackMessage) setFeedback(feedbackMessage);
  checkCurrentExerciseCompletion();
  renderSession();
  renderControlStates();
  renderWorkflow();
  persistState();
}

function getSelectedFocus() {
  return getSelectedDemo()?.focus || "Shoulders";
}

function getExerciseMatchAssessment(landmarks, selectedDemo = getSelectedDemo(), baseline = state.session.baseline) {
  if (!baseline || !landmarks?.length) {
    return { state: "searching", score: 0, close: false, active: false };
  }

  const movementPattern = selectedDemo?.movementPattern || "upperHold";
  const focus = selectedDemo?.focus || getSelectedFocus();
  const poseVariant = selectedDemo?.poseVariant || getDemoPoseVariant(selectedDemo);
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (movementPattern === "lowerLift") {
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftHeel = landmarks[29];
    const rightHeel = landmarks[30];
    const leftFootIndex = landmarks[31];
    const rightFootIndex = landmarks[32];
    const visiblePoints = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];

    if (!visiblePoints.every((point) => hasReliablePoint(point, 0.28))) {
      return { state: "searching", score: 0, close: false, active: false };
    }

    const shouldersLevel = Math.abs(leftShoulder.y - rightShoulder.y) < 0.11;
    const hipsLevel = Math.abs(leftHip.y - rightHip.y) < 0.12;
    const centered = average(leftShoulder.x, rightShoulder.x) > 0.22 && average(leftShoulder.x, rightShoulder.x) < 0.78;
    const lowerBodyScale = Math.max(
      0.12,
      average(distance(baseline.leftHip, baseline.leftAnkle), distance(baseline.rightHip, baseline.rightAnkle))
    );

    const rightGuide = focus === "Ankles"
      ? buildHeelRaiseGuideFromBaseline(baseline)?.points
      : {
        ...baseline,
        rightKnee: { ...baseline.rightKnee, y: baseline.rightKnee.y - 0.075 },
        rightAnkle: { ...baseline.rightAnkle, y: baseline.rightAnkle.y - 0.105, x: baseline.rightAnkle.x + 0.02 },
        rightHeel: baseline.rightHeel ? { ...baseline.rightHeel, y: baseline.rightHeel.y - 0.085, x: baseline.rightHeel.x + 0.014 } : undefined,
        rightFootIndex: baseline.rightFootIndex ? { ...baseline.rightFootIndex, y: baseline.rightFootIndex.y - 0.09, x: baseline.rightFootIndex.x + 0.03 } : undefined,
      };

    const leftGuide = rightGuide
      ? {
        ...rightGuide,
        leftKnee: rightGuide.rightKnee ? { x: 1 - rightGuide.rightKnee.x, y: rightGuide.rightKnee.y } : undefined,
        leftAnkle: rightGuide.rightAnkle ? { x: 1 - rightGuide.rightAnkle.x, y: rightGuide.rightAnkle.y } : undefined,
        leftHeel: rightGuide.rightHeel ? { x: 1 - rightGuide.rightHeel.x, y: rightGuide.rightHeel.y } : undefined,
        leftFootIndex: rightGuide.rightFootIndex ? { x: 1 - rightGuide.rightFootIndex.x, y: rightGuide.rightFootIndex.y } : undefined,
      }
      : null;

    const leftGuideOffset = getMeanNormalizedGuideOffset([
      [leftKnee, leftGuide?.leftKnee],
      [leftAnkle, leftGuide?.leftAnkle],
      [leftHeel, leftGuide?.leftHeel],
      [leftFootIndex, leftGuide?.leftFootIndex],
    ], lowerBodyScale);
    const rightGuideOffset = getMeanNormalizedGuideOffset([
      [rightKnee, rightGuide?.rightKnee],
      [rightAnkle, rightGuide?.rightAnkle],
      [rightHeel, rightGuide?.rightHeel],
      [rightFootIndex, rightGuide?.rightFootIndex],
    ], lowerBodyScale);
    const bestGuideOffset = Math.min(leftGuideOffset, rightGuideOffset);
    const leftLift = Math.max(
      getLiftDelta(baseline.leftHeel, leftHeel),
      getLiftDelta(baseline.leftAnkle, leftAnkle),
      getLiftDelta(baseline.leftKnee, leftKnee)
    );
    const rightLift = Math.max(
      getLiftDelta(baseline.rightHeel, rightHeel),
      getLiftDelta(baseline.rightAnkle, rightAnkle),
      getLiftDelta(baseline.rightKnee, rightKnee)
    );
    const bestLift = Math.max(leftLift, rightLift);
    const close = shouldersLevel && (bestGuideOffset < 0.36 || bestLift > 0.014);
    const active = shouldersLevel && (hipsLevel || centered) && (bestGuideOffset < 0.26 || bestLift > 0.022);
    const score = Math.max(0, Math.min(1, ((0.42 - Math.min(bestGuideOffset, 0.42)) / 0.42) * 0.7 + Math.min(bestLift / 0.03, 1) * 0.3));

    return {
      state: active ? "matched" : close ? "close" : "off",
      score,
      close,
      active,
    };
  }

  if (![leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist].every((point) => hasReliablePoint(point, 0.3))) {
    return { state: "searching", score: 0, close: false, active: false };
  }

  const shoulderWidth = Math.max(0.09, distance(leftShoulder, rightShoulder));
  const shouldersLevel = Math.abs(leftShoulder.y - rightShoulder.y) < 0.1;
  const wristsLevel = Math.abs(leftWrist.y - rightWrist.y) < 0.24;
  const wristsNearShoulderLine =
    Math.abs(leftWrist.y - average(leftShoulder.y, rightShoulder.y)) < 0.24 &&
    Math.abs(rightWrist.y - average(leftShoulder.y, rightShoulder.y)) < 0.24;
  const exerciseGuide = buildExercisePoseGuideFromBaseline(selectedDemo, baseline, landmarks)?.points;

  if (exerciseGuide && GUIDE_DRIVEN_ISOMETRIC_VARIANTS.has(poseVariant)) {
    const guideOffset = getMeanNormalizedGuideOffset(
      getGuideDrivenIsometricPairs(poseVariant, landmarks, exerciseGuide),
      shoulderWidth
    );
    const wristsMatched = Math.abs(leftWrist.y - rightWrist.y) < 0.3;
    const elbowsMatched = Math.abs(leftElbow.y - rightElbow.y) < 0.3;
    const symmetryReady = poseVariant === "tricepKickback"
      || poseVariant === "kickback"
      || poseVariant === "doorPull"
      || poseVariant === "internalRotation"
      ? elbowsMatched || wristsMatched
      : wristsMatched || elbowsMatched;
    const close = shouldersLevel && (guideOffset < 0.92 || symmetryReady);
    const active = shouldersLevel && (guideOffset < 0.68 || (guideOffset < 0.78 && symmetryReady));
    const score = Math.max(0, Math.min(1, (0.98 - Math.min(guideOffset, 0.98)) / 0.98));

    return {
      state: active ? "matched" : close ? "close" : "off",
      score,
      close,
      active,
    };
  }

  if (focus === "Shoulders") {
    const armGuide = buildArmsGuideFromBaseline(baseline, landmarks)?.points;
    const guideOffset = getMeanNormalizedGuideOffset([
      [leftElbow, armGuide?.leftElbow],
      [rightElbow, armGuide?.rightElbow],
      [leftWrist, armGuide?.leftWrist],
      [rightWrist, armGuide?.rightWrist],
    ], shoulderWidth);
    const wristsRaisedFromBaseline =
      average((baseline.leftWrist?.y ?? 1) - leftWrist.y, (baseline.rightWrist?.y ?? 1) - rightWrist.y);
    const close = shouldersLevel && (guideOffset < 1.02 || wristsRaisedFromBaseline > 0.05);
    const active = shouldersLevel && wristsLevel && (guideOffset < 0.84 || wristsRaisedFromBaseline > 0.08);
    const score = Math.max(0, Math.min(1, ((1.08 - Math.min(guideOffset, 1.08)) / 1.08) * 0.75 + Math.min(wristsRaisedFromBaseline / 0.1, 1) * 0.25));

    return {
      state: active ? "matched" : close ? "close" : "off",
      score,
      close,
      active,
    };
  }

  const centerX = average(leftShoulder.x, rightShoulder.x);
  const baselineCenterX = average(baseline.leftShoulder.x, baseline.rightShoulder.x);
  const wristInset = average(Math.abs(leftWrist.x - centerX), Math.abs(rightWrist.x - centerX));
  const baselineInset = average(Math.abs((baseline.leftWrist?.x ?? 0.3) - baselineCenterX), Math.abs((baseline.rightWrist?.x ?? 0.7) - baselineCenterX));
  const elbowInset = average(Math.abs(leftElbow.x - centerX), Math.abs(rightElbow.x - centerX));
  const baselineElbowInset = average(Math.abs((baseline.leftElbow?.x ?? 0.38) - baselineCenterX), Math.abs((baseline.rightElbow?.x ?? 0.62) - baselineCenterX));
  const inwardReach = Math.max(0, (baselineInset - wristInset) / shoulderWidth);
  const elbowReach = Math.max(0, (baselineElbowInset - elbowInset) / shoulderWidth);
  const close = shouldersLevel && wristsLevel && (inwardReach > 0.08 || elbowReach > 0.05);
  const active = shouldersLevel && wristsNearShoulderLine && (inwardReach > 0.15 || (inwardReach > 0.08 && elbowReach > 0.08));
  const score = Math.max(0, Math.min(1, Math.max(inwardReach / 0.22, elbowReach / 0.18)));

  return {
    state: active ? "matched" : close ? "close" : "off",
    score,
    close,
    active,
  };
}

function average(a, b) {
  return (a + b) / 2;
}

function distance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function stopCamera() {
  stopHoldTimer();
  resetExerciseHoldTracking();
  state.session.running = false;
  state.session.holdActive = false;
  state.session.cameraReady = false;
  state.session.motionScore = 0;
  state.session.trackedJoints = 0;
  state.session.trackingStatus = "Limb tracking offline";
  state.session.trackingQuality = 0;
  state.session.smoothedMotionScore = 0;
  state.session.calibrated = false;
  state.session.baseline = null;
  state.session.calibrationShots = {
    neutral: null,
    arms: null,
    knee: null,
  };
  state.session.currentCalibrationStep = 0;
  state.session.demoActive = false;
  state.session.demoCompleted = false;
  state.session.demoProgress = 0;
  state.session.pendingMotionLabel = "idle";
  state.session.pendingMotionFrames = 0;
  state.session.exerciseMatchState = "idle";
  state.session.exerciseMatchScore = 0;
  els.toggleSession.textContent = "Start Session";
  els.toggleHold.textContent = "Auto Hold";
  updateCalibrationButtonLabel();

  if (motionFrameId) {
    window.cancelAnimationFrame(motionFrameId);
    motionFrameId = undefined;
  }

  previousFrame = undefined;
  poseBusy = false;
  latestPoseLandmarks = undefined;
  demoHoldStartedAt = 0;
  resetAutoCalibrationTracking();
  calibrationStepReadyAt = 0;
  closeCameraPermissionModal();

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = undefined;
  }

  els.camera.pause();
  els.camera.srcObject = null;
  const trackingCtx = els.trackingCanvas.getContext("2d");
  trackingCtx.clearRect(0, 0, els.trackingCanvas.width, els.trackingCanvas.height);
  setFeedback("Camera stopped.");
  renderSession();
  renderControlStates();
  renderCalibration();
  renderWorkflow();
  persistState();
}

function toggleSession() {
  if (!state.session.cameraReady) {
    setFeedback("Start the camera first so IsoTrack can monitor movement.");
    return;
  }

  if (isPrescribedSessionComplete()) {
    setFeedback("All prescribed exercises are complete. Submit post-session RPE and finish the session.");
    return;
  }

  if (!state.session.running) {
    if (state.session.rpeDirty) {
      submitRpe({ feedback: false });
    } else {
      state.session.preRpe = clampRpe(els.preRpe.value);
      state.session.postRpe = clampRpe(els.postRpe.value);
    }
  }

  state.session.running = !state.session.running;
  sessionStartedAt = state.session.running ? Date.now() : sessionStartedAt;
  if (state.session.running) state.session.completed = false;
  resetExerciseHoldTracking();
  els.toggleSession.textContent = state.session.running ? "Pause Session" : "Start Session";

  if (state.session.running) {
    setFeedback(`Session active. User-entered starting RPE ${state.session.preRpe}/10.`);
  } else {
    setFeedback("Session paused.");
  }

  renderSession();
  renderControlStates();
  persistState();
}

function toggleHold() {
  if (!state.session.running) {
    setFeedback("Start the session before automatic hold tracking can begin.");
    return;
  }

  setFeedback("Hold time now tracks automatically while you stay close to the demo figure.");
}

function stopHoldTimer() {
  window.clearInterval(holdIntervalId);
  holdIntervalId = undefined;
}

function startMotionAnalysis() {
  if (motionFrameId) window.cancelAnimationFrame(motionFrameId);
  const ctx = els.analysisCanvas.getContext("2d", { willReadFrequently: true });

  const step = () => {
    if (els.camera.readyState >= 2) {
      ctx.drawImage(els.camera, 0, 0, els.analysisCanvas.width, els.analysisCanvas.height);
      const imageData = ctx.getImageData(0, 0, els.analysisCanvas.width, els.analysisCanvas.height);
      const data = imageData.data;
      let motion = 0;

      if (previousFrame) {
        for (let i = 0; i < data.length; i += 16) {
          motion += Math.abs(data[i] - previousFrame[i]);
          motion += Math.abs(data[i + 1] - previousFrame[i + 1]);
          motion += Math.abs(data[i + 2] - previousFrame[i + 2]);
        }
      }

      previousFrame = new Uint8ClampedArray(data);
      const normalized = Math.min(100, Math.round(motion / 14000));
      state.session.motionScore = normalized;
      state.session.smoothedMotionScore = Math.round((state.session.smoothedMotionScore * 0.82) + (normalized * 0.18));

      if (poseInstance && !poseBusy) {
        poseBusy = true;
        poseInstance.send({ image: els.camera })
          .catch(() => {
            state.session.trackingStatus = "Tracking unavailable";
          })
          .finally(() => {
            poseBusy = false;
          });
      }

      if (state.session.running) {
        if (repCooldown > 0) repCooldown -= 1;

        if (state.session.smoothedMotionScore > 28
          && repCooldown === 0
          && (state.session.exerciseMatchState === "matched" || state.session.exerciseMatchState === "close")) {
          registerExerciseRep(1, 6);
          repCooldown = 14;
        }

        updateMotionGuidance();
      }

      renderSession();
      renderWorkflow();
    }

    motionFrameId = window.requestAnimationFrame(step);
  };

  step();
}

function completeSession() {
  if (!state.session.running && state.session.reps === 0 && state.session.totalTension === 0) {
    setFeedback("Run at least part of a guided session before completing it.");
    return;
  }

  if (!isPrescribedSessionComplete()) {
    setFeedback("Finish each prescribed exercise in Session Lab before ending the session.");
    return;
  }

  ensureRewardPeriod();
  if (state.session.rpeDirty) {
    submitRpe({ feedback: false });
  } else {
    state.session.postRpe = clampRpe(els.postRpe.value);
  }

  stopHoldTimer();
  resetExerciseHoldTracking();
  state.session.running = false;
  state.session.holdActive = false;
  els.toggleSession.textContent = "Start Session";
  els.toggleHold.textContent = "Auto Hold";

  const sessionDurationMs = sessionStartedAt ? Date.now() - sessionStartedAt : state.session.totalTension * 1000;
  const estimatedMinutes = Math.max(1, Math.round(sessionDurationMs / 60000));
  const adherence = Math.min(100, 52 + state.session.reps * 4 + Math.floor(state.session.totalTension / 20));
  const activePlan = state.plan || {
    patientName: "Demo User",
    fatigue: 5,
    energy: "variable",
    rewardRate: getMonthlyRewardRate({ weeklyReps: 24 }),
    programValue: MONTHLY_SUBSCRIPTION_FEE,
    reimbursementSessions: DEFAULT_REIMBURSEMENT_SESSIONS,
    focuses: [getSelectedFocus()],
  };
  const preRpe = clampRpe(state.session.preRpe || 0);
  const postRpe = clampRpe(state.session.postRpe || 0);
  const reimbursementTarget = MONTHLY_SUBSCRIPTION_FEE;
  const remainingBalance = Math.max(0, reimbursementTarget - state.rewards.cashback);
  const monthlyRepTarget = getMonthlyRepTarget(activePlan);
  const sessionRepProgress = Math.min(1, state.session.reps / monthlyRepTarget);
  const selectedDemo = getSelectedDemo();
  const prescribedDemos = buildSessionDemoLibrary();
  const completedTitles = prescribedDemos
    .filter((item) => state.session.completedExercises.includes(item.sessionIndex))
    .map((item) => item.title);
  const sessionExerciseLabel = completedTitles.length
    ? `${completedTitles.length} prescribed exercises`
    : (selectedDemo?.title || activePlan.focuses[0]);
  const cashbackEarned = Number(Math.min(
    remainingBalance,
    reimbursementTarget * sessionRepProgress
  ).toFixed(2));
  const rpeDelta = postRpe - preRpe;
  const rpeSummary = `Pre ${preRpe}/10 | Post ${postRpe}/10`;
  const rpeChange = rpeDelta > 0 ? `+${rpeDelta} RPE` : rpeDelta < 0 ? `${rpeDelta} RPE` : "No change";
  const careStatus = postRpe >= 8 || rpeDelta >= 3
    ? "Review exertion before progression"
    : adherence >= 80
      ? "Ready for clinician review"
      : "Needs another supported session";

  state.report = {
    adherence,
    fatigueBand: rpeSummary,
    intensity: rpeChange,
    status: careStatus,
    text: `${activePlan.patientName} completed a ${estimatedMinutes}-minute session with ${state.session.reps} reps and ${state.session.totalTension} seconds of time under tension across ${sessionExerciseLabel}. User-entered RPE moved from ${preRpe}/10 to ${postRpe}/10. Keep focus on ${activePlan.focuses[0]} next session.`,
  };
  state.sessionHistory = [
    ...state.sessionHistory,
    {
      id: Date.now(),
      date: new Date().toISOString(),
      exercise: sessionExerciseLabel,
      focus: activePlan.focuses.join(", "),
      timeUnderTension: state.session.totalTension,
      holdSeconds: state.session.holdSeconds,
      preRpe,
      postRpe,
      adherence,
      reps: state.session.reps,
    },
  ].slice(-42);

  state.rewards.cashback = Number(Math.min(
    reimbursementTarget,
    state.rewards.cashback + cashbackEarned
  ).toFixed(2));
  state.rewards.streak += 1;
  state.rewards.tier = "Flat $15 plan";
  state.rewards.targetValue = MONTHLY_SUBSCRIPTION_FEE;
  state.session.completed = true;

  setFeedback(`Session completed. $${cashbackEarned.toFixed(2)} earned back toward this month's $${MONTHLY_SUBSCRIPTION_FEE} subscription.`);
  renderSession();
  renderControlStates();
  renderReport();
  renderRewards();
  state.activeTab = "reports";
  renderActiveTab();
  persistState();
}

function updateMotionGuidance() {
  const score = state.session.smoothedMotionScore;
  let nextLabel = "low";

  if (score > 42) {
    nextLabel = "high";
  } else if (score > 18) {
    nextLabel = "good";
  }

  if (nextLabel === state.session.pendingMotionLabel) {
    state.session.pendingMotionFrames += 1;
  } else {
    state.session.pendingMotionLabel = nextLabel;
    state.session.pendingMotionFrames = 1;
  }

  if (state.session.pendingMotionFrames < MOTION_CONFIRMATION_FRAMES) return;
  if (state.session.intensityLabel === nextLabel) return;

  state.session.intensityLabel = nextLabel;

  if (nextLabel === "high") {
    setFeedback("Tempo is too sharp. Slow it down.", false);
  } else if (nextLabel === "good") {
    setFeedback("Good tempo. Stay controlled.", false);
  } else {
    setFeedback("Movement is small. Reset posture or log manually.", false);
  }
}

function renderSession() {
  const currentExercise = getSelectedDemo();
  const exerciseProgress = currentExercise
    ? Math.min(100, Math.round(((state.session.exerciseReps / Math.max(1, currentExercise.repTarget))
      + (state.session.exerciseHoldSeconds / Math.max(1, currentExercise.holdTarget))) * 50))
    : 0;
  els.motionBar.style.width = `${state.session.trackingQuality}%`;
  els.motionScore.textContent = `${state.session.trackingQuality}%`;
  els.demoProgress.textContent = `${state.session.demoActive ? state.session.demoProgress : exerciseProgress}%`;
  els.repCount.textContent = currentExercise
    ? `${state.session.exerciseReps}/${currentExercise.repTarget}`
    : String(state.session.reps);
  els.holdTime.textContent = currentExercise
    ? `${formatTime(state.session.exerciseHoldSeconds)} / ${formatTime(currentExercise.holdTarget)}`
    : formatTime(state.session.holdSeconds);
  els.tutTotal.textContent = `${state.session.totalTension} sec`;
  els.trackingState.textContent = state.session.trackingStatus;
  els.trackedJoints.textContent = `${state.session.trackedJoints} points`;
  els.cameraStatus.textContent = state.session.running
    ? "Live"
    : state.session.cameraReady
      ? "Ready"
      : "Offline";
  if (els.rpeSubmitStatus) {
    els.rpeSubmitStatus.textContent = getRpeStatusLabel();
  }
  if (els.submitRpe) {
    els.submitRpe.textContent = getRpeSubmitLabel();
  }
  renderDemoPreview();
  renderCalibrationCountdown();
}

function renderControlStates() {
  els.toggleHold.textContent = "Auto Hold";
  els.startCamera.disabled = state.session.cameraReady;
  els.stopCamera.disabled = !state.session.cameraReady;
  els.captureCalibration.disabled = !state.session.cameraReady || state.session.calibrated || getCalibrationCountdownSeconds() > 0;
  els.resetCalibration.disabled = !state.session.cameraReady && !hasSavedCalibration();
  els.startDemo.disabled = !state.plan || !state.session.cameraReady || !state.session.calibrated || isPrescribedSessionComplete();
  els.toggleSession.disabled = !state.plan || !state.session.cameraReady || !state.session.calibrated || !state.session.demoCompleted || isPrescribedSessionComplete();
  els.toggleHold.disabled = !state.session.running;
  els.manualRep.disabled = !state.session.running;
  els.completeSession.disabled = state.session.completed
    || !isPrescribedSessionComplete()
    || (!state.session.running && state.session.reps === 0 && state.session.totalTension === 0);
  if (els.submitRpe) {
    els.submitRpe.disabled = !state.session.rpeDirty;
  }

  const primaryButtons = [
    els.startCamera,
    els.stopCamera,
    els.startDemo,
    els.toggleSession,
    els.completeSession,
  ];
  const secondaryButtons = [
    els.captureCalibration,
    els.resetCalibration,
    els.toggleHold,
    els.manualRep,
  ];
  const allButtons = [...primaryButtons, ...secondaryButtons];

  allButtons.forEach((button) => {
    button.classList.remove("button-primary");
  });

  primaryButtons.forEach((button) => {
    button.hidden = button.disabled;
  });
  secondaryButtons.forEach((button) => {
    button.hidden = button.disabled;
  });

  const emphasizedAction = primaryButtons.find((button) => !button.hidden)
    || secondaryButtons.find((button) => !button.hidden);
  emphasizedAction?.classList.add("button-primary");

  if (els.cameraPrimaryControls) {
    els.cameraPrimaryControls.hidden = primaryButtons.every((button) => button.hidden);
  }

  if (els.cameraSecondaryControls) {
    els.cameraSecondaryControls.hidden = secondaryButtons.every((button) => button.hidden);
  }
}

function renderCalibration() {
  const savedCount = CALIBRATION_SEQUENCE.filter(({ key }) => Boolean(state.session.calibrationShots[key])).length;
  const percent = Math.round((savedCount / CALIBRATION_SEQUENCE.length) * 100);
  updateCalibrationButtonLabel();
  els.calibrationCount.textContent = `${savedCount} / ${CALIBRATION_SEQUENCE.length} saved`;
  els.calibrationProgressBar.style.width = `${percent}%`;

  const stageMap = [
    { key: "neutral", element: els.calibrationStageNeutral, status: els.calibrationStageNeutralStatus },
    { key: "arms", element: els.calibrationStageArms, status: els.calibrationStageArmsStatus },
    { key: "knee", element: els.calibrationStageKnee, status: els.calibrationStageKneeStatus },
  ];

  stageMap.forEach((stage, index) => {
    const saved = Boolean(state.session.calibrationShots[stage.key]);
    const active = !state.session.calibrated && index === state.session.currentCalibrationStep;
    const stepCountdown = getCalibrationCountdownSeconds();
    const assessment = active && stepCountdown === 0 && latestPoseLandmarks
      ? getCalibrationPoseAssessment(stage.key, latestPoseLandmarks, state.session.baseline)
      : null;
    const stepDelaySeconds = Math.round((index === 0 ? FIRST_CALIBRATION_STEP_DELAY_MS : FOLLOWUP_CALIBRATION_STEP_DELAY_MS) / 1000);
    stage.element.classList.toggle("is-complete", saved);
    stage.element.classList.toggle("is-active", active);
    stage.status.textContent = saved
      ? "Saved"
      : active
        ? calibrationHoldStartedAt
          ? "Capturing"
          : stepCountdown > 0
            ? "Get ready"
            : assessment?.matched
              ? "Hold steady"
              : assessment?.shortHint || "Get ready"
        : "Queued";
  });
}

function updateCalibrationButtonLabel() {
  const currentStep = CALIBRATION_SEQUENCE[state.session.currentCalibrationStep];
  els.captureCalibration.textContent = currentStep ? "Capture Step" : "Calibration Complete";
}

function hasSavedCalibration() {
  return CALIBRATION_SEQUENCE.some(({ key }) => Boolean(state.session.calibrationShots[key]));
}

function renderWorkflow() {
  if (!state.plan) {
    updateStepChip(els.workflowStepCamera, state.session.cameraReady, !state.session.cameraReady);
    updateStepChip(els.workflowStepCalibration, false, false);
    updateStepChip(els.workflowStepDemo, false, false);
    updateStepChip(els.workflowStepSession, false, false);
    els.workflowTitle.textContent = "Start With Assessment";
    els.workflowCheckPrimary.textContent = "Overview -> Assessment";
    els.workflowCheckSecondary.textContent = "Session Lab unlocks after plan creation";
    return;
  }

  const stepStates = {
    camera: state.session.cameraReady,
    calibration: state.session.calibrated,
    demo: state.session.demoCompleted,
    session: state.session.running || state.session.completed,
  };

  updateStepChip(els.workflowStepCamera, state.session.cameraReady, !state.session.cameraReady);
  updateStepChip(els.workflowStepCalibration, stepStates.calibration, state.session.cameraReady && !stepStates.calibration);
  updateStepChip(els.workflowStepDemo, stepStates.demo, state.session.calibrated && !stepStates.demo);
  updateStepChip(els.workflowStepSession, stepStates.session, state.session.demoCompleted && !stepStates.session);

  if (!state.session.cameraReady) {
    els.workflowTitle.textContent = "Start Camera";
    els.workflowCheckPrimary.textContent = `${LIMB_CAPTURE_THRESHOLD}+ points`;
    els.workflowCheckSecondary.textContent = "Calibration pending";
  } else if (!state.session.calibrated) {
    const currentStep = CALIBRATION_SEQUENCE[state.session.currentCalibrationStep];
    const stepCountdown = getCalibrationCountdownSeconds();
    const assessment = currentStep
      ? getCalibrationPoseAssessment(currentStep.key, latestPoseLandmarks, state.session.baseline)
      : null;
    els.workflowTitle.textContent = calibrationHoldStartedAt ? "Calibrating" : "Get Ready";
    els.workflowCheckPrimary.textContent = stepCountdown > 0
      ? "Countdown active"
      : calibrationHoldStartedAt
        ? "Hold still"
        : assessment?.matched
          ? "Ready to save"
          : state.session.trackedJoints >= LIMB_CAPTURE_THRESHOLD
            ? "Match outline"
            : "Camera live";
    els.workflowCheckSecondary.textContent = calibrationHoldStartedAt
      ? "Auto capture running"
      : state.session.trackedJoints >= LIMB_CAPTURE_THRESHOLD
        ? `${CALIBRATION_SEQUENCE.filter(({ key }) => Boolean(state.session.calibrationShots[key])).length} / 3 steps saved`
        : "Move fully into frame for tracking";
  } else if (!state.session.demoCompleted) {
    const selectedDemo = getSelectedDemo();
    const matchState = state.session.exerciseMatchState;
    els.workflowTitle.textContent = state.session.demoActive ? (selectedDemo?.title || "Demo") : "Finished Calibrating";
    els.workflowCheckPrimary.textContent = selectedDemo ? `Exercise ${(selectedDemo.sessionIndex || 0) + 1} of ${buildSessionDemoLibrary().length}` : "Calibration done";
    els.workflowCheckSecondary.textContent = state.session.demoActive
      ? `${matchState === "matched" ? "Locked" : matchState === "close" ? "Close" : "Adjust"} • Demo ${state.session.demoProgress}%`
      : "Run prescribed demo";
  } else if (!state.session.running) {
    const selectedDemo = getSelectedDemo();
    if (isPrescribedSessionComplete()) {
      els.workflowTitle.textContent = "Session Done";
      els.workflowCheckPrimary.textContent = "Plan complete";
      els.workflowCheckSecondary.textContent = `${state.session.completedExercises.length} / ${buildSessionDemoLibrary().length} exercises done`;
    } else {
      els.workflowTitle.textContent = "Ready To Work";
      els.workflowCheckPrimary.textContent = selectedDemo ? getCurrentExerciseProgressLabel(selectedDemo) : "Calibration done";
      els.workflowCheckSecondary.textContent = `${state.session.completedExercises.length} / ${buildSessionDemoLibrary().length} exercises done`;
    }
  } else {
    const matchState = state.session.exerciseMatchState;
    const selectedDemo = getSelectedDemo();
    els.workflowTitle.textContent = "Working";
    els.workflowCheckPrimary.textContent = selectedDemo ? getCurrentExerciseProgressLabel(selectedDemo) : "TUT live";
    els.workflowCheckSecondary.textContent = selectedDemo
      ? `Target ${selectedDemo.repTarget} reps or ${selectedDemo.holdTarget}s`
      : "Work active";
  }

  updateWorkflowCheck(els.workflowCheckPrimary, /ready|complete|live|locked/i.test(els.workflowCheckPrimary.textContent));
  updateWorkflowCheck(els.workflowCheckSecondary, /ready|complete|live|locked/i.test(els.workflowCheckSecondary.textContent));
}

function updateStepChip(element, complete, active) {
  element.classList.toggle("is-complete", complete);
  element.classList.toggle("is-active", active);
}

function updateWorkflowCheck(element, complete) {
  element.classList.toggle("is-complete", complete);
  element.classList.toggle("is-active", !complete);
}

function renderReport() {
  els.reportViewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.reportView === state.reportView);
  });

  if (!state.report) {
    els.reportAdherence.textContent = "0%";
    els.reportFatigue.textContent = "Pre -- | Post --";
    els.reportIntensity.textContent = "--";
    els.reportStatus.textContent = "Awaiting first session";
    els.reportText.textContent = "Generate a plan, enter manual RPE, and complete a session to create the report.";
    renderReportChart();
    return;
  }

  els.reportAdherence.textContent = `${state.report.adherence}%`;
  els.reportFatigue.textContent = state.report.fatigueBand;
  els.reportIntensity.textContent = state.report.intensity;
  els.reportStatus.textContent = state.report.status;
  els.reportText.textContent = state.report.text;
  renderReportChart();
}

function renderReportChart() {
  if (!els.reportChart) return;

  const chartRows = state.reportView === "exercise"
    ? buildExerciseHistoryRows(state.sessionHistory)
    : buildDailyHistoryRows(state.sessionHistory);

  if (!chartRows.length) {
    els.reportChart.innerHTML = `<p class="report-chart-empty">Complete a session to populate the clinician graph with TUT and user-entered RPE.</p>`;
    return;
  }

  const maxTut = Math.max(...chartRows.map((row) => row.timeUnderTension), 1);
  els.reportChart.innerHTML = `
    <div class="report-chart-grid">
      ${chartRows.map((row) => {
        const barHeight = Math.max(10, Math.round((row.timeUnderTension / maxTut) * 100));
        const rpeBottom = Math.max(8, Math.min(96, Math.round((row.postRpe / 10) * 100)));
        return `
          <article class="report-chart-column">
            <div class="report-chart-plot">
              <span class="report-chart-bar" style="height:${barHeight}%"></span>
              <span class="report-chart-rpe" style="bottom:${rpeBottom}%">${row.postRpe.toFixed(0)}</span>
            </div>
            <strong>${row.label}</strong>
            <small>${row.timeUnderTension}s TUT</small>
            <small>User RPE ${row.postRpe.toFixed(1)}</small>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function buildDailyHistoryRows(history) {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const grouped = new Map();

  history.forEach((entry) => {
    const dayKey = entry.date.slice(0, 10);
    const existing = grouped.get(dayKey) || {
      label: formatter.format(new Date(entry.date)),
      timeUnderTension: 0,
      rpeTotal: 0,
      count: 0,
    };
    existing.timeUnderTension += Number(entry.timeUnderTension || 0);
    existing.rpeTotal += Number(entry.postRpe || 0);
    existing.count += 1;
    grouped.set(dayKey, existing);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([, value]) => ({
      label: value.label,
      timeUnderTension: value.timeUnderTension,
      postRpe: value.rpeTotal / Math.max(1, value.count),
    }));
}

function buildExerciseHistoryRows(history) {
  const grouped = new Map();

  history.forEach((entry) => {
    const key = entry.exercise || "Exercise";
    const existing = grouped.get(key) || {
      label: key.length > 16 ? `${key.slice(0, 16)}...` : key,
      timeUnderTension: 0,
      rpeTotal: 0,
      count: 0,
      lastDate: entry.date,
    };
    existing.timeUnderTension += Number(entry.timeUnderTension || 0);
    existing.rpeTotal += Number(entry.postRpe || 0);
    existing.count += 1;
    existing.lastDate = entry.date;
    grouped.set(key, existing);
  });

  return Array.from(grouped.values())
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate))
    .slice(0, 6)
    .reverse()
    .map((value) => ({
      label: value.label,
      timeUnderTension: value.timeUnderTension,
      postRpe: value.rpeTotal / Math.max(1, value.count),
    }));
}

function renderRewards() {
  ensureRewardPeriod();
  const activePlan = getActivePlan();
  const targetValue = MONTHLY_SUBSCRIPTION_FEE;
  const returned = Math.min(targetValue, state.rewards.cashback);
  const remaining = Math.max(0, targetValue - returned);
  const progress = Math.round((returned / targetValue) * 100);
  const sessions = state.rewards.streak;
  const monthlyRepTarget = getMonthlyRepTarget(activePlan);
  const rewardRate = getMonthlyRewardRate(activePlan);

  els.walletTotal.textContent = `$${returned.toFixed(2)}`;
  els.walletStreak.textContent = `${state.rewards.streak} sessions`;
  els.walletTier.textContent = `$${MONTHLY_SUBSCRIPTION_FEE} / month`;
  els.walletRemaining.textContent = `$${remaining.toFixed(2)}`;
  els.walletProgress.textContent = `${progress}%`;
  if (els.walletTierBar) {
    els.walletTierBar.style.width = `${progress}%`;
  }
  if (els.walletNextUnlock) {
    els.walletNextUnlock.textContent = remaining > 0
      ? `$${remaining.toFixed(2)} left to earn back`
      : "Subscription earned back";
  }
  if (els.walletTierCopy) {
    els.walletTierCopy.textContent = `One flat subscription for everyone: $${MONTHLY_SUBSCRIPTION_FEE} per month. Finish the month’s prescribed reps to make that back.`;
  }
  if (els.walletMonthlyGoal) {
    els.walletMonthlyGoal.textContent = `${monthlyRepTarget} reps`;
  }
  if (els.walletMonthlyGoalCopy) {
    els.walletMonthlyGoalCopy.textContent = `Each completed rep is worth about $${rewardRate.toFixed(2)} back this month.`;
  }
  if (els.walletSubscriptionStatus) {
    els.walletSubscriptionStatus.textContent = remaining > 0 ? "In progress" : "Earned back";
  }
  if (els.walletSubscriptionSummary) {
    els.walletSubscriptionSummary.textContent = remaining > 0
      ? `You have earned back $${returned.toFixed(2)} of the $${MONTHLY_SUBSCRIPTION_FEE} monthly fee so far.`
      : `You have earned back the full $${MONTHLY_SUBSCRIPTION_FEE} subscription for this month.`;
  }
  els.walletNote.textContent = state.rewards.streak
    ? remaining > 0
      ? `${state.rewards.streak} sessions completed. Keep going to earn back the full $${targetValue.toFixed(2)} this month.`
      : `Monthly subscription fully earned back for this month.`
    : `Finish your planned reps this month to earn back the full $${targetValue.toFixed(2)} subscription cost.`;
}

function setFeedback(message, force = true) {
  const now = performance.now();
  if (lastFeedbackMessage === message) return;
  if (!force && now - lastFeedbackAt < FEEDBACK_COOLDOWN_MS) return;
  lastFeedbackMessage = message;
  lastFeedbackAt = now;
  els.sessionFeedback.textContent = message;
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function countVisibleLimbPoints(landmarks) {
  return PRIMARY_LIMB_POINTS.filter(([, index]) => (landmarks[index]?.visibility ?? 0) >= LIMB_VISIBILITY_THRESHOLD).length;
}

function getNamedLimbPoints(landmarks) {
  return Object.fromEntries(
    EXTENDED_LIMB_POINTS.map(([name, index]) => [name, landmarks[index]])
  );
}

function getTrackedOverlayTheme() {
  const matchState = state.session.exerciseMatchState;
  if (matchState === "matched") {
    return {
      strongStroke: "rgba(143, 215, 191, 0.98)",
      weakStroke: "rgba(143, 215, 191, 0.44)",
      shadow: "rgba(143, 215, 191, 0.38)",
      jointOuter: "rgba(9, 14, 12, 0.86)",
      jointInner: "#e8fff6",
      jointCore: "#8fd7bf",
      weakJointInner: "rgba(232, 255, 246, 0.52)",
      weakJointCore: "rgba(143, 215, 191, 0.45)",
    };
  }

  if (matchState === "close") {
    return {
      strongStroke: "rgba(255, 196, 107, 0.98)",
      weakStroke: "rgba(255, 196, 107, 0.42)",
      shadow: "rgba(255, 196, 107, 0.36)",
      jointOuter: "rgba(14, 11, 7, 0.86)",
      jointInner: "#fff3dc",
      jointCore: "#ffc46b",
      weakJointInner: "rgba(255, 243, 220, 0.52)",
      weakJointCore: "rgba(255, 196, 107, 0.45)",
    };
  }

  return {
    strongStroke: "rgba(89, 220, 255, 0.96)",
    weakStroke: "rgba(89, 220, 255, 0.42)",
    shadow: "rgba(89, 220, 255, 0.4)",
    jointOuter: "rgba(9, 11, 14, 0.85)",
    jointInner: "#e9fbff",
    jointCore: "#59dcff",
    weakJointInner: "rgba(233, 251, 255, 0.52)",
    weakJointCore: "rgba(89, 220, 255, 0.45)",
  };
}

function drawTrackedLimbOverlay(ctx, landmarks, width, height) {
  const namedPoints = getNamedLimbPoints(landmarks);
  const theme = getTrackedOverlayTheme();

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  LIMB_CONNECTIONS.forEach(([from, to]) => {
    const start = namedPoints[from];
    const end = namedPoints[to];
    if (!start || !end) return;

    const visibility = Math.min(start.visibility ?? 0, end.visibility ?? 0);
    if (visibility < 0.4) return;

    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.lineWidth = visibility >= LIMB_VISIBILITY_THRESHOLD ? 7 : 4;
    ctx.strokeStyle = visibility >= LIMB_VISIBILITY_THRESHOLD ? theme.strongStroke : theme.weakStroke;
    ctx.shadowBlur = visibility >= LIMB_VISIBILITY_THRESHOLD ? 12 : 0;
    ctx.shadowColor = theme.shadow;
    ctx.stroke();
  });

  EXTENDED_LIMB_POINTS.forEach(([name]) => {
    const point = namedPoints[name];
    if (!point || (point.visibility ?? 0) < 0.35) return;

    const strongPoint = (point.visibility ?? 0) >= LIMB_VISIBILITY_THRESHOLD;
    const radius = strongPoint ? 7 : 5;
    const x = point.x * width;
    const y = point.y * height;

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = strongPoint ? theme.jointOuter : "rgba(9, 11, 14, 0.55)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = strongPoint ? theme.jointInner : theme.weakJointInner;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, Math.max(2.5, radius - 3), 0, Math.PI * 2);
    ctx.fillStyle = strongPoint ? theme.jointCore : theme.weakJointCore;
    ctx.fill();
  });

  ctx.restore();
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    activeTab: state.activeTab,
    auth: state.auth,
    plan: state.plan,
    rewards: state.rewards,
    report: state.report,
    reportView: state.reportView,
    sessionHistory: state.sessionHistory,
    session: {
      cameraReady: false,
      running: false,
      holdActive: false,
      reps: state.session.reps,
      holdSeconds: state.session.holdSeconds,
      totalTension: state.session.totalTension,
      motionScore: state.session.motionScore,
      intensityLabel: state.session.intensityLabel,
      selectedDemo: state.session.selectedDemo,
      previewDemoIndex: state.session.previewDemoIndex,
      librarySelectedDemo: state.session.librarySelectedDemo,
      completed: state.session.completed,
      preRpe: state.session.preRpe,
      postRpe: state.session.postRpe,
      preRpeDraft: state.session.preRpeDraft,
      postRpeDraft: state.session.postRpeDraft,
      rpeDirty: state.session.rpeDirty,
      rpeStatus: state.session.rpeStatus,
      exerciseReps: state.session.exerciseReps,
      exerciseHoldSeconds: state.session.exerciseHoldSeconds,
      exerciseTension: state.session.exerciseTension,
      completedExercises: state.session.completedExercises,
      trackedJoints: state.session.trackedJoints,
      trackingStatus: state.session.trackingStatus,
      trackingQuality: state.session.trackingQuality,
      calibrated: state.session.calibrated,
      baseline: state.session.baseline,
      calibrationShots: state.session.calibrationShots,
      currentCalibrationStep: state.session.currentCalibrationStep,
      demoActive: state.session.demoActive,
      demoCompleted: state.session.demoCompleted,
      demoProgress: state.session.demoProgress,
      exerciseMatchState: "idle",
      exerciseMatchScore: 0,
    },
  }));
}

function restoreState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    Object.assign(state.auth, parsed.auth || {});
    Object.assign(state.session, parsed.session || {});
    state.reportView = parsed.reportView || "daily";
    state.sessionHistory = Array.isArray(parsed.sessionHistory) ? parsed.sessionHistory : [];
    state.auth.mode = state.auth.mode || "signup";
    state.auth.stage = state.auth.stage || "credentials";
    state.auth.authenticated = Boolean(state.auth.authenticated);
    state.auth.feedback = state.auth.feedback || "Create an account or sign in to unlock Assessment, Session Lab, Clinician, and Rewards.";
    state.auth.pendingCode = state.auth.pendingCode || "";
    state.auth.pendingEmail = state.auth.pendingEmail || "";
    state.auth.pendingName = state.auth.pendingName || "";
    state.auth.pendingPassword = state.auth.pendingPassword || "";
    normalizePlanSubscription(state.plan);
    state.rewards.tier = "Flat $15 plan";
    state.rewards.targetValue = MONTHLY_SUBSCRIPTION_FEE;
    state.rewards.periodKey = parsed.rewards?.periodKey || getRewardPeriodKey();
    state.session.preRpe = clampRpe(state.session.preRpe);
    state.session.postRpe = clampRpe(state.session.postRpe);
    state.session.preRpeDraft = clampRpe(state.session.preRpeDraft ?? state.session.preRpe);
    state.session.postRpeDraft = clampRpe(state.session.postRpeDraft ?? state.session.postRpe);
    state.session.rpeDirty = Boolean(state.session.rpeDirty);
    state.session.rpeStatus = state.session.rpeStatus || "Enter values and submit them.";
    state.session.previewDemoIndex = Number(state.session.previewDemoIndex ?? state.session.selectedDemo ?? 0);
    state.session.librarySelectedDemo = Number(state.session.librarySelectedDemo || 0);
    state.session.exerciseReps = Number(state.session.exerciseReps || 0);
    state.session.exerciseHoldSeconds = Number(state.session.exerciseHoldSeconds || 0);
    state.session.exerciseTension = Number(state.session.exerciseTension || 0);
    state.session.completedExercises = Array.isArray(state.session.completedExercises) ? state.session.completedExercises : [];
    ensureRewardPeriod();
    state.session.exerciseMatchState = "idle";
    state.session.exerciseMatchScore = 0;
  } catch (error) {
    console.error("Unable to restore demo state", error);
  }
}
