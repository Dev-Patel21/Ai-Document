import React from "react";

export default function Profile({ profile, onProfileChange, onSave, stats, docs }) {
  const ownedCount = docs.filter((d) => d.owner === profile.name).length;
  const highConf   = docs.filter((d) => d.confidence >= 0.85).length;

  return (
    <div className="main-content" style={{ paddingBottom: "var(--sp-10)" }}>
      <div className="page-header">
        <h1 className="page-header__title">Profile</h1>
        <p className="page-header__sub">Manage your account and preferences.</p>
      </div>

      <div className="profile-grid">

        {/* Left — identity card */}
        <div
          className="card anim-fade-up"
          style={{ padding: "var(--sp-6)", textAlign: "center" }}
        >
          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "var(--text-xl)", color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "var(--sp-1)" }}>
            {profile.name}
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
            {profile.email}
          </p>
          <span className="profile-plan-badge">{profile.plan}</span>

          <div className="profile-stat-grid">
            {[
              { label: "Owned Docs",      val: ownedCount },
              { label: "High Confidence", val: highConf   },
              { label: "Total Docs",      val: stats.total },
              { label: "Added Today",     val: stats.today },
            ].map((s, i) => (
              <div key={s.label} className="profile-stat anim-fade-up" style={{ animationDelay: `${(i + 1) * 60}ms` }}>
                <div className="profile-stat__val">{s.val}</div>
                <div className="profile-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — settings form */}
        <div
          className="card anim-fade-up"
          style={{ padding: "var(--sp-6)", animationDelay: "80ms" }}
        >
          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "var(--text-xl)", color: "var(--text-primary)", marginBottom: "var(--sp-1)" }}>
            Account Settings
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--sp-6)" }}>
            Update your profile details. Changing your name will update ownership on all documents.
          </p>

          {[
            { label: "Full Name",      key: "name",  type: "text"  },
            { label: "Email Address",  key: "email", type: "email" },
            { label: "Plan",           key: "plan",  type: "text"  },
          ].map(({ label, key, type }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                type={type}
                value={profile[key]}
                onChange={(e) => onProfileChange(key, e.target.value)}
              />
            </div>
          ))}

          <button
            className="btn btn--primary"
            style={{ marginTop: "var(--sp-2)" }}
            onClick={onSave}
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
