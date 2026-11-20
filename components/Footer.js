import Link from "next/link";
import Logo from "./Logo";
import Icon from "./Icon";
import { shop } from "../data/shop";
import { whatsappLink } from "../lib/whatsapp";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo size={24} />
            <p className={styles.note}>Football jerseys in {shop.location}. Every order is confirmed on WhatsApp.</p>
          </div>
          <nav className={styles.links} aria-label="Footer">
            <Link href="/#shop">Shop</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/bag">Your bag</Link>
          </nav>
          <a
            className={`btn btnDark ${styles.chat}`}
            href={whatsappLink("Hi, I have a question about a jersey.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="chat" size={18} />
            Chat on WhatsApp
          </a>
        </div>
        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} {shop.name}
          </span>
          <Link href="/admin" className={styles.seller}>
            Seller login
          </Link>
        </div>
      </div>
    </footer>
  );
}
