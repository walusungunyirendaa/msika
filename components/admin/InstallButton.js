"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";
import styles from "./Admin.module.css";

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!prompt) return null;

  async function install() {
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return (
    <button type="button" className={`${styles.barLink} ${styles.install}`} onClick={install}>
      <Icon name="plus" size={16} />
      Install app
    </button>
  );
}
