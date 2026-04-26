const storyCards = Array.from(document.querySelectorAll("[data-story-card]"));
const progressFill = document.querySelector("[data-progress-fill]");
const steps = Array.from(document.querySelectorAll("[data-step]"));
const stageIndex = document.querySelector("[data-stage-index]");
const stageTitle = document.querySelector("[data-stage-title]");
const stageDescription = document.querySelector("[data-stage-description]");
const revealTargets = Array.from(document.querySelectorAll(".reveal"));
const topbar = document.querySelector("[data-topbar]");

let lastScrollY = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateHeroPanel() {
  const panel = document.querySelector("[data-scroll-panel]");

  if (!panel || !storyCards.length || !progressFill) {
    return;
  }

  const rect = panel.getBoundingClientRect();
  const viewportHeight = window.innerHeight || 1;

  if (rect.top >= viewportHeight * 0.08) {
    storyCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === 0);
    });
    progressFill.style.width = "16%";
    return;
  }

  const travelled = clamp((viewportHeight * 0.2 - rect.top) / (rect.height * 0.9), 0, 0.999);
  const index = clamp(Math.floor(travelled * storyCards.length), 0, storyCards.length - 1);
  const width = 16 + ((index + 1) / storyCards.length) * 84;

  storyCards.forEach((card, cardIndex) => {
    card.classList.toggle("is-active", cardIndex === index);
  });

  progressFill.style.width = `${width}%`;
}

function updateStickyStage() {
  if (!steps.length || !stageIndex || !stageTitle || !stageDescription) {
    return;
  }

  let activeStep = steps[0];
  let bestOffset = Number.POSITIVE_INFINITY;

  steps.forEach((step) => {
    const rect = step.getBoundingClientRect();
    const offset = Math.abs(rect.top - window.innerHeight * 0.28);

    if (offset < bestOffset) {
      bestOffset = offset;
      activeStep = step;
    }
  });

  steps.forEach((step) => {
    step.classList.toggle("is-current", step === activeStep);
  });

  stageIndex.textContent = activeStep.dataset.stage ?? "01";
  stageTitle.textContent = activeStep.dataset.title ?? "";
  stageDescription.textContent = activeStep.dataset.description ?? "";
}

function setVisibleEntries(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
}

function updateTopbar() {
  if (!topbar) {
    return;
  }

  const currentY = window.scrollY || 0;
  const scrollingDown = currentY > lastScrollY;
  const movedEnough = Math.abs(currentY - lastScrollY) > 8;

  if (currentY < 24) {
    topbar.classList.remove("is-hidden");
  } else if (scrollingDown && movedEnough) {
    topbar.classList.add("is-hidden");
  } else if (!scrollingDown && movedEnough) {
    topbar.classList.remove("is-hidden");
  }

  lastScrollY = currentY;
}

const revealObserver = new IntersectionObserver(setVisibleEntries, {
  threshold: 0.12,
});

revealTargets.forEach((target) => {
  revealObserver.observe(target);
});

function updateScrollEffects() {
  updateHeroPanel();
  updateStickyStage();
  updateTopbar();
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  lastScrollY = 0;
  updateScrollEffects();
});

window.addEventListener("pageshow", () => {
  window.scrollTo(0, 0);
  lastScrollY = 0;
  updateScrollEffects();
});

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);

updateScrollEffects();
