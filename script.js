const notes = document.getElementById("notes");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const summary = document.getElementById("summary");
const statusText = document.getElementById("status");
const modeButtons = document.querySelectorAll(".mode-btn");

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const sessions = document.getElementById("sessions");
const completeBtn = document.getElementById("completeBtn");

let selectedMode = "summarize";
let totalSeconds = 25 * 60;
let timerInterval = null;
let completedSessions = 0;

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMode = btn.dataset.mode;
    statusText.textContent = `Mode selected: ${selectedMode}`;
  });
});
fileInput?.addEventListener("change", () => {
  const selectedFile = fileInput.files[0];
  fileName.textContent = selectedFile ? selectedFile.name : "No file selected";
});

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

async function generateAIResponse() {
  const input = notes.value.trim();

  if (!input) {
    summary.textContent = "Please enter notes or a question first.";
    statusText.textContent = "Input required.";
    return;
  }

  statusText.textContent = "Generating response...";

  try {
    const response = await fetch("https://studyspark-ai-with-azure.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: selectedMode,
        input
      })
    });

    const data = await response.json();
    summary.textContent = data.result || "No response received.";
    statusText.textContent = "Done.";
  } catch (error) {
    summary.textContent = "Error: Unable to connect to AI server.";
    statusText.textContent = "Server error.";
  }
}

generateBtn.addEventListener("click", generateAIResponse);

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(summary.textContent);
    statusText.textContent = "Copied successfully.";
  } catch {
    statusText.textContent = "Copy failed.";
  }
});

clearBtn.addEventListener("click", () => {
  notes.value = "";
  summary.textContent = "Your AI response will appear here.";
  statusText.textContent = "Cleared.";
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

completeBtn.addEventListener("click", () => {
  completedSessions++;
  sessions.textContent = completedSessions;
});

updateTimer();
