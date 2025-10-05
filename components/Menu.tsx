"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Menu.module.css";

// Small dropdown menu with a hamburger button
export default function Menu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape and outside click; return focus to the button
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <div className={styles.container} ref={menuRef}>
      {/* Hamburger button (rotates to X when open) */}
      <button
        ref={btnRef}
        className={styles.hamburger}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mainnav"
        onClick={() => setOpen(v => !v)}
      >
        <span className={open ? styles.barOpen : styles.bar} />
        <span className={open ? styles.barOpen : styles.bar} />
        <span className={open ? styles.barOpen : styles.bar} />
      </button>

      {/* Dropdown links */}
      <nav id="mainnav" className={open ? styles.menuOpen : styles.menu}>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/courtroom">Courtroom</Link></li>
          <li><Link href="/prelab">Pre-lab</Link></li>
          <li><Link href="/escape">Escape Room</Link></li>
          <li><Link href="/races">Coding Races</Link></li>
        </ul>
      </nav>
    </div>
  );
}
