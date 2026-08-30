/**
 * ACCESS PAUSED SCREEN
 * ─────────────────────────────────────────────────────────────────────────────
 * This page is shown when CRM_ACCESS_PAUSED=true in .env.local
 *
 * TO RESTORE NORMAL CRM ACCESS:
 *   1. Open .env.local in the project root
 *   2. Change  CRM_ACCESS_PAUSED=true  →  CRM_ACCESS_PAUSED=false
 *   3. Restart the dev/production server
 *
 * This file does NOT touch any Supabase data, auth, or business logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

export default function PausedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #faf8f5 0%, #f3ede4 100%)",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 24px 56px rgba(42, 34, 27, 0.10), 0 2px 8px rgba(42,34,27,0.06)",
          border: "1px solid #ede8e1",
          padding: "3rem 2.5rem 2.5rem",
          textAlign: "center",
        }}
      >
        {/* Brand */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#1d1a18",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                fontFamily: "'Iowan Old Style', Baskerville, Georgia, serif",
                fontSize: "18px",
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              R
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#1d1a18", letterSpacing: "-0.02em" }}>
                RFM <span style={{ fontWeight: "400", opacity: 0.55 }}>Weddings</span>
              </div>
              <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#b99462", marginTop: "1px" }}>
                CRM Platform
              </div>
            </div>
          </div>
        </div>

        {/* Lock icon */}
        <div style={{ marginBottom: "1.5rem" }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto", display: "block" }}>
            <circle cx="28" cy="28" r="28" fill="#faf3e8" />
            <rect x="18" y="28" width="20" height="13" rx="3.5" stroke="#b99462" strokeWidth="2" fill="none" />
            <path d="M21.5 28v-5.5a6.5 6.5 0 0 1 13 0V28" stroke="#b99462" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="34.5" r="1.5" fill="#b99462" />
          </svg>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Iowan Old Style', Baskerville, Georgia, serif",
            fontSize: "1.625rem",
            fontWeight: "700",
            color: "#1d1a18",
            lineHeight: 1.25,
            margin: "0 0 0.875rem",
          }}
        >
          Service Temporarily Paused
        </h1>

        {/* Divider */}
        <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg, #b99462, #e0c898)", borderRadius: "2px", margin: "0 auto 1.25rem" }} />

        {/* Body */}
        <p style={{ fontSize: "0.9375rem", color: "#6b5e52", lineHeight: 1.7, margin: "0 0 0.625rem" }}>
          This CRM is temporarily unavailable due to a{" "}
          <strong style={{ color: "#1d1a18", fontWeight: 600 }}>pending account / payment matter</strong>.
        </p>
        <p style={{ fontSize: "0.875rem", color: "#9b8e84", lineHeight: 1.65, margin: "0 0 2rem" }}>
          Please contact the administrator to restore access.
          <br />Your data is completely safe and unchanged.
        </p>

        {/* CTA */}
        <a
          href="mailto:admin@rfm.in"
          style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            background: "#1d1a18",
            color: "#ffffff",
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: "600",
            letterSpacing: "0.01em",
            textDecoration: "none",
          }}
        >
          Contact Administrator
        </a>

        {/* Footer */}
        <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#b8aca4", letterSpacing: "0.02em" }}>
          RFM Weddings CRM · Access Paused
        </p>
      </div>
    </div>
  );
}
