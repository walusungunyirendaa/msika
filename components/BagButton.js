"use client";

import Link from "next/link";
import Icon from "./Icon";
import { useBag } from "../lib/useBag";
import styles from "./Header.module.css";

export default function BagButton() {
  const { count, ready } = useBag();
  const show = ready && count > 0;

  return (
    <Link href="/bag" className={styles.bag} aria-label={show ? `Bag, ${count} item${count === 1 ? "" : "s"}` : "Bag"}>
      <Icon name="bag" size={20} />
      Bag
      {show && <span className={styles.count}>{count}</span>}
    </Link>
  );
}
