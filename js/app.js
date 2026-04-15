// Click a button or object to earn points so that I can increase my score.
// See my current score during the game so that I know how well I am doing.

// See a countdown timer so that I know how much time is left. setInterval();

// Variables
let score = 0;

// HTML DOM
const button1 = document.getElementById('button1');
const scoreDisplay = document.getElementById('scoreDisplay');

// UI Functions
button1.addEventListener('click', () => {
  increaseScore();
})

// Functions
function increaseScore() {
  score++;
  scoreDisplay.innerText = score;
}
