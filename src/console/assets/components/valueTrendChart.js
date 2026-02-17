import { renderLine } from "../charts.js";

export function renderValueTrendChart(canvas, points, color = "#0f766e") {
  const values = Array.isArray(points)
    ? points
        .map((row) => Number(row?.value))
        .filter((value) => Number.isFinite(value))
    : [];
  renderLine(canvas, values.length > 0 ? values : [0], color);
}
