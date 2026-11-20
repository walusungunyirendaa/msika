"use client";

import { useEffect } from "react";

export default function ScrollEffects() {
  useEffect(() => {
    const root = document.documentElement;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.dataset.motion = "on";

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (y > 8) root.dataset.scrolled = "true";
        else delete root.dataset.scrolled;
        const hero = document.querySelector("[data-parallax]");
        const p = hero ? Math.min(1, Math.max(0, y / hero.offsetHeight)) : 1;
        root.style.setProperty("--p", p.toFixed(3));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      delete root.dataset.motion;
      delete root.dataset.scrolled;
      root.style.removeProperty("--p");
    };
  }, []);

  return null;
}
