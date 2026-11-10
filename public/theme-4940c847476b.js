// Necessary, local-only theme preference. No network requests or analytics.
(() => {
  const media = matchMedia("(prefers-color-scheme: dark)");
  let choice = "system";
  try {
    const saved = localStorage.getItem("scoreboard-theme");
    if (["light", "dark", "system"].includes(saved)) choice = saved;
  } catch {}
  function apply() {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.classList.toggle("dark", choice === "dark" || (choice === "system" && media.matches));
    root.dataset.theme = choice;
    requestAnimationFrame(() => root.classList.remove("theme-switching"));
  }
  apply();
  media.addEventListener("change", apply);
  addEventListener("scoreboard-theme", (event) => {
    if (!["light", "dark", "system"].includes(event.detail)) return;
    choice = event.detail;
    try {
      localStorage.setItem("scoreboard-theme", choice);
    } catch {}
    apply();
  });
  addEventListener("storage", (event) => {
    if (event.key === "scoreboard-theme") {
      choice = ["light", "dark", "system"].includes(event.newValue) ? event.newValue : "system";
      apply();
    }
  });
})();
