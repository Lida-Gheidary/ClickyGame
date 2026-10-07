# 🚀 Rocket Clicker

**How many rockets can you shoot in 60 seconds?!**

A space-themed game where you click or tap rockets to earn points before time runs out. Submit your score to compete on a shared Firebase leaderboard.

## How to Play

1. Select **Start game** to begin.
2. Click or tap the rockets. Each rocket earns one point.
3. When the 60 seconds end, enter your name and select **Submit score**.
4. The **Top 20 leaderboard** opens automatically after submission.
5. Select **Play again** to try to beat your score.

## Best Played On

**Best played on a touchscreen!** You can also play with a mouse.

The responsive layout adapts to desktop, tablet, and mobile screens.

## Features

- 60-second rounds with a visible score and countdown
- Custom monochrome rocket graphics
- Dark space background and Orbitron typography
- Shared leaderboard showing the 20 highest scores
- Automatic leaderboard popup after saving your score
- Your newly submitted entry is highlighted if it reaches the top 20

## Built With

- **HTML, CSS, and JavaScript:** interface and gameplay
- **Firebase Cloud Firestore:** score storage and leaderboard queries
- **Firebase Anonymous Authentication:** player identification without a signup form
- **Webpack:** development server and production builds
- **GitHub Pages and GitHub Actions:** hosting and automated deployment

## Run Locally

Install dependencies and start the development server:

```bash
npm install
npm start
```

In Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is blocked.

Open the localhost address printed in the terminal.

## Production Build

```bash
npm run build
```

The build generates the website in `dist`. The GitHub Actions workflow builds and deploys it when changes are pushed to `main`.

## Notes

- Player names must contain 3 to 16 characters after trimming spaces.
- Scoring stops when the timer reaches zero.
- An internet connection is required to submit scores and load the leaderboard.