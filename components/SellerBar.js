import Link from "next/link";
import { logout } from "../app/admin/actions";
import styles from "./SellerBar.module.css";

export default function SellerBar() {
  return (
    <div className={styles.bar}>
      <div className={`wrap ${styles.inner}`}>
        <span className={styles.label}>
          <span className={styles.dot} aria-hidden="true" />
          Seller view
        </span>
        <div className={styles.actions}>
          <Link href="/admin" className={styles.link}>
            Back to stock
          </Link>
          <form action={logout}>
            <button type="submit" className={styles.link}>
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
