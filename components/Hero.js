import Link from "next/link";
import { getImageProps } from "next/image";
import Icon from "./Icon";
import ProductImage from "./ProductImage";
import { jerseyTitle } from "../data/jerseys";
import { formatPrice } from "../lib/format";
import { whatsappLink } from "../lib/whatsapp";
import styles from "./Hero.module.css";

function heroImage() {
  const common = { alt: "", sizes: "100vw", quality: 75 };
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: "/photos/hero2-wide.jpg", width: 2000, height: 1250 });
  const {
    props: { srcSet: phone, ...rest },
  } = getImageProps({
    ...common,
    src: "/photos/hero2-phone.jpg",
    width: 900,
    height: 1200,
    loading: "eager",
    fetchPriority: "high",
  });
  return { wide, phone, rest };
}

export default function Hero({ inStock, featured }) {
  const { wide, phone, rest } = heroImage();

  return (
    <section className={styles.hero} aria-labelledby="store-title" data-parallax>
      <picture className={styles.bg}>
        <source media="(min-width: 720px)" srcSet={wide} />
        <source media="(max-width: 719px)" srcSet={phone} />
        <img {...rest} alt="" className={styles.photo} />
      </picture>
      <div className={styles.shade} aria-hidden="true" />

      <div className={`wrap ${styles.inner}`}>
        <div className={styles.text}>
          <span className={styles.badge}>
            <span className={styles.dot} aria-hidden="true" />
            {inStock} kits in stock now
          </span>
          <h1 id="store-title" className={styles.title}>
            Your club. Your size.
          </h1>
          <p className={styles.lede}>
            Football jerseys from the clubs you love. Check your size here. Then order straight on WhatsApp.
          </p>
          <div className={styles.actions}>
            <Link href="#shop" className={`btn ${styles.primary}`}>
              Shop kits
              <Icon name="arrowRight" size={18} />
            </Link>
            <a
              href={whatsappLink("Hi, I have a question about a jersey.")}
              className={`btn ${styles.ghost}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="chat" size={18} />
              Ask a question
            </a>
          </div>
          <ul className={styles.facts}>
            <li>
              <strong>S to XXL</strong>
              <span>Sizes</span>
            </li>
            <li>
              <strong>WhatsApp</strong>
              <span>Order and chat</span>
            </li>
            <li>
              <strong>Easy pay</strong>
              <span>Mobile money or cash</span>
            </li>
          </ul>
        </div>

        <div className={styles.featured} aria-hidden="true">
          {featured.map((j, i) => (
            <Link
              key={j.slug}
              href={`/jersey/${j.slug}`}
              tabIndex={-1}
              className={`${styles.feature} ${styles[`feature${i}`]}`}
            >
              <ProductImage jersey={j} sizes="(min-width: 900px) 22vw, 0px" />
              <span className={styles.featureLabel}>
                {jerseyTitle(j)} · {formatPrice(j.price)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
