// ponytail: replica lo que audita Lighthouse en /llms.txt — Markdown con un H1
// y al menos un enlace Markdown real. Las URLs crudas NO cuentan como enlace.
//   node scripts/check-llms-txt.mjs [origen]   (default http://localhost:3000)
const origin = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")

const res = await fetch(`${origin}/llms.txt`)
if (!res.ok) {
  console.error(`FAIL /llms.txt respondio ${res.status}`)
  process.exit(1)
}
const md = await res.text()

const h1 = md.match(/^#[^#].*/m)
const links = md.match(/^\s*-\s*\[[^\]]+\]\([^)]+\)/gm) ?? []
const bareUrlBullets = md.match(/^\s*-\s*[^[\n]*:\s*https?:\/\/\S+$/gm) ?? []

let ok = true
if (!h1) { console.error("FAIL falta el encabezado H1"); ok = false }
if (!links.length) { console.error("FAIL no hay ni un enlace Markdown [texto](url)"); ok = false }
if (bareUrlBullets.length) {
  console.error(`FAIL ${bareUrlBullets.length} bullets con URL cruda en vez de enlace Markdown, ej:`)
  console.error("  " + bareUrlBullets[0].trim())
  ok = false
}
if (!ok) process.exit(1)
console.log(`OK /llms.txt — H1 "${h1[0].slice(2)}", ${links.length} enlaces Markdown, 0 URLs crudas`)
