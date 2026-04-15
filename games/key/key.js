const timerText = document.getElementById("timerText");
const statusText = document.getElementById("statusText");
const mumbleButton = document.getElementById("mumbleButton");
const resetButton = document.getElementById("resetButton");
const keySpot = document.getElementById("keySpot");
const resultModal = document.getElementById("resultModal");
const resultEyebrow = document.getElementById("resultEyebrow");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const sceneBoard = document.getElementById("sceneBoard");

const totalTime = 60;
const mumblePhrases = [
  "Right side near the belt",
  "You are dying...",
  "This is not even a game...",
  "You are not belongs to here...",
];

const state = {
  timeLeft: totalTime,
  intervalId: null,
  finished: false,
  listened: false,
  mumbleVisible: false,
  mumbleTimeoutId: null,
  mumbleSpawnTimeoutId: null,
};

function updateTimer() {
  timerText.textContent = `${Math.max(0, Math.ceil(state.timeLeft))}s`;
}

function showResult({ eyebrow, title, text }) {
  resultEyebrow.textContent = eyebrow;
  resultTitle.textContent = title;
  resultText.textContent = text;
  resultModal.classList.remove("hidden");
  resultModal.setAttribute("aria-hidden", "false");
}

function hideResult() {
  resultModal.classList.add("hidden");
  resultModal.setAttribute("aria-hidden", "true");
}

function stopTimer() {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

function clearMumbleTimers() {
  if (state.mumbleTimeoutId) {
    clearTimeout(state.mumbleTimeoutId);
    state.mumbleTimeoutId = null;
  }

  if (state.mumbleSpawnTimeoutId) {
    clearTimeout(state.mumbleSpawnTimeoutId);
    state.mumbleSpawnTimeoutId = null;
  }
}

function hideMumble() {
  mumbleButton.classList.add("hidden");
  state.mumbleVisible = false;
}

function getRandomMumblePhrase() {
  const randomIndex = Math.floor(Math.random() * mumblePhrases.length);
  return mumblePhrases[randomIndex];
}

function showMumble() {
  if (state.finished || state.listened) return;

  const phrase = getRandomMumblePhrase();
  mumbleButton.textContent = phrase;

  state.mumbleVisible = true;
  mumbleButton.classList.remove("hidden");

  state.mumbleTimeoutId = setTimeout(() => {
    hideMumble();
    scheduleNextMumble();
  }, 3500);
}

function scheduleNextMumble() {
  if (state.finished || state.listened) return;

  const randomDelay = Math.floor(Math.random() * 2500) + 2500;
  state.mumbleSpawnTimeoutId = setTimeout(() => {
    showMumble();
  }, randomDelay);
}

function failGame() {
  if (state.finished) return;

  state.finished = true;
  stopTimer();
  clearMumbleTimers();
  hideMumble();

  statusText.textContent = "The guard stirs awake before Jin can take the key.";
  showResult({
    eyebrow: "Guard Awakens",
    title: "The chance is lost",
    text: "Jin hesitates too long and the drunken guard wakes with the keys still in reach.",
  });
}

function winGame() {
  if (state.finished) return;

  state.finished = true;
  stopTimer();
  clearMumbleTimers();
  hideMumble();

  statusText.textContent = "Jin slips the key away before the guard wakes.";
  showResult({
    eyebrow: "Key Secured",
    title: "Jin finds the key",
    text: "Jin lifts the key from the drunken guard in time. Janice's cell is no longer beyond reach.",
  });
}

function reduceTime(seconds) {
  if (state.finished) return;

  state.timeLeft = Math.max(0, state.timeLeft - seconds);
  updateTimer();

  if (state.timeLeft <= 0) {
    failGame();
  }
}

function startTimer() {
  stopTimer();
  state.intervalId = setInterval(() => {
    if (state.finished) return;

    state.timeLeft -= 1;
    updateTimer();

    if (state.timeLeft <= 0) {
      failGame();
    }
  }, 1000);
}

function listenToMumbling(event) {
  event.stopPropagation();
  if (state.finished || state.listened) return;

  state.listened = true;
  hideMumble();
  clearMumbleTimers();

  reduceTime(4);
  if (state.finished) return;

  statusText.textContent =
    "The guard slurs: 'Right side... near the belt...' Jin learns something, but time slips away.";
}

function handleWrongClick(event) {
  if (state.finished) return;
  if (event.target === keySpot || event.target === mumbleButton) return;

  reduceTime(3);
  if (state.finished) return;

  statusText.textContent =
    "Wrong place. Jin fumbles around the guard and loses 3 seconds.";
}

function resetGame() {
  state.timeLeft = totalTime;
  state.finished = false;
  state.listened = false;

  stopTimer();
  clearMumbleTimers();
  hideMumble();
  hideResult();
  updateTimer();

  statusText.textContent = "Search the guard and find the key before he wakes.";

  startTimer();
  scheduleNextMumble();
}

mumbleButton.addEventListener("click", listenToMumbling);

resetButton.addEventListener("click", resetGame);

keySpot.addEventListener("click", (event) => {
  event.stopPropagation();
  winGame();
});

sceneBoard.addEventListener("click", handleWrongClick);

resetGame();
