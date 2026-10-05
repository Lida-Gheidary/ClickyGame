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

// Game state
let score = 0;
let timeLeft = 60;
let gameStarted = false;
let gameEnded = false;
let interval = null;
let rocketInterval = null;
let loadingLeaderboard = false;

// Game elements
const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const label1 = document.getElementById("label1");
const input1 = document.getElementById("name");
const gameArea = document.getElementById("gameArea");
const endSection = document.getElementById("endSection");
const finalScore = document.getElementById("finalScore");
const playAgain = document.getElementById("playAgain");

// Leaderboard popup elements
const scoreboard = document.getElementById("scoreboard");
const leaderboardDialog = document.getElementById("leaderboardDialog");
const leaderboardMessage = document.getElementById("leaderboardMessage");
const refreshLeaderboard = document.getElementById("refreshLeaderboard");
const closeLeaderboard = document.getElementById("closeLeaderboard");
const modalPlayAgain = document.getElementById("modalPlayAgain");

// Initial display
gameArea.style.display = "none";

// Button events
button1.addEventListener("click", () => {
  if (!gameStarted) {
    startGame();
    gameArea.style.display = "block";
    button1.style.display = "none";
  }
});

button2.addEventListener("click", () => {
  submitHighScore();
});

button3.addEventListener("click", () => {
  loadScoreboard();
});

refreshLeaderboard.addEventListener("click", () => {
  loadScoreboard();
});

closeLeaderboard.addEventListener("click", () => {
  leaderboardDialog.close();
});

leaderboardDialog.addEventListener("close", () => {
  button3.focus();
});

playAgain.addEventListener("click", restartGame);
modalPlayAgain.addEventListener("click", restartGame);

function restartGame() {
  location.reload();
}

// Increase the score when a rocket is clicked
function increaseScore() {
  score++;
  scoreDisplay.innerText = "⭐ " + score;
}

// Update the timer once per second
function countdown() {
  timeLeft--;
  timerDisplay.innerText = "⏱ " + timeLeft;

  if (timeLeft <= 0) {
    timerDisplay.innerText = "⏱ 0";
    endGame();
  }
}

// Start the countdown and rocket spawning
function startGame() {
  gameStarted = true;
  interval = setInterval(countdown, 1000);
  rocketInterval = setInterval(spawnRocket, 200);
}

// Stop the game and show the submission controls
function endGame() {
  gameEnded = true;

  clearInterval(interval);
  clearInterval(rocketInterval);

  gameArea.innerHTML = "";
  button1.style.display = "none";
  endSection.style.display = "flex";
  button3.style.display = "none";

  finalScore.style.display = "block";
  finalScore.innerText = "⭐ Your score: " + score;
}

// Create a rocket at a random position
function spawnRocket() {
  const rocket = document.createElement("div");

  rocket.classList.add("rocket");
  rocket.innerText = "🚀";
  rocket.style.left = Math.random() * 520 + "px";
  rocket.style.top = Math.random() * 210 + "px";

  rocket.addEventListener("click", () => {
    if (gameEnded) return;

    increaseScore();
    rocket.remove();
  });

  gameArea.appendChild(rocket);
}

// Save the score, then automatically open the leaderboard
async function submitHighScore() {
  if (!gameEnded || button2.disabled) return;

  const name = input1.value.trim();

  if (name.length < 3 || name.length > 16) {
    alert("Please enter a name between 3 and 16 characters.");
    return;
  }

  button2.disabled = true;
  input1.disabled = true;
  button2.textContent = "Submitting…";

  try {
    const player = await getPlayer();

    await addDoc(collection(db, "scores"), {
      name: name,
      score: score,
      uid: player.uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Score submission failed:", error);
    alert("Could not submit your score. Please try again.");

    button2.disabled = false;
    input1.disabled = false;
    button2.textContent = "Submit Score";
    return;
  }

  button2.style.display = "none";
  input1.style.display = "none";
  label1.style.display = "none";
  button3.style.display = "block";
  button3.textContent = "Show Leaderboard";

  // No success alert or OK click is needed
  await loadScoreboard(true);
}

// Open the popup and fetch the highest scores
async function loadScoreboard(justSubmitted = false) {
  if (loadingLeaderboard) return;

  loadingLeaderboard = true;
  button3.disabled = true;
  refreshLeaderboard.disabled = true;

  try {
    leaderboardMessage.textContent = justSubmitted
      ? `Score saved! Your score: ${score}. Loading leaderboard…`
      : "Loading leaderboard…";

    scoreboard.replaceChildren();

    // Open immediately while Firebase loads the scores
    if (!leaderboardDialog.open) {
      leaderboardDialog.showModal();
    }

    const topScores = query(
      collection(db, "scores"),
      orderBy("score", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(topScores);

    leaderboardMessage.textContent = justSubmitted
      ? `Score saved! Your score: ${score}.`
      : "The highest scores from all players.";

    if (snapshot.empty) {
      const message = document.createElement("p");
      message.textContent = "No scores yet.";
      scoreboard.appendChild(message);
    }

    snapshot.docs.forEach((scoreDocument, index) => {
      const entry = scoreDocument.data();
      const row = document.createElement("p");

      row.textContent = `${index + 1}. ${entry.name} — ${entry.score}`;
      scoreboard.appendChild(row);
    });
  } catch (error) {
    console.error("Leaderboard loading failed:", error);

    leaderboardMessage.textContent = justSubmitted
      ? "Your score was saved, but the leaderboard could not load. Click Refresh to retry."
      : "Could not load the leaderboard. Click Refresh to retry.";
  } finally {
    loadingLeaderboard = false;
    button3.disabled = false;
    refreshLeaderboard.disabled = false;
  }
}