"use client";

import { useId, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { formatPrice } from "../lib/format";
import styles from "./AreaPicker.module.css";

export default function AreaPicker({ areas, value, onChange }) {
  const [query, setQuery] = useState(value?.name || "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const blurTimer = useRef(null);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return areas.slice(0, 8);
    const starts = areas.filter((a) => a.name.toLowerCase().startsWith(q));
    const contains = areas.filter((a) => !a.name.toLowerCase().startsWith(q) && a.name.toLowerCase().includes(q));
    return [...starts, ...contains].slice(0, 8);
  }, [areas, q]);
  const exact = areas.some((a) => a.name.toLowerCase() === q);
  const options = [...matches.map((a) => ({ ...a, other: false }))];
  if (q && !exact) options.push({ name: query.trim(), fee: null, other: true });

  function choose(option) {
    setQuery(option.name);
    setOpen(false);
    onChange({ name: option.name, fee: option.fee, other: option.other });
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && open && options[active]) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.inputRow}>
        <Icon name="pin" size={18} className={styles.icon} />
        <input
          id="bag-location"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder="Search your area, e.g. Chelstone"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
            onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
        />
        {value && <Icon name="check" size={18} className={styles.ok} />}
      </div>
      {open && options.length > 0 && (
        <ul id={listId} role="listbox" className={styles.list}>
          {options.map((o, i) => (
            <li
              key={`${o.other ? "other" : "area"}-${o.name}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`${styles.option} ${i === active ? styles.active : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(o)}
            >
              {o.other ? (
                <span>
                  Use “{o.name}” <span className={styles.note}>not on our list</span>
                </span>
              ) : (
                <span>{o.name}</span>
              )}
              {!o.other && o.fee ? <span className={styles.fee}>+{formatPrice(o.fee)}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
