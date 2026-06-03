const notes = document.getElementById("notes");
const summarizeBtn = document.getElementById("summarizeBtn");
const summary = document.getElementById("summary");

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const sessions = document.getElementById("sessions");
const completeBtn = document.getElementById("completeBtn");

let totalSeconds = 25 * 60;
let timerInterval = null;
let completedSessions = 0;

function updateTimer() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      updateTimer();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Study session completed!");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  totalSeconds = 25 * 60;
  updateTimer();
}

function summarizeText(text) {
  const cleanText = text.trim();

  if (cleanText.length === 0) {
    return "Please enter your study notes first.";
  }

  const sentences = cleanText
    .split(/[.!?]/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);

  if (sentences.length <= 2) {
    return cleanText;
  }

  return sentences.slice(0, 2).join(". ") + ".";
}

summarizeBtn.addEventListener("click", () => {
  summary.textContent = summarizeText(notes.value);
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

completeBtn.addEventListener("click", () => {
  completedSessions++;
  sessions.textContent = completedSessions;
});

updateTimer();
