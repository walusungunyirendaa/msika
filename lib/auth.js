import { cookies, headers } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";

const COOKIE = "msika_admin";
const SESSION_HOURS = 8;
const MIN_PASSWORD = 12;
const MAX_TRIES = 5;
const LOCK_MINUTES = 15;
const attempts = (globalThis.__msikaLoginAttempts ??= new Map());

function password() {
  return process.env.ADMIN_PASSWORD || "";
}

function signingKey() {
  return createHash("sha256")
    .update(`${process.env.ADMIN_SESSION_SECRET || ""}:${password()}`)
    .digest();
}

function sign(value) {
  return createHmac("sha256", signingKey()).update(value).digest("base64url");
}

function same(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwordProblem() {
  if (!password()) return "missing";
  if (password().length < MIN_PASSWORD) return "short";
  return null;
}

export async function getSession() {
  if (passwordProblem()) return null;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !same(signature, sign(expires))) return null;
  if (Number(expires) < Date.now()) return null;
  return { expiresAt: Number(expires) };
}

export async function isAdmin() {
  return Boolean(await getSession());
}

async function visitor() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
}

export async function signIn(attempt) {
  if (passwordProblem()) return { error: "The seller password is not set up yet." };
  const who = await visitor();
  const record = attempts.get(who) || { fails: 0, lockedUntil: 0 };
  if (record.lockedUntil > Date.now()) {
    const minutes = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { error: `Too many wrong tries. Wait ${minutes} min and try again.` };
  }
  const ok = same(createHash("sha256").update(attempt).digest(), createHash("sha256").update(password()).digest());
  if (!ok) {
    record.fails += 1;
    if (record.fails >= MAX_TRIES) {
      record.fails = 0;
      record.lockedUntil = Date.now() + LOCK_MINUTES * 60000;
    }
    attempts.set(who, record);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const left = MAX_TRIES - record.fails;
    return {
      error:
        record.lockedUntil > Date.now()
          ? `Too many wrong tries. Wait ${LOCK_MINUTES} min and try again.`
          : `That password is not right. ${left} ${left === 1 ? "try" : "tries"} left.`,
    };
  }
  attempts.delete(who);
  const expires = String(Date.now() + SESSION_HOURS * 3600000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return { ok: true };
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
