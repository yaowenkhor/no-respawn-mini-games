const coinButton = document.getElementById("coinButton");
const coinImage = document.getElementById("coinImage");
const coinFx = document.getElementById("coinFx");
const statusText = document.getElementById("statusText");
const playArea = document.querySelector(".play-area");
const resetButton = document.getElementById("resetButton");
const storyAction = document.getElementById("storyAction");
const continueButton = document.getElementById("continueButton");
const storyModal = document.getElementById("storyModal");
const fxContext = coinFx.getContext("2d");
const stableCoinSrc = "../assets/img/holding_coin.png";
const brokenCoinSrc = "../assets/img/coin_disappearing.png";
const brokenCoinImage = new Image();

brokenCoinImage.src = brokenCoinSrc;

const breakThreshold = 100;
const clickBoost = 14;
const decayRate = 10;

const state = {
  instability: 0,
  lastUpdate: performance.now(),
  broken: false,
  particles: [],
  particleFrame: null,
};

function resizeFxCanvas() {
  const rect = playArea.getBoundingClientRect();
  coinFx.width = Math.max(1, Math.round(rect.width));
  coinFx.height = Math.max(1, Math.round(rect.height));
}

function decayInstability(timestamp) {
  if (state.broken) {
    return;
  }

  const elapsed = (timestamp - state.lastUpdate) / 1000;
  state.lastUpdate = timestamp;
  state.instability = Math.max(0, state.instability - elapsed * decayRate);

  updateCoinState();
  setStatus();
  window.requestAnimationFrame(decayInstability);
}

function updateCoinState() {
  coinButton.classList.remove("unstable", "glitching", "broken", "hidden-coin");
  playArea.classList.remove("glitching", "broken");

  if (state.broken) {
    coinButton.classList.add("broken", "hidden-coin");
    playArea.classList.add("broken");
    coinImage.src = brokenCoinSrc;
    return;
  }

  coinImage.src = stableCoinSrc;

  if (state.instability >= 65) {
    coinButton.classList.add("glitching");
    playArea.classList.add("glitching");
  } else if (state.instability >= 30) {
    coinButton.classList.add("unstable");
  }
}

function setStatus() {
  if (state.broken) {
    statusText.textContent =
      "The exploit collapses. The coin glitches, flashes, and disappears before Jin's eyes.";
    return;
  }

  if (state.instability >= 65) {
    statusText.textContent =
      "The coin is glitching violently. Keep tapping and it may rupture.";
  } else if (state.instability >= 30) {
    statusText.textContent =
      "The duplication attempt is destabilizing the coin. Keep tapping.";
  } else if (state.instability > 0) {
    statusText.textContent =
      "Nothing duplicates. The coin jitters, then starts to calm.";
  } else {
    statusText.textContent = "Keep tapping the coin to stress the exploit.";
  }
}

function showStoryAction() {
  storyAction.classList.remove("hidden");
}

function hideStoryAction() {
  storyAction.classList.add("hidden");
}

function showStoryModal() {
  storyModal.classList.remove("hidden");
  storyModal.setAttribute("aria-hidden", "false");
}

function hideStoryModal() {
  storyModal.classList.add("hidden");
  storyModal.setAttribute("aria-hidden", "true");
}

function breakCoin() {
  state.broken = true;
  updateCoinState();
  spawnDissolveParticles();
  setStatus();
  window.setTimeout(showStoryAction, 700);
}

function spawnDissolveParticles() {
  resizeFxCanvas();
  state.particles = [];

  const playRect = playArea.getBoundingClientRect();
  const coinRect = coinImage.getBoundingClientRect();
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d");
  const width = Math.max(1, Math.round(coinRect.width));
  const height = Math.max(1, Math.round(coinRect.height));
  const step = 6;

  sampleCanvas.width = width;
  sampleCanvas.height = height;
  sampleContext.drawImage(brokenCoinImage, 0, 0, width, height);

  const imageData = sampleContext.getImageData(0, 0, width, height).data;
  const offsetX = coinRect.left - playRect.left;
  const offsetY = coinRect.top - playRect.top;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const alpha = imageData[index + 3];

      if (alpha < 40) {
        continue;
      }

      const red = imageData[index];
      const green = imageData[index + 1];
      const blue = imageData[index + 2];
      const normalizedX = x / width;

      state.particles.push({
        x: offsetX + x,
        y: offsetY + y,
        baseX: offsetX + x,
        baseY: offsetY + y,
        size: step,
        color: `rgba(${red}, ${green}, ${blue}, 1)`,
        alpha: 1,
        velocityX: 0.22 + Math.random() * 0.8 + normalizedX * 1.1,
        velocityY: -0.35 + Math.random() * 0.8,
        driftY: (Math.random() - 0.5) * 0.24,
        delay: (1 - normalizedX) * 1200,
        age: 0,
        life: 3400 + Math.random() * 2200,
      });
    }
  }

  if (state.particleFrame) {
    cancelAnimationFrame(state.particleFrame);
  }

  const startTime = performance.now();

  function animateParticles(now) {
    fxContext.clearRect(0, 0, coinFx.width, coinFx.height);
    let activeParticles = 0;

    state.particles.forEach((particle) => {
      const elapsed = now - startTime;

      if (elapsed < particle.delay) {
        activeParticles += 1;
        return;
      }

      const lifeElapsed = elapsed - particle.delay;
      const progress = Math.min(lifeElapsed / particle.life, 1);

      if (progress < 1) {
        activeParticles += 1;
      }

      particle.x = particle.baseX + particle.velocityX * lifeElapsed * 0.06;
      particle.y =
        particle.baseY +
        particle.velocityY * lifeElapsed * 0.02 +
        particle.driftY * lifeElapsed * 0.01;
      particle.alpha = 1 - progress;

      if (particle.alpha <= 0) {
        return;
      }

      fxContext.globalAlpha = particle.alpha;
      fxContext.fillStyle = particle.color;
      fxContext.fillRect(
        particle.x,
        particle.y,
        particle.size * (1 - progress * 0.25),
        particle.size * (1 - progress * 0.25),
      );
    });

    fxContext.globalAlpha = 1;

    if (activeParticles > 0) {
      state.particleFrame = requestAnimationFrame(animateParticles);
    } else {
      state.particleFrame = null;
      fxContext.clearRect(0, 0, coinFx.width, coinFx.height);
    }
  }

  state.particleFrame = requestAnimationFrame(animateParticles);
}

function handleCoinClick() {
  if (state.broken) {
    return;
  }

  state.instability = Math.min(breakThreshold, state.instability + clickBoost);
  updateCoinState();
  setStatus();

  if (state.instability >= breakThreshold) {
    breakCoin();
  }
}

function resetGame() {
  state.instability = 0;
  state.lastUpdate = performance.now();
  state.broken = false;
  if (state.particleFrame) {
    cancelAnimationFrame(state.particleFrame);
    state.particleFrame = null;
  }
  fxContext.clearRect(0, 0, coinFx.width, coinFx.height);
  hideStoryAction();
  hideStoryModal();
  updateCoinState();
  setStatus();
}

coinButton.addEventListener("click", handleCoinClick);
resetButton.addEventListener("click", resetGame);
continueButton.addEventListener("click", showStoryModal);
window.addEventListener("resize", resizeFxCanvas);

resizeFxCanvas();
resetGame();
window.requestAnimationFrame(decayInstability);
