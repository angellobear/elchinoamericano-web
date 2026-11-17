# Modo navideño

Decoración de temporada para el sitio público. **Se activa sola del 15 de noviembre al 31 de diciembre**
y se apaga sola el 1 de enero; no hace falta tocar código cada año.

Todo está marcado con el comentario `MODO NAVIDEÑO`. Para encontrarlo:

```bash
grep -rn "MODO NAVIDEÑO" app components
```

## Qué incluye

| Decoración | Dónde se ve |
|---|---|
| Nieve (200 copos, CSS) | Home, catálogo, fichas, contacto |
| Luces de colores intercaladas bajo el navbar | Mismas páginas |
| Gorro de Santa sobre la "A" del logo | Header, menú móvil y footer |

**No** aparece en guías, admin, login ni `/pedido/[token]` (no usan el Navbar).
Tampoco con `prefers-reduced-motion`: ahí la nieve se oculta y las luces no parpadean.

## Cómo funciona

1. `app/layout.tsx` tiene un `<script>` inline en `<head>` que agrega la clase
   `navidad` a `<html>` si la fecha del navegador está entre el 15 de noviembre y el 31 de
   diciembre, o si la URL tiene
   `?navidad`. Se usa la fecha del cliente porque home y fichas son ISR/SSG:
   una fecha evaluada en el servidor quedaría congelada en el HTML cacheado.
2. Todo elemento decorativo lleva la clase `xmas`. En `app/globals.css`,
   `html:not(.navidad) .xmas { display: none }` los oculta fuera de temporada.
3. La nieve solo se genera en el cliente si `html.navidad` está activo, así que
   fuera de temporada no se crea ningún copo.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `components/ChristmasSnow.tsx` | Nieve. **Archivo completo navideño.** Configuración en `SNOW_CONFIG` (mismas unidades que react-snowfall) |
| `components/SantaHat.tsx` | Gorro SVG. **Archivo completo navideño** |
| `components/Navbar.tsx` | 2 imports, 2 `<SantaHat />`, `<ChristmasSnow />` y el `<div>` de luces |
| `components/Footer.tsx` | 1 import y 1 `<SantaHat />` |
| `app/layout.tsx` | `<script>` de activación en `<head>` |
| `app/globals.css` | Bloque "MODO NAVIDEÑO" (nieve, luces, `.xmas`) |

## Ajustes rápidos

- **Probar fuera de temporada:** abrir cualquier página con `?navidad`
  (ej. `/?navidad`). Se mantiene al navegar sin recargar.
- **Cambiar fechas:** en el script de `app/layout.tsx`, la fecha se compara
  como número `MMDD` (mes×100 + día). `>=1115` = desde el 15 de noviembre hasta
  el 31 de diciembre. Ej.: `>=1201` = solo diciembre.
- **Más o menos nieve, velocidad, viento, tamaño o color:** `SNOW_CONFIG` en
  `components/ChristmasSnow.tsx`. Si va lento en celulares, bajar `count`.
- **Apagarlo este año sin borrar nada:** cambiar la condición del script a `false`.

## Cómo quitarlo por completo

1. Borrar `components/ChristmasSnow.tsx` y `components/SantaHat.tsx`.
2. En `components/Navbar.tsx` y `components/Footer.tsx`, borrar cada línea
   `MODO NAVIDEÑO` junto con la línea de abajo (o el import de esa línea).
3. En `app/layout.tsx`, borrar el comentario `MODO NAVIDEÑO` y el `<script>` que le sigue.
4. En `app/globals.css`, borrar el bloque desde `MODO NAVIDEÑO` hasta antes de
   `/* Documentos imprimibles (pedidos)`.
5. Verificar que no quede nada: `grep -rn "MODO NAVIDEÑO\|xmas\|navidad" app components`.

Alternativa: revertir el merge con `git revert -m 1 e1c26b5` (y el commit de
esta documentación).
