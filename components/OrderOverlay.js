"use client";

import { useEffect } from "react";
import Icon from "./Icon";
import styles from "./OrderOverlay.module.css";

export default function OrderOverlay({ mode, count, onClose }) {
  useEffect(() => {
    if (mode !== "tab") return undefined;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [mode, onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="order-title">
      <div className={styles.card}>
        <span className={styles.badge}>
          <Icon name="check" size={28} />
        </span>
        <h2 id="order-title" className={styles.title}>
          Order ready
        </h2>
        <p className={styles.text}>
          {count} {count === 1 ? "shirt" : "shirts"} written up for you.{" "}
          {mode === "tab" ? "WhatsApp is open. Press send there to place your order." : "Opening WhatsApp…"}
        </p>
        {mode === "same" && <span className={styles.bar} aria-hidden="true" />}
        {mode === "tab" && (
          <button type="button" className="btn btnDark" onClick={onClose}>
            Back to my bag
          </button>
        )}
      </div>
    </div>
  );
}
