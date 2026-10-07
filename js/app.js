import { db, getPlayer } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// Keep the original rules: 60 seconds, one rocket every 200ms, one point per hit.
const GAME_SECONDS = 60;
const ROCKET_INTERVAL = 200;

let score = 0;
let timeLeft = GAME_SECONDS;
let gameStarted = false;
let gameEnded = false;
let interval = null;
let rocketInterval = null;
let submissionPending = false;
let scoreSubmitted = false;
let loadingLeaderboard = false;
let leaderboardRequest = 0;
let lastSubmission = null;

const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const input1 = document.getElementById("name");
const gameArea = document.getElementById("gameArea");
const startSection = document.getElementById("startSection");
const endSection = document.getElementById("endSection");
const finalScore = document.getElementById("finalScore");
const scoreForm = document.getElementById("scoreForm");
const formMessage = document.getElementById("formMessage");
const gameStatus = document.getElementById("gameStatus");
const playAgain = document.getElementById("playAgain");
const scoreboard = document.getElementById("scoreboard");
const leaderboardDialog = document.getElementById("leaderboardDialog");
const leaderboardMessage = document.getElementById("leaderboardMessage");
const refreshLeaderboard = document.getElementById("refreshLeaderboard");
const closeLeaderboard = document.getElementById("closeLeaderboard");
const modalPlayAgain = document.getElementById("modalPlayAgain");

button1.addEventListener("click", startGame);
scoreForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitHighScore();
});
button3.addEventListener("click", () => loadScoreboard());
refreshLeaderboard.addEventListener("click", () => loadScoreboard());
closeLeaderboard.addEventListener("click", () => leaderboardDialog.close());
playAgain.addEventListener("click", restartGame);
modalPlayAgain.addEventListener("click", restartGame);

leaderboardDialog.addEventListener("close", () => {
  if (!button3.disabled) button3.focus();
});

function updateHud() {
  scoreDisplay.textContent = String(score);
  scoreDisplay.setAttribute("aria-label", `Score: ${score}`);
  timerDisplay.replaceChildren(document.createTextNode(String(timeLeft)));
  const unit = document.createElement("span");
  unit.className = "time-unit";
  unit.textContent = "s";
  timerDisplay.appendChild(unit);
  timerDisplay.setAttribute("aria-label", `${timeLeft} seconds remaining`);
  timerDisplay.classList.toggle("is-urgent", timeLeft <= 10 && gameStarted);
}

function startGame() {
  if (gameStarted || submissionPending) return;

  gameStarted = true;
  gameEnded = false;
  startSection.hidden = true;
  endSection.hidden = true;
  button3.disabled = true;
  gameStatus.textContent = "Click or tap a rocket to score a point.";
  updateHud();

  interval = setInterval(countdown, 1000);
  rocketInterval = setInterval(spawnRocket, ROCKET_INTERVAL);
}

function countdown() {
  timeLeft = Math.max(0, timeLeft - 1);
  updateHud();

  if (timeLeft === 10) gameStatus.textContent = "10 seconds left!";
  if (timeLeft === 0) endGame();
}

function endGame() {
  if (gameEnded) return;

  gameEnded = true;
  clearInterval(interval);
  clearInterval(rocketInterval);
  interval = null;
  rocketInterval = null;
  gameArea.replaceChildren();
  finalScore.textContent = String(score);
  endSection.hidden = false;
  button3.disabled = loadingLeaderboard;
  gameStatus.textContent = `Time's up! You scored ${score} points.`;
  input1.focus({ preventScroll: true });
}

function spawnRocket() {
  if (!gameStarted || gameEnded) return;

  const rocket = document.createElement("button");
  rocket.type = "button";
  rocket.className = "rocket";
  rocket.setAttribute("aria-label", "Shoot rocket");

  // A proportional position keeps each rocket inside the arena when it resizes.
  const size = parseFloat(getComputedStyle(gameArea).getPropertyValue("--rocket-size")) || 52;
  const x = Math.random();
  const y = Math.random();
  rocket.style.left = `calc(${x * 100}% - ${x * size}px)`;
  rocket.style.top = `calc(${y * 100}% - ${y * size}px)`;

  rocket.addEventListener("click", () => {
    if (!gameStarted || gameEnded) return;

    score += 1;
    scoreDisplay.textContent = String(score);
    scoreDisplay.setAttribute("aria-label", `Score: ${score}`);
    showScorePop(rocket);
    rocket.remove();
  }, { once: true });

  gameArea.appendChild(rocket);
}

function showScorePop(rocket) {
  const pop = document.createElement("span");
  pop.className = "score-pop";
  pop.textContent = "+1";
  pop.setAttribute("aria-hidden", "true");
  pop.style.left = rocket.style.left;
  pop.style.top = rocket.style.top;
  gameArea.appendChild(pop);
  setTimeout(() => pop.remove(), 550);
}

function showFormMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("is-error", isError);
}

