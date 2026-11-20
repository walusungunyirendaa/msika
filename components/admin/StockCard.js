"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import Icon from "../Icon";
import { toast } from "../Toast";
import { SIZES, jerseyTitle, totalStock } from "../../data/jerseys";
import { deleteProduct, saveProduct } from "../../app/admin/actions";
import styles from "./Admin.module.css";

function pick(p) {
  return { price: p.price, stock: { ...p.stock }, isNew: Boolean(p.isNew), hidden: Boolean(p.hidden) };
}

export default function StockCard({ product, onSaved, onEdit, onDeleted }) {
  const [draft, setDraft] = useState(() => pick(product));
  const [saved, setSaved] = useState(() => pick(product));
  const [message, setMessage] = useState(null);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const left = totalStock(draft);
  const title = jerseyTitle(product);

  function change(next) {
    setDraft((d) => ({ ...d, ...next }));
    setMessage(null);
  }

  function setSize(size, qty) {
    change({ stock: { ...draft.stock, [size]: Math.max(0, Math.min(999, qty)) } });
  }

  function save() {
    startTransition(async () => {
      const result = await saveProduct(product.slug, draft);
      if (result.error) {
        if (result.error === "Please log in again.") {
          router.replace("/admin?reason=expired");
          return;
        }
        setMessage({ tone: "error", text: result.error });
        return;
      }
      const clean = pick(result.product);
      setSaved(clean);
      setDraft(clean);
      onSaved(result.product);
      setMessage({ tone: "ok", text: "Saved" });
      toast(`${title} saved`);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteProduct(product.slug);
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        setConfirming(false);
        return;
      }
      onDeleted(product.slug);
    });
  }

  let status = `${left} in stock`;
  if (left === 0) status = "Sold out";
  else if (left <= 3) status = `Only ${left} left`;

  return (
    <article className={`${styles.card} ${draft.hidden ? styles.cardHidden : ""}`}>
      <div className={styles.cardHead}>
        <div className={styles.thumb}>
          {product.images?.[0] && (
            <Image
              src={product.images[0]}
              alt=""
              fill
              sizes="64px"
              loading="eager"
              unoptimized={product.images[0].startsWith("http")}
            />
          )}
        </div>
        <div className={styles.cardTitle}>
          <h2>{title}</h2>
          <p className={left === 0 ? styles.muted : left <= 3 ? styles.accent : styles.muted}>
            {draft.hidden ? "Hidden from shop" : status}
          </p>
        </div>
        <div className={styles.cardActions}>
          <button type="button" className={styles.iconBtn} onClick={onEdit} aria-label={`Edit ${title}`}>
            <Icon name="edit" size={18} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${title}`}
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      </div>

      {confirming && (
        <div className={styles.confirm} role="alertdialog" aria-label={`Delete ${title}?`}>
          <p>Delete {title}? It will leave the shop. This can&apos;t be undone.</p>
          <div>
            <button type="button" className="btn btnGhost" onClick={() => setConfirming(false)} disabled={pending}>
              Cancel
            </button>
            <button type="button" className={`btn ${styles.danger}`} onClick={remove} disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      )}

      <div className={styles.priceRow}>
        <label htmlFor={`price-${product.slug}`}>Price</label>
        <div className={styles.priceInput}>
          <span aria-hidden="true">K</span>
          <input
            id={`price-${product.slug}`}
            type="number"
            inputMode="numeric"
            min="0"
            value={draft.price}
            onChange={(e) => change({ price: e.target.value === "" ? "" : Number(e.target.value) })}
          />
        </div>
      </div>

      <div className={styles.sizesHead}>
        <span>Stock by size</span>
        <button
          type="button"
          className={styles.textBtn}
          disabled={left === 0}
          onClick={() => change({ stock: Object.fromEntries(SIZES.map((s) => [s, 0])) })}
        >
          Mark sold out
        </button>
      </div>
      <ul className={styles.sizes} aria-label={`${title} stock by size`}>
        {SIZES.map((s) => {
          const qty = draft.stock[s] || 0;
          return (
            <li key={s} className={styles.sizeRow}>
              <span className={styles.sizeName}>{s}</span>
              <div className={styles.stepper}>
                <button
                  type="button"
                  aria-label={`One less ${s}`}
                  disabled={qty === 0}
                  onClick={() => setSize(s, qty - 1)}
                >
                  <Icon name="minus" size={16} />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  aria-label={`${s} in stock`}
                  value={qty}
                  onChange={(e) => setSize(s, Number(e.target.value) || 0)}
                />
                <button type="button" aria-label={`One more ${s}`} onClick={() => setSize(s, qty + 1)}>
                  <Icon name="plus" size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.toggles}>
        <label className={styles.toggle}>
          <input type="checkbox" checked={!draft.hidden} onChange={(e) => change({ hidden: !e.target.checked })} />
          <span className={styles.switch} aria-hidden="true" />
          Show in shop
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" checked={draft.isNew} onChange={(e) => change({ isNew: e.target.checked })} />
          <span className={styles.switch} aria-hidden="true" />
          New label
        </label>
      </div>

      <div className={styles.saveRow}>
        <span className={message?.tone === "error" ? styles.error : styles.savedText} role="status" aria-live="polite">
          {message?.text || (dirty ? "Unsaved changes" : "")}
        </span>
        <button type="button" className="btn btnPrimary" disabled={!dirty || pending} onClick={save}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </article>
  );
}
