/**
 * Main controller: state, screens, start/try-again/new-test, nav, results binding, storage, chart.
 */

import { getRandomPassage } from "./texts.js";
import * as test from "./test.js";
import * as storage from "./storage.js";
import * as chart from "./chart.js";

const SCREENS = {
  landing: "screen-landing",
  test: "screen-test",
  results: "screen-results",
  reports: "screen-reports",
  resources: "screen-resources",
};

let appState = {
  screen: "landing",
  durationSeconds: 60,
  testInProgress: false,
  currentPassage: "",
  lastResult: null,
};

let passageWindowStart = 0;

const btnStart = document.getElementById("btn-start");
const btnTryAgain = document.getElementById("btn-try-again");
const btnNewTest = document.getElementById("btn-new-test");
const testTimerEl = document.getElementById("test-timer");
const passageDisplay = document.getElementById("passage-display");
const passageWrapper = document.querySelector(".passage-wrapper");
const testInput = document.getElementById("test-input");
const navLanding = document.getElementById("nav-landing");
const navReports = document.getElementById("nav-reports");
const navResources = document.getElementById("nav-resources");
const durationSelectedLabel = document.getElementById("duration-selected-label");
const emptyStateStats = document.getElementById("empty-state-stats");
const emptyStateTip = document.getElementById("empty-state-tip");

const DURATIONS = [
  { value: 30, label: "30s" },
  { value: 60, label: "1min" },
  { value: 120, label: "2min" },
  { value: 300, label: "5min" },
  { value: 600, label: "10min" },
];

const resultWpm = document.getElementById("result-wpm");
const resultAccuracy = document.getElementById("result-accuracy");
const resultCharacters = document.getElementById("result-characters");
const resultConsistency = document.getElementById("result-consistency");
const resultDuration = document.getElementById("result-duration");

function showScreen(screenId) {
  Object.values(SCREENS).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", id !== screenId);
  });
  appState.screen = Object.entries(SCREENS).find(([, id]) => id === screenId)?.[0] || screenId;

  if (screenId === SCREENS.reports) {
    renderReports();
  }
  if (screenId === SCREENS.landing) {
    renderEmptyState();
  }
}

function renderEmptyState() {
  const history = storage.getHistory();
  const { byDuration } = storage.getPersonalBests();
  const bestWpm = Math.max(0, ...Object.values(byDuration).map((x) => x.bestWpm));
  const TIPS = [
    "Tip: Keep your fingers on the home row keys.",
    "Tip: Position fingers on home row (ASDF JKL;) for better speed.",
    "Tip: Focus on accuracy first; speed will follow.",
  ];
  if (bestWpm > 0 && emptyStateStats) {
    emptyStateStats.textContent = `Your best: ${bestWpm} WPM`;
    emptyStateStats.style.display = "";
  } else if (emptyStateStats) {
    emptyStateStats.style.display = "none";
  }
  if (emptyStateTip) {
    const tipIndex = Math.floor(Math.random() * TIPS.length);
    emptyStateTip.textContent = TIPS[tipIndex];
  }
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${seconds / 60} min`;
  return `${seconds / 3600} min`;
}

function getDurationLabel(seconds) {
  const d = DURATIONS.find((x) => x.value === seconds);
  return d ? d.label : formatDuration(seconds);
}

function startTest() {
  const duration = appState.durationSeconds;
  appState.currentPassage = getRandomPassage(duration);
  appState.testInProgress = true;
  passageWindowStart = 0;

  passageDisplay.innerHTML = "";
  testInput.value = "";
  testInput.disabled = false;

  test.start(duration, appState.currentPassage, {
    onTick(remaining) {
      testTimerEl.textContent = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`;
    },
    onComplete(result) {
      appState.testInProgress = false;
      appState.lastResult = result;
      storage.save(result);
      showScreen(SCREENS.results);
      bindResultToDom(result);
      chart.renderWPMGraph("wpm-chart", result.wpmData, result.duration);
      testInput.disabled = true;
    },
  });

  renderPassageHighlight();
  showScreen(SCREENS.test);
  testInput.focus();
}