async function submitHighScore() {
  if (!gameEnded || submissionPending || scoreSubmitted) return;

  const name = input1.value.trim();
  if (name.length < 3 || name.length > 16) {
    showFormMessage("Please enter a name between 3 and 16 characters.", true);
    input1.setAttribute("aria-invalid", "true");
    input1.focus();
    return;
  }

  input1.removeAttribute("aria-invalid");
  const submittedScore = score;
  submissionPending = true;
  button2.disabled = true;
  input1.disabled = true;
  playAgain.disabled = true;
  button3.disabled = true;
  button2.textContent = "Submitting…";
  showFormMessage("Saving your score…");

  try {
    const player = await getPlayer();
    const savedDocument = await addDoc(collection(db, "scores"), {
      name,
      score: submittedScore,
      uid: player.uid,
      createdAt: serverTimestamp(),
    });

    lastSubmission = { id: savedDocument.id, score: submittedScore };
    scoreSubmitted = true;
    scoreForm.hidden = true;
    showFormMessage("Score saved! Open the leaderboard anytime.");
  } catch (error) {
    console.error("Score submission failed:", error);
    showFormMessage("Could not save your score. Please try again.", true);
  } finally {
    submissionPending = false;
    button2.disabled = false;
    input1.disabled = false;
    playAgain.disabled = false;
    button3.disabled = loadingLeaderboard;
    button2.textContent = "Submit score";
  }

  // Open the leaderboard automatically; no alert or OK step.
  if (scoreSubmitted) await loadScoreboard();
}

function showTableMessage(message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 3;
  cell.className = "empty-row";
  cell.textContent = message;
  row.appendChild(cell);
  scoreboard.replaceChildren(row);
}

async function loadScoreboard() {
  if (loadingLeaderboard || submissionPending || (gameStarted && !gameEnded)) return;

  const request = ++leaderboardRequest;
  loadingLeaderboard = true;
  button3.disabled = true;
  refreshLeaderboard.disabled = true;
  const savedMessage = lastSubmission ? `Score saved! Your score: ${lastSubmission.score}. ` : "";
  leaderboardMessage.textContent = `${savedMessage}Loading leaderboard…`;
  showTableMessage("Loading…");

  try {
    if (!leaderboardDialog.open) leaderboardDialog.showModal();

    const topScores = query(collection(db, "scores"), orderBy("score", "desc"), limit(20));
    const snapshot = await getDocs(topScores);
    if (request !== leaderboardRequest) return;

    scoreboard.replaceChildren();
    leaderboardMessage.textContent = savedMessage || "The highest scores from all players.";

    if (snapshot.empty) showTableMessage("No scores yet. Be the first!");

    snapshot.docs.forEach((scoreDocument, index) => {
      const entry = scoreDocument.data();
      const row = document.createElement("tr");
      if (index < 3) row.classList.add(`rank-${index + 1}`);
      if (scoreDocument.id === lastSubmission?.id) row.classList.add("is-yours");

      const rankCell = document.createElement("td");
      const rankBadge = document.createElement("span");
      rankBadge.className = "rank-badge";
      rankBadge.textContent = String(index + 1);
      rankCell.appendChild(rankBadge);

      const nameCell = document.createElement("td");
      nameCell.textContent = String(entry.name ?? "Player");
      const scoreCell = document.createElement("td");
      scoreCell.textContent = String(entry.score ?? 0);

      row.append(rankCell, nameCell, scoreCell);
      scoreboard.appendChild(row);
    });
  } catch (error) {
    if (request !== leaderboardRequest) return;
    console.error("Leaderboard loading failed:", error);
    leaderboardMessage.textContent = `${savedMessage}Could not load the leaderboard. Select Refresh to retry.`;
    showTableMessage("Leaderboard unavailable.");
  } finally {
    if (request === leaderboardRequest) {
      loadingLeaderboard = false;
      refreshLeaderboard.disabled = false;
      button3.disabled = gameStarted && !gameEnded;
    }
  }
}

function restartGame() {
  if (submissionPending) return;
  if (leaderboardDialog.open) leaderboardDialog.close();

  clearInterval(interval);
  clearInterval(rocketInterval);
  interval = null;
  rocketInterval = null;
  // Ignore an earlier leaderboard request if it completes after restarting.
  leaderboardRequest += 1;
  loadingLeaderboard = false;
  refreshLeaderboard.disabled = false;
  button3.disabled = false;

  score = 0;
  timeLeft = GAME_SECONDS;
  gameStarted = false;
  gameEnded = false;
  scoreSubmitted = false;
  lastSubmission = null;
  gameArea.replaceChildren();
  endSection.hidden = true;
  startSection.hidden = false;
  scoreForm.hidden = false;
  input1.value = "";
  input1.disabled = false;
  input1.removeAttribute("aria-invalid");
  button2.disabled = false;
  button2.textContent = "Submit score";
  showFormMessage("");
  gameStatus.textContent = "60 seconds. How high can you score?";
  updateHud();
  button1.focus({ preventScroll: true });
}

updateHud();

