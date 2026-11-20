import Reveal from "./Reveal";
import styles from "./Steps.module.css";

const steps = [
  {
    title: "Pick your kit",
    text: "Choose a jersey and your size. You see what is in stock before you ask.",
  },
  {
    title: "Send it on WhatsApp",
    text: "Your order opens as a ready-made WhatsApp message. Just press send.",
  },
  {
    title: "Pay and collect",
    text: "We confirm in the chat. Then you pay and pick it up or get it delivered.",
  },
];

export default function Steps() {
  return (
    <section id="how" className={styles.band} aria-labelledby="how-title">
      <div className={`wrap ${styles.panel}`}>
        <Reveal className={styles.head}>
          <h2 id="how-title" className={styles.title}>
            How ordering works
          </h2>
          <p className={styles.sub}>No account. No card. Just a chat.</p>
        </Reveal>
        <ol className={styles.list}>
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} className={styles.step} index={i + 2}>
              <span className={styles.num}>{i + 1}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.text}>{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
