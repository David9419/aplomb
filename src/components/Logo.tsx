// Logo Aplomb : un « A » dont la barre est remplacée par un fil à plomb.
// Le fil à plomb est l'outil qui vérifie qu'un mur est droit : la vérité du bâtiment.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M7 44 L24 5 L41 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <line x1="24" y1="5" x2="24" y2="27" stroke="currentColor" strokeWidth="1.3" />
      <path d="M24 27 L29 33 L24 42 L19 33 Z" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <LogoMark className="brand-mark" />
      <span>
        <b>Aplomb</b>
        {!compact && <small>Conseil &amp; expertise bâtiment</small>}
      </span>
    </span>
  );
}
