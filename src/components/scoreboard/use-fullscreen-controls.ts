"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useFullscreenControls(full: boolean, autoHide: boolean) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reveal = useCallback(() => {
    setVisible(true);
    clearTimeout(timer.current);
    if (!full || !autoHide) return;
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
  }, [full, autoHide]);
  useEffect(() => {
    reveal();
    return () => clearTimeout(timer.current);
  }, [reveal]);
  return { visible: !full || !autoHide || visible, reveal };
}
