// Verifica que todo href interno de /guias/** en data/guias.ts apunte a una guía existente.
// Correr: node scripts/check-guias-links.mjs
import assert from "node:assert"
import { readFileSync } from "node:fs"

const src = readFileSync(new URL("../data/guias.ts", import.meta.url), "utf8")

const existentes = new Set(
  [...src.matchAll(/slug: "([^"]+)",\n\s*categoria: "([^"]+)"/g)].map(
    ([, slug, cat]) => `/guias/${cat}/${slug}`,
  ),
)
const referidos = [...src.matchAll(/href: "(\/guias\/[^"]+)"/g)].map((m) => m[1])
const rotos = [...new Set(referidos)].filter((h) => !existentes.has(h))

assert.deepStrictEqual(rotos, [], `Enlaces de guías rotos:\n${rotos.join("\n")}`)

// La respuesta_corta es el bloque que citan los LLMs: debe ser autocontenido y de 100-150 palabras.
const largas = [...src.matchAll(/slug: "([^"]+)",[\s\S]{0,400}?respuesta_corta:\n\s*"(.*?)",\n/g)]
  .map(([, slug, txt]) => [slug, txt.split(/\s+/).length])
  .filter(([, n]) => n < 100 || n > 155)

assert.deepStrictEqual(
  largas,
  [],
  `respuesta_corta fuera del estandar de 100-150 palabras:\n${largas.map(([s, n]) => `${s}: ${n}`).join("\n")}`,
)

console.log(`OK — ${existentes.size} guías, ${referidos.length} enlaces internos, 0 rotos, respuestas cortas en rango`)
