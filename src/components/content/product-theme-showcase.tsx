"use client";
import { useState } from "react";
import Link from "next/link";
import { ToolDemo, type Tool } from "./tool-demo";
import { toolThemes, themeLabels } from "@/lib/tool-themes";
import { studioCopy } from "@/lib/studio-copy";
import { messages, type Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { Minus, Palette, Plus } from "lucide-react";
import { Button, Modal } from "@/components/ui/ui";
import { ColorControl, accentColors, backgroundColors } from "@/components/studio/color-control";
import type { ToolTheme } from "@/lib/tool-themes";
import { canAddScoreboardTeam, MAX_SCOREBOARD_TEAMS } from "@/lib/boards";
import { DemoTeamLimit } from "./demo-team-limit";
export function ProductThemeShowcase({
  tool,
  lang,
  hint,
}: {
  tool: Tool;
  lang: Lang;
  hint: string;
}) {
  const [theme, setTheme] = useState(3);
  const [expanded, setExpanded] = useState(false);
  const [scoreTeamCount, setScoreTeamCount] = useState(2);
  const [showLimit, setShowLimit] = useState(false);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [customColors, setCustomColors] = useState(() => ({
    accent: toolThemes[3].accent,
    background: toolThemes[3].background,
    textColor: toolThemes[3].textColor,
  }));
  const t = studioCopy[lang];
  const editor =
    tool === "scoreboard"
      ? "scoreboard"
      : tool === "leaderboard"
        ? "leaderboardEditor"
        : "bracketEditor";
  const preset = toolThemes[theme];
  const selectedTheme: ToolTheme = {
    ...preset,
    ...customColors,
    backgroundEnd: preset.gradient ? customColors.accent : preset.backgroundEnd,
  };
  const setPreset = (index: number) => {
    setTheme(index);
    setCustomColors({
      accent: toolThemes[index].accent,
      background: toolThemes[index].background,
      textColor: toolThemes[index].textColor,
    });
  };
  const launchQuery = new URLSearchParams({
    new: "1",
    theme: preset.id || "",
    accent: customColors.accent,
    background: customColors.background,
    textColor: customColors.textColor,
  });
  return (
    <div data-product-themes className="min-w-0">
      <div className="relative mb-3 grid gap-2">
        <div
          className="flex min-w-0 [scrollbar-width:thin] [scrollbar-color:rgba(40,91,53,0.35)_transparent] flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-forest/35 [&::-webkit-scrollbar-track]:bg-forest/5"
          role="group"
          aria-label={t.style}
        >
          {[1, 3, 2, 0, 5, 6].map((index) => (
            <button
              key={index}
              type="button"
              aria-pressed={theme === index}
              onClick={() => setPreset(index)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors motion-reduce:transition-none ${theme === index ? "border-action bg-action text-on-action" : "border-forest/25 hover:bg-forest/10"}`}
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
        <div className="flex min-w-0 flex-nowrap items-center justify-between gap-2">
          {tool === "scoreboard" ? (
            <div
              className="relative flex shrink-0 items-center gap-1.5"
              role="group"
              aria-label={messages[lang].teams}
            >
              <span className="text-xs font-semibold text-ink/65 sm:hidden">
                {messages[lang].teams}
              </span>
              <span
                aria-live="polite"
                className="mr-1 text-xs font-semibold text-ink/65 tabular-nums"
              >
                {scoreTeamCount}
              </span>
              <Button
                aria-label={t.removeTeam}
                title={t.removeTeam}
                disabled={scoreTeamCount <= 1}
                className="!min-h-10 !shrink-0 !px-2 !text-xs"
                onClick={() => {
                  setScoreTeamCount((current) => Math.max(1, current - 1));
                  setShowLimit(false);
                }}
              >
                <Minus size={16} aria-hidden="true" />
                <span className="hidden whitespace-nowrap sm:inline">{t.removeTeam}</span>
              </Button>
              <Button
                aria-label={t.addTeam}
                title={t.addTeam}
                className="!min-h-10 !shrink-0 !px-2 !text-xs"
                onClick={() => {
                  if (!canAddScoreboardTeam(scoreTeamCount)) setShowLimit(true);
                  else setScoreTeamCount((current) => Math.min(MAX_SCOREBOARD_TEAMS, current + 1));
                }}
              >
                <Plus size={16} aria-hidden="true" />
                <span className="hidden whitespace-nowrap sm:inline">{t.addTeam}</span>
              </Button>
              {showLimit && <DemoTeamLimit lang={lang} close={() => setShowLimit(false)} />}
            </div>
          ) : (
            <label className="grid min-w-0 gap-1 text-sm font-semibold">
              {tool === "leaderboard" ? t.leaderboardLayout : t.layout}
              <select
                value={expanded ? "expanded" : "default"}
                onChange={(event) => setExpanded(event.target.value === "expanded")}
                className="min-h-11 max-w-full rounded-lg border border-forest/25 bg-surface px-3 text-ink"
              >
                <option value="default">{tool === "leaderboard" ? t.oneColumn : t.single}</option>
                <option value="expanded">{tool === "leaderboard" ? t.twoColumns : t.split}</option>
              </select>
            </label>
          )}
          <Button
            aria-label={t.customiseColours}
            title={t.customiseColours}
            className="!min-h-10 !shrink-0 !gap-1.5 !px-2.5 !text-xs"
            onClick={() => setCustomiseOpen(true)}
          >
            <Palette size={14} aria-hidden="true" />
            <span className="whitespace-nowrap">{messages[lang].colors}</span>
          </Button>
        </div>
      </div>
      <div className="h-[30rem] min-w-0 overflow-hidden rounded-xl border border-forest/20 sm:h-[31rem]">
        <ToolDemo
          tool={tool}
          lang={lang}
          compact
          autoplay={false}
          readOnly
          showReadOnlyControls={tool === "scoreboard"}
          showPlaybackControls={false}
          theme={selectedTheme}
          expanded={expanded}
          teamCount={scoreTeamCount}
        />
      </div>
      <Link
        href={`${route(lang, editor)}?${launchQuery.toString()}`}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-action bg-action px-5 py-2 text-sm font-semibold text-on-action transition-colors hover:bg-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none"
      >
        {t.useTheme}: {themeLabels[lang][theme]}
      </Link>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">{hint}</p>
      {customiseOpen && (
        <Modal
          title={t.customiseColours}
          close={() => setCustomiseOpen(false)}
          closeLabel={t.close}
          size="wide"
        >
          <div className="grid gap-3 pb-1 sm:grid-cols-2">
            <ColorControl
              label={t.accent}
              value={customColors.accent}
              colors={accentColors}
              copy={t}
              change={(accent) => setCustomColors((current) => ({ ...current, accent }))}
            />
            <ColorControl
              label={t.background}
              value={customColors.background}
              colors={backgroundColors}
              copy={t}
              change={(background) => setCustomColors((current) => ({ ...current, background }))}
            />
            <ColorControl
              label={t.textColour}
              value={customColors.textColor}
              colors={accentColors}
              copy={t}
              change={(textColor) => setCustomColors((current) => ({ ...current, textColor }))}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
