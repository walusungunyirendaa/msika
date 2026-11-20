import Link from "next/link";
import Logo from "./Logo";
import BagButton from "./BagButton";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.bar}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.home} aria-label="msika home">
          <Logo size={24} />
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <Link href="/#shop" className={styles.link}>
            Shop
          </Link>
          <Link href="/#how" className={styles.link}>
            How it works
          </Link>
        </nav>
        <BagButton />
      </div>
    </header>
  );
}
