"use client"

import { useSyncExternalStore, type CSSProperties } from "react"

/**
 * Misma configuración y unidades que react-snowfall, pero en CSS puro:
 * speed y wind en px por frame (60 fps), radius en px. Cada copo toma un
 * valor al azar dentro de cada rango [min, max].
 */
const SNOW_CONFIG = {
  count: 200,
  speed: [0.5, 3],
  wind: [-0.5, 2],
  radius: [0.5, 3],
  color: "#dee4fd",
} as const

const FPS = 60

type Flake = { key: number; style: CSSProperties }

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)

function createFlakes(width: number, height: number): Flake[] {
  return Array.from({ length: SNOW_CONFIG.count }, (_, key) => {
    const radius = between(SNOW_CONFIG.radius)
    const travel = height * 1.2 // de -10vh a 110vh
    const duration = travel / (between(SNOW_CONFIG.speed) * FPS)
    const drift = between(SNOW_CONFIG.wind) * FPS * duration
    // ponytail: arranca desplazado contra el viento para que no quede un lado vacío.
    const left = Math.random() * (width + Math.abs(drift)) - Math.max(drift, 0)
    return {
      key,
      style: {
        left,
        width: radius * 2,
        height: radius * 2,
        background: SNOW_CONFIG.color,
        animationDuration: `${duration}s`,
        animationDelay: `${-Math.random() * duration}s`,
        ["--drift" as string]: `${drift}px`,
      },
    }
  })
}

// ponytail: copos solo en el cliente, tras hidratar. No engordan el HTML
// (200 spans) ni compiten con el LCP, y Math.random no rompe la hidratación.
// Se generan una vez por carga y se reutilizan al navegar entre páginas.
const NO_FLAKES: Flake[] = []
let clientFlakes: Flake[] | null = null

function getClientFlakes() {
  if (!document.documentElement.classList.contains("navidad")) return NO_FLAKES
  clientFlakes ??= createFlakes(window.innerWidth, window.innerHeight)
  return clientFlakes
}

const subscribe = () => () => {}

/** Nieve de las páginas con Navbar. Visible solo con html.navidad (ver app/layout.tsx). */
export function ChristmasSnow() {
  const flakes = useSyncExternalStore(subscribe, getClientFlakes, () => NO_FLAKES)

  if (flakes.length === 0) return null

  return (
    <div className="xmas snow-layer" aria-hidden="true">
      {flakes.map(({ key, style }) => (
        <span key={key} className="snowflake" style={style} />
      ))}
    </div>
  )
}
