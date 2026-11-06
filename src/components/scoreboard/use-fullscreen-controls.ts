"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function shouldKeepFullscreenControlsVisible(
  pointerType: PointerEvent["pointerType"],
  focusedControl: boolean,
  hoveredControl: boolean,
) {
  return focusedControl || (pointerType !== "touch" && hoveredControl);
}

export function useFullscreenControls(full: boolean, autoHide: boolean) {
  const [visible, setVisible] = useState(true);
  const lastPointerType = useRef<PointerEvent["pointerType"]>("mouse");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const canAutoHide = full && autoHide;

  useEffect(() => {
    const rememberPointerType = (event: PointerEvent) => {
      if (event.pointerType) lastPointerType.current = event.pointerType;
    };

    window.addEventListener("pointerdown", rememberPointerType, { passive: true });
    window.addEventListener("pointermove", rememberPointerType, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", rememberPointerType);
      window.removeEventListener("pointermove", rememberPointerType);
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
      const hovered =
        lastPointerType.current !== "touch" &&
        document.querySelector("[data-fullscreen-control]:hover");
      if (
        shouldKeepFullscreenControlsVisible(
          lastPointerType.current,
          Boolean(focused),
          Boolean(hovered),
        )
      ) {
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
