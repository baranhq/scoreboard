"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Messages } from "@/lib/i18n";
import { durationFromParts, MAX_TIMER_DURATION_MS } from "@/lib/timer";

type Parts = [string, string, string];
function parts(ms: number): Parts {
 const seconds = Math.floor(ms / 1000);
 return [String(Math.floor(seconds / 3600)).padStart(2, "0"), String(Math.floor(seconds / 60) % 60).padStart(2, "0"), String(seconds % 60).padStart(2, "0")];
}

export function DurationInput({ label, value, change, t, max = MAX_TIMER_DURATION_MS }: { label: string; value: number; change: (ms: number) => void; t: Messages; max?: number }) {
 const [values, setValues] = useState<Parts>(() => parts(value));
 const emitted = useRef(value);
 const fields = useRef<(HTMLInputElement | null)[]>([]);
 const [error, setError] = useState(false);
 const id = useId();

 useEffect(() => {
  if (value !== emitted.current) {
   emitted.current = value;
   setValues(parts(value));
   setError(false);
  }
 }, [value]);

 const commit = (next: Parts, blur = false) => {
  const ms = durationFromParts(next, max);
  if (ms !== undefined) {
   emitted.current = ms;
   change(ms);
   setError(false);
   if (blur) setValues(parts(ms));
   return true;
  }
  if (blur) {
   setError(true);
   setValues(parts(value));
  }
  return false;
 };

 return <fieldset>
  <legend className="sr-only">{label}</legend>
  <div className="flex items-end gap-2">
   {[t.hours, t.minutes, t.seconds].map((name, index) => <label key={name} className="grid gap-2 text-base">
    <span>{name}</span>
    <input ref={element => { fields.current[index] = element; }} aria-label={`${label}: ${name}`} aria-describedby={error ? id : undefined} aria-invalid={error} inputMode="numeric" pattern={index === 0 ? "[0-9]{1,3}" : "[0-9]{1,2}"} maxLength={index === 0 ? 3 : 2} value={values[index]} onChange={event => {
     if (!new RegExp(`^\\d{0,${index === 0 ? 3 : 2}}$`).test(event.target.value)) return;
     const next: Parts = [...values];
     next[index] = event.target.value;
     setValues(next);
     commit(next);
    }} onBlur={() => commit(values, true)} onKeyDown={event => {
     if (event.key !== "Enter") return;
     event.preventDefault();
     if (commit(values, true)) {
      if (index < 2) fields.current[index + 1]?.focus();
      else event.currentTarget.blur();
     }
    }} className="min-h-12 w-16 rounded-lg border border-forest/25 bg-paper px-2 text-center font-display text-xl font-bold tabular-nums"/>
   </label>)}
  </div>
  {error && <p id={id} role="alert" className="mt-2 text-base text-red-800 dark:text-red-200">{t.invalidDuration}</p>}
  <p className="mt-1 text-sm text-forest/75">{t.maxDuration}</p>
 </fieldset>;
}
