import { useEffect } from "react"
import { Icon } from "../Icon.jsx"
import "./ui.css"

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal fade-in ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--text-muted)" }}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
