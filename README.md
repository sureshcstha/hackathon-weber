# Focus Tracker App
The Focus Tracker app helps users track their focus sessions. This app uses **computer vision** AI technology to detect faces, track landmarks, recognize facial expressions, and infer whether the user is focused or distracted based  It allows users to start a session, monitor their focused and distracted times, and view session history in a table format. Sessions are stored locally in the browser's `localStorage`, and users can view and delete previous sessions.

## Summary
This app uses AI-powered face tracking via `face-api.js`, which is built on top of TensorFlow.js. The AI models it uses:
* Detect if a user's face is in the frame.
* Use this info to track focused vs distracted time.
* Optionally play a sound when the user has been distracted too long.
* Visualize results and stats in real time.

## Here's a breakdown of the AI technologies used:
1. Face Detection
    * Model: `TinyFaceDetector`
    * Purpose: Detects whether a face is visible in the webcam feed.
    * AI Use: It uses a pre-trained deep learning model to detect faces in real time, optimized for speed and performance.
2. Face Landmarks Detection
    * Model: `faceLandmark68Net`
    * Purpose: Detects facial features like eyes, nose, mouth, etc.
    * AI Use: Helps track detailed facial movements which can be used to infer attention/focus.
3. Facial Expression Recognition
    * Model: `faceRecognitionNet`
    * Purpose: Helping track faces more accurately in the video stream
    * The model is used to identify and differentiate faces in a stream, but it isn't actively used for recognition in this code. It aids in accurately tracking faces.
4. Facial Expression Recognition
    * Model: `faceExpressionNet`
    * Purpose: Recognizes expressions like happy, sad, angry, surprised, etc.
    * AI Use: Though your code doesn't currently use expressions to determine focus, it's loaded — potentially useful for richer focus/emotion tracking in the future.