"use client";

import { useEffect, useState, useTransition } from "react";
import Icon from "../Icon";
import { updateAreas } from "../../app/admin/actions";
import styles from "./Admin.module.css";

export default function AreasEditor({ initialAreas, onClose, onSaved }) {
  const [areas, setAreas] = useState(() => initialAreas.map((a) => ({ name: a.name, fee: a.fee ?? "" })));
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
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

  function add(e) {
    e.preventDefault();
    const name = newName.trim().replace(/\s+/g, " ");
    if (!name) return;
    if (areas.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      setError(`${name} is already on the list.`);
      return;
    }
    setAreas((list) => [{ name, fee: "" }, ...list]);
    setNewName("");
    setError(null);
  }

  function setFee(name, value) {
    setAreas((list) => list.map((a) => (a.name === name ? { ...a, fee: value === "" ? "" : Number(value) } : a)));
  }

  function remove(name) {
    setAreas((list) => list.filter((a) => a.name !== name));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateAreas(areas.map((a) => ({ name: a.name, fee: a.fee === "" ? null : a.fee })));
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(result.areas);
    });
  }

  const q = query.trim().toLowerCase();
  const shown = q ? areas.filter((a) => a.name.toLowerCase().includes(q)) : areas;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="areas-title">
        <div className={styles.sheetHead}>
          <h2 id="areas-title">Delivery areas</h2>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.sheetBody}>
          <p className={styles.hint}>
            Customers pick from this list in their bag. Leave the fee empty to agree on it in the chat.
          </p>
          <form className={styles.addRow} onSubmit={add}>
            <label htmlFor="new-area" className="sr-only">
              New area
            </label>
            <input
              id="new-area"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add an area, e.g. Ndeke"
              maxLength={50}
            />
            <button type="submit" className="btn btnGhost">
              <Icon name="plus" size={16} />
              Add
            </button>
          </form>
          <label className={styles.search}>
            <span className="sr-only">Search areas</span>
            <input type="search" placeholder="Search areas" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <ul className={styles.areaList}>
            {shown.map((a) => (
              <li key={a.name} className={styles.areaRow}>
                <span className={styles.areaName}>{a.name}</span>
                <div className={styles.areaFee}>
                  <span aria-hidden="true">K</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="—"
                    aria-label={`Delivery fee for ${a.name}`}
                    value={a.fee}
                    onChange={(e) => setFee(a.name, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => remove(a.name)}
                  aria-label={`Remove ${a.name}`}
                >
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
          {shown.length === 0 && <p className={styles.muted}>No areas match.</p>}
        </div>

        <div className={styles.sheetFoot}>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button type="button" className="btn btnPrimary" onClick={save} disabled={pending}>
            {pending ? "Saving…" : `Save ${areas.length} areas`}
          </button>
        </div>
      </div>
    </div>
  );
}
