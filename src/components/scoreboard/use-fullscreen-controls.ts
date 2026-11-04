"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useFullscreenControls(full: boolean, autoHide: boolean) {
  const [visible, setVisible] = useState(true);
  const [touchInput, setTouchInput] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const canAutoHide = full && autoHide && !touchInput;
  useEffect(() => {
    const touchPointers = window.matchMedia("(hover: none), (pointer: coarse)");
    const syncTouchPointer = () => setTouchInput(touchPointers.matches);
    const rememberTouch = (event: PointerEvent) => {
      if (event.pointerType === "touch") setTouchInput(true);
    };
    syncTouchPointer();
    touchPointers.addEventListener("change", syncTouchPointer);
    window.addEventListener("pointerdown", rememberTouch, { passive: true });
    return () => {
      touchPointers.removeEventListener("change", syncTouchPointer);
      window.removeEventListener("pointerdown", rememberTouch);
    };
  }, []);
  const reveal = useCallback(() => {
    setVisible(true);
    clearTimeout(timer.current);
    if (!canAutoHide) return;
    const hide = () => {
      const focused =
        document.activeElement?.matches(":focus-visible") &&
        document.activeElement.closest("[data-fullscreen-control]");
      const hovered = document.querySelector("[data-fullscreen-control]:hover");
      if (focused || hovered) {
        timer.current = setTimeout(hide, 3000);
        return;
      }
      setVisible(false);
    };
    timer.current = setTimeout(hide, 3000);
  }, [canAutoHide]);
  useEffect(() => {
    reveal();
    return () => clearTimeout(timer.current);
  }, [reveal]);
  return { visible: !canAutoHide || visible, reveal };
}
