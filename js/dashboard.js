const video = document.getElementById('video');
const focusStats = document.getElementById('focus-stats');
const distractedAudio = document.querySelector('audio[data-sound="distracted"]');

let isFocused = false;
let focusedTime = 0; // in seconds
let distractedTime = 0;
let lastCheckTime = Date.now();
let currentDistractedStreak = 0;
let audioPlayed = false;
let sessionRunning = true;
let trackingInterval;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function resetSession() {
  focusedTime = 0;
  distractedTime = 0;
  currentDistractedStreak = 0;
  audioPlayed = false;
  lastCheckTime = Date.now();

  focusStats.innerText =
    `🟢 Focused Time: 00:00\n` +
    `🔴 Distracted Time: 00:00\n` +
    `⏱️ Session Duration: 00:00\n` +
    `📊 Focus Percentage: 0.0%`;

  const canvas = document.querySelector('canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function startTracking(video, canvas, displaySize) {
  trackingInterval = setInterval(async () => {
    if (!sessionRunning) return;

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    const currentTime = Date.now();
    const elapsed = (currentTime - lastCheckTime) / 1000;
    lastCheckTime = currentTime;

    if (resizedDetections.length > 0) {
      isFocused = true;
      focusedTime += elapsed;
      currentDistractedStreak = 0;
      audioPlayed = false;
    } else {
      isFocused = false;
      distractedTime += elapsed;
      currentDistractedStreak += elapsed;

      if (currentDistractedStreak > 10 && !audioPlayed) {
        distractedAudio.play();
        audioPlayed = true;
      }
    }

    const totalTime = focusedTime + distractedTime;
    const focusPercentage = totalTime > 0 ? ((focusedTime / totalTime) * 100).toFixed(1) : '0.0';

    focusStats.innerText = 
      `🟢 Focused Time: ${formatTime(focusedTime)}\n` +
      `🔴 Distracted Time: ${formatTime(distractedTime)}\n` +
      `⏱️ Session Duration: ${formatTime(totalTime)}\n` +
      `📊 Focus Percentage: ${focusPercentage}%`;
  }, 1000);
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error(err));
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  startTracking(video, canvas, displaySize);
});

const toggleBtn = document.createElement('button');
toggleBtn.textContent = "Stop & Save Session";
toggleBtn.style.position = "absolute";
toggleBtn.style.bottom = "20px";
toggleBtn.style.left = "20px";
toggleBtn.style.padding = "10px 20px";
toggleBtn.style.background = "#f44336";
toggleBtn.style.color = "#fff";
toggleBtn.style.border = "none";
toggleBtn.style.borderRadius = "8px";
toggleBtn.style.cursor = "pointer";
document.body.appendChild(toggleBtn);

toggleBtn.addEventListener('click', () => {
  if (!sessionRunning) {
    // START session
    resetSession();
    toggleBtn.textContent = "Stop & Save Session";
    toggleBtn.style.background = "#f44336";
    sessionRunning = true;
    lastCheckTime = Date.now();

    const canvas = document.querySelector('canvas');
    const displaySize = { width: video.width, height: video.height };
    startTracking(video, canvas, displaySize);
  } else {
    // STOP session and save
    const session = {
      timestamp: new Date().toLocaleString(),
      focusedTime: focusedTime,
      distractedTime: distractedTime,
      totalTime: focusedTime + distractedTime,
      focusPercentage: ((focusedTime / (focusedTime + distractedTime)) * 100).toFixed(1),
    };

    const savedSessions = JSON.parse(localStorage.getItem('focusSessions')) || [];
    savedSessions.push(session);
    localStorage.setItem('focusSessions', JSON.stringify(savedSessions));

    clearInterval(trackingInterval);

    toggleBtn.textContent = "Start New Session";
    toggleBtn.style.background = "#4CAF50";
    sessionRunning = false;
  }
});
