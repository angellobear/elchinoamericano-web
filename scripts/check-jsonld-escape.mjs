import assert from 'node:assert/strict'

// Espejo de jsonLdScript en lib/seo.ts — si cambias uno, cambia el otro.
const jsonLdScript = (data) =>
  JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')

const out = jsonLdScript({ name: 'Filtro</script><script>alert(1)</script>' })
assert.ok(!out.includes('</script>'), 'el escape debe neutralizar </script>')
assert.ok(!out.includes('<'), 'no debe quedar ningun < sin escapar')
assert.deepEqual(JSON.parse(out).name, 'Filtro</script><script>alert(1)</script>', 'el JSON debe seguir parseando al valor original')
console.log('OK jsonLdScript escapa correctamente')
