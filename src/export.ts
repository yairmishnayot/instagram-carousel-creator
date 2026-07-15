import { toPng } from 'html-to-image';
import JSZip from 'jszip';

export function safeTitle(title: string): string {
  const cleaned = title.trim().replace(/[\\/:*?"<>|]+/g, '-');
  return cleaned || 'carousel';
}

async function capture(node: HTMLElement): Promise<string> {
  await document.fonts.ready;
  return toPng(node, { width: node.offsetWidth, height: node.offsetHeight, pixelRatio: 1 });
}

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

export async function downloadSlide(
  node: HTMLElement,
  title: string,
  index: number,
): Promise<void> {
  const dataUrl = await capture(node);
  triggerDownload(dataUrl, `${safeTitle(title)}-${index + 1}.png`);
}

export async function downloadAllImages(
  nodes: HTMLElement[],
  title: string,
): Promise<void> {
  const prefix = safeTitle(title);
  for (let i = 0; i < nodes.length; i++) {
    const dataUrl = await capture(nodes[i]);
    triggerDownload(dataUrl, `${prefix}-${i + 1}.png`);
    // Small gap between downloads so the browser doesn't drop any of them.
    await new Promise((r) => setTimeout(r, 300));
  }
}

export async function downloadAll(
  nodes: HTMLElement[],
  title: string,
): Promise<void> {
  const zip = new JSZip();
  const prefix = safeTitle(title);
  for (let i = 0; i < nodes.length; i++) {
    const dataUrl = await capture(nodes[i]);
    zip.file(`${prefix}-${i + 1}.png`, dataUrl.split(',')[1], { base64: true });
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${prefix}.zip`);
  URL.revokeObjectURL(url);
}
