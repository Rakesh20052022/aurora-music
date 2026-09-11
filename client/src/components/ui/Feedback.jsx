import { Icon } from "../Icon.jsx"

export function Loader({ label = "Loading" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "64px 0",
        color: "var(--text-muted)",
      }}
    >
      <span
        className="spin"
        style={{
          width: 28,
          height: 28,
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
        }}
      />
      <span>{label}…</span>
    </div>
  )
}

export function EmptyState({ icon = "music", title, message, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "72px 24px",
        textAlign: "center",
        color: "var(--text-muted)",
      }}
    >
      <span
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "var(--surface-2)",
          display: "grid",
          placeItems: "center",
          color: "var(--accent)",
        }}
      >
        <Icon name={icon} size={28} />
      </span>
      <h3 style={{ color: "var(--text)" }}>{title}</h3>
      {message && <p style={{ maxWidth: 380 }}>{message}</p>}
      {action}
    </div>
  )
}

export function ErrorText({ children }) {
  if (!children) return null
  return (
    <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: 4 }} role="alert">
      {children}
    </p>
  )
}
