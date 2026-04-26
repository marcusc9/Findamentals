const storyCards = Array.from(document.querySelectorAll("[data-story-card]"));
const progressFill = document.querySelector("[data-progress-fill]");
const steps = Array.from(document.querySelectorAll("[data-step]"));
const stageIndex = document.querySelector("[data-stage-index]");
const stageTitle = document.querySelector("[data-stage-title]");
const stageDescription = document.querySelector("[data-stage-description]");
const revealTargets = Array.from(document.querySelectorAll(".reveal"));
const topbar = document.querySelector("[data-topbar]");
const editorialBrief = document.querySelector("[data-editorial-brief]");
const workflowCards = Array.from(document.querySelectorAll("[data-workflow-card]"));
const handoffOutput = document.querySelector("[data-handoff-output]");
const copyNote = document.querySelector("[data-copy-note]");

const workflowCandidates = {
  "lead-read": [
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mohamed%20A.%20El-Erian%20%28cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Mohamed_A._El-Erian_(cropped).jpg",
      caption: "Public-figure option: Mohamed El-Erian as a recognisable macro voice for the read.",
      tags: ["person", "public-figure", "macro", "portrait"],
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bank%20of%20England,%20London.JPG",
      source: "https://commons.wikimedia.org/wiki/File:Bank_of_England,_London.JPG",
      caption: "Institutional option: Bank of England exterior for a central-bank credibility framing.",
      tags: ["institution", "building", "central-bank", "clean"],
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pump%20Jack.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Pump_Jack.jpg",
      caption: "Macro-energy option: oil infrastructure to anchor the inflation-and-energy story.",
      tags: ["energy", "infrastructure", "macro"],
    },
  ],
  "skill-drill": [
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Jensen%20Huang%20%28cropped%29%20%282024%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Jensen_Huang_(cropped)_(2024).jpg",
      caption: "Public-figure option: Jensen Huang as the operator at the centre of the company example.",
      tags: ["person", "public-figure", "operator", "portrait"],
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/NVIDIA%20Headquarters.jpg",
      source: "https://commons.wikimedia.org/wiki/File:NVIDIA_Headquarters.jpg",
      caption: "Corporate option: NVIDIA headquarters as a clean company anchor for the skill drill.",
      tags: ["company", "building", "clean", "institutional"],
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Jensen%20Huang%20%28cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Jensen_Huang_(cropped).jpg",
      caption: "Alternative operator-led option: a more direct portrait of Jensen Huang.",
      tags: ["person", "public-figure", "operator", "portrait"],
    },
  ],
  "historical-lens": [
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Eccles%20Federal%20Reserve%20Board%20Building.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Eccles_Federal_Reserve_Board_Building.jpg",
      caption: "Institutional option: the Eccles Building for a cleaner policy-history visual.",
      tags: ["institution", "building", "history", "clean"],
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20A.%20Volcker%20%28cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Paul_A._Volcker_(cropped).jpg",
      caption: "Portrait option: Paul Volcker for the credibility lesson at the centre of the piece.",
      tags: ["person", "public-figure", "history", "portrait"],
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marriner%20S.%20Eccles%20Federal%20Reserve%20Board%20Building.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Marriner_S._Eccles_Federal_Reserve_Board_Building.jpg",
      caption: "Alternative Fed-building option with a broader exterior view.",
      tags: ["institution", "building", "history"],
    },
    {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Alan%20Greenspan%2C%20official%20Federal%20Reserve%20photo.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Alan_Greenspan,_official_Federal_Reserve_photo.jpg",
      caption: "Alternative public-figure option: Alan Greenspan as another recognisable central-bank figure.",
      tags: ["person", "public-figure", "history", "portrait"],
    },
  ],
};

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

function updateEditorialBrief() {
  if (!editorialBrief) {
    return;
  }

  const rect = editorialBrief.getBoundingClientRect();
  const viewportHeight = window.innerHeight || 1;
  const progress = clamp(1 - Math.abs(rect.top - viewportHeight * 0.28) / (viewportHeight * 0.9), 0, 1);

  editorialBrief.style.setProperty("--brief-shift", `${(1 - progress) * 10}px`);
  editorialBrief.style.setProperty("--brief-glow-shift", `${progress * -10}px`);
  editorialBrief.style.setProperty("--brief-glow-scale", `${0.96 + progress * 0.1}`);
  editorialBrief.style.setProperty("--brief-rule-scale", `${0.9 + progress * 0.1}`);
}

