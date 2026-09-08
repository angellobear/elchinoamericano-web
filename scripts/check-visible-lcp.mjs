// ponytail: la regresion que arregla este commit es una sola cosa — el HTML del
// SSR llegaba con 36 nodos en opacity:0 y el LCP esperaba a que hidratara JS.
// Este check falla si vuelve a pasar. Uso:
//   node scripts/check-visible-lcp.mjs [url]        (default http://localhost:3000/)
const url = process.argv[2] ?? "http://localhost:3000/"

const res = await fetch(url)
if (!res.ok) {
  console.error(`FAIL ${url} respondio ${res.status}`)
  process.exit(1)
}
const html = await res.text()

const hidden = html.match(/style="[^"]*opacity:\s*0[^."\d]/g) ?? []
const hasH1 = /<h1[^>]*id="home-hero-title"/.test(html)

if (!hasH1) {
  console.error("FAIL no se encontro el <h1> del hero en el HTML del servidor")
  process.exit(1)
}
if (hidden.length) {
  console.error(`FAIL ${hidden.length} nodos llegan invisibles desde el servidor:`)
  console.error([...new Set(hidden)].slice(0, 5).join("\n"))
  process.exit(1)
}
// Segunda invariante, aprendida a golpes: Chrome registra el PRIMER paint de
// cada elemento como candidato a LCP y descarta los que pintan con opacity:0,
// sin reconsiderarlos. Un fade-in por CSS sobre el h1 deja la pagina sin LCP
// (Lighthouse: NO_LCP). Las animaciones above-the-fold animan solo transform.
const cssHref = html.match(/href="([^"]+\.css[^"]*)"/)?.[1]
if (!cssHref) {
  console.error("FAIL no se encontro la hoja de estilos para auditar los keyframes")
  process.exit(1)
}
const css = await (await fetch(new URL(cssHref, url))).text()
const aboveFold = ["slide-up", "slide-right", "slide-down", "pop-in"]
const conFade = aboveFold.filter((name) => {
  const block = css.match(new RegExp(`@keyframes\\s+${name}\\s*\\{[^@]*?\\}\\s*\\}`))?.[0]
  return block ? /opacity/.test(block) : false
})
if (conFade.length) {
  console.error(`FAIL keyframes above-the-fold con opacity: ${conFade.join(", ")}`)
  console.error("  Chrome descarta como candidato a LCP el elemento que pinta con opacity:0.")
  process.exit(1)
}
console.log(`OK ${url} — h1 visible, 0 nodos en opacity:0, ${aboveFold.length} keyframes above-the-fold sin fade`)
