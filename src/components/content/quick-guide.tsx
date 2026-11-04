import { Minus, Plus, Save, Share2 } from "lucide-react";
import type { HelpAction, QuickGuide as QuickGuideCopy } from "@/lib/help";
import type { Messages } from "@/lib/i18n";

function ControlPreview({ example, t }: { example: HelpAction["example"]; t: Messages }) {
  if (example === "teams" || example === "timer") {
    return (
      <span className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-lg bg-action px-3 py-2 text-base font-semibold text-on-action">
        {example === "teams" ? t.teams : t.timer}
      </span>
    );
  }

  if (example === "score") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-12 w-14 items-center justify-center rounded-md border border-forest/25 text-3xl text-forest">
          <Minus className="h-7 w-7" />
        </span>
        <span className="flex h-12 w-14 items-center justify-center rounded-md border border-action bg-action text-3xl text-on-action">
          <Plus className="h-7 w-7" />
        </span>
      </div>
    );
  }

  if (example === "save" || example === "share") {
    const Icon = example === "save" ? Save : Share2;

    return (
      <span
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-base font-medium ${
          example === "save"
            ? "border-action bg-action text-on-action"
            : "border-forest/25 bg-transparent text-forest"
        }`}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
        {example === "save" ? t.saveBoardShort : t.share}
      </span>
    );
  }

  return (
    <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-forest/25 bg-transparent px-4 py-2 text-base font-medium text-forest">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
      </svg>
      {t.fullscreen}
    </span>
  );
}

export function QuickGuide({ content, t }: { content: QuickGuideCopy; t: Messages }) {
  return (
    <section
      id="quick-guide"
      aria-labelledby="quick-guide-title"
      className="scroll-mt-24 py-7 first:pt-0"
    >
      <header className="mb-5 max-w-3xl">
        <h2 id="quick-guide-title" className="font-display text-2xl font-bold tracking-tight">
          {content.title}
        </h2>
        <p className="mt-3 text-base leading-7 text-forest/90 sm:text-lg sm:leading-8">
          {content.intro}
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {content.actions.map((action) => (
          <li key={action.title} className="min-w-0">
            <article className="h-full rounded-xl border border-forest/15 bg-surface p-4">
              <h3 className="font-display text-lg font-semibold text-ink">{action.title}</h3>
              <p className="mt-2 text-base leading-7 text-forest/90">{action.description}</p>
              <div aria-hidden="true" className="mt-4 flex min-h-12 items-center">
                <ControlPreview example={action.example} t={t} />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
