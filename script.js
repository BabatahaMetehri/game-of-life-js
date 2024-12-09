"use strict";

const gameContainer = document.querySelector(".game");
const modal = document.getElementById("myModal");
const acceptBtn = document.querySelector(".accept");
const cancelBtn = document.querySelector(".cancel");
const exitBtn = document.querySelector(".close");

// const WIDTH = Math.floor(gameContainer.offsetWidth / 100) * 100;
// const HEIGHT = Math.floor(gameContainer.offsetHeight / 100) * 100;

const WIDTH = gameContainer.offsetWidth;
const HEIGHT = gameContainer.offsetHeight;

// console.log(WIDTH, HEIGHT);
// gameContainer.style.width = `${WIDTH}px`;
// gameContainer.style.height = `${HEIGHT}px`;

const cellWidth = 20;
const rows = Math.floor(HEIGHT / cellWidth);
const cols = Math.floor(WIDTH / cellWidth);
const whiteColor = "#fff";
const blackColor = "#000";
let gameMatrix = [];
let gameOngoing = false;
let counter;
let SavedMatrices = [];
let savedMatrixIndex = -1;

const initGameMatrix = function () {
  for (let i = 0; i < rows; i++) {
    const col = [];
    for (let j = 0; j < cols; j++) {
      col[j] = 0;
    }
    gameMatrix[i] = col;
  }
};

const randomGameMatrix = function () {
  for (let i = 0; i < rows; i++) {
    const col = [];
    for (let j = 0; j < cols; j++) {
      col[j] = Number(
        Math.random() >= 0.5 && Math.random() >= 0.5 && Math.random() >= 0.5
      );
    }
    gameMatrix[i] = col;
  }
};

const clearContainer = function () {
  gameContainer.innerHTML = "";
};

const resetGame = function () {
  gameMatrix = gameMatrix.map((arr) => arr.map((val) => 0));
  drawMatrix();
  if (counter) endSimulation();
};

const drawMatrix = function () {
  clearContainer();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const color = gameMatrix[i][j] ? whiteColor : blackColor;
      const html = `
    <div class="cell" style="width:${cellWidth}px; height:${cellWidth}px; background-color:${color}; display:inline-block"></div>
    `;
      gameContainer.insertAdjacentHTML("beforeend", html);
    }
  }
};

const countNeighbours = function (i, j) {
  let neighbours = 0;
  // upper
  if (i > 0) neighbours += gameMatrix[i - 1][j];
  // upper left
  if (i > 0 && j > 0) neighbours += gameMatrix[i - 1][j - 1];
  // upper right
  if (i > 0 && j < cols - 1) neighbours += gameMatrix[i - 1][j + 1];
  // left
  if (j > 0) neighbours += gameMatrix[i][j - 1];
  // right
  if (j < cols - 1) neighbours += gameMatrix[i][j + 1];
  // bottom
  if (i < rows - 1) neighbours += gameMatrix[i + 1][j];
  // bottom left
  if (i < rows - 1 && j > 0) neighbours += gameMatrix[i + 1][j - 1];
  // bottom right
  if (i < rows - 1 && j < cols - 1) neighbours += gameMatrix[i + 1][j + 1];

  return neighbours;
};

const gameLogic = function (gameMatrix) {
  const newMatrix = gameMatrix.map((arr) => arr.slice());
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = gameMatrix[i][j];
      const neighboursCount = countNeighbours(i, j);

      // rule 1
      if (cell && neighboursCount < 2) newMatrix[i][j] = 0;

      // rule 2
      if (cell && (neighboursCount === 2 || neighboursCount === 3))
        newMatrix[i][j] = 1;

      // rule 3
      if (cell && neighboursCount > 3) newMatrix[i][j] = 0;

      // rule 4
      if (!cell && neighboursCount === 3) newMatrix[i][j] = 1;
    }
  }

  return newMatrix;
};

const endSimulation = function () {
  gameOngoing = false;
  clearInterval(counter);
};

const game = function () {
  let counter = setInterval(() => {
    console.log("Interval ongoing...");
    gameOngoing = true;
    const nextMatrix = gameLogic(gameMatrix);

    if (JSON.stringify(gameMatrix) === JSON.stringify(nextMatrix))
      endSimulation();

    gameMatrix = nextMatrix;
    if (!gameMatrix.flat().some((val) => val)) endSimulation();

    drawMatrix();
  }, 100);

  return counter;
};

const showModal = function () {
  modal.classList.remove("hidden");
};

const hideModal = function () {
  modal.classList.add("hidden");
};

const savePatterns = function () {
  const patterns = JSON.stringify(SavedMatrices);
  window.localStorage.removeItem("patterns");
  window.localStorage.setItem("patterns", patterns);
};

const clearHistory = function () {
  SavedMatrices = [];
  savePatterns();
};

const loadHistory = function () {
  const patterns = window.localStorage.getItem("patterns");
  if (patterns) SavedMatrices = JSON.parse(patterns);
};

///////////////////////////////////////////////// EVENTS
// Clear board with Backspace
document.addEventListener("keydown", function (e) {
  if (e.key === "Backspace") resetGame();
  if (e.key === " ") {
    if (!gameOngoing) {
      if (gameMatrix.flat().some((val) => val)) counter = game();
    } else {
      endSimulation();
    }
  }
  if (e.key.toLowerCase() === "r") {
    if (counter) endSimulation();
    randomGameMatrix();
    drawMatrix();
  }
  if (e.key.toLowerCase() === "s" && !gameOngoing) {
    SavedMatrices.push(gameMatrix);
    savePatterns();
  }
  if (e.key === "Enter" && SavedMatrices.at(-1) && !gameOngoing) {
    savedMatrixIndex = -1;
    gameMatrix = SavedMatrices.at(-1);
    drawMatrix();
  }
  if (e.key === "ArrowLeft" && !gameOngoing)
    if (-savedMatrixIndex <= SavedMatrices.length - 1) {
      savedMatrixIndex--;
      gameMatrix = SavedMatrices.at(savedMatrixIndex);
      drawMatrix();
    }

  if (e.key === "ArrowRight" && !gameOngoing)
    if (savedMatrixIndex < -1) {
      savedMatrixIndex++;
      gameMatrix = SavedMatrices.at(savedMatrixIndex);
      drawMatrix();
    }
  if (e.key.toLowerCase() === "c") {
    showModal();
  }
  if (e.key === "Escape") hideModal();
});

// Draw cells using mouse
gameContainer.addEventListener("click", function (e) {
  const clicked = e.target.closest(".cell");
  if (!clicked) return;

  const pos = [...this.children].indexOf(clicked);
  const j = pos % cols;
  const i = (pos - j) / cols;
  gameMatrix[i][j] = 1 - gameMatrix[i][j];
  drawMatrix();
});

exitBtn.addEventListener("click", hideModal);
cancelBtn.addEventListener("click", hideModal);
acceptBtn.addEventListener("click", function () {
  clearHistory();
  hideModal();
});

initGameMatrix();
drawMatrix();
loadHistory();
