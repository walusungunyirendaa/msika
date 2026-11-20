"use client";

import { useActionState } from "react";
import Link from "next/link";
import Logo from "../Logo";
import Icon from "../Icon";
import { login } from "../../app/admin/actions";
import styles from "./Admin.module.css";

export default function LoginForm({ problem, reason }) {
  const [state, action, pending] = useActionState(login, null);

  return (
    <main className={styles.loginPage}>
      <form action={action} className={styles.loginCard}>
        <Logo size={28} />
        <div>
          <h1 className={styles.loginTitle}>Seller login</h1>
          <p className={styles.muted}>Manage your stock and prices.</p>
        </div>
        {reason === "out" && (
          <p className={`${styles.notice} ${styles.noticeOk}`} role="status">
            <Icon name="check" size={16} />
            You&apos;re logged out. See you next time.
          </p>
        )}
        {(reason === "idle" || reason === "expired") && !problem && (
          <p className={styles.notice} role="status">
            {reason === "idle"
              ? "You were logged out after 30 minutes without activity."
              : "Your session ended. Please log in again."}
          </p>
        )}
        {!problem ? (
          <>
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            {state?.error && (
              <p className={styles.error} role="alert">
                {state.error}
              </p>
            )}
            <button type="submit" className="btn btnDark" disabled={pending}>
              {pending ? "Logging in…" : "Log in"}
            </button>
          </>
        ) : (
          <p className={styles.error} role="alert">
            {problem === "short"
              ? "The seller password is too short. Set ADMIN_PASSWORD to at least 12 characters, then restart the site."
              : "No password is set yet. Add ADMIN_PASSWORD to the .env.local file, then restart the site."}
          </p>
        )}
      </form>
      <Link href="/" className={styles.backLink}>
        <Icon name="arrowLeft" size={16} />
        Back to the shop
      </Link>
    </main>
  );
}
