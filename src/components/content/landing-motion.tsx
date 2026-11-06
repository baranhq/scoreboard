"use client";

import { useEffect } from "react";

export function LandingMotion() {
  useEffect(() => {
    const landing = document.querySelector<HTMLElement>("[data-landing-home]");
    const targets = landing?.querySelectorAll<HTMLElement>("[data-reveal]");

    if (
      !landing ||
      !targets?.length ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          target.dataset.revealed = "true";
          observer.unobserve(target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    landing.dataset.revealReady = "true";
    targets.forEach((target) => {
      const bounds = target.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 0.92 && bounds.bottom > 0) {
        target.dataset.revealed = "true";
      } else {
        observer.observe(target);
      }
    });

    return () => {
      observer.disconnect();
      delete landing.dataset.revealReady;
      targets.forEach((target) => delete target.dataset.revealed);
    };
  }, []);

  return null;
}
