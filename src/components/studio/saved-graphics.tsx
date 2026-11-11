"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { listDocuments, deleteDocument, saveDocument } from "@/store/studio";
import { duplicateStudioDocument, type StudioDocument } from "@/lib/studio";
import { europeanDateTime } from "@/lib/dates";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { messages } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { Button } from "@/components/ui/ui";
export function SavedGraphics({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const common = messages[lang];
  const [documents, setDocuments] = useState<StudioDocument[]>([]);
  const [status, setStatus] = useState(t.loading);
  const [removing, setRemoving] = useState<string>();
  const [renaming, setRenaming] = useState<string>();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void listDocuments()
      .then((all) => {
        if (active) {
          setDocuments(all);
          setStatus("");
        }
      })
      .catch(() => {
        if (active) setStatus(t.storageError);
      });
    return () => {
      active = false;
    };
  }, [t.loading, t.storageError]);
  const remove = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((all) => all.filter((d) => d.id !== id));
      setRemoving(undefined);
    } catch {
      setStatus(t.storageError);
    }
  };
  const rename = async (document: StudioDocument, nextTitle: string, updatedAt: number) => {
    const cleanedTitle = nextTitle.trim();
    if (!cleanedTitle || busy) return;
    setBusy(true);
    try {
      const updated = { ...document, title: cleanedTitle, updatedAt };
      await saveDocument(updated);
      setDocuments((all) =>
        [updated, ...all.filter((item) => item.id !== document.id)].sort(
          (a, b) => b.updatedAt - a.updatedAt,
        ),
      );
      setRenaming(undefined);
      setStatus(t.savedOk);
    } catch {
      setStatus(t.storageError);
    } finally {
      setBusy(false);
    }
  };
  const duplicate = async (document: StudioDocument) => {
    if (busy) return;
    setBusy(true);
    try {
      const suffix = ` (${t.copySuffix})`;
      const copy = duplicateStudioDocument(
        document,
        `${document.title.slice(0, 200 - suffix.length)}${suffix}`,
      );
      await saveDocument(copy);
      setDocuments((all) => [copy, ...all].sort((a, b) => b.updatedAt - a.updatedAt));
      setStatus(t.savedOk);
    } catch {
      setStatus(t.storageError);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      className="mb-7 border-b border-forest/20 pb-6"
      aria-label={`${t.leaderboard} & ${t.bracket}`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Link
          className="inline-flex min-h-11 items-center rounded-lg bg-action px-4 text-base font-semibold text-on-action"
          href={route(lang, "leaderboardEditor")}
        >
          {t.leaderAction}
        </Link>
        <Link
          className="inline-flex min-h-11 items-center rounded-lg border border-forest/25 px-4 text-base font-semibold"
          href={route(lang, "bracketEditor")}
        >
          {t.bracketAction}
        </Link>
      </div>
      {status && (
        <p role="status" className="py-3 text-sm">
          {status}
        </p>
      )}
      {!status && !documents.length && (
        <div className="py-4">
          <h2 className="text-xl font-semibold">{t.empty}</h2>
          <p className="mt-2 text-base text-ink/75">{t.emptyText}</p>
        </div>
      )}
      <ul className="divide-y divide-forest/15">
        {documents.map((doc) => (
          <li key={doc.id} className="flex flex-wrap items-center gap-3 py-4">
            <div className="min-w-0 flex-1">
              {renaming === doc.id ? (
                <form
                  className="flex flex-wrap items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void rename(doc, title, Date.now());
                  }}
                >
                  <input
                    aria-label={t.title}
                    autoFocus
                    maxLength={200}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="min-h-11 min-w-0 flex-1 rounded-md border border-forest/25 bg-surface px-3 text-base"
                  />
                  <Button disabled={!title.trim() || busy}>{t.saveChanges}</Button>
                  <Button type="button" onClick={() => setRenaming(undefined)} disabled={busy}>
                    {t.cancel}
                  </Button>
                </form>
              ) : (
                <Link
                  className="flex min-h-11 items-center gap-2 text-lg font-semibold [overflow-wrap:anywhere]"
                  href={`${route(lang, doc.kind === "leaderboard" ? "leaderboardEditor" : "bracketEditor")}#table=${encodeURIComponent(doc.id)}`}
                >
                  {doc.title || t[doc.kind]}
                  <ArrowUpRight size={16} className="shrink-0" />
                </Link>
              )}
              <p className="text-sm text-ink/70">
                {t[doc.kind]} · {europeanDateTime(doc.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {renaming !== doc.id && (
                <>
                  <Button
                    disabled={busy || removing === doc.id}
                    onClick={() => {
                      setTitle(doc.title);
                      setRenaming(doc.id);
                    }}
                  >
                    {common.rename}
                  </Button>
                  <Button
                    disabled={busy || removing === doc.id}
                    onClick={() => void duplicate(doc)}
                  >
                    {common.duplicate}
                  </Button>
                </>
              )}
              {removing === doc.id ? (
                <div
                  role="group"
                  aria-label={t.deleteQuestion}
                  className="flex flex-wrap items-center gap-2"
                >
                  <p className="text-sm">{t.deleteQuestion}</p>
                  <Button onClick={() => void remove(doc.id)}>{t.delete}</Button>
                  <Button onClick={() => setRemoving(undefined)}>{t.cancel}</Button>
                </div>
              ) : (
                <Button
                  aria-label={`${t.delete}: ${doc.title}`}
                  onClick={() => setRemoving(doc.id)}
                  disabled={busy || renaming === doc.id}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
