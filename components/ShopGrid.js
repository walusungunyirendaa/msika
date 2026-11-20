"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { clubsOf, totalStock } from "../data/jerseys";
import styles from "./ShopGrid.module.css";

export default function ShopGrid({ products }) {
  const [club, setClub] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);
  const options = ["All", ...clubsOf(products)];
  const shown = products.filter((j) => (club === "All" || j.club === club) && (!inStockOnly || totalStock(j) > 0));

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.chips} role="group" aria-label="Filter by club">
          {options.map((name) => (
            <button
              key={name}
              type="button"
              className={styles.chip}
              aria-pressed={club === name}
              onClick={() => setClub(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          <span className={styles.switch} aria-hidden="true" />
          In stock only
        </label>
      </div>
      <p className={styles.count} aria-live="polite">
        {shown.length} {shown.length === 1 ? "kit" : "kits"}
      </p>
      {shown.length > 0 ? (
        <div className={styles.grid}>
          {shown.map((j, i) => (
            <ProductCard key={`${club}-${j.slug}`} jersey={j} eager={i < 4} index={i} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Nothing here right now</p>
          <p>Try another club. New kits land often.</p>
        </div>
      )}
    </>
  );
}