const LINES_VISIBLE = 6;
const APPROX_CHARS_PER_LINE = 70;
const PASSAGE_WINDOW_CHARS = LINES_VISIBLE * APPROX_CHARS_PER_LINE;
const LINES_BEFORE_FIRST_SHIFT = 2;
const CHARS_BEFORE_LINE_SHIFT = LINES_BEFORE_FIRST_SHIFT * APPROX_CHARS_PER_LINE;
const TYPING_LINE_OFFSET_RATIO = 0.28;

function wordBoundaryStart(passage, preferred) {
  let idx = Math.max(0, preferred);
  while (idx > 0 && passage[idx - 1] !== " " && passage[idx - 1] !== "\n") idx--;
  return idx;
}

function wordBoundaryEnd(passage, preferred, len) {
  let idx = Math.min(preferred, len);
  while (idx < len && passage[idx] !== " " && passage[idx] !== "\n") idx++;
  if (idx < len) idx++;
  return idx;
}

function nextLineStart(passage, from, len) {
  const searchEnd = Math.min(from + APPROX_CHARS_PER_LINE + 20, len);
  for (let i = from; i < searchEnd; i++) {
    if (passage[i] === "\n") return i + 1;
  }
  return wordBoundaryStart(passage, from + APPROX_CHARS_PER_LINE);
}

function renderPassageHighlight() {
  const { passage, input } = test.getPassageAndInput();
  const len = passage.length;
  const pos = input.length;

  if (len === 0) {
    passageDisplay.innerHTML = "";
    return;
  }

  const charsTypedInWindow = pos - passageWindowStart;
  if (charsTypedInWindow >= CHARS_BEFORE_LINE_SHIFT) {
    while (pos >= passageWindowStart + CHARS_BEFORE_LINE_SHIFT) {
      const next = nextLineStart(passage, passageWindowStart, len);
      if (next <= passageWindowStart) break;
      passageWindowStart = next;
    }
  }

  const start = passageWindowStart;
  const end = wordBoundaryEnd(passage, start + PASSAGE_WINDOW_CHARS, len);
  const fragment = document.createDocumentFragment();

  for (let i = start; i < end; i++) {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = passage[i];
    if (i < pos) {
      span.classList.add(passage[i] === input[i] ? "correct" : "incorrect");
    } else if (i === pos) {
      span.classList.add("current");
    }
    fragment.appendChild(span);
  }

  const inner = document.createElement("div");
  inner.className = "passage-inner";
  inner.appendChild(fragment);

  passageDisplay.innerHTML = "";
  passageDisplay.appendChild(inner);

  if (pos < len) {
    const currentSpan = passageDisplay.querySelector(".char.current");
    if (currentSpan) {
      requestAnimationFrame(() => {
        const container = passageDisplay;
        const innerEl = container.querySelector(".passage-inner");
        const spanTop = currentSpan.offsetTop;
        const containerHeight = container.clientHeight;
        const targetOffset = containerHeight * TYPING_LINE_OFFSET_RATIO;
        const translateY = Math.max(0, spanTop - targetOffset);
        innerEl.style.transform = `translateY(-${translateY}px)`;
      });
    }
  }
}

function bindResultToDom(result) {
  resultWpm.textContent = result.wpm;
  resultAccuracy.textContent = `${result.accuracy}%`;
  resultCharacters.textContent = result.charactersTyped;
  resultConsistency.textContent = result.consistency;
  resultDuration.textContent = formatDuration(result.timeSelected ?? result.duration);
}

