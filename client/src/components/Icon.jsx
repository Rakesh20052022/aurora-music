// Lightweight inline SVG icon set (stroke-based, currentColor).
const paths = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  library: <path d="M4 4h4v16H4zM12 4h4v16h-4zM19 5l2 14" />,
  play: <path d="M6 4l14 8-14 8z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" />
    </>
  ),
  next: (
    <>
      <path d="M5 4l10 8-10 8z" fill="currentColor" stroke="none" />
      <rect x="17" y="4" width="2.5" height="16" fill="currentColor" stroke="none" />
    </>
  ),
  prev: (
    <>
      <path d="M19 4L9 12l10 8z" fill="currentColor" stroke="none" />
      <rect x="4.5" y="4" width="2.5" height="16" fill="currentColor" stroke="none" />
    </>
  ),
  shuffle: <path d="M3 7h4l10 10h4M3 17h4L17 7h4M18 4l3 3-3 3M18 14l3 3-3 3" />,
  "smart-shuffle": (
    <>
      <path d="M3 7h4l10 10h4M3 17h4L17 7h4M18 4l3 3-3 3M18 14l3 3-3 3" />
      <path d="M10 2l1.5 3 3 1.5-3 1.5L10 11l-1.5-3-3-1.5 3-1.5z" fill="currentColor" stroke="none" />
    </>
  ),
  repeat: <path d="M4 12V9a3 3 0 0 1 3-3h13M20 8l-3-3M20 12v3a3 3 0 0 1-3 3H4M4 16l3 3" />,
  heart: <path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.5 0 5 3.5 3.5 6.5C19 15.65 12 20 12 20z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  volume: <path d="M4 9v6h4l5 4V5L8 9H4zM17 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13" />,
  mute: <path d="M4 9v6h4l5 4V5L8 9H4zM17 9l4 6M21 9l-4 6" />,
  trash: <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />,
  edit: <path d="M4 20h4L20 8l-4-4L4 16zM14 6l4 4" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  logout: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h9" />,
  upload: <path d="M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />,
  music: (
    <>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  disc: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
}

export function Icon({ name, size = 20, className = "", filled = false, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      style={filled ? { fill: "currentColor", stroke: "none" } : undefined}
      {...rest}
    >
      {paths[name] || null}
    </svg>
  )
}
