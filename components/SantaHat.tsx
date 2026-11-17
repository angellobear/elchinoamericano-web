// MODO NAVIDEÑO — componente temporal, ver docs/modo-navideno.md
/**
 * Gorro de Santa sobre la punta de la "A" de logo-ca.png. Va dentro del
 * contenedor `relative` del logo; las medidas en % escalan con cualquier
 * tamaño de logo. Visible solo con html.navidad (ver app/layout.tsx).
 */
export function SantaHat() {
  return (
    <svg
      className="xmas absolute rotate-12 drop-shadow-sm"
      style={{ top: "-20%", left: "41.5%", width: "41.5%", height: "40%" }}
      viewBox="0 0 40 36"
      aria-hidden="true"
    >
      <path d="M6 28 C10 16 18 6 32 5 C28 12 30 20 34 28 Z" fill="#e03030" />
      <rect x="3" y="25" width="34" height="8" rx="4" fill="#fff" />
      <circle cx="33" cy="6" r="4.5" fill="#fff" />
    </svg>
  )
}
