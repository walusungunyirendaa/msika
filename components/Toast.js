"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "./Icon";
import styles from "./Toast.module.css";

const EVENT = "msika-toast";

export function toast(text, tone = "ok") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { text, tone, id: Date.now() + Math.random() } }));
}

function ToastItem({ item, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(item.id), 3200);
    return () => clearTimeout(t);
  }, [item.id, onDone]);

  return (
    <div className={`${styles.toast} ${item.tone === "error" ? styles.error : ""}`}>
      <span className={styles.icon}>
        <Icon name={item.tone === "error" ? "close" : "check"} size={14} />
      </span>
      {item.text}
    </div>
  );
}

export default function Toaster() {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((list) => list.filter((i) => i.id !== id)), []);

  useEffect(() => {
    let last = { text: "", at: 0 };
    const onToast = (e) => {
      const item = e.detail;
      if (item.text === last.text && Date.now() - last.at < 1500) return;
      last = { text: item.text, at: Date.now() };
      setItems((list) => [...list.slice(-2), item]);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {items.map((i) => (
        <ToastItem key={i.id} item={i} onDone={remove} />
      ))}
    </div>
  );
}
