import s from "../../components/Skeleton.module.css";

export default function Loading() {
  return (
    <div aria-busy="true">
      <div className={`${s.block} ${s.hero}`} />
      <div className={`wrap ${s.page}`}>
        <span className={s.label} role="status">
          Loading kits…
        </span>
        <div className={`${s.block} ${s.title}`} />
        <div className={s.chips}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${s.block} ${s.chip}`} />
          ))}
        </div>
        <div className={s.grid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={s.card}>
              <div className={`${s.block} ${s.photo}`} />
              <div className={`${s.block} ${s.line}`} />
              <div className={`${s.block} ${s.line} ${s.short}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
