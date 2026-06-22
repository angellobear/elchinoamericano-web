# El Chino Americano — Web Frontend

Tienda online de repuestos automotrices para vehículos chinos y americanos. Catálogo con filtros cruzados y pedido por WhatsApp.

---

## Estructura del proyecto

```
el-chino-americano/
├── CLAUDE.md       ← instrucciones para Claude Code (no borrar)
├── README.md       ← este archivo
└── index.html      ← toda la web (generado por Claude Code)
```

Un solo archivo `index.html` autocontenido. Sin dependencias locales, sin npm, sin build step.

---

## Cómo usar con Claude Code

### Primera vez

```bash
# 1. Clona o crea la carpeta del proyecto
mkdir el-chino-americano
cd el-chino-americano

# 2. Pon CLAUDE.md y README.md en la carpeta
# 3. Abre Claude Code en esa carpeta
claude

# 4. Dale esta instrucción
> Build the project described in CLAUDE.md
```

Claude Code leerá el `CLAUDE.md` automáticamente y construirá el `index.html`.

### Iterar y mejorar

```bash
# Para pedir cambios después de la primera versión:
> Adjust the hero title size to 72px on desktop
> Add a loading skeleton to the product cards
> Make the cart drawer close when clicking the overlay
```

---

## Cómo usar las Skills de diseño (en Claude.ai chat)

Las Skills se usan en el **chat de Claude.ai**, no en Claude Code. Son herramientas para generar assets y refinar el diseño antes o después de que Claude Code construya el HTML.

### Flujo recomendado

```
Claude.ai chat (Skills)          Claude Code (código)
─────────────────────            ────────────────────
1. theme-factory                 4. Construye index.html
   → define tokens de color          con el CLAUDE.md
   → elige tipografía
   → exporta sistema de diseño

2. canvas-design                 5. Pídele ajustes al HTML
   → genera banners/posters          basado en los assets
   → crea imágenes de producto       que generaste
   → diseña el hero visual

3. frontend-design               6. Itera
   → revisa que no quede genérico
   → valida jerarquía visual
   → afina microinteracciones
```

### Qué hace cada Skill y cuándo usarla

#### `theme-factory`
**Cuándo:** Antes de que Claude Code construya el HTML, para afinar los tokens de diseño.
**Cómo:** En el chat de Claude.ai, escribe:
```
Aplica la skill theme-factory para crear un tema personalizado 
para El Chino Americano con estos colores: navy #0d1f3c, 
rojo #e03030, blanco #ffffff. Fuentes: Barlow Condensed + Inter.
```
El resultado es un sistema de colores/tipografía documentado que puedes pegar en el CLAUDE.md.

#### `canvas-design`
**Cuándo:** Para generar imágenes de productos placeholder, el hero visual, banners para redes.
**Cómo:**
```
Usa canvas-design para crear un banner hero para una tienda 
de repuestos automotrices llamada El Chino Americano. 
Paleta: navy #0d1f3c y rojo #e03030. Estilo industrial, premium.
```
Descarga el PNG y úsalo como imagen en el HTML.

#### `web-artifacts-builder`
**Cuándo:** Si quieres probar componentes individuales (el carrito, una card de producto) 
antes de integrarlo todo en el HTML final.
**Cómo:**
```
Usa web-artifacts-builder para crear un componente React 
de product card para El Chino Americano con Tailwind CSS.
```
Te da un componente interactivo en el chat que puedes revisar visualmente.

#### `frontend-design`
**Cuándo:** Para validar que el diseño no quedó genérico antes de darlo por terminado.
**Cómo:**
```
Usa frontend-design para revisar el diseño de El Chino Americano 
y sugerir un elemento de firma visual que lo haga único y memorable.
```

---

## Cómo publicar (hosting gratuito)

### Opción A — Netlify (más fácil, recomendado)

1. Ve a [netlify.com](https://netlify.com) y crea una cuenta gratis
2. Arrastra la carpeta `el-chino-americano/` al dashboard de Netlify
3. En segundos tienes una URL tipo `https://elchinoamericano.netlify.app`
4. Para un dominio propio (ej. `elchinoamericano.com`): en Netlify → Site settings → Domain management

### Opción B — GitHub Pages (gratis con GitHub)

```bash
# 1. Crea un repositorio en github.com
# 2. Sube los archivos
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/el-chino-americano.git
git push -u origin main

# 3. En GitHub: Settings → Pages → Source: main branch → /root
# URL resultante: https://TU_USUARIO.github.io/el-chino-americano/
```

### Opción C — Vercel

```bash
npm i -g vercel
vercel
# Sigue las instrucciones interactivas
```

---

## Agregar productos reales

Los productos están en el array `products` dentro del `index.html`. Para agregar o editar:

1. Abre `index.html` en cualquier editor de texto (VS Code recomendado)
2. Busca `const products = [`
3. Agrega objetos con esta estructura:

```js
{
  id: 13,                              // número único
  name: "Nombre del repuesto",
  brand_product: "Marca del repuesto", // ej: "Bosch", "NGK"
  compatible: "Vehículo · Año",        // ej: "Ford Ranger 2.5 · 2018-22"
  category: "motor",                   // motor | frenos | suspension | filtros | carroceria | enfriamiento
  car_brand: "ford",                   // ford | chevrolet | chery | great_wall | dfsk | jetour | shineray | byd | mg | jac
  type: "original",                    // original | alterno
  price: 35.00,
  icon: "ti-bolt"                      // cualquier ícono de tabler-icons.io
}
```

---

## Contacto del negocio

- **WhatsApp:** 098 487 8153
- **Cobertura delivery:** Quito (Norte, Sur, Valles) y Santo Domingo
- **Envíos:** A nivel nacional