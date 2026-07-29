const API_BASE = 'https://api.ayrshare.com/api';
const KEY = 'ayrshare-api-key-v1';

export function loadApiKey(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveApiKey(apiKey: string): void {
  try {
    if (apiKey) localStorage.setItem(KEY, apiKey);
    else localStorage.removeItem(KEY);
  } catch {
    // Private-mode/quota failures are non-fatal.
  }
}

async function ayrshareFetch(path: string, apiKey: string, body: unknown): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status === 'error') {
    const message = json?.errors?.[0]?.message ?? json?.message ?? `שגיאת שרת (${res.status})`;
    throw new Error(message);
  }
  return json;
}

/** Uploads one slide image (data URL) to Ayrshare's media host, returning a public URL. */
export async function uploadMedia(apiKey: string, dataUrl: string, fileName: string): Promise<string> {
  const json = await ayrshareFetch('/media/upload', apiKey, { file: dataUrl, fileName });
  const url = json?.url;
  if (!url) throw new Error('העלאת התמונה נכשלה');
  return url;
}

/** Publishes an Instagram carousel post (2+ images) via Ayrshare. Returns the Instagram post URL, if any. */
export async function postCarousel(apiKey: string, imageUrls: string[], caption: string): Promise<string | undefined> {
  const json = await ayrshareFetch('/post', apiKey, {
    post: caption,
    platforms: ['instagram'],
    mediaUrls: imageUrls,
  });
  const result = json?.postIds?.find((p: any) => p.platform === 'instagram');
  if (result?.status === 'error') throw new Error(result.errors?.[0]?.message ?? 'הפרסום נכשל');
  return result?.postUrl;
}

export type PostProgress = { done: number; total: number; stage: 'uploading' | 'publishing' };

/** Captures every slide, uploads the images, then publishes them as one Instagram carousel post. */
export async function postSlidesToInstagram(
  apiKey: string,
  nodes: HTMLElement[],
  caption: string,
  onProgress?: (p: PostProgress) => void,
): Promise<string | undefined> {
  const { capture } = await import('./export');
  const urls: string[] = [];
  for (let i = 0; i < nodes.length; i++) {
    onProgress?.({ done: i, total: nodes.length, stage: 'uploading' });
    const dataUrl = await capture(nodes[i]);
    urls.push(await uploadMedia(apiKey, dataUrl, `slide-${i + 1}.png`));
  }
  onProgress?.({ done: nodes.length, total: nodes.length, stage: 'publishing' });
  return postCarousel(apiKey, urls, caption);
}
