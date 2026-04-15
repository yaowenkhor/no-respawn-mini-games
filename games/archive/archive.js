const initialStones = [
  { id: "v1-2", rune: "triangle ||", version: "v1.2", order: 3 },
  { id: "v1-0", rune: "triangle", version: "v1.0", order: 1 },
  { id: "v1-3", rune: "triangle |||", version: "v1.3", order: 4 },
  { id: "v1-1", rune: "triangle |", version: "v1.1", order: 2 },
  { id: "v1-1-1", rune: "triangle | dot", version: "v1.1.1", order: 2.5 },
];

const stoneTray = document.getElementById("stoneTray");
const statusText = document.getElementById("statusText");
const checkButton = document.getElementById("checkButton");
const hintButton = document.getElementById("hintButton");
const legendBox = document.getElementById("legendBox");
const resetButton = document.getElementById("resetButton");
const winModal = document.getElementById("winModal");
const memoryModal = document.getElementById("memoryModal");
const closeMemoryButton = document.getElementById("closeMemoryButton");

const state = {
  stones: initialStones.map((stone) => ({ ...stone })),
  draggedIndex: null,
  isAnimating: false,
  won: false,
};

let hintVisible = false;

function renderStones() {
  stoneTray.innerHTML = "";

  state.stones.forEach((stone, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stone";
    button.dataset.index = String(index);
    button.dataset.stoneId = stone.id;
    button.draggable = !state.won && !state.isAnimating;

    button.innerHTML = `
      <span class="stone-rune">${stone.rune}</span>
      <span class="stone-version">${stone.version}</span>
    `;

    button.addEventListener("dragstart", (event) => handleDragStart(event, index));
    button.addEventListener("dragend", handleDragEnd);
    button.addEventListener("dragover", handleDragOver);
    button.addEventListener("dragleave", handleDragLeave);
    button.addEventListener("drop", (event) => {
      void handleDrop(event, index);
    });

    stoneTray.appendChild(button);
  });
}

function handleDragStart(event, index) {
  if (state.isAnimating) {
    event.preventDefault();
    return;
  }

  state.draggedIndex = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(index));
  event.currentTarget.classList.add("dragging");
  statusText.textContent = "Drop the stone onto another stone to swap them.";
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove("dragging");
  clearDropTargets();

  if (!state.won && !state.isAnimating) {
    statusText.textContent = "Drag the stones into place, then check the sequence.";
  }
}

function handleDragOver(event) {
  if (state.won || state.isAnimating || state.draggedIndex === null) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  event.currentTarget.classList.add("drop-target");
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("drop-target");
}

async function handleDrop(event, targetIndex) {
  if (state.won || state.isAnimating) {
    return;
  }

  event.preventDefault();
  event.currentTarget.classList.remove("drop-target");

  const sourceIndex = Number(event.dataTransfer.getData("text/plain"));

  if (Number.isNaN(sourceIndex) || sourceIndex === targetIndex) {
    state.draggedIndex = null;
    return;
  }

  await animateSwap(sourceIndex, targetIndex);
  state.draggedIndex = null;
  statusText.textContent = "Arrangement updated. Check the sequence when ready.";
}

function clearDropTargets() {
  document.querySelectorAll(".stone.drop-target").forEach((stone) => {
    stone.classList.remove("drop-target");
  });
}

function swapStones(firstIndex, secondIndex) {
  [state.stones[firstIndex], state.stones[secondIndex]] = [
    state.stones[secondIndex],
    state.stones[firstIndex],
  ];
}

async function animateSwap(sourceIndex, targetIndex) {
  state.isAnimating = true;
  const firstPositions = captureStonePositions();

  swapStones(sourceIndex, targetIndex);
  renderStones();

  const animations = [];

  stoneTray.querySelectorAll(".stone").forEach((stoneElement) => {
    const firstPosition = firstPositions.get(stoneElement.dataset.stoneId);

    if (!firstPosition) {
      return;
    }

    const lastPosition = stoneElement.getBoundingClientRect();
    const deltaX = firstPosition.left - lastPosition.left;
    const deltaY = firstPosition.top - lastPosition.top;

    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    const animation = stoneElement.animate(
      [
        { transform: `translate(${deltaX}px, ${deltaY}px)` },
        { transform: "translate(0, 0)" },
      ],
      {
        duration: 260,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );

    animations.push(animation.finished.catch(() => {}));
  });

  await Promise.all(animations);
  state.isAnimating = false;
  renderStones();
}

function captureStonePositions() {
  const positions = new Map();

  stoneTray.querySelectorAll(".stone").forEach((stoneElement) => {
    positions.set(stoneElement.dataset.stoneId, stoneElement.getBoundingClientRect());
  });

  return positions;
}

function checkSequence() {
  const inOrder = state.stones.every((stone, index, stones) => {
    if (index === 0) {
      return true;
    }

    return stones[index - 1].order < stone.order;
  });

  if (inOrder) {
    state.won = true;
    statusText.textContent = "The archive opens. The sequence is correct.";
    showWinModal();
  } else {
    statusText.textContent = "The stones reject the order. An echo answers back.";
    showMemoryModal();
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

function showMemoryModal() {
  memoryModal.classList.remove("hidden");
  memoryModal.setAttribute("aria-hidden", "false");
}

function hideMemoryModal() {
  memoryModal.classList.add("hidden");
  memoryModal.setAttribute("aria-hidden", "true");
}

function syncHintUI() {
  legendBox.classList.toggle("hidden", !hintVisible);
  hintButton.textContent = hintVisible ? "Hide Hint" : "Show Hint";
}

function toggleHint() {
  hintVisible = !hintVisible;
  syncHintUI();
}

function resetGame() {
  state.stones = initialStones.map((stone) => ({ ...stone }));
  state.draggedIndex = null;
  state.isAnimating = false;
  state.won = false;
  statusText.textContent = "Drag the stones into place, then check the sequence.";
  hideWinModal();
  hideMemoryModal();
  renderStones();
}

checkButton.addEventListener("click", checkSequence);
hintButton.addEventListener("click", toggleHint);
resetButton.addEventListener("click", resetGame);
closeMemoryButton.addEventListener("click", hideMemoryModal);

syncHintUI();
resetGame();
