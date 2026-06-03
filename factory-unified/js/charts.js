/* ============================ CHART.JS WRAPPERS ============================ */

export function createDonut(ctx, labels, data, colors, opts = {}) {
  if (!ctx) return null;
  const cur = opts.currency || "CNY";
  const rate = opts.rate || 7;
  const sym = cur === "USD" ? "$" : "¥";
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: "#131821",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { color: "#8B9DB8", font: { size: 10 }, boxWidth: 10 } },
        tooltip: {
          callbacks: {
            label: (c) => {
              const v = c.raw;
              return c.label + ": " + sym + formatNumber(v);
            },
          },
        },
      },
    },
  });
}

export function createBar(ctx, labels, datasets, opts = {}) {
  if (!ctx) return null;
  return new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: opts.horizontal ? "y" : "x",
      scales: {
        x: {
          stacked: opts.stacked || false,
          grid: { color: "#1E2A3A" },
          ticks: { color: "#4A5D75", font: { size: 10 } },
        },
        y: {
          stacked: opts.stacked || false,
          grid: { color: "#1E2A3A" },
          ticks: { color: "#4A5D75", font: { size: 10 } },
        },
      },
      plugins: {
        legend: { labels: { color: "#8B9DB8", font: { size: 10 }, boxWidth: 10 } },
      },
    },
  });
}

export function createLine(ctx, labels, datasets, opts = {}) {
  if (!ctx) return null;
  return new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: "#1E2A3A" },
          ticks: { color: "#4A5D75", font: { size: 10 } },
        },
        y: {
          grid: { color: "#1E2A3A" },
          ticks: { color: "#4A5D75", font: { size: 10 } },
        },
      },
      plugins: {
        legend: { labels: { color: "#8B9DB8", font: { size: 10 }, boxWidth: 10 } },
        // annotation: opts.annotation || {},
      },
    },
  });
}

function formatNumber(v) {
  if (!isFinite(v)) v = 0;
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
