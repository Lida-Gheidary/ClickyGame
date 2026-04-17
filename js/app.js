// Click a button or object to earn points so that I can increase my score.
// See my current score during the game so that I know how well I am doing.

// See a countdown timer so that I know how much time is left. setInterval();

// Variables
let score = 0;
let timeLeft = 60;

// HTML DOM
const button1 = document.getElementById('button1');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
// UI Functions & Events
button1.addEventListener('click', () => {
  increaseScore();
})

// TODO: Start only when "Click Me is Clicked"
setInterval(countdown,  1000);

// Functions
function increaseScore() {
  score++;
  scoreDisplay.innerText = score;
}

function countdown() {
  timeLeft--;
  timerDisplay.innerText = timeLeft;
  // TODO: Stop timer at the end.
}
