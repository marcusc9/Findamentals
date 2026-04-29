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
const homeFocus = document.querySelector("[data-home-focus]");
const homeFormat = document.querySelector("[data-home-format]");
const workflowDeadline = document.querySelector("[data-workflow-deadline]");
const workflowTitle = document.querySelector("[data-workflow-title]");
const workflowLive = document.querySelector("[data-workflow-live]");
const workflowLiveBridge = document.querySelector("[data-workflow-live-bridge]");
const workflowLiveSummary = document.querySelector("[data-workflow-live-summary]");
const workflowLiveTabs = Array.from(document.querySelectorAll("[data-workflow-live-tab]"));
const workflowLivePanels = Array.from(document.querySelectorAll("[data-workflow-live-panel]"));
const WORKFLOW_BRIDGE_URL = "http://127.0.0.1:8765";

const editionState = window.FindamentalsEditionState ?? {};
const currentEditionState = editionState.currentEdition ?? {};
const nextEditionWorkflowState = editionState.nextEditionWorkflow ?? {};

const dailyEditionMeta = {
  focus: currentEditionState.focus ?? "Private-credit sentiment, borrower fragility, credit-cycle history",
  format: currentEditionState.format ?? "Sentiment explainer, credit-risk drill, historical lens",
};

const workflowSearchContext = {
  "lead-read": ["private credit", "direct lending", "credit markets", "Jamie Dimon"],
  "skill-drill": ["private credit", "credit default swap", "borrower fragility", "risk transfer"],
  "historical-lens": ["junk bonds", "Michael Milken", "Drexel", "credit cycle"],
};

