"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Icon from "../Icon";
import { SIZES } from "../../data/jerseys";
import { createProduct, editProduct } from "../../app/admin/actions";
import styles from "./Admin.module.css";

const KITS = ["Home", "Away", "Third", "Retro", "Training"];

async function preparePhoto(file) {
  const bitmap = await createImageBitmap(file);
  const W = 1200;
  const H = 1600;
  const scale = Math.min(W / bitmap.width, H / bitmap.height);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f3f3f1";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(bitmap, Math.round((W - w) / 2), Math.round((H - h) / 2), w, h);
  bitmap.close?.();
  for (const quality of [0.84, 0.74, 0.62]) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size < 850 * 1024) return blob;
  }
  throw new Error("Photo too large");
}

export default function ProductForm({ product, clubs = [], onClose, onDone }) {
  const editing = Boolean(product);
  const [club, setClub] = useState(product?.club || "");
  const [kitName, setKitName] = useState(product?.kitName || "Home");
  const [price, setPrice] = useState(product?.price ?? "");
  const [stock, setStock] = useState(() => Object.fromEntries(SIZES.map((s) => [s, 0])));
  const [isNew, setIsNew] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(product?.images?.[0] || null);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const firstField = useRef(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function choosePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const blob = await preparePhoto(file);
      setPhoto(blob);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setError("That photo could not be used. Try another one.");
    }
  }

  function setSize(size, qty) {
    setStock((s) => ({ ...s, [size]: Math.max(0, Math.min(999, qty)) }));
  }

  function submit(e) {
    e.preventDefault();
    setError(null);
    const data = new FormData();
    data.set("club", club);
    data.set("kitName", kitName);
    if (photo) data.set("photo", photo, "photo.jpg");
    if (!editing) {
      data.set("price", String(price));
      data.set("stock", JSON.stringify(stock));
      data.set("isNew", String(isNew));
    }
    startTransition(async () => {
      const result = editing ? await editProduct(product.slug, data) : await createProduct(data);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone(result.product);
    });
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={styles.sheet} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className={styles.sheetHead}>
          <h2 id="sheet-title">{editing ? "Edit shirt" : "Add a shirt"}</h2>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.sheetBody}>
          <div className={styles.photoPick}>
            <div className={styles.photoPreview}>
              {preview ? (
                <Image src={preview} alt="Chosen shirt photo" fill sizes="96px" unoptimized />
              ) : (
                <span className={styles.muted}>No photo yet</span>
              )}
            </div>
            <label className={`btn btnGhost ${styles.photoBtn}`}>
              <Icon name="camera" size={18} />
              {preview ? "Change photo" : "Add photo"}
              <input type="file" accept="image/*" onChange={choosePhoto} className="sr-only" />
            </label>
            <p className={styles.hint}>A clear photo of the front works best. Plain background if you can.</p>
          </div>

          <div className={styles.field}>
            <label htmlFor="f-club">Club</label>
            <input
              ref={firstField}
              id="f-club"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              placeholder="e.g. Wolves"
              list="club-options"
              autoComplete="off"
              maxLength={40}
              required
            />
          </div>

          <datalist id="club-options">
            {clubs.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <div className={styles.field}>
            <label htmlFor="f-kit">Kit</label>
            <input
              id="f-kit"
              list="kit-options"
              value={kitName}
              onChange={(e) => setKitName(e.target.value)}
              maxLength={30}
              required
            />
            <datalist id="kit-options">
              {KITS.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>

          {!editing && (
            <>
              <div className={styles.field}>
                <label htmlFor="f-price">Price (K)</label>
                <input
                  id="f-price"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="550"
                  required
                />
              </div>

              <fieldset className={styles.fieldset}>
                <legend>Stock by size</legend>
                <ul className={styles.sizes}>
                  {SIZES.map((s) => (
                    <li key={s} className={styles.sizeRow}>
                      <span className={styles.sizeName}>{s}</span>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          aria-label={`One less ${s}`}
                          disabled={stock[s] === 0}
                          onClick={() => setSize(s, stock[s] - 1)}
                        >
                          <Icon name="minus" size={16} />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          aria-label={`${s} in stock`}
                          value={stock[s]}
                          onChange={(e) => setSize(s, Number(e.target.value) || 0)}
                        />
                        <button type="button" aria-label={`One more ${s}`} onClick={() => setSize(s, stock[s] + 1)}>
                          <Icon name="plus" size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <label className={styles.toggle}>
                <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
                <span className={styles.switch} aria-hidden="true" />
                Show the New label
              </label>
            </>
          )}
        </div>

        <div className={styles.sheetFoot}>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btnPrimary" disabled={pending}>
            {pending ? "Saving…" : editing ? "Save changes" : "Add shirt"}
          </button>
        </div>
      </form>
    </div>
  );
}
