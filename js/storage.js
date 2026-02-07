/**
 * localStorage management for test history and personal bests.
 */

const STORAGE_KEY = "typingTestHistory";

/**
 * @typedef {Object} TestResult
 * @property {number} testId
 * @property {string} date
 * @property {number} duration
 * @property {number} wpm
 * @property {number} accuracy
 * @property {number} consistency
 * @property {number} charactersTyped
 * @property {number[]} wpmData
 */

/**
 * Saves a test result to localStorage.
 * @param {TestResult} result
 */
export function save(result) {
  try {
    const history = getHistoryRaw();
    const record = {
      testId: result.testId ?? Date.now(),
      date: result.date ?? new Date().toISOString(),
      duration: result.duration,
      wpm: result.wpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      charactersTyped: result.charactersTyped,
      wpmData: result.wpmData ?? [],
    };
    history.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save test result:", e);
  }
}

/**
 * @returns {TestResult[]} Raw history (oldest first in storage; we sort when reading)
 */
function getHistoryRaw() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Returns full history sorted by date descending (newest first).
 * @returns {TestResult[]}
 */
export function getHistory() {
  const raw = getHistoryRaw();
  return [...raw].sort((a, b) => {
    const tA = new Date(a.date).getTime();
    const tB = new Date(b.date).getTime();
    return tB - tA;
  });
}

/**
 * Returns personal bests: max WPM and best accuracy per duration.
 * @returns {{ byDuration: Record<number, { bestWpm: number, bestAccuracy: number }> }}
 */
export function getPersonalBests() {
  const history = getHistoryRaw();
  const byDuration = {};

  for (const record of history) {
    const d = record.duration;
    if (!byDuration[d]) {
      byDuration[d] = { bestWpm: 0, bestAccuracy: 0 };
    }
    if (record.wpm > byDuration[d].bestWpm) byDuration[d].bestWpm = record.wpm;
    if (record.accuracy > byDuration[d].bestAccuracy) byDuration[d].bestAccuracy = record.accuracy;
  }

  return { byDuration };
}
