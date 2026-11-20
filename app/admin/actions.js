"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, signIn, signOut } from "../../lib/auth";
import { addProduct, getProducts, removeProduct, saveAreas, savePhoto, updateProduct } from "../../lib/store";
import { SIZES } from "../../data/jerseys";

export async function login(previous, formData) {
  const result = await signIn(String(formData.get("password") || "").slice(0, 200));
  if (result.error) return { error: result.error };
  redirect("/admin?status=in");
}

export async function logout() {
  await signOut();
  redirect("/admin?status=out");
}

export async function logoutIdle() {
  await signOut();
  redirect("/admin?reason=idle");
}

function whole(value, max) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > max) throw new Error("Invalid number");
  return n;
}

export async function saveProduct(slug, draft) {
  if (!(await isAdmin())) return { error: "Please log in again." };
  try {
    const stock = {};
    SIZES.forEach((s) => {
      stock[s] = whole(draft.stock?.[s] ?? 0, 999);
    });
    const product = await updateProduct(slug, {
      price: whole(draft.price, 100000),
      stock,
      isNew: Boolean(draft.isNew),
      hidden: Boolean(draft.hidden),
    });
    revalidatePath("/", "layout");
    return { product };
  } catch (error) {
    return {
      error: error.message === "Invalid number" ? "Check the price and stock numbers." : friendly(error),
    };
  }
}

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function text(value, max) {
  const v = String(value || "").trim();
  if (!v || v.length > max) throw new Error("Invalid text");
  return v;
}

async function clubName(value) {
  const typed = text(value, 40).replace(/\s+/g, " ");
  const match = (await getProducts()).find((p) => p.club.toLowerCase() === typed.toLowerCase());
  return match ? match.club : typed;
}

async function photoFrom(formData) {
  const file = formData.get("photo");
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (!PHOTO_TYPES.includes(file.type) || file.size > 900 * 1024) throw new Error("Invalid photo");
  return savePhoto(file);
}

function friendly(error) {
  if (error.name === "OfflineError") return "No connection to the shop's database. Check your internet and try again.";
  if (error.message === "Invalid text") return "Add the club and kit name.";
  if (error.message === "Invalid number") return "Check the price and stock numbers.";
  if (error.message === "Invalid photo") return "That photo could not be used. Try another one.";
  if (error.message.startsWith("Photo upload failed")) return "The photo did not upload. Try again.";
  return "Could not save. Try again.";
}

export async function createProduct(formData) {
  if (!(await isAdmin())) return { error: "Please log in again." };
  try {
    const stockInput = JSON.parse(String(formData.get("stock") || "{}"));
    const stock = {};
    SIZES.forEach((s) => {
      stock[s] = whole(stockInput[s] ?? 0, 999);
    });
    const club = await clubName(formData.get("club"));
    const kitName = text(formData.get("kitName"), 30);
    const price = whole(formData.get("price"), 100000);
    const photo = await photoFrom(formData);
    const product = await addProduct({
      club,
      kitName,
      price,
      isNew: formData.get("isNew") === "true",
      hidden: false,
      images: photo ? [photo] : [],
      stock,
    });
    revalidatePath("/", "layout");
    return { product };
  } catch (error) {
    return { error: friendly(error) };
  }
}

export async function editProduct(slug, formData) {
  if (!(await isAdmin())) return { error: "Please log in again." };
  try {
    const changes = {
      club: await clubName(formData.get("club")),
      kitName: text(formData.get("kitName"), 30),
    };
    const photo = await photoFrom(formData);
    if (photo) changes.images = [photo];
    const product = await updateProduct(slug, changes);
    revalidatePath("/", "layout");
    return { product };
  } catch (error) {
    return { error: friendly(error) };
  }
}

export async function deleteProduct(slug) {
  if (!(await isAdmin())) return { error: "Please log in again." };
  try {
    await removeProduct(slug);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { error: friendly(error) };
  }
}

export async function updateAreas(list) {
  if (!(await isAdmin())) return { error: "Please log in again." };
  try {
    if (!Array.isArray(list) || list.length > 300) throw new Error("Invalid text");
    const seen = new Set();
    const areas = [];
    for (const item of list) {
      const name = text(item?.name, 50).replace(/\s+/g, " ");
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const fee = item?.fee === null || item?.fee === "" || item?.fee === undefined ? null : whole(item.fee, 10000);
      areas.push({ name, fee });
    }
    areas.sort((a, b) => a.name.localeCompare(b.name));
    await saveAreas(areas);
    revalidatePath("/bag");
    return { areas };
  } catch (error) {
    return { error: error.message === "Invalid text" ? "Every area needs a name." : friendly(error) };
  }
}
