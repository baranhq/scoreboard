"use client";
import { useEffect, useRef, useState } from "react";
import { parseDocument, type StudioDocument } from "@/lib/studio";
import { readDocument, saveDocument } from "@/store/studio";
import type { StudioCopy } from "@/lib/studio-copy";
import { downloadBlob, safeFilename } from "@/lib/export-png";
export function useDocument(initial: StudioDocument, labels: StudioCopy) {
  const [document, setDocument] = useState(initial);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const revision = useRef(0);
  const history = useRef<StudioDocument[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const draftKey = useRef("");
  const loading = useRef(true);
  useEffect(() => {
    let active = true;
    let generation = 0;
    const load = async () => {
      const request = ++generation;
      const currentRevision = revision.current;
      loading.current = true;
      const id = new URLSearchParams(window.location.hash.slice(1)).get("table");
      const key = `scoreboard-draft:${initial.kind}:${id || "new"}`;
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
          const recovered = draftText ? parseDocument(JSON.parse(draftText)) : undefined;
          if (recovered && (!saved || recovered.updatedAt > saved.updatedAt)) draft = recovered;
        } catch {
          draftProblem = true;
        }
        if (!active || request !== generation || currentRevision !== revision.current) return;
        draftKey.current = key;
        history.current = [];
        setCanUndo(false);
        setDocument(
          draft?.kind === initial.kind ? draft : saved?.kind === initial.kind ? saved : initial,
        );
        setDirty(draft?.kind === initial.kind);
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
      if (target.pathname === window.location.pathname && target.origin === window.location.origin)
        return;
      if (!window.confirm(labels.discardQuestion)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    window.document.addEventListener("click", protectNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.document.removeEventListener("click", protectNavigation, true);
    };
  }, [dirty, labels.discardQuestion]);
  const change = (next: StudioDocument) => {
    if (loading.current) return;
    history.current = [...history.current.slice(-49), document];
    setCanUndo(true);
    revision.current++;
    setDocument(next);
    setDirty(true);
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
  const newProject = () => {
    if (dirty && !window.confirm(labels.discardQuestion)) return;
    revision.current++;
    history.current = [];
    setCanUndo(false);
    setDocument({ ...initial, id: crypto.randomUUID() });
    draftKey.current = `scoreboard-draft:${initial.kind}:new`;
    try {
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
  const save = async () => {
    if (busy || loading.current) return;
    setBusy(true);
    const current = revision.current;
    const next = {
      ...document,
      id: document.id.startsWith("demo-") ? crypto.randomUUID() : document.id,
      updatedAt: Date.now(),
    };
    try {
      await saveDocument(next);
      let draftProblem = false;
      if (current === revision.current) {
        setDocument(next);
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
    } catch {
      setMessage(labels.storageError);
    } finally {
      setBusy(false);
    }
  };
  const backup = () =>
    downloadBlob(
      new Blob([JSON.stringify(document, null, 2)], { type: "application/json" }),
      `${safeFilename(document.title)}.json`,
    );
  const importFile = async (file: File) => {
    if (loading.current || busy) return;
    try {
      if (file.size > 2_000_000) throw new Error("Too large");
      const next = parseDocument(JSON.parse(await file.text()));
      if (next.kind !== initial.kind) throw new Error("Wrong tool");
      change({ ...next, id: crypto.randomUUID(), updatedAt: 0 });
    } catch {
      setMessage(labels.importError);
    }
  };
  return {
    document,
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
