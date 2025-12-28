import React from "react";
import styles from "./sidebar.module.css";

export type SidebarItem = {
  id: string;
  label: string;
};

type SidebarProps = {
  title?: string;
  items: SidebarItem[];
  activeId?: string;
  onSelect: (id: string) => void;
};

export default function Sidebar({ title, items, activeId, onSelect }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {title ? <div className={styles.title}>{title}</div> : null}

      <nav className={styles.nav}>
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`${styles.itemButton} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
