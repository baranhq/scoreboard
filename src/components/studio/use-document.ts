"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  parseDocument,
  parseDocumentText,
  MAX_STUDIO_BACKUP_BYTES,
  type StudioDocument,
} from "@/lib/studio";
import { readDocument, saveDocument } from "@/store/studio";
import type { StudioCopy } from "@/lib/studio-copy";
import { downloadBlob, safeFilename } from "@/lib/export-png";
import { getToolTheme } from "@/lib/tool-themes";
import { readJsonFile } from "@/lib/untrusted-json";
import { useConfirmation } from "@/components/ui/use-confirmation";

function contentKey(document: StudioDocument) {
  const content = Object.fromEntries(
    Object.entries(document).filter(([key]) => key !== "updatedAt"),
  );
  return JSON.stringify(content);
}

export function useDocument(initial: StudioDocument, labels: StudioCopy) {
  const router = useRouter();
  const { confirm, dialog } = useConfirmation(labels);
  const [document, setDocument] = useState(initial);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const revision = useRef(0);
  const history = useRef<StudioDocument[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const draftKey = useRef("");
  const baseline = useRef("");
  const loading = useRef(true);
  const freshTemplate = useRef(initial);
  const saveRef = useRef<() => Promise<boolean>>(async () => false);
  useEffect(() => {
    let active = true;
    let generation = 0;
    const load = async () => {
      const request = ++generation;
      const currentRevision = revision.current;
      loading.current = true;
      const id = new URLSearchParams(window.location.hash.slice(1)).get("table");
      const search = new URLSearchParams(window.location.search);
      const launchTheme =
        !id && search.get("new") === "1" ? getToolTheme(search.get("theme")) : undefined;
      let template = initial;
      let draftSuffix = id || "new";
      if (launchTheme) {
        const instance = search.get("instance") || crypto.randomUUID();
        if (!search.has("instance")) {
          search.set("instance", instance);
          window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}?${search.toString()}${window.location.hash}`,
          );
        }
        template = {
          ...initial,
          id: instance,
          style: { ...initial.style, ...launchTheme },
        };
        freshTemplate.current = template;
        draftSuffix = `theme-${instance}`;
      } else {
        freshTemplate.current = initial;
      }
      const key = `scoreboard-draft:${initial.kind}:${draftSuffix}`;
      try {
        let saved: StudioDocument | undefined;
        let storageProblem = false;
        try {
          saved = id ? await readDocument(id) : undefined;
        } catch {
          storageProblem = true;
        }
        let draft: StudioDocument | undefined;
        let draftProblem = false;
        try {
          const draftText = window.sessionStorage.getItem(key);
          const recovered = draftText ? parseDocumentText(draftText) : undefined;
          if (recovered && (!saved || recovered.updatedAt > saved.updatedAt)) draft = recovered;
        } catch {
          draftProblem = true;
        }
        if (!active || request !== generation || currentRevision !== revision.current) return;
        draftKey.current = key;
        history.current = [];
        setCanUndo(false);
        const original = saved?.kind === initial.kind ? saved : template;
        const current = draft?.kind === initial.kind ? draft : original;
        baseline.current = contentKey(original);
        setDocument(current);
        setDirty(contentKey(current) !== baseline.current);
        setMessage(
          storageProblem
            ? labels.storageError
            : draftProblem
              ? labels.draftWarning
              : id && !saved && !draft
                ? labels.notFound
                : "",
        );
      } catch {
        if (active && request === generation) {
          draftKey.current = key;
          setMessage(labels.storageError);
        }
      } finally {
        if (active && request === generation) {
          loading.current = false;
          setReady(true);
        }
      }
    };
    const reload = () => {
      setReady(false);
      void load();
    };
    void load();
    window.addEventListener("hashchange", reload);
    window.addEventListener("popstate", reload);
    return () => {
      active = false;
      window.removeEventListener("hashchange", reload);
      window.removeEventListener("popstate", reload);
    };
  }, [initial, labels.notFound, labels.storageError, labels.draftWarning]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const protectNavigation = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.download || anchor.target === "_blank")
        return;
      const target = new URL(anchor.href);
      if (target.origin !== window.location.origin || target.href === window.location.href) return;
      if (
        target.pathname === window.location.pathname &&
        target.search === window.location.search &&
        !target.hash.startsWith("#table=")
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      void confirm(labels.discardQuestion, {
        cancelLabel: labels.stay,
        secondaryLabel: labels.leaveWithoutSaving,
        confirmLabel: labels.saveAndLeave,
      }).then(async (choice) => {
        if (choice === "secondary") {
          try {
            window.sessionStorage.removeItem(draftKey.current);
          } catch {
            setMessage(labels.draftWarning);
          }
          router.push(`${target.pathname}${target.search}${target.hash}`);
        }
        if (choice === "confirm" && (await saveRef.current()))
          router.push(`${target.pathname}${target.search}${target.hash}`);
      });
    };
    window.addEventListener("beforeunload", warn);
    window.document.addEventListener("click", protectNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.document.removeEventListener("click", protectNavigation, true);
    };
  }, [
    confirm,
    dirty,
    labels.discardQuestion,
    labels.draftWarning,
    labels.leaveWithoutSaving,
    labels.saveAndLeave,
    labels.stay,
    router,
  ]);
  const change = (next: StudioDocument) => {
    if (loading.current) return;
    if (contentKey(next) === contentKey(document)) return;
    history.current = [...history.current.slice(-49), document];
    setCanUndo(true);
    revision.current++;
    setDocument(next);
    setDirty(contentKey(next) !== baseline.current);
    setMessage("");
    try {
      window.sessionStorage.setItem(
        draftKey.current,
        JSON.stringify({ ...next, updatedAt: Date.now() }),
      );
    } catch {
      setMessage(labels.draftWarning);
    }
  };
  const undo = () => {
    const previous = history.current.pop();
    if (previous) {
      change(previous);
      history.current.pop();
      setCanUndo(history.current.length > 0);
    }
  };
  const startNewProject = () => {
    const previousDraftKey = draftKey.current;
    revision.current++;
    history.current = [];
    setCanUndo(false);
    const id = crypto.randomUUID();
    const next = { ...freshTemplate.current, id };
    baseline.current = contentKey(next);
    setDocument(next);
    const search = new URLSearchParams(window.location.search);
    if (search.get("new") === "1" && getToolTheme(search.get("theme"))) {
      search.set("instance", id);
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}?${search.toString()}${window.location.hash}`,
      );
      draftKey.current = `scoreboard-draft:${initial.kind}:theme-${id}`;
    } else {
      draftKey.current = `scoreboard-draft:${initial.kind}:new`;
    }
    try {
      if (previousDraftKey) window.sessionStorage.removeItem(previousDraftKey);
      window.sessionStorage.removeItem(draftKey.current);
    } catch {
      setMessage(labels.draftWarning);
    }
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
    setDirty(false);
    setMessage("");
  };
  const newProject = () => {
    if (!dirty) {
      startNewProject();
      return;
    }

    void confirm(labels.newProjectQuestion, {
      cancelLabel: labels.stay,
      confirmLabel: labels.newProject,
    }).then((choice) => {
      if (choice === "confirm") startNewProject();
    });
  };
  const save = async () => {
    if (busy || loading.current) return false;
    setBusy(true);
    const current = revision.current;
    const next = {
      ...document,
      id: document.id.startsWith("demo-") ? crypto.randomUUID() : document.id,
      updatedAt: Date.now(),
    };
    let saved = false;
    try {
      await saveDocument(next);
      let draftProblem = false;
      if (current === revision.current) {
        setDocument(next);
        baseline.current = contentKey(next);
        setDirty(false);
        try {
          window.sessionStorage.removeItem(draftKey.current);
        } catch {
          draftProblem = true;
        }
        draftKey.current = `scoreboard-draft:${initial.kind}:${next.id}`;
      }
      window.history.replaceState(
        window.history.state,
        "",
        `#table=${encodeURIComponent(next.id)}`,
      );
      setMessage(draftProblem ? `${labels.savedOk} ${labels.draftWarning}` : labels.savedOk);
      saved = true;
    } catch {
      setMessage(labels.storageError);
    } finally {
      setBusy(false);
    }
    return saved;
  };
  useEffect(() => {
    saveRef.current = save;
  });
  const backup = () =>
    downloadBlob(
      new Blob([JSON.stringify(document, null, 2)], { type: "application/json" }),
      `${safeFilename(document.title)}.json`,
    );
  const importFile = async (file: File) => {
    if (loading.current || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const next = parseDocument(await readJsonFile(file, MAX_STUDIO_BACKUP_BYTES));
      if (next.kind !== initial.kind) throw new Error("Wrong tool");
      const count = next.kind === "leaderboard" ? next.rows.length : next.participants.length;
      const summary = `${labels.importSummary}\n\n${labels.title}: ${next.title}\n${labels.participants}: ${count}`;
      const confirmation = dirty ? labels.importDraftWarning : labels.importConfirm;
      const choice = await confirm(`${summary}\n\n${confirmation}`, {
        confirmLabel: labels.continue,
      });
      if (choice !== "confirm") return;
      change({ ...next, id: crypto.randomUUID(), updatedAt: 0 });
    } catch {
      setMessage(labels.importError);
    } finally {
      setBusy(false);
    }
  };
  return {
    document,
    confirmationDialog: dialog,
    confirm,
    change,
    undo,
    newProject,
    canUndo,
    ready,
    dirty,
    message,
    busy,
    save,
    backup,
    importFile,
  };
}
