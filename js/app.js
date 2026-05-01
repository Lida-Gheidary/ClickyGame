// Click a button or object to earn points so that I can increase my score.
// See my current score during the game so that I know how well I am doing.

// See a countdown timer so that I know how much time is left. setInterval();

// Variables
let score = 0;
//Correcting time to 60 seconds//
let timeLeft = 60;
let gameStarted = false;
let gameEnded = false;
let interval = null;

// HTML DOM
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const label1 = document.getElementById('label1');
const input1 = document.getElementById('name');
const scoreboard = document.getElementById('scoreboard');
const button3 = document.getElementById('button3')

// UI Functions & Events
button1.addEventListener('click', () => {
  if (!gameEnded) {
    increaseScore();
  }

  if (!gameStarted) {
    startGame();
  }
})

button2.addEventListener('click', () => {
  submitHighScore();
})

// Show the scoreboard when the button is clicked //
button3.addEventListener('click', () => {
  loadScoreboard();
});

input1.style.display = 'none';
label1.style.display = 'none';
button2.style.display = 'none';
button3.style.display = 'none';

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
  button1.style.display = 'none';
  input1.style.display = 'block';
  label1.style.display = 'block';
  button2.style.display = 'block';
  
}
// Sends player's name and score to the shared scoreboard API prepared by Ben
async function submitHighScore() {
  const name = input1.value;

  try {
    const response = await fetch("https://hooks.zapier.com/hooks/catch/8338993/ujs9jj9/", {
      method: "POST",
      body: JSON.stringify({ name: name, score: score }),
    });

    if (response.ok) {
      alert("Score submitted successfully!");
      button2.style.display = 'none';
      input1.style.display = 'none';
      label1.style.display = 'none';
      button3.style.display = 'block';
    } else {
      alert("Something went wrong. Score not submitted.");
    }

  } catch (error) {
    // Handles network errors or API being unreachable
    alert("Error: Could not connect to scoreboard.");
  }
}

// Fetches and displays the scoreboard sorted by highest score //
async function loadScoreboard() {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbys5aEPMvNCutyhNYYCcQcCjzsi2UtqNspmKyCH-AicJxJbCJMrAoT0LUaYaXhTWA8n/exec");
    const data = await response.json();

    data.sort((a, b) => b.score - a.score);

    scoreboard.innerHTML = "";
    data.forEach((entry, index) => {
      scoreboard.innerHTML += `<p>${index + 1}. ${entry.name} — ${entry.score}</p>`;
    });

  } catch (error) {
    // Handles failure to load scoreboard data //
    scoreboard.innerText = "Could not load scoreboard.";
  }
}