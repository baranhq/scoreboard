"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang, Messages } from "@/lib/i18n";
import { pageForPath, route } from "@/lib/routes";
import { events } from "@/lib/analytics";
import {
  createPrivacySession,
  disabledPrivacyState,
  type PrivacyChoices as Choices,
  type PrivacyState as State,
} from "@/lib/privacy-session";
import { Button, Modal } from "../ui/ui";
const off: Choices = { usage: false, cloud: false };
const initial = disabledPrivacyState;
// A beacon remains active for this document even when a route unmounts its controls.
const cloudIntegration: { token: string | null } = { token: null };
export function PrivacyControls({
  lang,
  t,
  fullscreen,
  promptReady = false,
}: {
  lang: Lang;
  t: Messages;
  fullscreen?: boolean;
  promptReady?: boolean;
}) {
  const [linkReady, setLinkReady] = useState(false);
  useEffect(() => {
    const ready = () => setLinkReady(true);
    if (!/^#(?:share|board)=/.test(location.hash)) ready();
    window.addEventListener("scoreboard-ready", ready);
    return () => window.removeEventListener("scoreboard-ready", ready);
  }, []);
  const [state, setState] = useState<State>(initial);
  const [draft, setDraft] = useState<Choices>(off);
  const [open, setOpen] = useState(false);
  const [shouldAsk, setShouldAsk] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const stateRef = useRef(state);
  const usageVisitStarted = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);
  const sessionRef = useRef<ReturnType<typeof createPrivacySession> | null>(null);
  const read = useCallback(async () => {
    const next = await sessionRef.current?.read();
    if (next) {
      if (!next.usage) usageVisitStarted.current = false;
      setDraft({ usage: next.usage, cloud: next.cloud });
      setError("");
    }
    return next;
  }, []);
  useEffect(() => {
    const session = createPrivacySession({
      async request(choices) {
        const response = await fetch(`/api/index.php?action=${choices ? "consent" : "state"}`, {
          cache: "no-store",
          credentials: "same-origin",
          ...(choices
            ? {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(choices),
              }
            : {}),
        });
        if (!response.ok) throw new Error("Privacy request failed");
        return response.json();
      },
      update(next) {
        stateRef.current = next;
        setState(next);
      },
      unavailable: () => setError(t.unavailable),
      reload: () => location.reload(),
      integration: cloudIntegration,
    });
    sessionRef.current = session;
    let alive = true;
    void read().then((s) => {
      if (alive && s && !s.saved && (s.capabilities.usage || s.capabilities.cloud))
        setShouldAsk(true);
    });
    const show = () => {
      setOpen(true);
      void read();
    };
    window.addEventListener("privacy-open", show);
    if (typeof BroadcastChannel !== "undefined") {
      channel.current = new BroadcastChannel("scoreboard-privacy");
      channel.current.onmessage = () => {
        void read();
      };
    }
    const refresh = () => {
      if (document.visibilityState === "visible") void read();
    };
    document.addEventListener("visibilitychange", refresh);
    return () => {
      alive = false;
      session.cancel();
      sessionRef.current = null;
      window.removeEventListener("privacy-open", show);
      document.removeEventListener("visibilitychange", refresh);
      channel.current?.close();
    };
  }, [read, t.unavailable]);
  useEffect(() => {
    if (promptReady && shouldAsk && !fullscreen) setOpen(true);
  }, [promptReady, shouldAsk, fullscreen]);
  useEffect(() => {
    if (
      !linkReady ||
      !state.cloud ||
      !state.cloudToken ||
      !sessionRef.current?.startCloud(state.cloudToken)
    )
      return;
    const script = document.createElement("script");
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.defer = true;
    script.dataset.cfBeacon = JSON.stringify({ token: state.cloudToken, spa: false });
    document.head.appendChild(script);
  }, [state, linkReady]);
  useEffect(() => {
    if (
      !linkReady ||
      !state.usage ||
      (location.pathname !== "/" &&
        !["home", "scoreboard", "privacy", "licenses"].includes(
          pageForPath(location.pathname) || "",
        ))
    )
      return;
    let lastActivity = Date.now();
    let lastTick = Date.now();
    let activeSinceTick = false;
    const send = (data: { type: "view" | "click" | "active"; label?: string }) => {
      if (!stateRef.current.usage) return;
      void fetch("/api/index.php?action=event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, path: location.pathname }),
        credentials: "same-origin",
        cache: "no-store",
      })
        .then((r) => {
          if (!r.ok) {
            stateRef.current = { ...stateRef.current, usage: false };
            setState(stateRef.current);
          }
        })
        .catch(() => {});
    };
    if (!usageVisitStarted.current) {
      usageVisitStarted.current = true;
      send({ type: "view" });
    }
    const activity = () => {
      lastActivity = Date.now();
      activeSinceTick = true;
    };
    const click = (event: Event) => {
      const label = (event as CustomEvent).detail;
      if (events.includes(label)) send({ type: "click", label });
    };
    window.addEventListener("scoreboard-event", click);
    window.addEventListener("keydown", activity);
    window.addEventListener("pointerdown", activity);
    window.addEventListener("scroll", activity, { passive: true });
    const timer = setInterval(() => {
      const now = Date.now();
      if (
        document.visibilityState === "visible" &&
        document.hasFocus() &&
        now - lastActivity < 30 * 60 * 1000 &&
        now - lastTick < 30000 &&
        activeSinceTick
      )
        send({ type: "active" });
      activeSinceTick = now - lastActivity < 30 * 60 * 1000;
      lastTick = now;
    }, 15000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scoreboard-event", click);
      window.removeEventListener("keydown", activity);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("scroll", activity);
    };
  }, [state.usage, linkReady]);
  const save = async (choices: Choices) => {
    setBusy(true);
    try {
      const next = await sessionRef.current?.save(choices);
      if (next) {
        if (!next.usage) usageVisitStarted.current = false;
        setDraft({ usage: next.usage, cloud: next.cloud });
        setOpen(false);
        setShouldAsk(false);
        setError("");
        channel.current?.postMessage("changed");
      }
    } finally {
      setBusy(false);
    }
  };
  if (!open || fullscreen) return null;
  return (
    <Modal
      title={t.choices}
      close={() => setOpen(false)}
      closeLabel={t.close}
      variant="privacy"
      beforeScrollable={<p className="text-sm leading-5 text-ink/85">{t.consentNote}</p>}
      afterScrollable={
        <div className="space-y-3">
          <p className="text-xs leading-4 text-ink/70">
            {t.consentChangeNote}{" "}
            <a className="underline underline-offset-2" href={route(lang, "privacy")}>
              {t.privacy}
            </a>
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              {error}
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              accent
              className="w-full justify-center text-sm font-semibold"
              disabled={busy}
              onClick={() =>
                void save({ usage: state.capabilities.usage, cloud: state.capabilities.cloud })
              }
            >
              {t.allow}
            </Button>
            <Button
              className="w-full justify-center bg-surface text-sm font-semibold"
              disabled={busy}
              onClick={() => void save(off)}
            >
              {t.reject}
            </Button>
            <Button
              className="w-full justify-center bg-surface text-sm font-semibold"
              disabled={busy}
              onClick={() => void save(draft)}
            >
              {t.save}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-3">
        {(
          [
            ["usage", t.usage, t.usageText],
            ["cloud", t.cloud, t.cloudText],
          ] as const
        ).map(([key, label, text]) => (
          <div key={key} className="rounded-xl border border-forest/20 bg-paper p-3">
            <label htmlFor={`privacy-${key}`} className="flex cursor-pointer items-start gap-3">
              <input
                id={`privacy-${key}`}
                type="checkbox"
                checked={draft[key]}
                disabled={busy || !state.capabilities[key]}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.checked }))}
                className="mt-0.5 h-5 w-5 shrink-0 accent-forest"
              />
              <span className="min-w-0 text-sm leading-5">
                <span className="block font-semibold text-ink">{label}</span>
                <span className="mt-1 block text-ink/80">
                  {key === "usage" ? t.usageSummary : t.cloudSummary}
                </span>
              </span>
            </label>
            <details className="mt-2 ml-8 text-sm leading-5">
              <summary className="w-fit cursor-pointer font-medium text-forest underline underline-offset-2">
                {t.moreInformation}
              </summary>
              <div className="mt-2 space-y-2 text-ink/80">
                <p>{text}</p>
                {key === "cloud" && (
                  <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-forest underline underline-offset-2"
                  >
                    {t.cloudPolicy}
                  </a>
                )}
              </div>
            </details>
            {!state.capabilities[key] && (
              <p className="mt-2 ml-8 text-xs leading-4 text-ink/65">{t.unavailableChoice}</p>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