const workflowFigureProfiles = {
  "lead-read": [
    { name: "Jamie Dimon", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Jamie%20Dimon%2C%20CEO%20of%20JPMorgan%20Chase.jpg", source: "https://commons.wikimedia.org/wiki/File:Jamie_Dimon,_CEO_of_JPMorgan_Chase.jpg" },
    { name: "David Solomon", image: "https://www.goldmansachs.com/images/migrated/about-us/people-and-leadership/leadership/management-committee/images/david-solomon-1000x1000.png", source: "https://www.goldmansachs.com/images/migrated/about-us/people-and-leadership/leadership/management-committee/images/david-solomon-1000x1000.png" },
    { name: "Marc Rowan", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Marc%20Rowan%20-%20World%20Economic%20Forum%20Annual%20Meeting%202023.jpg", source: "https://commons.wikimedia.org/wiki/File:Marc_Rowan_-_World_Economic_Forum_Annual_Meeting_2023.jpg" },
    { name: "Sarah Breeden", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Sarah%20Breeden%20-%20Bank%20of%20England.jpg", source: "https://commons.wikimedia.org/wiki/File:Sarah_Breeden_-_Bank_of_England.jpg" },
  ],
  "skill-drill": [
    { name: "Howard Marks", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Howard%20Marks%20at%20Delivering%20Alpha%202018.jpg", source: "https://commons.wikimedia.org/wiki/File:Howard_Marks_at_Delivering_Alpha_2018.jpg" },
    { name: "Katie Koch", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Katie%20Koch%202023.jpg", source: "https://commons.wikimedia.org/wiki/File:Katie_Koch_2023.jpg" },
    { name: "Michael Cembalest", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Michael%20Cembalest.jpg", source: "https://commons.wikimedia.org/wiki/File:Michael_Cembalest.jpg" },
    { name: "Sonali Basak", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Sonali%20Basak.jpg", source: "https://commons.wikimedia.org/wiki/File:Sonali_Basak.jpg" },
  ],
  "historical-lens": [
    { name: "Michael Milken", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mike%20Milken.jpg", source: "https://commons.wikimedia.org/wiki/File:Mike_Milken.jpg" },
    { name: "Edward Altman", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Edward%20Altman.jpg", source: "https://commons.wikimedia.org/wiki/File:Edward_Altman.jpg" },
    { name: "Raghuram Rajan", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Raghuram%20Rajan%2C%20November%202024.jpg", source: "https://commons.wikimedia.org/wiki/File:Raghuram_Rajan,_November_2024.jpg" },
    { name: "Gillian Tett", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Gillian%20Tett.jpg", source: "https://commons.wikimedia.org/wiki/File:Gillian_Tett.jpg" },
  ],
};

let lastScrollY = 0;
let latestWorkflowHandoff = null;
const imageValidationCache = new Map();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatWorkflowTimestamp(value) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
    timeZoneName: "short",
  }).format(date);
}

function applyDailyEditionMeta() {
  if (homeFocus) {
    homeFocus.textContent = dailyEditionMeta.focus;
  }

  if (homeFormat) {
    homeFormat.textContent = dailyEditionMeta.format;
  }

  if (workflowDeadline) {
    workflowDeadline.textContent = `Approval window: ${nextEditionWorkflowState.approvalWindow ?? "6pm BST"}.`;
  }

  if (workflowTitle) {
    workflowTitle.textContent = nextEditionWorkflowState.targetEditionLabel ?? "Next image handoff.";
  }
}

function applyWorkflowEditionState() {
  workflowCards.forEach((card) => {
    const readKey = card.dataset.readKey ?? "";
    const workflowRead = nextEditionWorkflowState.reads?.[readKey];

    if (!workflowRead) {
      return;
    }

    const label = card.querySelector(".feed-tag");
    const heading = card.querySelector("h3");
    const previewImage = card.querySelector(".workflow-preview img");
    const previewCaption = card.querySelector(".workflow-preview figcaption");
    const sourceLink = card.querySelector("[data-workflow-source-link]");

    if (label) {
      label.textContent = workflowRead.label ?? label.textContent;
    }

    if (heading) {
      heading.textContent = workflowRead.label ?? heading.textContent;
    }

    if (previewImage) {
      previewImage.src = workflowRead.previewImage ?? previewImage.getAttribute("src") ?? "";
      previewImage.alt = workflowRead.previewAlt ?? previewImage.alt;
    }

    if (previewCaption) {
      previewCaption.textContent = workflowRead.previewCaption ?? previewCaption.textContent;
    }

    if (sourceLink && workflowRead.previewSource) {
      sourceLink.href = workflowRead.previewSource;
    }
  });
}

function extractWorkflowSourceUrl(card) {
  const previewCaptionLink = card.querySelector(".workflow-preview figcaption a");
  const sourceLink = card.querySelector("[data-workflow-source-link]");
  return previewCaptionLink?.getAttribute("href") ?? sourceLink?.getAttribute("href") ?? "";
}

function showWorkflowSyncNote(note, message, isError = false) {
  if (!note) {
    return;
  }

  note.hidden = false;
  note.textContent = message;
  note.classList.toggle("is-error", isError);
}

async function persistWorkflowApproval(card) {
  const readKey = card.dataset.readKey ?? "";
  const readLabel = card.querySelector("h3")?.textContent?.trim() ?? readKey;
  const previewImage = card.querySelector(".workflow-preview img");
  const previewCaption = card.querySelector(".workflow-preview figcaption");
  const textarea = card.querySelector("[data-workflow-textarea]");

  const response = await fetch(`${WORKFLOW_BRIDGE_URL}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      read_key: readKey,
      read_label: readLabel,
      status: "approved",
      image_url: previewImage?.getAttribute("src") ?? "",
      source_url: extractWorkflowSourceUrl(card),
      source_note: previewCaption?.textContent?.trim() ?? "",
      change_request: textarea?.value.trim() || null,
    }),
  });

  if (!response.ok) {
    throw new Error("Bridge rejected approval");
  }

  return response.json();
}

function getWorkflowReads() {
  return Object.entries(nextEditionWorkflowState.reads ?? {}).map(([key, read]) => ({
    key,
    ...read,
  }));
}

function getVisualForRead(handoff, read) {
  return handoff?.approved_visuals?.find((visual) => visual.read === read.label) ?? null;
}

function getWorkflowApprovalTime(handoff, visual) {
  return visual?.approved_at ?? handoff?.approved_at ?? "";
}

function normaliseWorkflowStatus(status) {
  return String(status || "pending").toLowerCase();
}

function workflowStatusClass(status, requiredValue = "approved") {
  return normaliseWorkflowStatus(status) === requiredValue ? "is-ready" : "is-warning";
}

function renderWorkflowLiveSummary(handoff, bridgeOnline) {
  if (!workflowLiveSummary) {
    return;
  }

  const reads = getWorkflowReads();
  const approvedCount = reads.filter((read) => getVisualForRead(handoff, read)?.status === "approved").length;
  const targetPublication = nextEditionWorkflowState.targetPublication ?? handoff?.target_publish_date ?? "Next cycle";
  const approvalsComplete = handoff?.approvals_complete === true;
  const approvedAt = approvalsComplete ? formatWorkflowTimestamp(handoff?.approved_at) : "Not complete";

  workflowLiveSummary.innerHTML = `
    <article class="workflow-live-stat">
      <span>Publication</span>
      <strong>${escapeHtml(targetPublication)}</strong>
    </article>
    <article class="workflow-live-stat">
      <span>Illustrations</span>
      <strong>${approvedCount}/${reads.length || 3} approved</strong>
    </article>
    <article class="workflow-live-stat">
      <span>Handoff</span>
      <strong>${approvalsComplete ? "Ready" : "Open"}</strong>
    </article>
    <article class="workflow-live-stat">
      <span>Approved at</span>
      <strong>${escapeHtml(approvedAt)}</strong>
    </article>
  `;

  if (workflowLiveBridge) {
    workflowLiveBridge.textContent = bridgeOnline ? "Bridge live" : "Bridge offline";
    workflowLiveBridge.classList.toggle("is-ready", bridgeOnline);
    workflowLiveBridge.classList.toggle("is-warning", !bridgeOnline);
  }
}

function renderWorkflowReadPanel(handoff) {
  const panel = document.querySelector('[data-workflow-live-panel="reads"]');
  if (!panel) {
    return;
  }

  const reads = getWorkflowReads();

  panel.innerHTML = `
    <div class="workflow-live-grid">
      ${reads
        .map((read) => {
          const visual = getVisualForRead(handoff, read);
          const articleStatus = read.readAngle ? "Brief ready" : "Needs brief";
          const people = (read.peopleToWatch ?? []).slice(0, 4).map(escapeHtml).join(", ");
          const title = read.workingQuestion ?? read.workingTitle ?? read.label;
          const approvedAt = getWorkflowApprovalTime(handoff, visual);

          return `
            <article class="workflow-live-card">
              <span class="workflow-live-status ${read.readAngle ? "is-ready" : "is-warning"}">${articleStatus}</span>
              <h3>${escapeHtml(read.label)}</h3>
              <p class="workflow-live-meta">${escapeHtml(title)}</p>
              <p class="workflow-live-copy">${escapeHtml(read.readAngle ?? "No article brief is available yet.")}</p>
              <p class="workflow-live-copy"><strong>People:</strong> ${people || "None listed"}</p>
              <span class="workflow-live-status ${workflowStatusClass(visual?.status)}">${escapeHtml(visual?.status ?? "image pending")}</span>
              <p class="workflow-live-copy"><strong>Approved:</strong> ${escapeHtml(formatWorkflowTimestamp(approvedAt))}</p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderWorkflowImagePanel(handoff) {
  const panel = document.querySelector('[data-workflow-live-panel="images"]');
  if (!panel) {
    return;
  }

  const reads = getWorkflowReads();

  panel.innerHTML = `
    <div class="workflow-live-grid">
      ${reads
        .map((read) => {
          const visual = getVisualForRead(handoff, read);
          const image = visual?.image_url || read.previewImage || "";
          const caption = visual?.source_note || read.previewCaption || "";
          const source = visual?.source_url || read.previewSource || "";
          const status = visual?.status ?? "pending";
          const approvedAt = getWorkflowApprovalTime(handoff, visual);

          return `
            <article class="workflow-live-card">
              <span class="workflow-live-status ${workflowStatusClass(status)}">${escapeHtml(status)}</span>
              ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(read.previewAlt ?? `${read.label} image`)}" loading="lazy" />` : ""}
              <h3>${escapeHtml(read.label)}</h3>
              <p class="workflow-live-copy">${escapeHtml(caption || "No image caption is available yet.")}</p>
              <p class="workflow-live-copy"><strong>Approved:</strong> ${escapeHtml(formatWorkflowTimestamp(approvedAt))}</p>
              ${source ? `<a class="workflow-live-source" href="${escapeHtml(source)}" target="_blank" rel="noreferrer">Open source</a>` : ""}
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderWorkflowHandoffPanel(handoff) {
  const panel = document.querySelector('[data-workflow-live-panel="handoff"]');
  if (!panel) {
    return;
  }

  const checks = [
    {
      label: "Workflow prepared",
      ready: handoff?.workflow_ready === true,
      detail: "The next-edition workflow has been staged.",
    },
    {
      label: "Images approved",
      ready: handoff?.approvals_complete === true,
      detail: handoff?.approvals_complete
        ? `Every read approved at ${formatWorkflowTimestamp(handoff.approved_at)}.`
        : "Every read needs an approved image URL and source note.",
    },
    {
      label: "Publish target",
      ready: Boolean(handoff?.target_publish_date || nextEditionWorkflowState.targetPublication),
      detail: handoff?.target_publish_date ?? nextEditionWorkflowState.targetPublication ?? "No target set.",
    },
  ];

  panel.innerHTML = `
    <div class="workflow-live-grid">
      ${checks
        .map(
          (check) => `
            <article class="workflow-live-card">
              <span class="workflow-live-status ${check.ready ? "is-ready" : "is-warning"}">${check.ready ? "Ready" : "Open"}</span>
              <h3>${escapeHtml(check.label)}</h3>
              <p class="workflow-live-copy">${escapeHtml(check.detail)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderWorkflowLiveDashboard(handoff = latestWorkflowHandoff, bridgeOnline = Boolean(latestWorkflowHandoff)) {
  if (!workflowLive) {
    return;
  }

  renderWorkflowLiveSummary(handoff, bridgeOnline);
  renderWorkflowReadPanel(handoff);
  renderWorkflowImagePanel(handoff);
  renderWorkflowHandoffPanel(handoff);
}

function hydrateWorkflowCardsFromHandoff(handoff) {
  if (!handoff || !workflowCards.length) {
    return;
  }

  workflowCards.forEach((card) => {
    const readKey = card.dataset.readKey ?? "";
    const workflowRead = nextEditionWorkflowState.reads?.[readKey];
    const readLabel = workflowRead?.label ?? card.querySelector("h3")?.textContent?.trim();
    const visual = handoff.approved_visuals?.find((entry) => entry.read === readLabel);

    if (!visual) {
      return;
    }

    const status = card.querySelector("[data-workflow-status]");
    const previewImage = card.querySelector(".workflow-preview img");
    const previewCaption = card.querySelector(".workflow-preview figcaption");
    const sourceLink = card.querySelector("[data-workflow-source-link]");
    const syncNote = card.querySelector("[data-workflow-sync-note]");
    const approved = visual.status === "approved";

    card.classList.toggle("is-accepted", approved);
    card.classList.toggle("is-changes", !approved && Boolean(visual.change_request));

    if (status) {
      status.textContent = approved ? "Accepted" : visual.status ?? "Pending approval";
    }

    if (previewImage && visual.image_url) {
      previewImage.src = visual.image_url;
    }

    if (previewCaption && visual.source_note) {
      previewCaption.textContent = visual.source_note;
    }

    if (sourceLink && visual.source_url) {
      sourceLink.href = visual.source_url;
    }

    if (syncNote && approved) {
      syncNote.hidden = false;
      syncNote.classList.remove("is-error");
      syncNote.textContent = `Saved to handoff at ${formatWorkflowTimestamp(getWorkflowApprovalTime(handoff, visual))}.`;
    }
  });
}

async function refreshWorkflowLiveStatus() {
  if (!workflowLive) {
    return;
  }

  try {
    const response = await fetch(`${WORKFLOW_BRIDGE_URL}/handoff`);
    if (!response.ok) {
      throw new Error("Bridge handoff unavailable");
    }
    latestWorkflowHandoff = await response.json();
    renderWorkflowLiveDashboard(latestWorkflowHandoff, true);
    hydrateWorkflowCardsFromHandoff(latestWorkflowHandoff);
  } catch (error) {
    renderWorkflowLiveDashboard(null, false);
  }
}

function wireWorkflowLiveTabs() {
  if (!workflowLiveTabs.length || !workflowLivePanels.length) {
    return;
  }

  workflowLiveTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = tab.dataset.workflowLiveTab;

      workflowLiveTabs.forEach((candidate) => {
        const isActive = candidate === tab;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-selected", String(isActive));
      });

      workflowLivePanels.forEach((panel) => {
        const isActive = panel.dataset.workflowLivePanel === selected;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    });
  });
}

function initialsFromName(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function wireAvatarFallbacks() {
  document.querySelectorAll(".person-avatar").forEach((img) => {
    if (img.dataset.fallbackWired === "true") {
      return;
    }

    img.addEventListener("error", () => {
      const name = img.dataset.fallbackName || img.alt.replace(/\s*headshot\s*$/i, "").trim() || "FT";
      img.classList.add("is-fallback");
      img.alt = `${name} initials avatar`;
      img.removeAttribute("src");
      img.replaceWith(createAvatarFallback(name, img.className));
    });

    img.dataset.fallbackWired = "true";
  });
}

function wireExternalBlankLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    if (link.dataset.externalWired === "true") {
      return;
    }

    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.open(href, "_blank", "noopener,noreferrer");
    });

    link.dataset.externalWired = "true";
  });
}

function createAvatarFallback(name, className) {
  const fallback = document.createElement("span");
  fallback.className = `${className} is-fallback`;
  fallback.setAttribute("aria-label", `${name} initials avatar`);
  fallback.textContent = initialsFromName(name) || "FT";
  return fallback;
}

function loadImage(url) {
  if (!url) {
    return Promise.resolve(false);
  }

  if (imageValidationCache.has(url)) {
    return imageValidationCache.get(url);
  }

  const promise = new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = url;
  });

  imageValidationCache.set(url, promise);
  return promise;
}

async function filterValidCandidates(candidates) {
  const validated = await Promise.all(
    candidates.map(async (candidate) => {
      const thumbOk = await loadImage(candidate.thumb);
      const imageOk = candidate.image === candidate.thumb ? thumbOk : await loadImage(candidate.image);

      return thumbOk && imageOk ? candidate : null;
    }),
  );

  return validated.filter(Boolean);
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
    const collapseChangesButton = card.querySelector('[data-workflow-action="collapse-changes"]');
    const saveChangesButton = card.querySelector('[data-workflow-action="save-changes"]');
    const feedback = card.querySelector("[data-workflow-feedback]");
    const textarea = card.querySelector("[data-workflow-textarea]");
    const suggestions = card.querySelector("[data-workflow-suggestions]");
    const previewImage = card.querySelector(".workflow-preview img");
    const previewCaption = card.querySelector(".workflow-preview figcaption");
    const sourceLink = card.querySelector("[data-workflow-source-link]");
    const syncNote = card.querySelector("[data-workflow-sync-note]");
    const currentPreviewSrc = () => previewImage?.getAttribute("src") ?? "";

    if (!status || !acceptButton || !changesButton || card.dataset.wired === "true") {
      return;
    }

    acceptButton.addEventListener("click", async () => {
      card.classList.add("is-accepted");
      card.classList.remove("is-changes");
      status.textContent = "Accepted";
      if (feedback) {
        feedback.hidden = true;
      }

      try {
        const result = await persistWorkflowApproval(card);
        showWorkflowSyncNote(
          syncNote,
          result.approvals_complete
            ? "Saved to handoff. All reads approved for the next publication run."
            : "Saved to handoff.",
        );
        refreshWorkflowLiveStatus();
      } catch (error) {
        showWorkflowSyncNote(
          syncNote,
          "Could not save to the local handoff yet. Start the workflow bridge to enable approval syncing.",
          true,
        );
      }
    });

    changesButton.addEventListener("click", () => {
      card.classList.add("is-changes");
      card.classList.remove("is-accepted");
      status.textContent = "Changes requested";
      if (feedback) {
        feedback.hidden = false;
      }
      if (suggestions) {
        suggestions.hidden = true;
        suggestions.innerHTML = "";
      }
      if (textarea) {
        textarea.focus();
      }
    });

    if (collapseChangesButton) {
      collapseChangesButton.addEventListener("click", () => {
        if (feedback) {
          feedback.hidden = true;
        }
        if (suggestions) {
          suggestions.hidden = true;
          suggestions.innerHTML = "";
        }
      });
    }

    if (saveChangesButton) {
      saveChangesButton.addEventListener("click", async () => {
        card.classList.add("is-changes");
        card.classList.remove("is-accepted");
        status.textContent = textarea?.value.trim() ? "Candidates generated" : "Changes requested";

        if (suggestions) {
          const prompt = textarea?.value.trim().toLowerCase() ?? "";
          if (!prompt) {
            suggestions.hidden = true;
            suggestions.innerHTML = "";
            status.textContent = "Changes requested";
            return;
          }
          suggestions.hidden = false;
          suggestions.innerHTML = '<p class="workflow-suggestion-heading">Searching image sources...</p>';
          status.textContent = "Searching";

          try {
            const candidates = await searchCommonsImages(prompt, readKey, currentPreviewSrc());
            const validCandidates = await filterValidCandidates(candidates);

            if (!validCandidates.length) {
              const fallbackCandidates = await buildFallbackCandidates(prompt, readKey, currentPreviewSrc());

              if (!fallbackCandidates.length) {
                suggestions.innerHTML = '<p class="workflow-suggestion-empty">No usable matches found yet.</p>';
                status.textContent = "No results";
                return;
              }

              status.textContent = "Fallback results";
              suggestions.innerHTML = renderSuggestionCards(fallbackCandidates, readKey, "Best available alternatives");
              wireSuggestionSelection(suggestions, fallbackCandidates, previewImage, previewCaption, status);
              wireCandidateImageFallbacks(suggestions, fallbackCandidates);
              return;
            }

            status.textContent = "Results ready";
            suggestions.innerHTML = renderSuggestionCards(validCandidates, readKey, "Live results");
            wireSuggestionSelection(suggestions, validCandidates, previewImage, previewCaption, status);
            wireCandidateImageFallbacks(suggestions, validCandidates);
          } catch (error) {
            const fallbackCandidates = await buildFallbackCandidates(prompt, readKey, currentPreviewSrc());
            if (fallbackCandidates.length) {
              status.textContent = "Fallback results";
              suggestions.innerHTML = renderSuggestionCards(fallbackCandidates, readKey, "Best available alternatives");
              wireSuggestionSelection(suggestions, fallbackCandidates, previewImage, previewCaption, status);
              wireCandidateImageFallbacks(suggestions, fallbackCandidates);
            } else {
              suggestions.innerHTML =
                '<p class="workflow-suggestion-empty">Search is unavailable right now.</p>';
              status.textContent = "Search unavailable";
            }
          }
        }
      });
    }

    card.dataset.wired = "true";
  });
}

async function searchCommonsImages(prompt, readKey, currentPreviewSrc = "") {
  const queries = buildCommonsQueries(prompt, readKey);
  const seen = new Set();
  const results = [];

  for (const query of queries) {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: query,
      gsrnamespace: "6",
      gsrlimit: "8",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "900",
    });

    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Search failed with status ${response.status}`);
    }

    const data = await response.json();
    const pages = Object.values(data?.query?.pages ?? {});
    const filtered = filterCommonsResults(pages, prompt, readKey, currentPreviewSrc);

    filtered.forEach((candidate) => {
      if (!seen.has(candidate.source)) {
        seen.add(candidate.source);
        results.push(candidate);
      }
    });

    if (results.length >= 6) {
      break;
    }
  }

  return results.slice(0, 6);
}

function buildCommonsQueries(prompt, readKey) {
  const context = workflowSearchContext[readKey] ?? [];
  const profiles = (workflowFigureProfiles[readKey] ?? []).map((profile) => profile.name);
  const lowerPrompt = prompt.toLowerCase();
  const wantsPerson = /person|public figure|known public figure|portrait|someone|people|figure/i.test(lowerPrompt);
  const wantsInstitution = /institution|building|policy|clean|headquarters|office/i.test(lowerPrompt);
  const wantsArchive = /history|historical|period|archive|document/i.test(lowerPrompt);
  const wantsEnergy = /energy|oil|inflation|macro/i.test(lowerPrompt);
  const wantsAlternatives = /alternative|alternatives|another|other|else|instead/i.test(lowerPrompt);

  if (wantsPerson) {
    const portraitQueries = profiles.map((name) => `${name} portrait ${context.join(" ")}`.trim());
    if (wantsAlternatives) {
      portraitQueries.push(`${context.join(" ")} notable person portrait`.trim());
      portraitQueries.push(`${context.join(" ")} economist portrait`.trim());
    }
    return portraitQueries;
  }

  const queries = [`${prompt} ${context.join(" ")}`.trim()];

  if (wantsInstitution) {
    queries.unshift(`${prompt} building ${context.join(" ")}`.trim());
  }

  if (wantsArchive) {
    queries.push(`${prompt} archival photograph ${context.join(" ")}`.trim());
  }

  if (wantsEnergy) {
    queries.push(`${prompt} energy infrastructure ${context.join(" ")}`.trim());
  }

  if (wantsAlternatives) {
    queries.push(`${context.join(" ")} alternative image`.trim());
  }

  return queries;
}

function filterCommonsResults(pages, prompt, readKey, currentPreviewSrc = "") {
  const lowerPrompt = prompt.toLowerCase();
  const wantsPerson = /person|public figure|known public figure|portrait|someone|people|figure/i.test(lowerPrompt);
  const wantsAlternatives = /alternative|alternatives|another|other|else|instead/i.test(lowerPrompt);
  const blockedTerms = [
    ".pdf",
    ".djvu",
    "federal register",
    "iss ",
    "document",
    "report",
    "seal",
    "logo",
    "icon",
    "map",
    "chart",
    "diagram",
  ];
  const peopleNames = (workflowFigureProfiles[readKey] ?? []).map((profile) => profile.name.toLowerCase());

  return pages
    .filter((page) => page.imageinfo?.[0]?.thumburl && page.imageinfo?.[0]?.descriptionurl)
    .map((page) => {
      const title = String(page.title || "").replace(/^File:/, "").replace(/_/g, " ");
      const lowerTitle = title.toLowerCase();
      const personMatch = peopleNames.some((name) => lowerTitle.includes(name.toLowerCase()));
      const blocked = blockedTerms.some((term) => lowerTitle.includes(term));

      return {
        title,
        lowerTitle,
        thumb: page.imageinfo[0].thumburl,
        image: page.imageinfo[0].url || page.imageinfo[0].thumburl,
        source: page.imageinfo[0].descriptionurl,
        personMatch,
        blocked,
      };
    })
    .filter((candidate) => candidate.image !== currentPreviewSrc)
    .filter((candidate) => !candidate.blocked)
    .filter((candidate) => !wantsPerson || candidate.personMatch || candidate.lowerTitle.includes("portrait"))
    .filter((candidate) => !wantsAlternatives || candidate.image !== currentPreviewSrc)
    .map((candidate) => ({
      title: candidate.title,
      thumb: candidate.thumb,
      image: candidate.image,
      source: candidate.source,
      caption: candidate.title,
    }));
}

async function buildFallbackCandidates(prompt, readKey, currentPreviewSrc = "") {
  const lowerPrompt = prompt.toLowerCase();
  const wantsPerson = /person|public figure|known public figure|portrait|someone|people|figure/i.test(lowerPrompt);
  const wantsAlternatives = /alternative|alternatives|another|other|else/i.test(lowerPrompt);
  const profiles = workflowFigureProfiles[readKey] ?? [];

  if (!wantsPerson) {
    return [];
  }

  const candidates = profiles
    .filter((profile) => !wantsAlternatives || profile.image !== currentPreviewSrc)
    .map((profile) => ({
    thumb: profile.image,
    image: profile.image,
    source: profile.source,
    caption: `${profile.name} portrait`,
  }));

  return filterValidCandidates(wantsAlternatives ? candidates.slice(0, 4) : candidates);
}

function renderSuggestionCards(candidates, readKey, heading) {
  return `
    <p class="workflow-suggestion-heading">${heading}</p>
    <div class="workflow-suggestion-track">
      ${candidates
        .map(
          (candidate, index) => `
            <article class="workflow-suggestion-card">
              <img src="${candidate.thumb}" alt="Candidate ${index + 1} for ${readKey}" loading="lazy" />
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
}

function wireSuggestionSelection(container, candidates, previewImage, previewCaption, status) {
  container.querySelectorAll("[data-select-candidate]").forEach((button) => {
    button.addEventListener("click", async () => {
      const candidate = candidates[Number(button.getAttribute("data-select-candidate"))];

      if (!candidate || !previewImage || !previewCaption) {
        return;
      }

      const previewOk = await loadImage(candidate.image);
      if (!previewOk) {
        status.textContent = "Image unavailable";
        button.closest(".workflow-suggestion-card")?.remove();
        return;
      }

      previewImage.src = candidate.image;
      previewCaption.innerHTML = `Proposed image: ${candidate.caption}. Source: <a href="${candidate.source}" target="_blank" rel="noreferrer">Open source</a>.`;
      status.textContent = "Candidate selected";

      const card = button.closest("[data-workflow-card]");
      const sourceLink = card?.querySelector("[data-workflow-source-link]");
      if (sourceLink) {
        sourceLink.href = candidate.source;
      }
    });
  });
}

function wireCandidateImageFallbacks(container, candidates) {
  container.querySelectorAll(".workflow-suggestion-card img").forEach((img, index) => {
    if (img.dataset.fallbackWired === "true") {
      return;
    }

    img.addEventListener("error", () => {
      const candidate = candidates[index];
      const name = candidate?.caption || "Candidate";
      const fallback = document.createElement("div");
      fallback.className = "workflow-suggestion-image-fallback";
      fallback.textContent = initialsFromName(name) || "FT";
      img.replaceWith(fallback);
    });

    img.dataset.fallbackWired = "true";
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
      approval_window: "6pm BST",
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

applyDailyEditionMeta();
applyWorkflowEditionState();
wireAvatarFallbacks();
wireExternalBlankLinks();
wireWorkflowCards();
wireWorkflowLiveTabs();
renderWorkflowLiveDashboard(null, false);
refreshWorkflowLiveStatus();

if (workflowLive) {
  window.setInterval(refreshWorkflowLiveStatus, 15000);
}

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
