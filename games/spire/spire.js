const absorbButton = document.getElementById("absorbButton");
const stabilizeButton = document.getElementById("stabilizeButton");
const messageBox = document.getElementById("messageBox");
const visionModal = document.getElementById("visionModal");
const visionCard = document.getElementById("visionCard");
const visionEyebrow = document.getElementById("visionEyebrow");
const visionTitle = document.getElementById("visionTitle");
const visionText = document.getElementById("visionText");
const visionContinue = document.getElementById("visionContinue");
const rewindButton = document.getElementById("rewindButton");

const consequences = {
  absorb: {
    eyebrow: "Endfall Vision",
    title: "The Spire breaks open",
    text: "Jin lives, but the power tears through the Mana Spire and floods the horizon with ruin. This is a placeholder for a destruction scene, loss image, or narrated collapse.",
    message:
      "Endfall is triggered in this vision. Rewind and choose again if you want to preserve the world.",
    tone: "danger",
    final: false,
  },
  stabilize: {
    eyebrow: "Fate Decided",
    title: "The Mana Spire is Stable",
    text: "Jin gives up the power and anchors the core. The Spire endures, and the world survives. This is the correct ending and can later hold a final artwork or closing passage.",
    message: "Jin chooses sacrifice over destruction. The Spire holds.",
    tone: "safe",
    final: true,
  },
};

function setMessage(text, tone = "") {
  messageBox.textContent = text;
  messageBox.classList.remove("error", "success");

  if (tone) {
    messageBox.classList.add(tone);
  }
}

function showVision(decision) {
  const consequence = consequences[decision];

  visionEyebrow.textContent = consequence.eyebrow;
  visionTitle.textContent = consequence.title;
  visionText.textContent = consequence.text;
  visionCard.classList.remove("danger", "safe");
  visionCard.classList.add(consequence.tone);
  visionContinue.classList.toggle("hidden", !consequence.final);
  rewindButton.classList.toggle("hidden", consequence.final);
  visionModal.classList.remove("hidden");
  visionModal.setAttribute("aria-hidden", "false");
  setMessage(consequence.message, consequence.final ? "success" : "error");
}

function hideVision() {
  visionModal.classList.add("hidden");
  visionModal.setAttribute("aria-hidden", "true");
}

function rewindVision() {
  hideVision();
  setMessage("The vision rewinds. Choose the fate you can live with.");
}

absorbButton.addEventListener("click", () => showVision("absorb"));
stabilizeButton.addEventListener("click", () => showVision("stabilize"));
rewindButton.addEventListener("click", rewindVision);

setMessage("Choose an action to witness its consequence.");