function wireWorkflowCards() {
  workflowCards.forEach((card) => {
    const readKey = card.dataset.readKey ?? "";
    const status = card.querySelector("[data-workflow-status]");
    const acceptButton = card.querySelector('[data-workflow-action="accept"]');
    const changesButton = card.querySelector('[data-workflow-action="changes"]');
    const saveChangesButton = card.querySelector('[data-workflow-action="save-changes"]');
    const feedback = card.querySelector("[data-workflow-feedback]");
    const textarea = card.querySelector("[data-workflow-textarea]");
    const suggestions = card.querySelector("[data-workflow-suggestions]");
    const previewImage = card.querySelector(".workflow-preview img");
    const previewCaption = card.querySelector(".workflow-preview figcaption");

    if (!status || !acceptButton || !changesButton || card.dataset.wired === "true") {
      return;
    }

    acceptButton.addEventListener("click", () => {
      card.classList.add("is-accepted");
      card.classList.remove("is-changes");
      status.textContent = "Accepted";
      if (feedback) {
        feedback.hidden = true;
      }
    });

    changesButton.addEventListener("click", () => {
      card.classList.add("is-changes");
      card.classList.remove("is-accepted");
      status.textContent = "Changes requested";
      if (feedback) {
        feedback.hidden = false;
      }
      if (textarea) {
        textarea.focus();
      }
    });

    if (saveChangesButton) {
      saveChangesButton.addEventListener("click", () => {
        card.classList.add("is-changes");
        card.classList.remove("is-accepted");
        status.textContent = textarea?.value.trim() ? "Candidates generated" : "Changes requested";

        if (suggestions) {
          const prompt = textarea?.value.trim().toLowerCase() ?? "";
          let candidates = [...(workflowCandidates[readKey] ?? [])];
          const wantsPerson = /person|public figure|known public figure|portrait|someone/i.test(prompt);
          const wantsInstitution = /institution|building|policy|clean|headquarters/i.test(prompt);
          const wantsEnergy = /energy|oil|inflation|macro/i.test(prompt);
          const wantsHistory = /history|historical|period|archive/i.test(prompt);

          const scoredCandidates = candidates.map((candidate) => {
            let score = 0;

            if (wantsPerson && candidate.tags.includes("person")) {
              score += 4;
            }
            if (wantsInstitution && candidate.tags.includes("institution")) {
              score += 3;
            }
            if (wantsEnergy && candidate.tags.includes("energy")) {
              score += 3;
            }
            if (wantsHistory && candidate.tags.includes("history")) {
              score += 2;
            }
            if (prompt.includes("clean") && candidate.tags.includes("clean")) {
              score += 2;
            }
            if (prompt.includes("operator") && candidate.tags.includes("operator")) {
              score += 3;
            }

            return { candidate, score };
          });

          scoredCandidates.sort((a, b) => b.score - a.score);
          candidates = scoredCandidates.map((item) => item.candidate);

          suggestions.hidden = false;
          suggestions.innerHTML = `
            <p class="workflow-suggestion-heading">Candidate pack</p>
            <div class="workflow-suggestion-track">
              ${candidates
                .map(
                  (candidate, index) => `
                    <article class="workflow-suggestion-card">
                      <img src="${candidate.src}" alt="Candidate ${index + 1} for ${readKey}" loading="lazy" />
                      <p>${candidate.caption}</p>
                      <div class="workflow-suggestion-actions">
                        <button class="button button-primary" type="button" data-select-candidate="${index}">Use this image</button>
                        <a class="button button-secondary" href="${candidate.source}" target="_blank" rel="noreferrer">Source</a>
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          `;

          suggestions.querySelectorAll("[data-select-candidate]").forEach((button) => {
            button.addEventListener("click", () => {
              const candidate = candidates[Number(button.getAttribute("data-select-candidate"))];

              if (!candidate || !previewImage || !previewCaption) {
                return;
              }

              previewImage.src = candidate.src;
              previewCaption.textContent = `Proposed image: ${candidate.caption}`;
              status.textContent = "Candidate selected";
            });
          });
        }
      });
    }

    card.dataset.wired = "true";
  });
}

function prepareWorkflowHandoff() {
  if (!handoffOutput) {
    return;
  }

  const payload = workflowCards.map((card) => {
    const label = card.querySelector(".feed-tag")?.textContent?.trim() ?? "Read";
    const status = card.querySelector("[data-workflow-status]")?.textContent?.trim() ?? "Pending approval";
    const preview = card.querySelector(".workflow-preview img");
    const note = card.querySelector("[data-workflow-textarea]")?.value?.trim() ?? "";
    const caption = card.querySelector(".workflow-preview figcaption")?.textContent?.trim() ?? "";

    return {
      read: label,
      status,
      image_url: preview?.getAttribute("src") ?? "",
      source_note: caption,
      change_request: note || null,
    };
  });

  handoffOutput.textContent = JSON.stringify(
    {
      publish_date: "next daily edition",
      instruction:
        "Download approved images, preserve source credit, and place them into the corresponding article body slots before publication.",
      visuals: payload,
    },
    null,
    2,
  );
}

function copyWorkflowHandoff() {
  if (!handoffOutput) {
    return;
  }

  const text = handoffOutput.textContent ?? "";

  const showCopiedState = () => {
    if (!copyNote) {
      return;
    }

    copyNote.hidden = false;
    window.setTimeout(() => {
      copyNote.hidden = true;
    }, 1600);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(showCopiedState);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = text;
  fallback.setAttribute("readonly", "true");
  fallback.style.position = "absolute";
  fallback.style.left = "-9999px";
  document.body.appendChild(fallback);
  fallback.select();
  document.execCommand("copy");
  document.body.removeChild(fallback);
  showCopiedState();
}

const revealObserver = new IntersectionObserver(setVisibleEntries, {
  threshold: 0.12,
});

revealTargets.forEach((target) => {
  revealObserver.observe(target);
});

wireWorkflowCards();

document.querySelector('[data-workflow-action="prepare-handoff"]')?.addEventListener("click", prepareWorkflowHandoff);
document.querySelector('[data-workflow-action="copy-handoff"]')?.addEventListener("click", copyWorkflowHandoff);

function updateScrollEffects() {
  updateHeroPanel();
  updateStickyStage();
  updateTopbar();
  updateEditorialBrief();
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
