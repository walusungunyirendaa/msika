import s from "../../../../components/Skeleton.module.css";

export default function Loading() {
  return (
    <div className={`wrap ${s.product}`} aria-busy="true">
      <div className={`${s.block} ${s.photo}`} />
      <div className={s.productInfo}>
        <span className={s.label} role="status">
          Loading shirt…
        </span>
        <div className={`${s.block} ${s.line} ${s.short}`} />
        <div className={`${s.block} ${s.big}`} />
        <div className={`${s.block} ${s.line} ${s.short}`} />
        <div className={s.sizes}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`${s.block} ${s.size}`} />
          ))}
        </div>
        <div className={`${s.block} ${s.button}`} />
      </div>
    </div>
  );
}
