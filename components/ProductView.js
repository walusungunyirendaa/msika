"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { toast } from "./Toast";
import ProductImage from "./ProductImage";
import { SIZES, jerseyTitle, totalStock } from "../data/jerseys";
import { shop } from "../data/shop";
import { formatPrice, listWithOr } from "../lib/format";
import { addToBag, useBag } from "../lib/useBag";
import { buildOrderMessage, whatsappLink } from "../lib/whatsapp";
import { openWhatsApp } from "../lib/openWhatsApp";
import styles from "./ProductView.module.css";

function sizeNote(qty) {
  if (qty === 0) return "Sold out";
  if (qty === 1) return "Last one";
  return `${qty} left`;
}

export default function ProductView({ jersey }) {
  const slug = jersey.slug;
  const [size, setSize] = useState(null);
  const [photo, setPhoto] = useState(0);
  const [added, setAdded] = useState(null);
  const { items } = useBag();

  const title = jerseyTitle(jersey);
  const left = totalStock(jersey);
  const soldOut = left === 0;
  const inBag = size ? items.find((i) => i.slug === slug && i.size === size)?.qty || 0 : 0;
  const maxed = size ? inBag >= jersey.stock[size] : false;
  const quickLink = size ? whatsappLink(buildOrderMessage({ items: [{ jersey, size, qty: 1 }] })) : null;
  const photos = jersey.images?.length ? jersey.images : [null];

  function pickSize(s) {
    setSize(s);
    setAdded(null);
  }

  function handleAdd() {
    if (!size || maxed) return;
    addToBag(slug, size, jersey.stock[size]);
    setAdded(size);
    toast(`${title}, size ${size} added to your bag`);
  }

  let addLabel = "Add to bag";
  if (soldOut) addLabel = "Sold out";
  else if (!size) addLabel = "Select a size";
  else if (maxed) addLabel = "All in your bag";

  return (
    <div className={styles.layout}>
      <div className={styles.gallery}>
        <ProductImage
          jersey={jersey}
          index={photo}
          eager
          sizes="(min-width: 900px) 55vw, 100vw"
          className={styles.main}
        />
        {photos.length > 1 && (
          <div className={styles.thumbs} role="group" aria-label="Photos">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={styles.thumb}
                aria-pressed={photo === i}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setPhoto(i)}
              >
                <ProductImage jersey={jersey} index={i} sizes="80px" compact />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.head}>
          <p className={styles.kicker}>
            {jersey.kitName} kit
            {jersey.isNew && <span className={styles.new}>New</span>}
          </p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.price}>{formatPrice(jersey.price)}</p>
        </div>

        <fieldset className={styles.sizes} disabled={soldOut}>
          <legend className={styles.legend}>
            <span>Size</span>
            <span className={styles.legendNote}>
              {size ? sizeNote(jersey.stock[size]) : soldOut ? "Sold out" : "Pick one"}
            </span>
          </legend>
          <div className={styles.sizeGrid}>
            {SIZES.map((s) => {
              const qty = jersey.stock[s];
              return (
                <button
                  key={s}
                  type="button"
                  className={styles.size}
                  aria-pressed={size === s}
                  aria-label={`${s}, ${sizeNote(qty)}`}
                  disabled={qty === 0}
                  onClick={() => pickSize(s)}
                >
                  {s}
                  {qty === 1 && <span className={styles.dot} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {!soldOut && (
            <p className={styles.hint}>
              <span className={styles.dot} aria-hidden="true" /> Last one in that size
            </p>
          )}
        </fieldset>

        <div className={styles.actions}>
          <button type="button" className="btn btnPrimary" onClick={handleAdd} disabled={!size || maxed || soldOut}>
            <Icon name="bag" size={18} />
            {addLabel}
          </button>
          {quickLink ? (
            <a
              className="btn btnGhost"
              href={quickLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => openWhatsApp(e, quickLink)}
            >
              <Icon name="chat" size={18} />
              Order on WhatsApp
            </a>
          ) : (
            <span className="btn btnGhost" aria-disabled="true">
              <Icon name="chat" size={18} />
              Order on WhatsApp
            </span>
          )}
        </div>

        <div className={styles.status} role="status">
          {added && (
            <p className={styles.toast}>
              <span className={styles.check}>
                <Icon name="check" size={14} />
              </span>
              Size {added} added to your bag.
              <Link href="/bag" className={styles.toastLink}>
                View bag
              </Link>
            </p>
          )}
        </div>

        <div className={styles.details}>
          <details open>
            <summary>
              How ordering works
              <Icon name="chevron" size={18} className={styles.chev} />
            </summary>
            <p>Add your jersey to the bag. Then send your order on WhatsApp. We confirm your size before you pay.</p>
          </details>
          <details>
            <summary>
              Payment
              <Icon name="chevron" size={18} className={styles.chev} />
            </summary>
            <p>Pay with {listWithOr(shop.payments)} once your order is confirmed.</p>
          </details>
          <details>
            <summary>
              Pick up and delivery
              <Icon name="chevron" size={18} className={styles.chev} />
            </summary>
            <p>Choose pick up or delivery when you send your order. We sort out the details in the chat.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
