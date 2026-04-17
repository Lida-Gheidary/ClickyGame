// Click a button or object to earn points so that I can increase my score.
// See my current score during the game so that I know how well I am doing.

// See a countdown timer so that I know how much time is left. setInterval();

// Variables
let score = 0;
let timeLeft = 5;
let gameStarted = false;
let gameEnded = false;
let interval = null;

// HTML DOM
const button1 = document.getElementById('button1');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');

// UI Functions & Events
button1.addEventListener('click', () => {
  if (!gameEnded) {
    increaseScore();
  }

  if (!gameStarted) {
    startGame();
  }
})

// Functions
function increaseScore() {
  score++;
  scoreDisplay.innerText = score;
}

function countdown() {
  timeLeft--;
  timerDisplay.innerText = timeLeft;

  if (timeLeft <= 0) {
    timerDisplay.innerText = 0;
    endGame();
  }
}

function startGame() {
  interval = setInterval(countdown,  1000);
  gameStarted = true;
}

function endGame() {
  gameEnded = true;
  clearInterval(interval);
  // TODO: Make something appear for the user to input their name.
}
