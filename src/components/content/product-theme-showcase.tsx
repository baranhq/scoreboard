"use client";
import { useState } from "react";
import { ToolDemo, type Tool } from "./tool-demo";
import { toolThemes, themeLabels } from "@/lib/tool-themes";
import { studioCopy } from "@/lib/studio-copy";
import { messages, type Lang } from "@/lib/i18n";
export function ProductThemeShowcase({
  tool,
  lang,
  hint,
}: {
  tool: Tool;
  lang: Lang;
  hint: string;
}) {
  const [theme, setTheme] = useState(tool === "leaderboard" ? 0 : 1);
  const [expanded, setExpanded] = useState(false);
  const t = studioCopy[lang];
  return (
    <div data-product-themes className="min-w-0">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.style}>
          {[0, 1, 6, 8].map((index) => (
            <button
              key={index}
              type="button"
              aria-pressed={theme === index}
              onClick={() => setTheme(index)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none ${theme === index ? "border-action bg-action text-on-action" : "border-forest/25 hover:bg-forest/10"}`}
            >
              <span
                aria-hidden="true"
                className="size-3 rounded-full border border-current"
                style={{ background: toolThemes[index].accent }}
              />
              {themeLabels[lang][index]}
            </button>
          ))}
        </div>
        <label className="grid min-w-0 gap-1 text-sm font-semibold">
          {tool === "scoreboard"
            ? messages[lang].teams
            : tool === "leaderboard"
              ? t.leaderboardLayout
              : t.layout}
          <select
            value={expanded ? "expanded" : "default"}
            onChange={(event) => setExpanded(event.target.value === "expanded")}
            className="min-h-11 max-w-full rounded border border-forest/25 bg-surface px-3 text-ink"
          >
            <option value="default">
              {tool === "scoreboard" ? "2" : tool === "leaderboard" ? t.oneColumn : t.split}
            </option>
            <option value="expanded">
              {tool === "scoreboard" ? "3" : tool === "leaderboard" ? t.twoColumns : t.single}
            </option>
          </select>
        </label>
      </div>
      <div className="min-w-0 border border-forest/20">
        <ToolDemo
          tool={tool}
          lang={lang}
          compact
          autoplay={false}
          theme={toolThemes[theme]}
          expanded={expanded}
        />
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">{hint}</p>
    </div>
  );
}
