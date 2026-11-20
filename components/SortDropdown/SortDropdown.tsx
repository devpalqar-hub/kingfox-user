"use client";

import { useEffect, useId, useRef, useState } from "react";

import styles from "./SortDropdown.module.css";

export type SortDropdownOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  /** Currently selected value, or null for "no sorting". */
  value: T | null;
  options: SortDropdownOption<T>[];
  /** Called with the picked value, or null when the user clears the sort. */
  onChange: (value: T | null) => void;
  label?: string;
  placeholder?: string;
};

export default function SortDropdown<T extends string>({
  value,
  options,
  onChange,
  label = "Sort by",
  placeholder = "Featured",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // "Featured" (null) is always the first row so a sort can be cleared.
  const rows: { value: T | null; label: string }[] = [
    { value: null, label: placeholder },
    ...options,
  ];
  const selectedIndex = rows.findIndex((row) => row.value === value);
  const selected = rows[selectedIndex] ?? rows[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const openMenu = () => {
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const pick = (index: number) => {
    onChange(rows[index].value);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return openMenu();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((prev) => (prev + step + rows.length) % rows.length);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) return openMenu();
      if (active >= 0) pick(active);
    }
  };

  return (
    <div className={styles.root} ref={rootRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <svg
          className={styles.sortIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M6 12h12M10 18h4" />
        </svg>
        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{selected.label}</span>
        </span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox" id={listId} aria-label={label}>
          {rows.map((row, index) => {
            const isSelected = index === (selectedIndex >= 0 ? selectedIndex : 0);
            return (
              <li
                key={row.value ?? "__none"}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${
                  index === active ? styles.optionActive : ""
                } ${isSelected ? styles.optionSelected : ""}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(index)}
              >
                <span>{row.label}</span>
                {isSelected && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
