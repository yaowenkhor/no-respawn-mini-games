const fragmentDefinitions = [
  {
    id: "center",
    label: "Central prism",
    slot: "center",
    width: 76,
    height: 148,
    clipPath: "polygon(50% 0%, 92% 18%, 84% 100%, 16% 100%, 8% 18%)",
    slotX: 43,
    slotY: 58,
    trayX: 18,
    trayY: 38,
  },
  {
    id: "rear-left",
    label: "Rear left shard",
    slot: "rear-left",
    width: 58,
    height: 112,
    clipPath: "polygon(46% 0%, 88% 16%, 76% 100%, 18% 100%, 8% 20%)",
    slotX: 31,
    slotY: 60,
    trayX: 48,
    trayY: 28,
  },
  {
    id: "rear-right",
    label: "Rear right shard",
    slot: "rear-right",
    width: 56,
    height: 104,
    clipPath: "polygon(52% 0%, 90% 18%, 80% 100%, 18% 100%, 10% 16%)",
    slotX: 53,
    slotY: 61,
    trayX: 76,
    trayY: 40,
  },
  {
    id: "left",
    label: "Left edge shard",
    slot: "left",
    width: 52,
    height: 92,
    clipPath: "polygon(44% 0%, 90% 18%, 74% 100%, 16% 100%, 7% 26%)",
    slotX: 22,
    slotY: 66,
    trayX: 32,
    trayY: 70,
  },
  {
    id: "right",
    label: "Right needle shard",
    slot: "right",
    width: 44,
    height: 84,
    clipPath: "polygon(50% 0%, 88% 20%, 66% 100%, 24% 100%, 10% 18%)",
    slotX: 62,
    slotY: 69,
    trayX: 62,
    trayY: 72,
  },
];

const slotStyles = {
  left: {
    width: 52,
    height: 92,
    x: 22,
    y: 66,
    clipPath: "polygon(44% 0%, 90% 18%, 74% 100%, 16% 100%, 7% 26%)",
  },
  center: {
    width: 76,
    height: 148,
    x: 43,
    y: 58,
    clipPath: "polygon(50% 0%, 92% 18%, 84% 100%, 16% 100%, 8% 18%)",
  },
  "rear-left": {
    width: 58,
    height: 112,
    x: 31,
    y: 60,
    clipPath: "polygon(46% 0%, 88% 16%, 76% 100%, 18% 100%, 8% 20%)",
  },
  "rear-right": {
    width: 56,
    height: 104,
    x: 53,
    y: 61,
    clipPath: "polygon(52% 0%, 90% 18%, 80% 100%, 18% 100%, 10% 16%)",
  },
  right: {
    width: 44,
    height: 84,
    x: 62,
    y: 69,
    clipPath: "polygon(50% 0%, 88% 20%, 66% 100%, 24% 100%, 10% 18%)",
  },
};

const statusText = document.getElementById("statusText");
const resetButton = document.getElementById("resetButton");
const board = document.getElementById("board");
const fragmentTray = document.getElementById("fragmentTray");
const slotsLayer = document.getElementById("slotsLayer");
const winModal = document.getElementById("winModal");

const state = {
  fragments: [],
  draggedId: null,
  won: false,
};

function cloneFragments() {
  return fragmentDefinitions.map((fragment) => ({
    ...fragment,
    placed: false,
    x: fragment.trayX,
    y: fragment.trayY,
  }));
}

function initializeSlots() {
  slotsLayer.querySelectorAll(".slot").forEach((slotElement) => {
    const slot = slotStyles[slotElement.dataset.slot];
    slotElement.style.setProperty("--w", `${slot.width}px`);
    slotElement.style.setProperty("--h", `${slot.height}px`);
    slotElement.style.setProperty("--x", `${slot.x}%`);
    slotElement.style.setProperty("--y", `${slot.y}%`);
    slotElement.style.setProperty("--clip", slot.clipPath);
    slotElement.addEventListener("dragover", handleSlotDragOver);
    slotElement.addEventListener("dragleave", handleSlotDragLeave);
    slotElement.addEventListener("drop", handleSlotDrop);
  });
}

function setElementPosition(element, x, y) {
  element.style.setProperty("--x", `${x}%`);
  element.style.setProperty("--y", `${y}%`);
}

