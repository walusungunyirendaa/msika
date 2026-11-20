import s from "../../components/Skeleton.module.css";

export default function Loading() {
  return (
    <div className={s.admin} aria-busy="true">
      <div className={s.adminBar} />
      <div className={`wrap ${s.page}`}>
        <span className={s.label} role="status">
          Loading your stock…
        </span>
        <div className={`${s.block} ${s.title}`} />
        <div className={s.adminCards}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${s.block} ${s.adminCard}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