function tryAgain() {
  appState.currentPassage = getRandomPassage(appState.durationSeconds);
  appState.testInProgress = true;
  passageWindowStart = 0;
  passageDisplay.innerHTML = "";
  testInput.value = "";
  testInput.disabled = false;

  test.start(appState.durationSeconds, appState.currentPassage, {
    onTick(remaining) {
      testTimerEl.textContent = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`;
    },
    onComplete(result) {
      appState.testInProgress = false;
      appState.lastResult = result;
      storage.save(result);
      showScreen(SCREENS.results);
      bindResultToDom(result);
      chart.renderWPMGraph("wpm-chart", result.wpmData, result.duration);
      testInput.disabled = true;
    },
  });

  renderPassageHighlight();
  showScreen(SCREENS.test);
  testInput.focus();
}

function newTest() {
  showScreen(SCREENS.landing);
}

function renderReports() {
  const history = storage.getHistory();
  const { byDuration } = storage.getPersonalBests();

  const bestsEl = document.getElementById("personal-bests");
  const durations = [30, 60, 120, 300, 600];
  const lines = durations
    .filter((d) => byDuration[d])
    .map(
      (d) =>
        `${formatDuration(d)}: Best WPM ${byDuration[d].bestWpm}, Best accuracy ${byDuration[d].bestAccuracy.toFixed(1)}%`
    );
  bestsEl.textContent = lines.length ? `Personal bests: ${lines.join(" | ")}` : "No tests recorded yet.";

  const tbody = document.getElementById("history-tbody");
  tbody.innerHTML = "";
  history.forEach((r) => {
    const tr = document.createElement("tr");
    const date = new Date(r.date).toLocaleString();
    tr.innerHTML = `
      <td>${date}</td>
      <td>${formatDuration(r.duration)}</td>
      <td>${r.wpm}</td>
      <td>${r.accuracy}%</td>
      <td>${r.consistency}</td>
    `;
    tbody.appendChild(tr);
  });

  chart.renderTrendChart("trend-chart", history);
}

function setupNav() {
  navLanding.addEventListener("click", (e) => {
    e.preventDefault();
    showScreen(SCREENS.landing);
  });
  navReports.addEventListener("click", (e) => {
    e.preventDefault();
    showScreen(SCREENS.reports);
  });
  navResources.addEventListener("click", (e) => {
    e.preventDefault();
    showScreen(SCREENS.resources);
  });
}

function focusTrap(e) {
  if (appState.screen !== "test" || !appState.testInProgress) return;
  if (e.key !== "Tab") return;
  if (document.activeElement !== testInput) {
    e.preventDefault();
    testInput.focus();
  } else {
    e.preventDefault();
    testInput.focus();
  }
}

function init() {
  document.querySelectorAll(".duration-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const duration = parseInt(btn.dataset.duration, 10);
      appState.durationSeconds = duration;
      document.querySelectorAll(".duration-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      if (durationSelectedLabel) durationSelectedLabel.textContent = `(${getDurationLabel(duration)} selected)`;
    });
  });
  if (durationSelectedLabel) durationSelectedLabel.textContent = `(${getDurationLabel(appState.durationSeconds)} selected)`;

  btnStart.addEventListener("click", () => {
    if (appState.screen === "landing") startTest();
  });

  testInput.addEventListener("input", () => {
    let v = testInput.value;
    if (v.includes("\n")) v = v.replace(/\n/g, " ");
    if (v !== testInput.value) testInput.value = v;
    test.setInput(v);
    renderPassageHighlight();
  });

  testInput.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\n/g, " ");
    const start = testInput.selectionStart;
    const end = testInput.selectionEnd;
    const val = testInput.value;
    const newVal = val.slice(0, start) + text + val.slice(end);
    testInput.value = newVal;
    test.setInput(newVal);
    renderPassageHighlight();
  });

  testInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (appState.testInProgress) {
        test.stop();
        appState.testInProgress = false;
        showScreen(SCREENS.landing);
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && appState.screen === "landing" && !document.activeElement?.classList?.contains("duration-btn")) {
      e.preventDefault();
      startTest();
    }
    if (e.key === "Escape" && appState.screen === "test" && appState.testInProgress) {
      e.preventDefault();
      e.stopPropagation();
      test.stop();
      appState.testInProgress = false;
      showScreen(SCREENS.landing);
    }
  });

  document.addEventListener("keydown", focusTrap);

  btnTryAgain.addEventListener("click", tryAgain);
  btnNewTest.addEventListener("click", newTest);

  setupNav();
  showScreen(SCREENS.landing);
  if (passageWrapper) {
    passageWrapper.addEventListener("click", () => {
      if (appState.screen === "test" && appState.testInProgress) testInput.focus();
    });
  }

  function lockPassageScroll(e) {
    if (appState.screen === "test" && appState.testInProgress && passageDisplay.contains(e.target)) {
      e.preventDefault();
    }
  }
  passageDisplay.addEventListener("wheel", lockPassageScroll, { passive: false });
  passageDisplay.addEventListener("touchmove", lockPassageScroll, { passive: false });
}

init();
