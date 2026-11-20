import ShopGrid from "../../components/ShopGrid";
import Steps from "../../components/Steps";
import Hero from "../../components/Hero";
import Reveal from "../../components/Reveal";
import { totalStock } from "../../data/jerseys";
import { getShopProducts } from "../../lib/store";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getShopProducts();
  const available = products.filter((j) => totalStock(j) > 0);
  const inStock = available.length;
  const featured = [...available.filter((j) => j.isNew), ...available.filter((j) => !j.isNew)].slice(0, 2);

  return (
    <>
      <Hero inStock={inStock} featured={featured} />

      <section id="shop" className={`wrap ${styles.shop}`} aria-labelledby="shop-title">
        <Reveal as="h2" id="shop-title" className={styles.shopTitle}>
          All kits
        </Reveal>
        <ShopGrid products={products} />
      </section>

      <Steps />
    </>
  );
}
