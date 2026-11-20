"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "./Icon";
import { useOnline } from "../lib/useOnline";
import styles from "./ErrorScreen.module.css";

export default function ErrorScreen({ reset, homeHref = "/", homeText = "Back to the shop" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const offline = !useOnline();

  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div className={`wrap ${styles.page}`} role="alert">
      <span className={styles.icon}>
        <Icon name="signal" size={28} />
      </span>
      <h1 className={styles.title}>{offline ? "You're offline" : "Slow connection"}</h1>
      <p className={styles.text}>
        {offline
          ? "Your device is not connected to the internet. Connect to Wi-Fi or mobile data. Then try again."
          : "We couldn't load this page in time. Your internet may be slow right now. Please try again."}
      </p>
      <div className={styles.actions}>
        <button type="button" className="btn btnPrimary" onClick={retry} disabled={pending}>
          {pending ? "Trying…" : "Try again"}
        </button>
        <Link href={homeHref} className="btn btnGhost">
          {homeText}
        </Link>
      </div>
    </div>
  );
}
