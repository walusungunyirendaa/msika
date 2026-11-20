"use client";

import { useSyncExternalStore } from "react";

const KEY = "msika-bag";
const EMPTY = [];
const listeners = new Set();
let cache = null;

function read() {
  if (cache !== null) return cache;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (event) => {
    if (event.key === KEY) {
      cache = null;
      fn();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

function sameLine(item, slug, size) {
  return item.slug === slug && item.size === size;
}

export function addToBag(slug, size, max) {
  const items = read();
  const found = items.find((i) => sameLine(i, slug, size));
  if (found) {
    write(items.map((i) => (sameLine(i, slug, size) ? { ...i, qty: Math.min(max, i.qty + 1) } : i)));
  } else {
    write([...items, { slug, size, qty: 1 }]);
  }
}

export function setBagQty(slug, size, qty, max) {
  const items = read();
  if (qty <= 0) {
    write(items.filter((i) => !sameLine(i, slug, size)));
    return;
  }
  write(items.map((i) => (sameLine(i, slug, size) ? { ...i, qty: Math.min(max, qty) } : i)));
}

export function clearBag() {
  write([]);
}

export function useBag() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  return { items, ready, count };
}
