import React, { useState } from "react";
import Sidebar, { type SidebarItem } from "./Sidebar"; // adjust path if Sidebar is in another folder

const items: SidebarItem[] = [
  { id: "home", label: "Home" },
  { id: "settings", label: "Settings" },
  { id: "about", label: "About" },
];

export default function MainPage() {
  const [activeId, setActiveId] = useState("home");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        title="Menu"
        items={items}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <main style={{ padding: 16, flex: 1 }}>
        Active: {activeId}
      </main>
    </div>
  );
}
