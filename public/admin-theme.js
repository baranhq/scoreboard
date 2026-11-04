document.getElementById("admin-theme")?.addEventListener("click", () =>
  window.dispatchEvent(
    new CustomEvent("scoreboard-theme", {
      detail: document.documentElement.classList.contains("dark") ? "light" : "dark",
    }),
  ),
);
