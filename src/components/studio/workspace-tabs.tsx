"use client";
import { useRef } from "react";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";

export type WorkspaceTab = "content" | "design" | "settings" | "timer" | "export";

export function WorkspaceTabs({
  lang,
  value,
  change,
  includeTimer = false,
}: {
  lang: Lang;
  value: WorkspaceTab;
  change: (tab: WorkspaceTab) => void;
  includeTimer?: boolean;
}) {
  const labels = studioCopy[lang];
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs: WorkspaceTab[] = includeTimer
    ? ["content", "design", "settings", "timer", "export"]
    : ["content", "design", "settings", "export"];
  const tabLabels: Record<WorkspaceTab, string> = {
    content: labels.contentTab,
    design: labels.designTab,
    settings: labels.settingsTab,
    timer: labels.timerTab,
    export: labels.exportTab,
  };

  return (
    <div
      role="tablist"
      aria-label={labels.workspaceTabs}
      className={`flex min-w-0 [scrollbar-width:thin] [scrollbar-color:rgba(40,91,53,0.35)_transparent] overflow-x-auto overscroll-x-contain border-b border-forest/20 sm:grid [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-forest/35 [&::-webkit-scrollbar-track]:bg-forest/5 ${includeTimer ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          ref={(element) => {
            buttons.current[index] = element;
          }}
          id={`workspace-tab-${tab}`}
          type="button"
          role="tab"
          aria-selected={value === tab}
          aria-controls="workspace-panel"
          tabIndex={value === tab ? 0 : -1}
          onClick={() => change(tab)}
          onKeyDown={(event) => {
            let next = index;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault();
            change(tabs[next]);
            buttons.current[next]?.focus();
          }}
          className={`min-h-12 min-w-[5.5rem] shrink-0 border-b-2 px-2 py-2 text-xs font-semibold transition-colors duration-150 hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-forest motion-reduce:transition-none sm:min-w-0 sm:px-1 sm:text-sm ${value === tab ? "border-action text-forest" : "border-transparent text-ink/70"}`}
        >
          {tabLabels[tab]}
        </button>
      ))}
    </div>
  );
}
