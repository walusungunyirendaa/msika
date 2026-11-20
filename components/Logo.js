import styles from "./Logo.module.css";

export function TagMark({ className, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M11 3 H19 A2 2 0 0 1 21 5 V13 L12.6 21.4 A2 2 0 0 1 9.8 21.4 L2.6 14.2 A2 2 0 0 1 2.6 11.4 Z"
        fill="currentColor"
      />
      <circle cx="16.4" cy="7.6" r="1.9" className={styles.hole} />
    </svg>
  );
}

export default function Logo({ size = 26, className = "" }) {
  return (
    <span className={`${styles.logo} ${className}`} style={{ fontSize: size }} role="img" aria-label="msika">
      <span aria-hidden="true">ms</span>
      <span aria-hidden="true" className={styles.i}>
        ı
        <svg viewBox="0 0 24 24" className={styles.tag}>
          <path
            d="M11 3 H19 A2 2 0 0 1 21 5 V13 L12.6 21.4 A2 2 0 0 1 9.8 21.4 L2.6 14.2 A2 2 0 0 1 2.6 11.4 Z"
            fill="currentColor"
          />
          <circle cx="16.4" cy="7.6" r="1.9" className={styles.hole} />
        </svg>
      </span>
      <span aria-hidden="true">ka</span>
    </span>
  );
}
