import { useState } from 'react';
import { loadApiKey, saveApiKey, postSlidesToInstagram, type PostProgress } from '../ayrshare';

interface Props {
  nodes: HTMLElement[];
  defaultCaption: string;
  onClose: () => void;
}

type Status = { kind: 'idle' } | { kind: 'busy'; progress: PostProgress } | { kind: 'done'; url?: string } | { kind: 'error'; message: string };

/** Modal for publishing the carousel straight to Instagram via the Ayrshare API (free tier: 20 image posts/mo). */
export default function PostToInstagramModal({ nodes, defaultCaption, onClose }: Props) {
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [caption, setCaption] = useState(defaultCaption);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const busy = status.kind === 'busy';

  const submit = async () => {
    const key = apiKey.trim();
    if (!key) return;
    saveApiKey(key);
    setStatus({ kind: 'busy', progress: { done: 0, total: nodes.length, stage: 'uploading' } });
    try {
      const url = await postSlidesToInstagram(key, nodes, caption, (progress) => setStatus({ kind: 'busy', progress }));
      setStatus({ kind: 'done', url });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'הפרסום נכשל' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={busy ? undefined : onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">פרסום ישיר לאינסטגרם</h2>
          {!busy && (
            <button type="button" onClick={onClose} aria-label="סגירה" className="text-xl text-neutral-400 hover:text-neutral-600">
              ✕
            </button>
          )}
        </div>

        {status.kind === 'done' ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-green-700">הקרוסלה פורסמה בהצלחה!</p>
            {status.url && (
              <a href={status.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#E1306C] underline">
                צפייה בפוסט
              </a>
            )}
            <button type="button" onClick={onClose} className="rounded-lg bg-[#E1306C] px-4 py-2 text-sm font-semibold text-white">
              סגירה
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xs leading-relaxed text-neutral-500">
              פרסום דרך{' '}
              <a href="https://www.ayrshare.com" target="_blank" rel="noreferrer" className="underline">
                Ayrshare
              </a>{' '}
              — חברו את חשבון האינסטגרם העסקי שלכם וקבלו מפתח API. המסלול החינמי כולל 20 פרסומים בחודש.
            </p>
            <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
              מפתח API של Ayrshare
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={busy}
                placeholder="הדביקו כאן את מפתח ה-API"
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal text-neutral-800 outline-none focus:border-[#E1306C]"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
              כיתוב הפוסט
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={busy}
                rows={3}
                className="resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal text-neutral-800 outline-none focus:border-[#E1306C]"
              />
            </label>

            {status.kind === 'error' && <p className="text-xs text-red-600">{status.message}</p>}

            <button
              type="button"
              disabled={busy || !apiKey.trim()}
              onClick={submit}
              className="rounded-lg bg-[#E1306C] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {busy
                ? status.progress.stage === 'uploading'
                  ? `מעלה תמונות… (${status.progress.done}/${status.progress.total})`
                  : 'מפרסם…'
                : `פרסום ${nodes.length} שקופיות לאינסטגרם`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
