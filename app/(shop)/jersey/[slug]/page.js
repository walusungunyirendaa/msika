import Link from "next/link";
import { notFound } from "next/navigation";
import ProductView from "../../../../components/ProductView";
import ProductCard from "../../../../components/ProductCard";
import Icon from "../../../../components/Icon";
import { jerseyTitle, totalStock } from "../../../../data/jerseys";
import { getProduct, getShopProducts } from "../../../../lib/store";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const jersey = await getProduct(slug);
  return { title: jersey ? jerseyTitle(jersey) : "Kit not found" };
}

export default async function JerseyPage({ params }) {
  const { slug } = await params;
  const jersey = await getProduct(slug);
  if (!jersey) notFound();

  const more = (await getShopProducts()).filter((j) => j.slug !== slug && totalStock(j) > 0).slice(0, 4);

  return (
    <div className="wrap">
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/#shop" className={styles.back}>
          <Icon name="arrowLeft" size={18} />
          All kits
        </Link>
      </nav>
      <ProductView jersey={jersey} />
      {more.length > 0 && (
        <section className={styles.more} aria-labelledby="more-title">
          <h2 id="more-title" className={styles.moreTitle}>
            You might also like
          </h2>
          <div className={styles.moreGrid}>
            {more.map((j) => (
              <ProductCard key={j.slug} jersey={j} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
