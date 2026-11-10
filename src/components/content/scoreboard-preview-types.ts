export type PreviewTab = "teams" | "colors" | "appearance" | "controls" | "timer";

export type PreviewTarget =
  | "team-one-plus"
  | "team-one-minus"
  | "team-two-minus"
  | "team-three-minus"
  | "team-one-name"
  | "add-team"
  | "team-three-remove"
  | "team-one-color"
  | "team-three-color"
  | "team-one-default-color"
  | "team-three-default-color"
  | "timer-scroll"
  | "timer-paused-time"
  | "teams-tab"
  | "colors-tab"
  | "timer-tab"
  | "timer-enable"
  | "timer-start"
  | "timer-reset"
  | "team-two-plus"
  | "team-three-plus";

export type PreviewState = {
  teamNames: [string, string, string];
  scores: [number, number, number];
  teamCount: 2 | 3;
  teamPalettes: [number, number, number];
  tab: PreviewTab;
  timerEnabled: boolean;
  timerRunning: boolean;
  timer: string;
  trackPausedTime: boolean;
  editingTeamName: boolean;
  leavingThirdTeam: boolean;
  cursor: PreviewTarget | null;
  pressed: PreviewTarget | null;
};

export type PreviewLabels = {
  share: string;
  save: string;
  fullscreen: string;
  reset: string;
  teams: string;
  colors: string;
  appearance: string;
  controls: string;
  timer: string;
  boardName: string;
  teamName: string;
  editParticipant: string;
  increase: string;
  decrease: string;
  close: string;
  resetDemo: string;
  addTeam: string;
  scoreSize: string;
  medium: string;
  teamSize: string;
  increment: string;
  enableTimer: string;
  countdown: string;
  pauseTimer: string;
  startTimer: string;
  pausePreview: string;
  playPreview: string;
  resetTimer: string;
  teamColors: string;
  customColor: string;
  color: string;
  iconColor: string;
  resetColors: string;
  layoutLabel: string;
  automatic: string;
  horizontal: string;
  grid: string;
  density: string;
  compact: string;
  spacious: string;
  small: string;
  large: string;
  extraLarge: string;
  fineTuneSizes: string;
  icon: string;
  resetAppearance: string;
  step: string;
  fullscreenControls: string;
  autoHideControls: string;
  timerMode: string;
  duration: string;
  hours: string;
  minutes: string;
  minute: string;
  seconds: string;
  showTimerHours: string;
  trackPausedTime: string;
  pausedScoreNotice: string;
  sportsOptions: string;
};
