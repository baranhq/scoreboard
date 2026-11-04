export const events = [
  "create_scoreboard",
  "enter_fullscreen",
  "export_backup",
  "import_backup",
] as const;
export function track(event: (typeof events)[number]) {
  window.dispatchEvent(new CustomEvent("scoreboard-event", { detail: event }));
}
