"use client";
import { useCallback, useState, type CSSProperties } from "react";
import { ArrowDown, Download, Save, Share2 } from "lucide-react";
import { type Board, type Team, validScore } from "@/lib/boards";
import { defaults } from "@/lib/appearance";
import { foreground, validColor } from "@/lib/colors";
import { type Lang, messages } from "@/lib/i18n";
import { type HelpCopy } from "@/lib/help";
import { defaultTimer, isGamePaused } from "@/lib/timer";
import { teamGridClass } from "@/lib/team-layout";
import { BoardIcon } from "../scoreboard/board-icon";
import { TimerDisplay } from "../scoreboard/game-timer";
import { TeamPanel } from "../scoreboard/team-panel";
import { Button, Modal } from "../ui/ui";

type CustomizationComponent = typeof import("../scoreboard/customization").Customization;

export function HelpDemo({ lang, copy }: { lang: Lang; copy: Pick<HelpCopy, "demoTitle" | "demoNote" | "guide" | "guideStep" | "guideOf" | "guideBack" | "guideNext" | "guideRestart"> }) {
 const t = messages[lang];
 const [board, setBoard] = useState<Board>(() => ({
  id: "help-demo",
  name: t.board,
  automaticName: false,
  icon: "scoreboard",
  accent: "#285b35",
  updatedAt: 0,
  teams: [
   { id: "help-demo-one", name: `${t.team} 1`, score: 0 },
   { id: "help-demo-two", name: `${t.team} 2`, score: 0 },
  ],
  timer: { ...defaultTimer, enabled: true, durationMs: 60_000, remainingMs: 60_000 },
 }));
 const [scoreTeam, setScoreTeam] = useState<Team>();
 const [scoreValue, setScoreValue] = useState("");
 const [status, setStatus] = useState("");
 const [activeStep, setActiveStep] = useState(0);
 const [CustomizationView, setCustomizationView] = useState<CustomizationComponent | null>(null);
 const appearance = { ...defaults, ...board.appearance };

 const change = useCallback((update: (current: Board) => Board) => {
  setBoard(current => update(current));
 }, []);
 const editTeam = (id: string, update: Partial<Team>) => change(current => ({
  ...current,
  teams: current.teams.map(team => team.id === id ? { ...team, ...update } : team),
 }));
 const score = (team: Team, amount: number) => {
  if (isGamePaused(board.timer)) {
   setStatus(t.matchPaused);
   return;
  }
  const value = team.score + amount;
  if (validScore(value)) editTeam(team.id, { score: value });
 };
 const changeTimer = (timer: NonNullable<Board["timer"]>) => change(current => ({ ...current, timer }));
 const openCustomization = async () => {
  if (CustomizationView) return;
  const { Customization } = await import("../scoreboard/customization");
  setCustomizationView(() => Customization);
 };
 const goToStep = (index: number) => {
  setActiveStep(index);
  if (index >= 1 && index <= 3) void openCustomization();
 };
 const confirmScore = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const value = Number(scoreValue);
  if (!scoreTeam || !validScore(value)) {
   setStatus(t.scoreRange);
   return;
  }
  editTeam(scoreTeam.id, { score: value });
  setScoreTeam(undefined);
  setStatus("");
 };
 const accent = validColor(board.accent) ? board.accent : "#285b35";
 const guide = copy.guide[activeStep];
 const guideCard = <div key={activeStep} className="my-4 rounded-xl border border-forest/20 bg-surface p-4 motion-safe:animate-[appear_160ms_ease-out]">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex min-w-0 items-start gap-3">
   <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-action text-on-action font-bold tabular-nums">{activeStep + 1}</span>
   <div id="help-guide-copy" aria-live="polite">
    <p className="text-sm font-semibold text-forest">{copy.guideStep} {activeStep + 1} {copy.guideOf} {copy.guide.length}</p>
    <h3 className="font-display text-lg font-bold">{guide.title}</h3>
    <p className="mt-1 text-base leading-6 text-forest/90">{guide.body}</p>
   </div>
  </div>
  <div className="flex flex-wrap items-center justify-between gap-3 sm:shrink-0 sm:flex-col sm:items-end">
   <div role="group" aria-label={`${copy.guideStep} ${copy.guideOf} ${copy.guide.length}`} className="flex items-center gap-1.5">
    {copy.guide.map((step, index) => <button key={step.title} type="button" aria-label={`${copy.guideStep} ${index + 1}: ${step.title}`} aria-current={activeStep === index ? "step" : undefined} onClick={() => goToStep(index)} className={`flex size-8 items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-colors duration-150 motion-reduce:transition-none ${activeStep === index ? "border-action bg-action text-on-action" : "border-forest/25 text-forest hover:bg-forest/5"}`}>{index + 1}</button>)}
   </div>
   <div className="flex gap-2">
    <Button disabled={activeStep === 0} onClick={() => goToStep(Math.max(0, activeStep - 1))}>{copy.guideBack}</Button>
    <Button primary onClick={() => goToStep((activeStep + 1) % copy.guide.length)}>{activeStep === copy.guide.length - 1 ? copy.guideRestart : copy.guideNext}</Button>
   </div>
  </div>
  </div>
  <div aria-hidden="true" className="mt-3 flex justify-center text-action"><ArrowDown className="h-5 w-5"/></div>
 </div>;

 return <section aria-labelledby="help-demo-title" className="mt-8 border-y border-forest/15 py-6 sm:py-8">
  <div className="mb-5">
   <h2 id="help-demo-title" className="font-display text-2xl font-bold tracking-tight">{copy.demoTitle}</h2>
   <p className="mt-2 max-w-3xl text-base leading-7 text-forest/90">{copy.demoNote}</p>
  </div>
  <div>
   <div>
    {activeStep === 4 && guideCard}
    <section aria-label={t.board} className="flex min-h-0 flex-1 flex-col">
     <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h3 className="min-w-0 break-words font-display text-2xl font-bold tracking-tight sm:text-3xl">
       <span className="inline-flex items-center gap-2">
        <span style={{ "--accent": accent, "--accent-text": foreground(accent) } as CSSProperties} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-text)]">
         <BoardIcon id={board.icon} />
        </span>
        {board.name}
       </span>
      </h3>
      <div role="group" aria-label={t.actions} className="flex shrink-0 items-center gap-2">
       <Button disabled aria-label={t.share}><Share2 aria-hidden="true" className="h-5 w-5"/><span className="hidden sm:inline">{t.share}</span></Button>
       <Button disabled primary><Save aria-hidden="true" className="h-5 w-5"/>{t.saveBoardShort}</Button>
       <Button disabled aria-label={t.exportOne}><Download aria-hidden="true" className="h-5 w-5"/><span className="hidden sm:inline">{t.exportOne}</span></Button>
       <Button disabled aria-label={t.fullscreen}><span className="hidden sm:inline">{t.fullscreen}</span><svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg></Button>
      </div>
     </div>
     {activeStep === 3 && guideCard}
     {board.timer?.enabled && <div className={activeStep === 3 ? "rounded-xl ring-4 ring-action ring-offset-2" : ""}><TimerDisplay timer={board.timer} t={t} change={changeTimer} full={false} controlsVisible={true} textScale={appearance.textScaleEnabled?appearance.textScale:100}/></div>}
     {activeStep === 0 && guideCard}
     <div style={{ "--board-background": board.background || "transparent" } as CSSProperties} className={`min-h-0 flex-1 gap-3 bg-[var(--board-background)] ${board.background?"rounded-xl p-2":""} ${teamGridClass(board.teams.length, appearance.layout, false)}`}>
      {board.teams.map((team, index) => <TeamPanel
       key={team.id}
       className={activeStep === 0 && index === 0 ? "ring-4 ring-action ring-offset-2" : undefined}
       team={team}
       color={board.color}
       textColor={board.textColor}
       paused={isGamePaused(board.timer)}
       appearance={appearance}
       controlsVisible={true}
       index={index}
       count={board.teams.length}
       full={false}
       t={t}
       edit={update => editTeam(team.id, update)}
       rename={() => {}}
       change={amount => score(team, amount * appearance.increment)}
       move={offset => change(current => {
        const teams = [...current.teams];
        [teams[index + offset], teams[index]] = [teams[index], teams[index + offset]];
        return { ...current, teams };
       })}
       remove={() => change(current => ({ ...current, teams: current.teams.filter(item => item.id !== team.id) }))}
       manual={() => { if (isGamePaused(board.timer)) { setStatus(t.matchPaused); return; } setScoreTeam(team); setScoreValue(String(team.score)); }}
      />)}
     </div>
     <div className="mt-3 flex justify-end"><Button onClick={() => change(current => ({ ...current, teams: current.teams.map(team => ({ ...team, score: 0 })) }))}>↺ {t.reset}</Button></div>
    </section>
    {(activeStep === 1 || activeStep === 2) && guideCard}
    {activeStep >= 1 && activeStep <= 3 && <div className="rounded-xl ring-4 ring-action ring-offset-2">{CustomizationView ? <CustomizationView board={board} t={t} change={change} renameBoard={name => change(current => ({ ...current, name, automaticName: false }))} remove={teamId => change(current => ({ ...current, teams: current.teams.filter(team => team.id !== teamId) }))}/> : <p role="status" className="grid min-h-48 place-items-center text-base text-forest/80">{t.loading}</p>}</div>}
    {status && <p role="status" className="mt-3 rounded-lg bg-forest/5 px-3 py-2 text-sm leading-6 text-forest">{status}</p>}
   </div>
  </div>
  {scoreTeam && <Modal title={`${scoreTeam.name}: ${t.score}`} close={() => setScoreTeam(undefined)} closeLabel={t.close}>
   <form onSubmit={confirmScore}>
    <label className="block text-base">{t.name}<input autoFocus required inputMode="numeric" pattern="-?[0-9]+" maxLength={10} value={scoreValue} onChange={event => setScoreValue(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-forest/30 bg-surface px-3"/></label>
    <div className="mt-6 flex justify-end gap-3"><Button type="button" onClick={() => setScoreTeam(undefined)}>{t.cancel}</Button><Button primary type="submit" disabled={!scoreValue.trim() || !validScore(Number(scoreValue))}>{t.confirm}</Button></div>
   </form>
  </Modal>}
 </section>;
}
