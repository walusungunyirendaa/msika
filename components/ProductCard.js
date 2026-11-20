"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import Reveal from "./Reveal";
import { jerseyTitle, sizesInStock, totalStock } from "../data/jerseys";
import { formatPrice } from "../lib/format";
import styles from "./ProductCard.module.css";

function availability(jersey) {
  const left = totalStock(jersey);
  if (left === 0) return { text: "Sold out", tone: styles.out };
  if (left <= 3) return { text: `Only ${left} left`, tone: styles.low };
  const sizes = sizesInStock(jersey);
  return { text: `${sizes[0]} to ${sizes[sizes.length - 1]}`, tone: "" };
}

export default function ProductCard({ jersey, eager = false, index = 0 }) {
  const status = availability(jersey);
  const soldOut = totalStock(jersey) === 0;

  return (
    <Reveal
      as={Link}
      href={`/jersey/${jersey.slug}`}
      className={`${styles.card} ${soldOut ? styles.soldOut : ""}`}
      index={index % 4}
    >
      <div className={styles.media}>
        <ProductImage jersey={jersey} eager={eager} sizes="(min-width: 1040px) 25vw, (min-width: 720px) 33vw, 50vw" />
        {jersey.isNew && !soldOut && <span className={styles.tag}>New</span>}
        {soldOut && <span className={styles.tag}>Sold out</span>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{jerseyTitle(jersey)}</h3>
        <p className={styles.meta}>{jersey.kitName} kit</p>
        <div className={styles.row}>
          <span className={styles.price}>{formatPrice(jersey.price)}</span>
          <span className={`${styles.status} ${status.tone}`}>{status.text}</span>
        </div>
      </div>
    </Reveal>
  );
}
