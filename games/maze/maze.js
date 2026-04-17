const maze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
];

const start = { x: 0, y: 1 };
const exit = { x: 17, y: 18 };

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const resetButton = document.getElementById("resetButton");
const winModal = document.getElementById("winModal");
const treeImage = new Image();

treeImage.src = "../assets/img/tree.png";
treeImage.addEventListener("load", drawMaze);

const tileSize = canvas.width / maze[0].length;
const moveDuration = 140;
const tileOverlap = 0.6;

const state = {
  player: {
    tileX: start.x,
    tileY: start.y,
    drawX: start.x,
    drawY: start.y,
    fromX: start.x,
    fromY: start.y,
    toX: start.x,
    toY: start.y,
    moveStartTime: 0,
    progress: 0,
    moving: false,
  },
  won: false,
};

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      const x = col * tileSize;
      const y = row * tileSize;

      if (maze[row][col] === 1) {
        drawWallTile(x, y);
      } else {
        ctx.fillStyle = "#8f9b6f";
        ctx.fillRect(
          x - tileOverlap / 2,
          y - tileOverlap / 2,
          tileSize + tileOverlap,
          tileSize + tileOverlap,
        );
      }
    }
  }

  drawExit();
  drawPlayer();
}

function drawWallTile(x, y) {
  ctx.fillStyle = "#8f9b6f";
  ctx.fillRect(
    x - tileOverlap / 2,
    y - tileOverlap / 2,
    tileSize + tileOverlap,
    tileSize + tileOverlap,
  );

  if (treeImage.complete && treeImage.naturalWidth > 0) {
    const inset = Math.max(1, tileSize * 0.04);
    ctx.drawImage(
      treeImage,
      x + inset,
      y + inset,
      tileSize - inset * 2,
      tileSize - inset * 2,
    );
    return;
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
}

function drawExit() {
  const x = exit.x * tileSize;
  const y = exit.y * tileSize;

  ctx.fillStyle = "#70e000";
  ctx.fillRect(x + 6, y + 6, tileSize - 12, tileSize - 12);

  ctx.strokeStyle = "#3a8600";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 6, y + 6, tileSize - 12, tileSize - 12);
}

function drawPlayer() {
  const centerX = state.player.drawX * tileSize + tileSize / 2;
  const centerY =
    state.player.drawY * tileSize +
    tileSize / 2 -
    Math.sin(state.player.progress * Math.PI) * tileSize * 0.08;
  const radius = tileSize * 0.24;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff5d73";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX - 4, centerY - 5, radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();
}

function isWalkable(x, y) {
  return maze[y]?.[x] === 0;
}

function checkWin() {
  if (state.player.tileX === exit.x && state.player.tileY === exit.y) {
    state.won = true;
    drawMaze();
    showWinModal();
  }
}

function showWinModal() {
  winModal.classList.remove("hidden");
  winModal.setAttribute("aria-hidden", "false");
}

function hideWinModal() {
  winModal.classList.add("hidden");
  winModal.setAttribute("aria-hidden", "true");
}

function movePlayer(dx, dy) {
  if (state.won || state.player.moving) {
    return;
  }

  const nextX = state.player.tileX + dx;
  const nextY = state.player.tileY + dy;

  if (!isWalkable(nextX, nextY) && !(nextX === exit.x && nextY === exit.y)) {
    return;
  }

  state.player.fromX = state.player.tileX;
  state.player.fromY = state.player.tileY;
  state.player.toX = nextX;
  state.player.toY = nextY;
  state.player.tileX = nextX;
  state.player.tileY = nextY;
  state.player.moveStartTime = performance.now();
  state.player.progress = 0;
  state.player.moving = true;

  window.requestAnimationFrame(animatePlayerStep);
}

function animatePlayerStep(timestamp) {
  const elapsed = timestamp - state.player.moveStartTime;
  const linearProgress = Math.min(elapsed / moveDuration, 1);
  const easedProgress = 1 - (1 - linearProgress) ** 3;

  state.player.progress = linearProgress;
  state.player.drawX =
    state.player.fromX +
    (state.player.toX - state.player.fromX) * easedProgress;
  state.player.drawY =
    state.player.fromY +
    (state.player.toY - state.player.fromY) * easedProgress;

  drawMaze();

  if (linearProgress < 1) {
    window.requestAnimationFrame(animatePlayerStep);
    return;
  }

  state.player.drawX = state.player.toX;
  state.player.drawY = state.player.toY;
  state.player.progress = 0;
  state.player.moving = false;
  drawMaze();
  checkWin();
}

function resetGame() {
  state.player = {
    tileX: start.x,
    tileY: start.y,
    drawX: start.x,
    drawY: start.y,
    fromX: start.x,
    fromY: start.y,
    toX: start.x,
    toY: start.y,
    moveStartTime: 0,
    progress: 0,
    moving: false,
  };
  state.won = false;
  hideWinModal();
  drawMaze();
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();

  if (
    [
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "w",
      "a",
      "s",
      "d",
    ].includes(key)
  ) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") {
    movePlayer(0, -1);
  } else if (key === "arrowdown" || key === "s") {
    movePlayer(0, 1);
  } else if (key === "arrowleft" || key === "a") {
    movePlayer(-1, 0);
  } else if (key === "arrowright" || key === "d") {
    movePlayer(1, 0);
  }
}

window.addEventListener("keydown", handleKeydown);
resetButton.addEventListener("click", resetGame);

resetGame();
