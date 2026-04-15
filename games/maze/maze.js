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
const illusionModal = document.getElementById("illusionModal");
const illusionTitle = document.getElementById("illusionTitle");
const illusionText = document.getElementById("illusionText");
const closeIllusionButton = document.getElementById("closeIllusionButton");
const treeImage = new Image();
const playerImage = new Image();

treeImage.src = "../../assets/img/tree.png";
treeImage.addEventListener("load", drawMaze);
playerImage.src = "../../assets/img/jin_head.png";
playerImage.addEventListener("load", drawMaze);

const tileSize = canvas.width / maze[0].length;
const moveDuration = 140;
const tileOverlap = 0.6;
const illusionTriggers = [
  {
    x: 5,
    y: 3,
    title: "A crown of branches",
    text: "Jin sees himself claiming glory too early. This dead end can hold a fear, desire, or image later.",
  },
  {
    x: 15,
    y: 3,
    title: "The longbow's promise",
    text: "A whisper tempts Jin with power and praise. This is a placeholder encounter for a wrong-path illusion.",
  },
  {
    x: 9,
    y: 15,
    title: "Endfall's echo",
    text: "The woods show Jin a ruined future. You can replace this with custom text or a photo-based vision later.",
  },
];

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
  seenIllusions: new Set(),
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

  drawIllusionMarkers();
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

function drawIllusionMarkers() {
  illusionTriggers.forEach((trigger) => {
    const x = trigger.x * tileSize;
    const y = trigger.y * tileSize;

    ctx.fillStyle = "rgba(214, 47, 67, 0.88)";
    ctx.fillRect(x + 8, y + 8, tileSize - 16, tileSize - 16);

    ctx.strokeStyle = "rgba(120, 10, 24, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, y + 8, tileSize - 16, tileSize - 16);
  });
}

function drawPlayer() {
  const centerX = state.player.drawX * tileSize + tileSize / 2;
  const centerY =
    state.player.drawY * tileSize +
    tileSize / 2 -
    Math.sin(state.player.progress * Math.PI) * tileSize * 0.08;
  const spriteSize = tileSize * 0.62;

  if (playerImage.complete && playerImage.naturalWidth > 0) {
    ctx.drawImage(
      playerImage,
      centerX - spriteSize / 2,
      centerY - spriteSize / 2,
      spriteSize,
      spriteSize,
    );
    return;
  }

  const radius = tileSize * 0.24;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff5d73";
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

function showIllusion(trigger) {
  illusionTitle.textContent = trigger.title;
  illusionText.textContent = trigger.text;
  illusionModal.classList.remove("hidden");
  illusionModal.setAttribute("aria-hidden", "false");
}

function hideIllusion() {
  illusionModal.classList.add("hidden");
  illusionModal.setAttribute("aria-hidden", "true");
}

function checkIllusionTrigger() {
  const trigger = illusionTriggers.find(
    (entry) =>
      entry.x === state.player.tileX &&
      entry.y === state.player.tileY &&
      !state.seenIllusions.has(`${entry.x},${entry.y}`),
  );

  if (!trigger) {
    return;
  }

  state.seenIllusions.add(`${trigger.x},${trigger.y}`);
  showIllusion(trigger);
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
  checkIllusionTrigger();
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
  state.seenIllusions = new Set();
  state.won = false;
  hideWinModal();
  hideIllusion();
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
closeIllusionButton.addEventListener("click", hideIllusion);

resetGame();
