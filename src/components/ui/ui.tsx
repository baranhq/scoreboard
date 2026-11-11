"use client";
import {
  useEffect,
  useRef,
  useId,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-base font-medium transition-[color,background-color,border-color,opacity,filter,transform] duration-150 ease-out active:scale-[.98] active:brightness-95 disabled:opacity-50 motion-reduce:transition-none motion-reduce:transform-none";
type ModalAction = {
  id: string;
  label: string;
  primary?: boolean;
  autoFocus?: boolean;
  className?: string;
};
export const buttonClass = `${base} border-forest/25 bg-transparent text-forest hover:border-forest/45 hover:bg-forest/10`;
export function Button({
  className = "",
  primary = false,
  accent = false,
  onDark = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  accent?: boolean;
  onDark?: boolean;
}) {
  return (
    <button
      data-fullscreen-control
      {...props}
      className={`${base} ${onDark ? "border-white/35 bg-transparent text-white hover:border-white/55 hover:bg-surface/10" : primary ? "border-action bg-action text-on-action hover:brightness-95" : accent ? "border-[#9fbea4] bg-[#e3efe4] text-[#173d22] hover:border-[#7fa487] hover:bg-[#d5e8d7] dark:border-[#6c9474] dark:bg-[#294932] dark:text-[#e5f2e7] dark:hover:bg-[#34583c]" : "border-forest/25 bg-transparent text-forest hover:border-forest/45 hover:bg-forest/10"} ${className}`}
    />
  );
}
export function Modal({
  title,
  close,
  children,
  beforeScrollable,
  afterScrollable,
  variant = "default",
  closeLabel,
  closeDisabled = false,
  size = "default",
  footerActions,
  onAction,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  beforeScrollable?: ReactNode;
  afterScrollable?: ReactNode;
  variant?: "default" | "privacy";
  closeLabel: string;
  closeDisabled?: boolean;
  size?: "default" | "wide";
  footerActions?: ModalAction[];
  onAction?: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closingRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
      d?.close();
    };
  }, []);
  const requestClose = () => {
    if (closeDisabled || closingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      closeRef.current();
      return;
    }
    closingRef.current = true;
    setClosing(true);
    timer.current = window.setTimeout(() => closeRef.current(), 180);
  };
  const finishClose = () => {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    closeRef.current();
  };
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) finishClose();
      }}
      aria-labelledby={titleId}
      className={`m-auto flex max-h-[90dvh] ${size === "wide" ? "w-[min(94vw,56rem)]" : variant === "privacy" ? "w-[min(94vw,44rem)]" : "w-[min(94vw,28rem)]"} bg-surface text-ink ${variant === "privacy" ? "backdrop:bg-black/50 sm:p-9" : "backdrop:bg-[#102116]/60 sm:p-6"} flex-col overflow-hidden rounded-xl border border-forest/20 p-4 shadow-lg transition-colors duration-150 motion-reduce:transition-none ${closing ? "motion-safe:animate-[dismiss_160ms_ease-out_forwards] motion-reduce:animate-none" : "motion-safe:animate-[appear_180ms_ease-out]"}`}
    >
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h2 id={titleId} className="min-w-0 pt-1 font-display text-xl font-bold tracking-tight">
          {title}
        </h2>
        <Button
          aria-label={closeLabel}
          disabled={closeDisabled || closing}
          onClick={requestClose}
          className="h-11 w-11 shrink-0 rounded-md border-forest/30 bg-forest/5 px-3 text-2xl leading-none hover:bg-forest/10"
        >
          ×
        </Button>
      </div>
      {beforeScrollable && <div className="shrink-0">{beforeScrollable}</div>}
      <div
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${beforeScrollable ? "mt-3" : ""}`}
      >
        {children}
      </div>
      {afterScrollable && (
        <div className="mt-3 shrink-0 border-t border-forest/15 pt-3">{afterScrollable}</div>
      )}
      {footerActions && (
        <div className="mt-3 grid shrink-0 grid-cols-2 gap-2 border-t border-forest/15 pt-3 sm:flex sm:justify-end">
          {footerActions.map((action, index) => (
            <Button
              key={action.id}
              autoFocus={action.autoFocus}
              disabled={closeDisabled || closing}
              primary={action.primary}
              className={`w-full sm:w-auto ${index === footerActions.length - 1 ? "col-span-2 justify-self-end sm:col-auto" : ""} ${action.className || ""}`}
              onClick={() => {
                if (closingRef.current) return;
                onAction?.(action.id);
                requestClose();
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </dialog>
  );
}
