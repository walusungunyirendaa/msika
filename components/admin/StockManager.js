"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "../Logo";
import StockCard from "./StockCard";
import ProductForm from "./ProductForm";
import InstallButton from "./InstallButton";
import AreasEditor from "./AreasEditor";
import Toaster, { toast } from "../Toast";
import OfflineBanner from "../OfflineBanner";
import Icon from "../Icon";
import { clubsOf, totalStock } from "../../data/jerseys";
import { logout, logoutIdle } from "../../app/admin/actions";
import styles from "./Admin.module.css";

const FILTERS = ["All", "Low", "Sold out", "Hidden"];
const IDLE_MS = 30 * 60 * 1000;

function matches(filter, p) {
  const left = totalStock(p);
  if (filter === "Low") return left > 0 && left <= 3;
  if (filter === "Sold out") return left === 0;
  if (filter === "Hidden") return p.hidden;
  return true;
}

export default function StockManager({ initialProducts, initialAreas, expiresAt, welcome = false }) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null);
  const [areas, setAreas] = useState(initialAreas);
  const [editingAreas, setEditingAreas] = useState(false);
  const router = useRouter();

  const welcomed = useRef(false);

  useEffect(() => {
    if (!welcome || welcomed.current) return;
    welcomed.current = true;
    toast("Logged in. Welcome back.");
    router.replace("/admin");
  }, [welcome, router]);

  useEffect(() => {
    let last = Date.now();
    let done = false;
    const bump = () => {
      last = Date.now();
    };
    const check = () => {
      if (done) return;
      if (Date.now() > expiresAt) {
        done = true;
        router.replace("/admin?reason=expired");
      } else if (Date.now() - last > IDLE_MS) {
        done = true;
        logoutIdle();
      }
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    document.addEventListener("visibilitychange", check);
    const timer = setInterval(check, 30000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      document.removeEventListener("visibilitychange", check);
      clearInterval(timer);
    };
  }, [expiresAt, router]);

  const summary = useMemo(() => {
    const shown = products.filter((p) => !p.hidden);
    return {
      shirts: shown.reduce((sum, p) => sum + totalStock(p), 0),
      low: shown.filter((p) => matches("Low", p)).length,
      out: shown.filter((p) => matches("Sold out", p)).length,
    };
  }, [products]);

  const q = query.trim().toLowerCase();
  const list = products.filter((p) => matches(filter, p) && (!q || `${p.club} ${p.kitName}`.toLowerCase().includes(q)));

  function replace(updated) {
    setProducts((all) => all.map((p) => (p.slug === updated.slug ? updated : p)));
  }

  function remove(slug) {
    const gone = products.find((p) => p.slug === slug);
    setProducts((all) => all.filter((p) => p.slug !== slug));
    if (gone) toast(`${gone.club} ${gone.kitName} deleted`);
  }

  function formDone(product) {
    if (form?.product) {
      replace(product);
      toast(`${product.club} ${product.kitName} updated`);
    } else {
      toast(`${product.club} ${product.kitName} added to the shop`);
      setProducts((all) => [product, ...all]);
      setFilter("All");
      setQuery("");
    }
    setForm(null);
  }

  return (
    <div className={styles.page}>
      <OfflineBanner />
      <header className={styles.bar}>
        <div className={`wrap ${styles.barInner}`}>
          <div className={styles.brand}>
            <Logo size={22} />
            <span className={styles.badge}>Seller</span>
          </div>
          <div className={styles.barActions}>
            <InstallButton />
            <Link href="/" className={styles.barLink}>
              View shop
            </Link>
            <form action={logout}>
              <button type="submit" className={styles.barLink}>
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className={`wrap ${styles.main}`}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Stock</h1>
          <div className={styles.titleActions}>
            <button type="button" className="btn btnGhost" onClick={() => setEditingAreas(true)}>
              <Icon name="pin" size={18} />
              Delivery areas
            </button>
            <button type="button" className="btn btnPrimary" onClick={() => setForm({})}>
              <Icon name="plus" size={18} />
              Add shirt
            </button>
          </div>
        </div>

        <dl className={styles.summary}>
          <div>
            <dt>Shirts in stock</dt>
            <dd>{summary.shirts}</dd>
          </div>
          <div>
            <dt>Running low</dt>
            <dd className={summary.low ? styles.accent : ""}>{summary.low}</dd>
          </div>
          <div>
            <dt>Sold out</dt>
            <dd>{summary.out}</dd>
          </div>
        </dl>

        <div className={styles.tools}>
          <div className={styles.filters} role="group" aria-label="Filter shirts">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={styles.filter}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <label className={styles.search}>
            <span className="sr-only">Search shirts</span>
            <input type="search" placeholder="Search shirts" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>

        {list.length > 0 ? (
          <div className={styles.grid}>
            {list.map((p) => (
              <StockCard
                key={p.slug}
                product={p}
                onSaved={replace}
                onEdit={() => setForm({ product: p })}
                onDeleted={remove}
              />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No shirts here.</p>
        )}
      </main>
      {editingAreas && (
        <AreasEditor
          initialAreas={areas}
          onClose={() => setEditingAreas(false)}
          onSaved={(saved) => {
            setAreas(saved);
            toast("Delivery areas saved");
            setEditingAreas(false);
          }}
        />
      )}
      {form && (
        <ProductForm product={form.product} clubs={clubsOf(products)} onClose={() => setForm(null)} onDone={formDone} />
      )}
      <Toaster />
    </div>
  );
}
