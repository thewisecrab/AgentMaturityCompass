function hashText(input) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function renderQrLike(container, text) {
  const size = 21;
  const scale = 6;
  const seed = hashText(text);
  let bits = seed;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("width", String(size * scale));
  svg.setAttribute("height", String(size * scale));
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Pairing QR for ${text}`);

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(size));
  bg.setAttribute("height", String(size));
  bg.setAttribute("fill", "#fff");
  svg.appendChild(bg);

  const square = (x, y, w, fill = "#000") => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(w));
    rect.setAttribute("height", String(w));
    rect.setAttribute("fill", fill);
    svg.appendChild(rect);
  };

  const finder = (x, y) => {
    square(x, y, 7);
    square(x + 1, y + 1, 5, "#fff");
    square(x + 2, y + 2, 3);
  };

  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inFinder = (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);
      if (inFinder) {
        continue;
      }
      bits ^= bits << 13;
      bits ^= bits >>> 17;
      bits ^= bits << 5;
      const on = ((bits + x * 31 + y * 17) & 1) === 1;
      if (on) {
        square(x, y, 1);
      }
    }
  }

  container.innerHTML = "";
  container.appendChild(svg);
}

