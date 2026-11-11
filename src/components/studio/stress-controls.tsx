"use client";
import type { StudioDocument } from "@/lib/studio";
import { stressDocument } from "@/lib/studio-stress";
import type { StudioCopy } from "@/lib/studio-copy";
export function StressControls({
  initial,
  change,
  labels,
}: {
  initial: StudioDocument;
  change: (doc: StudioDocument) => void;
  labels: StudioCopy;
}) {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <div
      aria-label="Development data"
      className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-lg border border-forest/25 bg-paper p-1 text-sm shadow-sm"
    >
      <button className="min-h-11 px-3 whitespace-nowrap" onClick={() => change(initial)}>
        {labels.data}
      </button>
      <button
        className="min-h-11 px-3 whitespace-nowrap"
        onClick={() => change(stressDocument(initial.kind))}
      >
        {labels.worst}
      </button>
    </div>
  );
}
