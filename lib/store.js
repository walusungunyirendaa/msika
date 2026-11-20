import { promises as fs } from "fs";
import path from "path";

const SEED_FILE = path.join(process.cwd(), "data", "products.json");
const LIVE_FILE = path.join(process.cwd(), "data", "store.json");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const useDatabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
const TIMEOUT_MS = 8000;
const lastGood = new Map();

export class OfflineError extends Error {
  constructor() {
    super("offline");
    this.name = "OfflineError";
  }
}

async function dbFetch(url, options = {}) {
  try {
    return await fetch(url, { ...options, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new OfflineError();
  }
}

async function remember(key, load) {
  try {
    const value = await load();
    lastGood.set(key, value);
    return value;
  } catch (error) {
    if (lastGood.has(key)) return lastGood.get(key);
    throw error;
  }
}

async function readSeed() {
  return JSON.parse(await fs.readFile(SEED_FILE, "utf8"));
}

function dbHeaders(extra = {}) {
  const headers = { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...extra };
  if (SUPABASE_KEY.startsWith("ey")) headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  return headers;
}

async function readDatabase() {
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/store?id=eq.1&select=products`, {
    headers: dbHeaders(),
  });
  if (!res.ok) throw new Error(`Database read failed (${res.status})`);
  const rows = await res.json();
  return rows[0]?.products ?? readSeed();
}

async function writeDatabase(products) {
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/store`, {
    method: "POST",
    headers: dbHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({ id: 1, products }),
  });
  if (!res.ok) throw new Error(`Database save failed (${res.status})`);
}

const AREAS_SEED = path.join(process.cwd(), "data", "areas.json");
const AREAS_LIVE = path.join(process.cwd(), "data", "areas-live.json");

async function readRow(id) {
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/store?id=eq.${id}&select=products`, {
    headers: dbHeaders(),
  });
  if (!res.ok) throw new Error(`Database read failed (${res.status})`);
  const rows = await res.json();
  return rows[0]?.products ?? null;
}

async function writeRow(id, value) {
  const res = await dbFetch(`${SUPABASE_URL}/rest/v1/store`, {
    method: "POST",
    headers: dbHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({ id, products: value }),
  });
  if (!res.ok) throw new Error(`Database save failed (${res.status})`);
}

export async function getAreas() {
  if (useDatabase) {
    try {
      const saved = await remember("areas", () => readRow(2));
      if (saved) return saved;
    } catch {}
  } else {
    try {
      return JSON.parse(await fs.readFile(AREAS_LIVE, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return JSON.parse(await fs.readFile(AREAS_SEED, "utf8"));
}

export async function saveAreas(areas) {
  if (useDatabase) {
    await writeRow(2, areas);
    lastGood.set("areas", areas);
  }
  else await fs.writeFile(AREAS_LIVE, JSON.stringify(areas, null, 2) + "\n");
}

async function readFile() {
  try {
    return JSON.parse(await fs.readFile(LIVE_FILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return readSeed();
    throw error;
  }
}

export async function getProducts() {
  return useDatabase ? remember("products", readDatabase) : readFile();
}

export async function getShopProducts() {
  return (await getProducts()).filter((p) => !p.hidden);
}

export async function getProduct(slug) {
  return (await getShopProducts()).find((p) => p.slug === slug);
}

async function writeAll(products) {
  if (useDatabase) {
    await writeDatabase(products);
    lastGood.set("products", products);
  }
  else await fs.writeFile(LIVE_FILE, JSON.stringify(products, null, 2) + "\n");
}

export async function updateProduct(slug, changes) {
  const products = await getProducts();
  const index = products.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error("Shirt not found");
  products[index] = { ...products[index], ...changes };
  await writeAll(products);
  return products[index];
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function addProduct(product) {
  const products = await getProducts();
  const base = slugify(`${product.club} ${product.kitName}`) || "shirt";
  let slug = base;
  for (let n = 2; products.some((p) => p.slug === slug); n++) slug = `${base}-${n}`;
  const created = { ...product, slug };
  await writeAll([created, ...products]);
  return created;
}

export async function removeProduct(slug) {
  const products = await getProducts();
  const next = products.filter((p) => p.slug !== slug);
  if (next.length === products.length) throw new Error("Shirt not found");
  await writeAll(next);
}

export async function savePhoto(file) {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (useDatabase) {
    const headers = dbHeaders({ "Content-Type": file.type || "image/jpeg", "x-upsert": "true" });
    const res = await dbFetch(`${SUPABASE_URL}/storage/v1/object/jerseys/${name}`, {
      method: "POST",
      headers,
      body: bytes,
    });
    if (!res.ok) throw new Error(`Photo upload failed (${res.status})`);
    return `${SUPABASE_URL}/storage/v1/object/public/jerseys/${name}`;
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}
