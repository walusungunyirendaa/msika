"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ProductImage from "./ProductImage";
import AreaPicker from "./AreaPicker";
import OrderOverlay from "./OrderOverlay";
import LocationPreview from "./LocationPreview";
import { toast } from "./Toast";
import { jerseyTitle } from "../data/jerseys";
import { shop } from "../data/shop";
import { formatPrice } from "../lib/format";
import { clearBag, setBagQty, useBag } from "../lib/useBag";
import { buildOrderMessage, whatsappLink } from "../lib/whatsapp";
import { openWhatsApp } from "../lib/openWhatsApp";
import styles from "./BagView.module.css";

export default function BagView({ products, areas = [] }) {
  const { items, ready } = useBag();
  const [name, setName] = useState("");
  const [fulfilment, setFulfilment] = useState("pickup");
  const [area, setArea] = useState(null);
  const [pin, setPin] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(null);
  const locTimer = useRef(null);

  useEffect(() => () => clearTimeout(locTimer.current), []);
  const [payment, setPayment] = useState(shop.payments[0]);
  const [sent, setSent] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem("msika-sent") === "1";
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  useEffect(() => {
    try {
      sessionStorage.removeItem("msika-sent");
    } catch {}
  }, []);
  const [skipped, setSkipped] = useState(() => new Set());

  const lines = items
    .map((i) => ({ ...i, jersey: products.find((p) => p.slug === i.slug) }))
    .filter((i) => i.jersey && i.jersey.stock[i.size] > 0);
  const keyOf = (i) => `${i.slug}-${i.size}`;
  const chosen = lines.filter((i) => !skipped.has(keyOf(i)));
  const allChosen = chosen.length === lines.length;
  const subtotal = chosen.reduce((sum, i) => sum + i.jersey.price * i.qty, 0);
  const fee = fulfilment === "delivery" && area?.fee ? area.fee : 0;
  const total = subtotal + fee;
  const count = lines.reduce((sum, i) => sum + i.qty, 0);
  const chosenCount = chosen.reduce((sum, i) => sum + i.qty, 0);
  const nothingChosen = chosen.length === 0;
  const missingName = name.trim() === "";
  const missingLocation = fulfilment === "delivery" && !area && !pin;
  const message =
    !nothingChosen && !missingName && !missingLocation
      ? buildOrderMessage({
          items: chosen,
          name: name.trim(),
          fulfilment,
          location: area?.name || "my shared location",
          pin,
          fee,
          payment,
        })
      : null;
  const link =
    !nothingChosen && !missingName && !missingLocation
      ? whatsappLink(
          buildOrderMessage({
            items: chosen,
            name: name.trim(),
            fulfilment,
            location: area?.name || "my shared location",
            pin,
            fee,
            payment,
          }),
        )
      : null;

  function toggle(key) {
    setSent(false);
    setSkipped((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setSent(false);
    setSkipped(allChosen ? new Set(lines.map(keyOf)) : new Set());
  }

  function removeSent() {
    chosen.forEach((i) => setBagQty(i.slug, i.size, 0, i.jersey.stock[i.size]));
    setSkipped(new Set());
    setSent(false);
  }

  async function copyOrder() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const box = document.createElement("textarea");
      box.value = message;
      document.body.appendChild(box);
      box.select();
      document.execCommand("copy");
      box.remove();
    }
    setCopied(true);
  }

  function locateFailed(text) {
    clearTimeout(locTimer.current);
    setLocating(false);
    setLocError(text);
    toast("Could not get your location", "error");
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      setLocError("This browser can't share your location. Choose your area above instead.");
      return;
    }
    setLocating(true);
    setLocError(null);
    clearTimeout(locTimer.current);
    locTimer.current = setTimeout(
      () => locateFailed("This is taking too long. Check that location is on for this browser and try again. You can also choose your area above."),
      25000,
    );
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(locTimer.current);
        setPin({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLocating(false);
        toast("Location added to your order");
      },
      (err) => {
        if (err.code === 1)
          locateFailed("Location is blocked for this site. Tap the icon next to the web address, allow Location, then try again.");
        else if (err.code === 3)
          locateFailed("We couldn't find you in time. Move near a window or turn on Wi-Fi, then try again.");
        else locateFailed("Your device couldn't tell where you are. Turn on location in your device settings, then try again.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
    );
  }

  if (!ready) {
    return (
      <div className={`wrap ${styles.page}`}>
        <h1 className={styles.title}>Your bag</h1>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Icon name="bag" size={28} />
          </span>
          <h1 className={styles.emptyTitle}>Your bag is empty</h1>
          <p className={styles.emptyText}>Find your club and pick a size. It will wait for you here.</p>
          <Link href="/#shop" className="btn btnDark">
            Shop kits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Your bag</h1>
        <span className={styles.itemCount}>
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>
      <div className={styles.layout}>
        <div className={styles.listWrap}>
          {lines.length > 1 && (
            <label className={styles.selectAll}>
              <input type="checkbox" checked={allChosen} onChange={toggleAll} />
              <span className={styles.box} aria-hidden="true" />
              {allChosen ? "All shirts selected" : `${chosen.length} of ${lines.length} selected`}
            </label>
          )}
          <ul className={styles.list}>
            {lines.map((i) => {
              const max = i.jersey.stock[i.size];
              const title = jerseyTitle(i.jersey);
              return (
                <li key={keyOf(i)} className={`${styles.line} ${skipped.has(keyOf(i)) ? styles.skipped : ""}`}>
                  <label className={styles.pick}>
                    <input
                      type="checkbox"
                      checked={!skipped.has(keyOf(i))}
                      onChange={() => toggle(keyOf(i))}
                      aria-label={`Include ${title} size ${i.size} in this order`}
                    />
                    <span className={styles.box} aria-hidden="true" />
                  </label>
                  <Link href={`/jersey/${i.slug}`} className={styles.thumb} tabIndex={-1} aria-hidden="true">
                    <ProductImage jersey={i.jersey} sizes="96px" compact />
                  </Link>
                  <div className={styles.lineBody}>
                    <div className={styles.lineTop}>
                      <div>
                        <Link href={`/jersey/${i.slug}`} className={styles.lineTitle}>
                          {title}
                        </Link>
                        <p className={styles.lineMeta}>
                          Size {i.size} · {formatPrice(i.jersey.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={`Remove ${title} size ${i.size}`}
                        onClick={() => setBagQty(i.slug, i.size, 0, max)}
                      >
                        <Icon name="close" size={18} />
                      </button>
                    </div>
                    <div className={styles.lineBottom}>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          aria-label={`One less ${title}`}
                          onClick={() => setBagQty(i.slug, i.size, i.qty - 1, max)}
                        >
                          <Icon name="minus" size={16} />
                        </button>
                        <span aria-live="polite">{i.qty}</span>
                        <button
                          type="button"
                          aria-label={`One more ${title}`}
                          disabled={i.qty >= max}
                          onClick={() => setBagQty(i.slug, i.size, i.qty + 1, max)}
                        >
                          <Icon name="plus" size={16} />
                        </button>
                      </div>
                      <span className={styles.lineTotal}>{formatPrice(i.jersey.price * i.qty)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <section className={styles.summary} aria-labelledby="summary-title">
          <h2 id="summary-title" className={styles.summaryTitle}>
            Order details
          </h2>
          {!allChosen && (
            <p className={styles.partial}>
              Ordering {chosenCount} of {count} {count === 1 ? "shirt" : "shirts"}. The rest stay in your bag.
            </p>
          )}
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.field}>
              <label htmlFor="bag-name">Your name</label>
              <input
                id="bag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
              />
            </div>
            <fieldset className={styles.field}>
              <legend>Pick up or delivery</legend>
              <div className={styles.segment}>
                {[
                  ["pickup", "Pick up"],
                  ["delivery", "Delivery"],
                ].map(([value, text]) => (
                  <label key={value} className={styles.option}>
                    <input
                      type="radio"
                      name="fulfilment"
                      value={value}
                      checked={fulfilment === value}
                      onChange={() => setFulfilment(value)}
                    />
                    <span>{text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {fulfilment === "delivery" && (
              <div className={styles.field}>
                <label htmlFor="bag-location">
                  Delivery area{pin ? <span className={styles.optional}> (optional now)</span> : null}
                </label>
                <AreaPicker areas={areas} value={area} onChange={setArea} />
{pin ? (
                  <LocationPreview pin={pin} onRemove={() => setPin(null)} onRetry={shareLocation} busy={locating} />
                ) : (
                  <button type="button" className={styles.locate} onClick={shareLocation} disabled={locating}>
                    <Icon name="locate" size={16} />
                    {locating ? "Finding you… allow location if asked" : "Share my exact location (optional)"}
                  </button>
                )}
                {locError && (
                  <p className={styles.locError} role="alert">
                    <Icon name="alert" size={16} />
                    <span>{locError}</span>
                  </p>
                )}
              </div>
            )}
            <div className={styles.field}>
              <label htmlFor="bag-payment">Payment</label>
              <div className={styles.selectWrap}>
                <select id="bag-payment" value={payment} onChange={(e) => setPayment(e.target.value)}>
                  {shop.payments.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <Icon name="chevron" size={18} className={styles.selectIcon} />
              </div>
            </div>

            <dl className={styles.totals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>{fulfilment === "pickup" ? "Free pick up" : fee ? formatPrice(fee) : "Agreed in chat"}</dd>
              </div>
              <div className={styles.grand}>
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {link ? (
              <a
                className={`btn btnPrimary ${styles.send}`}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  setSent(true);
                  setCopied(false);
                  const mode = openWhatsApp(e, link, () => {
                    try {
                      sessionStorage.setItem("msika-sent", "1");
                    } catch {}
                  });
                  setOverlay(mode);
                }}
              >
                <Icon name="chat" size={18} />
                Send order on WhatsApp
              </a>
            ) : (
              <button type="button" className={`btn btnPrimary ${styles.send}`} disabled>
                {nothingChosen
                  ? "Select at least one shirt"
                  : missingName
                    ? "Add your name to continue"
                    : "Choose your area or share your location"}
              </button>
            )}
            <p className={styles.fine}>Nothing is paid yet. We confirm your order in the chat first.</p>
            {sent && (
              <div className={styles.after} role="status">
                <div className={styles.afterRow}>
                  <span>Sent it in WhatsApp?</span>
                  <button type="button" onClick={allChosen ? clearBag : removeSent}>
                    {allChosen ? "Clear bag" : "Remove sent shirts"}
                  </button>
                </div>
                <div className={styles.afterHelp}>
                  <span>WhatsApp didn&apos;t open?</span>
                  <button type="button" onClick={copyOrder}>
                    {copied ? "Order copied" : "Copy order"}
                  </button>
                </div>
                {copied && <p className={styles.afterNote}>Paste it in a WhatsApp chat to +{shop.whatsapp}.</p>}
              </div>
            )}
          </form>
        </section>
      </div>
      {overlay && <OrderOverlay mode={overlay} count={chosenCount} onClose={closeOverlay} />}
    </div>
  );
}
