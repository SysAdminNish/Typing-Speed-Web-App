/**
 * Test execution: timer, input tracking, WPM/accuracy/consistency, per-second WPM data.
 */

const WORDS_PER_CHAR = 1 / 5; // 1 word = 5 characters

let state = {
  durationSeconds: 0,
  remainingSeconds: 0,
  passageText: "",
  inputValue: "",
  startTime: null,
  timerId: null,
  wpmData: [],
  charsThisSecond: 0,
  lastSecondTime: null,
  onTick: null,
  onComplete: null,
};

/**
 * Standard deviation of an array of numbers.
 * @param {number[]} arr
 * @returns {number}
 */
function standardDeviation(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squaredDiffs = arr.map((x) => Math.pow(x - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Count correct characters vs passage prefix.
 * @param {string} passage
 * @param {string} input
 * @returns {{ correct: number, total: number }}
 */
function getAccuracyCounts(passage, input) {
  let correct = 0;
  const total = input.length;
  for (let i = 0; i < total; i++) {
    if (passage[i] === input[i]) correct++;
  }
  return { correct, total };
}

/**
 * Start the test.
 * @param {number} durationSeconds
 * @param {string} passageText
 * @param {object} callbacks
 * @param {function(number): void} callbacks.onTick - (remainingSeconds) each second
 * @param {function(object): void} callbacks.onComplete - (result) when test ends
 */
export function start(durationSeconds, passageText, callbacks = {}) {
  stop();

  state = {
    durationSeconds,
    remainingSeconds: durationSeconds,
    passageText: passageText || "",
    inputValue: "",
    startTime: Date.now(),
    timerId: null,
    wpmData: [],
    charsThisSecond: 0,
    lastSecondTime: Math.floor(Date.now() / 1000),
    onTick: callbacks.onTick || (() => {}),
    onComplete: callbacks.onComplete || (() => {}),
  };

  state.timerId = setInterval(tick, 1000);
  state.onTick(state.remainingSeconds);
}

/**
 * Stop the test and clear timer.
 */
export function stop() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

/**
 * Timer tick: decrement remaining, record per-second WPM, check for end.
 */
function tick() {
  state.remainingSeconds--;
  const now = Math.floor(Date.now() / 1000);
  const elapsed = state.durationSeconds - state.remainingSeconds;

  // Per-second WPM: (chars this second / 5) * 60 = charsThisSecond * 12
  const wpmThisSecond = state.charsThisSecond * 12;
  state.wpmData.push(wpmThisSecond);
  state.charsThisSecond = 0;
  state.lastSecondTime = now;

  state.onTick(state.remainingSeconds);

  if (state.remainingSeconds <= 0) {
    finish();
  }
}

/**
 * Record current input (call from app on input event).
 * @param {string} value
 */
export function setInput(value) {
  const prevLen = state.inputValue.length;
  state.inputValue = value;
  const now = Math.floor(Date.now() / 1000);
  if (now === state.lastSecondTime && value.length > prevLen) {
    state.charsThisSecond += value.length - prevLen;
  }
}

/**
 * Finish the test and compute results.
 */
function finish() {
  stop();
  const elapsed = state.durationSeconds;
  const { correct, total } = getAccuracyCounts(state.passageText, state.inputValue);
  const charactersTyped = state.inputValue.length;
  const wpm = elapsed > 0 ? (charactersTyped / 5) / (elapsed / 60) : 0;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  const consistency = standardDeviation(state.wpmData);

  const result = {
    testId: state.startTime,
    date: new Date().toISOString(),
    duration: state.durationSeconds,
    wpm: Math.round(wpm * 10) / 10,
    accuracy: Math.round(accuracy * 10) / 10,
    consistency: Math.round(consistency * 10) / 10,
    charactersTyped,
    timeSelected: state.durationSeconds,
    wpmData: [...state.wpmData],
  };

  state.onComplete(result);
}

/**
 * Get remaining time in seconds (for display).
 * @returns {number}
 */
export function getRemainingSeconds() {
  return state.remainingSeconds;
}

/**
 * Get current passage and input for UI (character-level highlighting).
 * @returns {{ passage: string, input: string }}
 */
export function getPassageAndInput() {
  return { passage: state.passageText, input: state.inputValue };
}

/**
 * Check if test is currently running.
 * @returns {boolean}
 */
export function isRunning() {
  return state.timerId != null;
}
