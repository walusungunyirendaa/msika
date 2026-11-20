"use client";

import { useEffect, useRef } from "react";
import { useOnline } from "../lib/useOnline";
import Icon from "./Icon";
import { toast } from "./Toast";
import styles from "./OfflineBanner.module.css";

export default function OfflineBanner() {
  const online = useOnline();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (online && wasOffline.current) toast("You're back online");
    wasOffline.current = !online;
  }, [online]);

  if (online) return null;

  return (
    <div className={styles.banner} role="status">
      <Icon name="signal" size={16} />
      <span>You&apos;re offline. Your bag is saved. Orders send once you&apos;re back online.</span>
    </div>
  );
}
