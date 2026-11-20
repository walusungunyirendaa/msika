"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({ as: Tag = "div", variant, index = 0, style, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown(true);
        else if (entry.boundingClientRect.top > window.innerHeight) setShown(false);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={variant || ""}
      data-shown={shown ? "true" : undefined}
      style={{ ...style, "--i": index }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