function renderFragments() {
  fragmentTray.innerHTML = "";
  board.querySelectorAll(".fragment").forEach((fragment) => fragment.remove());

  state.fragments.forEach((fragment) => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = `fragment${fragment.placed ? " placed" : ""}`;
    element.dataset.fragmentId = fragment.id;
    element.setAttribute("aria-label", fragment.label);
    element.style.setProperty("--w", `${fragment.width}px`);
    element.style.setProperty("--h", `${fragment.height}px`);
    element.style.setProperty("--clip", fragment.clipPath);
    setElementPosition(element, fragment.x, fragment.y);

    if (fragment.placed) {
      element.disabled = true;
      board.appendChild(element);
      return;
    }

    element.draggable = true;
    element.addEventListener("dragstart", (event) => handleDragStart(event, fragment.id));
    element.addEventListener("dragend", handleDragEnd);
    fragmentTray.appendChild(element);
  });
}

function handleDragStart(event, fragmentId) {
  if (state.won) {
    event.preventDefault();
    return;
  }

  state.draggedId = fragmentId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", fragmentId);
  event.currentTarget.classList.add("dragging");
  statusText.textContent = "Drop the fragment onto the glowing outline with the same shape.";
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove("dragging");
  clearSlotHover();

  if (!state.won) {
    statusText.textContent = "Drag a crystal fragment onto the matching outline in the cluster.";
  }

  state.draggedId = null;
}

function clearSlotHover() {
  slotsLayer.querySelectorAll(".slot-hover").forEach((slot) => {
    slot.classList.remove("slot-hover");
  });
}

function handleSlotDragOver(event) {
  if (state.won || !state.draggedId) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  highlightCurrentTarget(state.draggedId);
}

function handleSlotDragLeave(event) {
  event.currentTarget.classList.remove("slot-hover");
}

function handleSlotDrop(event) {
  if (state.won) {
    return;
  }

  event.preventDefault();
  const fragmentId = event.dataTransfer.getData("text/plain");
  const placed = tryPlaceDraggedFragment(fragmentId);

  if (!placed) {
    updateStatusAfterMove(false);
  }
}

function highlightCurrentTarget(fragmentId) {
  clearSlotHover();
  const fragment = state.fragments.find((item) => item.id === fragmentId);

  if (!fragment) {
    return;
  }

  const slotElement = slotsLayer.querySelector(`.slot[data-slot="${fragment.slot}"]`);

  if (slotElement) {
    slotElement.classList.add("slot-hover");
  }
}

function tryPlaceDraggedFragment(fragmentId) {
  const fragment = state.fragments.find((item) => item.id === fragmentId);

  if (!fragment) {
    clearSlotHover();
    return false;
  }

  placeFragment(fragment, fragment.slot);
  clearSlotHover();
  renderFragments();
  updateStatusAfterMove(true);
  checkForWin();
  return true;
}

function placeFragment(fragment, slotName) {
  fragment.placed = true;
  fragment.x = slotStyles[slotName].x;
  fragment.y = slotStyles[slotName].y;
  const slotElement = slotsLayer.querySelector(`.slot[data-slot="${slotName}"]`);
  slotElement.classList.add("slot-filled");
}

function updateStatusAfterMove(placed) {
  const remaining = state.fragments.filter((fragment) => !fragment.placed).length;

  if (placed) {
    if (remaining === 0) {
      statusText.textContent = "The crystal cluster is complete. Mana floods back into the Spire.";
      return;
    }

    statusText.textContent = `${remaining} fragment${remaining === 1 ? "" : "s"} left. Keep matching the glowing outlines.`;
    return;
  }

  statusText.textContent = "That fragment does not lock there. Match it to its own silhouette in the cluster.";
}

function checkForWin() {
  if (state.fragments.every((fragment) => fragment.placed)) {
    state.won = true;
    winModal.classList.remove("hidden");
    winModal.setAttribute("aria-hidden", "false");
  }
}

function clearSlotFill() {
  slotsLayer.querySelectorAll(".slot-filled").forEach((slot) => {
    slot.classList.remove("slot-filled");
  });
}

function resetGame() {
  state.fragments = cloneFragments();
  state.draggedId = null;
  state.won = false;
  statusText.textContent = "Drag a crystal fragment onto the matching outline in the cluster.";
  clearSlotFill();
  clearSlotHover();
  winModal.classList.add("hidden");
  winModal.setAttribute("aria-hidden", "true");
  renderFragments();
}

resetButton.addEventListener("click", resetGame);
board.addEventListener("dragover", (event) => {
  if (state.won || !state.draggedId) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  highlightCurrentTarget(state.draggedId);
});
board.addEventListener("drop", (event) => {
  if (state.won) {
    return;
  }

  event.preventDefault();
  const fragmentId = event.dataTransfer.getData("text/plain");
  const placed = tryPlaceDraggedFragment(fragmentId);

  if (!placed) {
    updateStatusAfterMove(false);
  }
});

initializeSlots();
resetGame();
