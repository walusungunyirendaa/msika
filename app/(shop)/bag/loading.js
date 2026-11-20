import s from "../../../components/Skeleton.module.css";

export default function Loading() {
  return (
    <div className={`wrap ${s.page}`} aria-busy="true">
      <span className={s.label} role="status">
        Loading your bag…
      </span>
      <div className={`${s.block} ${s.title}`} />
      <div className={s.productInfo}>
        {[0, 1].map((i) => (
          <div key={i} className={`${s.block} ${s.size}`} style={{ height: 120 }} />
        ))}
      </div>
    </div>
  );
}
