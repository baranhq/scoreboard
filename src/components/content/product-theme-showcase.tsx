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
import { useSiteThemeMode } from "@/components/layout/theme-select";
import { Select } from "@/components/ui/select";

type ThemeColors = Pick<ToolTheme, "accent" | "background" | "textColor">;

function themeColors(theme: ToolTheme): ThemeColors {
  return {
    accent: theme.accent,
    background: theme.background,
    textColor: theme.textColor,
  };
}

export function ProductThemeShowcase({
  tool,
  lang,
  hint,
}: {
  tool: Tool;
  lang: Lang;
  hint: string;
}) {
  const { dark } = useSiteThemeMode();
  const [chosenTheme, setChosenTheme] = useState<number | null>(null);
  const theme = chosenTheme ?? (dark ? 1 : 3);
  const [expanded, setExpanded] = useState(false);
  const [scoreTeamCount, setScoreTeamCount] = useState(2);
  const [showLimit, setShowLimit] = useState(false);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const t = studioCopy[lang];
  const editor =
    tool === "scoreboard"
      ? "scoreboard"
      : tool === "leaderboard"
        ? "leaderboardEditor"
        : "bracketEditor";
  const preset = toolThemes[theme];
  const [customColors, setCustomColors] = useState<ThemeColors | null>(null);
  const colors = customColors ?? themeColors(preset);
  const selectedTheme: ToolTheme = {
    ...preset,
    ...colors,
    backgroundEnd: preset.gradient ? colors.accent : preset.backgroundEnd,
  };
  const setPreset = (index: number) => {
    setChosenTheme(index);
    setCustomColors(themeColors(toolThemes[index]));
  };
  const changeColors = (update: Partial<ThemeColors>) => {
    setChosenTheme((current) => current ?? theme);
    setCustomColors((current) => ({ ...(current ?? themeColors(preset)), ...update }));
  };
  const launchQuery = new URLSearchParams({
    new: "1",
    theme: preset.id || "",
    accent: colors.accent,
    background: colors.background,
    textColor: colors.textColor,
  });
  return (
    <div data-product-themes className="min-w-0">
      <div className="relative mb-3 grid gap-2">
        <div
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
          role="group"
          aria-label={t.style}
        >
          {[1, 3, 2, 0, 5, 6].map((index) => (
            <button
              key={index}
              type="button"
              aria-pressed={theme === index}
              onClick={() => setPreset(index)}
              className={`inline-flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors motion-reduce:transition-none sm:w-auto ${theme === index ? "border-action bg-action text-on-action" : "border-forest/25 hover:bg-forest/10"}`}
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
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:flex sm:justify-between">
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
                className="!min-h-11 !min-w-11 !shrink-0 !px-2 !text-xs"
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
                className="!min-h-11 !min-w-11 !shrink-0 !px-2 !text-xs"
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
            <label className="grid min-w-0 gap-1 text-sm font-semibold sm:w-56">
              {tool === "leaderboard" ? t.leaderboardLayout : t.layout}
              <Select
                label={tool === "leaderboard" ? t.leaderboardLayout : t.layout}
                value={expanded ? "expanded" : "default"}
                change={(value) => setExpanded(value === "expanded")}
                triggerClassName="!h-11 !bg-surface"
                options={[
                  {
                    value: "default",
                    label: tool === "leaderboard" ? t.oneColumn : t.single,
                  },
                  {
                    value: "expanded",
                    label: tool === "leaderboard" ? t.twoColumns : t.split,
                  },
                ]}
              />
            </label>
          )}
          <Button
            aria-label={t.customiseColours}
            title={t.customiseColours}
            className="!h-11 !min-h-11 !shrink-0 !gap-1.5 !px-2.5 !text-xs"
            onClick={() => setCustomiseOpen(true)}
          >
            <Palette size={14} aria-hidden="true" />
            <span className="whitespace-nowrap">{messages[lang].colors}</span>
          </Button>
        </div>
      </div>
      <div
        className={
          tool === "bracket"
            ? "-mx-5 h-auto min-w-0 overflow-hidden sm:mx-0 sm:h-[31rem]"
            : "h-[30rem] min-w-0 overflow-hidden rounded-xl border border-forest/20 sm:h-[31rem]"
        }
      >
        <ToolDemo
          tool={tool}
          lang={lang}
          compact
          autoplay={false}
          fillPreview={tool === "bracket"}
          readOnly
          showReadOnlyControls={tool === "scoreboard"}
          showPlaybackControls={false}
          theme={selectedTheme}
          expanded={expanded}
          teamCount={scoreTeamCount}
          barePreview={tool === "bracket"}
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
              value={colors.accent}
              colors={accentColors}
              copy={t}
              change={(accent) => changeColors({ accent })}
            />
            <ColorControl
              label={t.background}
              value={colors.background}
              colors={backgroundColors}
              copy={t}
              change={(background) => changeColors({ background })}
            />
            <ColorControl
              label={t.textColour}
              value={colors.textColor}
              colors={accentColors}
              copy={t}
              change={(textColor) => changeColors({ textColor })}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
