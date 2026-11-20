import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={`wrap ${styles.page}`}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>This page is offside</h1>
      <p className={styles.text}>The link may be old. The kit may be gone.</p>
      <Link href="/" className="btn btnDark">
        Back to the shop
      </Link>
    </div>
  );
}
