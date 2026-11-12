"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AutoDemoOptions = {
  controlled?: boolean;
  allowReducedMotionAutoplay?: boolean;
};

export function useAutoDemo(
  advance: () => void,
  resetDemo: () => void,
  delay = 2600,
  autoplay = true,
  { controlled = false, allowReducedMotionAutoplay = false }: AutoDemoOptions = {},
) {
  const ref = useRef<HTMLElement | null>(null);
  const advanceRef = useRef(advance);
  const resetRef = useRef(resetDemo);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [manualOverride, setManualOverride] = useState(false);
  const [playing, setPlaying] = useState(autoplay);
  const [revision, setRevision] = useState(0);
  const requestedPlayback = controlled ? autoplay : playing;
  const canPlay =
    requestedPlayback &&
    (!reducedMotion || allowReducedMotionAutoplay || (controlled ? autoplay : manualOverride));

  useEffect(() => {
    advanceRef.current = advance;
    resetRef.current = resetDemo;
  }, [advance, resetDemo]);

  const attach = useCallback((node: HTMLElement | null) => {
    ref.current = node;
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.12,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!canPlay || !inView || !pageVisible) return;

    const timeout = window.setTimeout(() => {
      advanceRef.current();
      setRevision((current) => current + 1);
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [canPlay, delay, inView, pageVisible, revision]);

  const play = useCallback(() => {
    resetRef.current();
    setRevision(0);
    setManualOverride(true);
    setPlaying(true);
  }, []);
  const pause = useCallback(() => {
    setManualOverride(true);
    setPlaying(false);
  }, []);
  const reset = useCallback(() => {
    resetRef.current();
    setRevision(0);
    setManualOverride(true);
    setPlaying(autoplay);
  }, [autoplay]);

  return {
    ref: attach,
    playing: canPlay,
    toggle: canPlay ? pause : play,
    pause,
    reset,
  };
}
