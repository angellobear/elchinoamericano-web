// MODO NAVIDEÑO — componente temporal, ver docs/modo-navideno.md

/**
 * Franja de bastón de caramelo (rayas rojas y blancas) en el borde superior
 * de un contenedor posicionado: cards del catálogo y foto del detalle.
 * Visible solo con html.navidad.
 */
export function CandyStripe() {
  return <div className="xmas candy-stripe absolute inset-x-0 top-0 z-20 h-1.5 pointer-events-none" aria-hidden="true" />
}
