import Icon from "./Icon";
import styles from "./LocationPreview.module.css";

function frameUrl(lat, lng) {
  const d = 0.004;
  const box = [lng - d, lat - d * 0.6, lng + d, lat + d * 0.6].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${lat},${lng}`;
}

export default function LocationPreview({ pin, onRemove, onRetry, busy }) {
  const lat = Number(pin.lat);
  const lng = Number(pin.lng);
  const rough = pin.accuracy > 500;

  return (
    <div className={styles.card} role="status">
      <div className={styles.map}>
        <div className={styles.fallback} aria-hidden="true">
          <Icon name="pin" size={22} />
          <span>
            {pin.lat}, {pin.lng}
          </span>
        </div>
        <iframe
          title="Your shared location on a map"
          src={frameUrl(lat, lng)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className={styles.body}>
        <p className={styles.title}>
          <Icon name="check" size={16} /> Exact location added
        </p>
        <p className={styles.meta}>
          {pin.accuracy ? `Accurate to about ${pin.accuracy.toLocaleString()} m. ` : ""}
          The seller gets this pin in your WhatsApp message.
        </p>
        {rough && (
          <p className={styles.warn}>
            This is a rough spot. On a laptop this is normal. Pick your area above to be safe or try again on your phone.
          </p>
        )}
        <div className={styles.actions}>
          <a href={`https://maps.google.com/?q=${pin.lat},${pin.lng}`} target="_blank" rel="noopener noreferrer">
            Check on map
          </a>
          <button type="button" onClick={onRetry} disabled={busy}>
            {busy ? "Finding you…" : "Try again"}
          </button>
          <button type="button" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
