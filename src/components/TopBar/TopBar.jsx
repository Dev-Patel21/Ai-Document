import React from "react";

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__logo">
        <div className="topbar__logo-mark">D</div>
        <span className="topbar__logo-text">
          Document<em>AI</em>
        </span>
      </div>
      <div className="topbar__spacer" />
      <div className="topbar__status">
        <span className="topbar__status-dot" />
        AI Ready
      </div>
    </header>
  );
}
