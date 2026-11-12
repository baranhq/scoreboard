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
    const isDark = choice === "dark" || (choice === "system" && media.matches);
    root.classList.add("theme-switching");
    root.classList.toggle("dark", isDark);
    root.dataset.theme = choice;
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const label = button.dataset.themeLabel;
      const action = isDark ? button.dataset.themeLightLabel : button.dataset.themeDarkLabel;
      if (!label || !action) return;
      button.setAttribute("aria-label", `${label}: ${action}`);
      button.setAttribute("title", `${label}: ${action}`);
    });
    requestAnimationFrame(() => root.classList.remove("theme-switching"));
  }
  apply();
  if (media.addEventListener) media.addEventListener("change", apply);
  else media.addListener(apply);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  }
  addEventListener("scoreboard-theme", (event) => {
    if (!["light", "dark", "system"].includes(event.detail)) return;
    choice = event.detail;
    try {
      localStorage.setItem("scoreboard-theme", choice);
    } catch {}
    apply();
  });
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest("[data-theme-toggle]")) return;
    const isDark = choice === "dark" || (choice === "system" && media.matches);
    dispatchEvent(new CustomEvent("scoreboard-theme", { detail: isDark ? "light" : "dark" }));
  });
  addEventListener("storage", (event) => {
    if (event.key === "scoreboard-theme") {
      choice = ["light", "dark", "system"].includes(event.newValue) ? event.newValue : "system";
      apply();
    }
  });
})();
