"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

export function useListMotion<T extends HTMLElement>() {
  const list = useRef<T>(null);
  const previousPositions = useRef<Map<string, DOMRect> | null>(null);

  const capture = useCallback(() => {
    const element = list.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    previousPositions.current = new Map(
      [...element.querySelectorAll<HTMLElement>("[data-motion-item]")].flatMap((item) => {
        const id = item.dataset.motionItem;
        return id ? [[id, item.getBoundingClientRect()] as const] : [];
      }),
    );
  }, []);

  useLayoutEffect(() => {
    const previous = previousPositions.current;
    previousPositions.current = null;
    const element = list.current;
    if (!previous || !element || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const animations: Animation[] = [];
    element.querySelectorAll<HTMLElement>("[data-motion-item]").forEach((item) => {
      if (typeof item.animate !== "function") return;
      const id = item.dataset.motionItem;
      if (!id) return;

      const oldPosition = previous.get(id);
      const nextPosition = item.getBoundingClientRect();
      if (!oldPosition) {
        animations.push(
          item.animate(
            [
              { opacity: 0, transform: "translate3d(0, -4px, 0)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 160, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
          ),
        );
        return;
      }

      const offsetX = oldPosition.left - nextPosition.left;
      const offsetY = oldPosition.top - nextPosition.top;
      if (!offsetX && !offsetY) return;
      animations.push(
        item.animate(
          [
            { transform: `translate3d(${offsetX}px, ${offsetY}px, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          { duration: 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
        ),
      );
    });

    return () => animations.forEach((animation) => animation.cancel());
  });

  return { list, capture };
}
