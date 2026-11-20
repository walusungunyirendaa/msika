import Image from "next/image";
import { jerseyTitle } from "../data/jerseys";
import { TagMark } from "./Logo";
import styles from "./ProductImage.module.css";

export default function ProductImage({ jersey, index = 0, sizes, eager = false, compact = false, className = "" }) {
  const src = jersey.images?.[index];

  return (
    <div className={`${styles.frame} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={`${jerseyTitle(jersey)} jersey, photo ${index + 1}`}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          unoptimized={src.startsWith("http")}
          className={styles.photo}
        />
      ) : (
        <div className={`${styles.placeholder} ${compact ? styles.compact : ""}`}>
          <span className={styles.club} aria-hidden="true">
            {jersey.club}
          </span>
          {!compact && (
            <span className={styles.soon}>
              <TagMark size={14} />
              Photo coming soon
            </span>
          )}
        </div>
      )}
    </div>
  );
}
