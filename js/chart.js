/**
 * Chart.js wrappers: WPM over time (per test) and improvement trend (reports).
 */

let wpmChartInstance = null;
let trendChartInstance = null;

/**
 * Render WPM-over-time line chart after a test.
 * @param {string} containerId - Canvas element id
 * @param {number[]} wpmData - WPM per second
 * @param {number} durationSeconds
 */
export function renderWPMGraph(containerId, wpmData, durationSeconds) {
  const canvas = document.getElementById(containerId);
  if (!canvas) return;

  if (wpmChartInstance) {
    wpmChartInstance.destroy();
    wpmChartInstance = null;
  }

  const labels = wpmData.map((_, i) => i + 1);
  const data = wpmData;

  wpmChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "WPM",
          data,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Time (seconds)" },
        },
        y: {
          title: { display: true, text: "WPM" },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

/**
 * Render improvement trend chart (WPM over test date) in Reports.
 * @param {string} containerId - Canvas element id
 * @param {Array<{ date: string, wpm: number }>} history - Sorted by date (newest first or chronological for trend)
 */
export function renderTrendChart(containerId, history) {
  const canvas = document.getElementById(containerId);
  if (!canvas) return;

  if (trendChartInstance) {
    trendChartInstance.destroy();
    trendChartInstance = null;
  }

  const chronological = [...history].reverse();
  const labels = chronological.map((r) => {
    const d = new Date(r.date);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
  });
  const data = chronological.map((r) => r.wpm);

  trendChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "WPM",
          data,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Date" },
        },
        y: {
          title: { display: true, text: "WPM" },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}
