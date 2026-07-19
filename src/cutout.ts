/**
 * Client-side background removal for the 'cutout' logo style: flood-fills the
 * border background color to transparency and crops to the remaining content.
 * Results are cached per source data URL, so repeated calls are cheap.
 */

const TOLERANCE = 60; // max euclidean RGB distance from the border color to count as background

const cache = new Map<string, Promise<string>>();

export function makeCutout(dataUrl: string): Promise<string> {
  let p = cache.get(dataUrl);
  if (!p) {
    p = removeBackground(dataUrl).catch((e) => {
      cache.delete(dataUrl);
      throw e;
    });
    cache.set(dataUrl, p);
  }
  return p;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load logo image'));
    img.src = src;
  });
}

async function removeBackground(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const w = img.width;
  const h = img.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;

  // Images that already have transparency (e.g. PNG logos) are used as-is.
  let transparent = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 16) transparent++;
  if (transparent > (w * h) / 20) return dataUrl;

  // Estimate the background color as the average of the border pixels.
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const addBorder = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
    n++;
  };
  for (let x = 0; x < w; x++) {
    addBorder(x, 0);
    addBorder(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    addBorder(0, y);
    addBorder(w - 1, y);
  }
  r /= n;
  g /= n;
  b /= n;

  const isBgColor = (idx: number) => {
    const i = idx * 4;
    const dr = d[i] - r;
    const dg = d[i + 1] - g;
    const db = d[i + 2] - b;
    return dr * dr + dg * dg + db * db <= TOLERANCE * TOLERANCE;
  };

  // Flood fill from the borders so background-colored areas inside the icon
  // itself are preserved.
  const mask = new Uint8Array(w * h);
  const queue: number[] = [];
  const seed = (idx: number) => {
    if (!mask[idx] && isBgColor(idx)) {
      mask[idx] = 1;
      queue.push(idx);
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 1; y < h - 1; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }
  for (let head = 0; head < queue.length; head++) {
    const idx = queue[head];
    const x = idx % w;
    const y = (idx - x) / w;
    if (x > 0) seed(idx - 1);
    if (x < w - 1) seed(idx + 1);
    if (y > 0) seed(idx - w);
    if (y < h - 1) seed(idx + w);
  }

  for (let idx = 0; idx < mask.length; idx++) {
    if (mask[idx]) d[idx * 4 + 3] = 0;
  }

  // Crop to the opaque bounding box, with a small padding.
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return dataUrl; // everything matched the background; keep the original

  ctx.putImageData(image, 0, 0);
  const pad = Math.round(Math.max(w, h) * 0.02);
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const cw = Math.min(w, maxX + pad + 1) - sx;
  const ch = Math.min(h, maxY + pad + 1) - sy;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  out.getContext('2d')!.drawImage(canvas, sx, sy, cw, ch, 0, 0, cw, ch);
  return out.toDataURL('image/png');
}
