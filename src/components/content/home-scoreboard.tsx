"use client";

import { useCallback, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { useAutoDemo } from "./use-auto-demo";
import { DemoPlaybackControls } from "./demo-playback-controls";

export function HomeScoreboard({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const [scores, setScores] = useState([12, 9]);
  const [seconds, setSeconds] = useState(272);
  const step = useRef(0);
  const reset = useCallback(() => {
    setScores([12, 9]);
    setSeconds(272);
    step.current = 0;
  }, []);
  const advance = useCallback(() => {
    step.current += 1;
    setSeconds((value) => (step.current % 8 === 0 ? 272 : value + 1));
    setScores(
      step.current % 8 === 0
        ? [12, 9]
        : (current) => current.map((value, index) => value + (index === step.current % 2 ? 1 : 0)),
    );
  }, []);
  const { ref, playing, toggle, pause, reset: resetPlayback } = useAutoDemo(advance, reset, 1500);

  return (
    <section
      ref={ref}
      aria-label={t.scoreboard}
      className="flex flex-col overflow-hidden rounded-xl bg-[#192d20] text-[#f7f7f0]"
    >
      <header className="flex items-center justify-between border-b border-white/15 px-4 py-2 sm:px-6">
        <span className="text-sm font-semibold">{t.eventName}</span>
        <DemoPlaybackControls
          playing={playing}
          onToggle={toggle}
          onReset={resetPlayback}
          onDark
          labels={{ play: t.startTimer, pause: t.pauseTimer, reset: t.resetDemo }}
        />
      </header>
      <div className="flex flex-1 flex-col justify-center px-4 py-7 sm:px-7 sm:py-9">
        <div className="mb-7 flex items-center justify-center gap-3 text-sm font-medium text-[#a9d5a5]">
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {t.secondHalf}{" "}
          <span className="font-mono tabular-nums">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-white/20">
          {[t.teamOne, t.teamTwo].map((name, index) => (
            <div key={name} className="min-w-0 px-2 text-center">
              <p className="truncate text-sm font-semibold sm:text-lg">{name}</p>
              <p
                key={scores[index]}
                className="my-3 font-display text-[clamp(4rem,9vw,7.5rem)] leading-none font-bold tracking-[-0.065em] tabular-nums motion-safe:animate-[preview-intro_350ms_ease-out_both]"
              >
                {scores[index]}
              </p>
              <div className="flex justify-center gap-2">
                {[-1, 1].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    aria-label={`${amount > 0 ? t.increase : t.decrease} ${name}`}
                    onClick={() => {
                      pause();
                      setScores((current) =>
                        current.map((value, position) =>
                          position === index ? Math.max(0, value + amount) : value,
                        ),
                      );
                    }}
                    className={`inline-flex size-11 items-center justify-center rounded-md transition-colors ${amount > 0 ? "bg-[#a9d5a5] text-[#19251c] hover:bg-[#c1e2bd]" : "border border-white/30 hover:bg-white/10"}`}
                  >
                    {amount > 0 ? <Plus size={18} /> : <Minus size={18} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
