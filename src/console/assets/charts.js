export function renderLine(canvas, values, color = "#134e4a") {
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, w, h);
  if (!values || values.length === 0) {
    return;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((value, idx) => {
    const x = (idx / Math.max(1, values.length - 1)) * (w - 16) + 8;
    const y = h - 8 - ((value - min) / range) * (h - 16);
    if (idx === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

export function renderBars(canvas, values, color = "#1d4ed8") {
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, w, h);
  if (!values || values.length === 0) {
    return;
  }
  const max = Math.max(1, ...values);
  const gap = 4;
  const barW = (w - gap * (values.length + 1)) / values.length;
  ctx.fillStyle = color;
  values.forEach((value, idx) => {
    const barH = ((value || 0) / max) * (h - 16);
    const x = gap + idx * (barW + gap);
    const y = h - 8 - barH;
    ctx.fillRect(x, y, barW, barH);
  });
}

