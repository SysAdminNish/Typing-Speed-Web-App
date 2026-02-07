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

const timerSelect = document.getElementById("timer-select");
const btnStart = document.getElementById("btn-start");
const btnTryAgain = document.getElementById("btn-try-again");
const btnNewTest = document.getElementById("btn-new-test");
const testTimerEl = document.getElementById("test-timer");
const passageDisplay = document.getElementById("passage-display");
const testInput = document.getElementById("test-input");
const navLanding = document.getElementById("nav-landing");
const navReports = document.getElementById("nav-reports");
const navResources = document.getElementById("nav-resources");

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
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${seconds / 60} min`;
  return `${seconds / 3600} min`;
}

function startTest() {
  const duration = parseInt(timerSelect.value, 10) || 60;
  appState.durationSeconds = duration;
  appState.currentPassage = getRandomPassage();
  appState.testInProgress = true;

  passageDisplay.innerHTML = "";
  testInput.value = "";
  testInput.disabled = false;

  test.start(duration, appState.currentPassage, {
    onTick(remaining) {
      testTimerEl.textContent = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`;
      renderPassageHighlight();
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

function renderPassageHighlight() {
  const { passage, input } = test.getPassageAndInput();
  passageDisplay.innerHTML = "";
  for (let i = 0; i < passage.length; i++) {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = passage[i];
    if (i < input.length) {
      span.classList.add(passage[i] === input[i] ? "correct" : "incorrect");
    } else if (i === input.length) {
      span.classList.add("current");
    }
    passageDisplay.appendChild(span);
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
  appState.currentPassage = getRandomPassage();
  appState.testInProgress = true;
  passageDisplay.innerHTML = "";
  testInput.value = "";
  testInput.disabled = false;

  test.start(appState.durationSeconds, appState.currentPassage, {
    onTick(remaining) {
      testTimerEl.textContent = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`;
      renderPassageHighlight();
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
  timerSelect.value = String(appState.durationSeconds);

  btnStart.addEventListener("click", () => {
    if (appState.screen === "landing") startTest();
  });

  testInput.addEventListener("input", () => {
    test.setInput(testInput.value);
    renderPassageHighlight();
  });

  testInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (confirm("Cancel the test?")) {
        test.stop();
        appState.testInProgress = false;
        showScreen(SCREENS.landing);
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && appState.screen === "landing" && document.activeElement?.id !== "timer-select") {
      e.preventDefault();
      startTest();
    }
  });

  document.addEventListener("keydown", focusTrap);

  btnTryAgain.addEventListener("click", tryAgain);
  btnNewTest.addEventListener("click", newTest);

  setupNav();
  showScreen(SCREENS.landing);
}

init();
