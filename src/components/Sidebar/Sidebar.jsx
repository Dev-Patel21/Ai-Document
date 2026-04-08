import React from "react";
import { NAV_ITEMS, CATEGORIES } from "../../utils/constants";

export default function Sidebar({ activePage, onNavigate, activeCat, onCatSelect, catCounts, docCount }) {
  return (
    <aside className="sidebar">
      {/* Main navigation */}
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`sidebar__nav-btn ${activePage === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
          aria-current={activePage === item.id ? "page" : undefined}
        >
          <span className="sidebar__nav-icon">{item.icon}</span>
          <span className="sidebar__nav-label">{item.label}</span>
          {item.id === "documents" && docCount > 0 && (
            <span className="sidebar__nav-count">{docCount}</span>
          )}
        </button>
      ))}

      <div className="sidebar__divider" />

      {/* Category quick-filters */}
      <div className="sidebar__section-label">Categories</div>

      {CATEGORIES.map((cat) => {
        const count = cat.id === "all" ? docCount : (catCounts[cat.id] || 0);
        return (
          <button
            key={cat.id}
            className={`sidebar__cat-btn ${activeCat === cat.id ? "active" : ""}`}
            onClick={() => { onCatSelect(cat.id); onNavigate("documents"); }}
            title={cat.label}
          >
            <span className="sidebar__cat-icon">{cat.icon}</span>
            <span className="sidebar__cat-name">
              {cat.id === "all" ? "All" : cat.label}
            </span>
            <span className="sidebar__cat-count">{count}</span>
          </button>
        );
      })}
    </aside>
  );
}
