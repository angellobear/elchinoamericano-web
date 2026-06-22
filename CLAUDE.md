# El Chino Americano — Frontend Guide

## Proyecto

Tienda de repuestos automotrices ecuatoriana. Single-page con catálogo, filtros cruzados y pedido por WhatsApp. **Solo frontend, sin backend ni pagos en línea.** Los datos son mockeados en un archivo local.

---

## Stack

- **Next.js 16** con App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** para componentes base (Sheet, Badge, Button, Input)
- **Framer Motion** para animaciones
- **Lucide React** para íconos
- Datos mockeados en `src/data/products.ts`

---

## Tokens de marca (no negociables)

```ts
// tailwind.config.ts
colors: {
  navy:  { DEFAULT: '#0d1f3c', dark: '#0a1628' },
  brand: { DEFAULT: '#e03030' },
  wa:    { DEFAULT: '#25d366' },
}

fontFamily: {
  display: ['Barlow Condensed', 'sans-serif'],
  body:    ['Inter', 'sans-serif'],
}
```

Importar en `app/layout.tsx` desde Google Fonts:
```ts
import { Barlow_Condensed, Inter } from 'next/font/google'
```

**Regla:** Solo navy, rojo y blanco. Sin gradientes de colores, sin púrpuras, sin fondos crema.

---

## Estructura de archivos

```
src/
├── app/
│   ├── layout.tsx          # fuentes + metadata + CartProvider
│   └── page.tsx            # importa todas las secciones en orden
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── FilterBar.tsx
│   ├── ProductGrid.tsx
│   ├── ProductCard.tsx
│   ├── WhyUs.tsx
│   ├── Brands.tsx
│   ├── CartDrawer.tsx
│   └── Footer.tsx
├── context/
│   └── CartContext.tsx      # estado global del carrito con useReducer
├── data/
│   └── products.ts          # array de productos mockeados
└── types/
    └── index.ts             # Product, CartItem
```

---

## Tipos

```ts
// src/types/index.ts
export type Category = 'motor' | 'frenos' | 'suspension' | 'filtros' | 'carroceria' | 'enfriamiento'
export type CarBrand = 'ford' | 'chevrolet' | 'chery' | 'great_wall' | 'dfsk' | 'jetour' | 'shineray' | 'byd' | 'mg' | 'jac'

export interface Product {
  id: number
  name: string
  brandProduct: string
  compatible: string
  category: Category
  carBrand: CarBrand
  type: 'original' | 'alterno'
  price: number
  icon: string  // nombre de ícono Lucide
}

export interface CartItem extends Product {
  qty: number
}
```

---

## Datos mockeados

```ts
// src/data/products.ts
import { Product } from '@/types'

export const products: Product[] = [
  { id:1,  name:'Bomba de agua',              brandProduct:'MGT Magiaty', compatible:'Great Wall Wingle 5 2.2 · 2016-19', category:'enfriamiento', carBrand:'great_wall', type:'original', price:48.00,  icon:'Droplets' },
  { id:2,  name:'Kit de frenos trasero',       brandProduct:'Brembo',      compatible:'Ford F-150 · 2018-2022',           category:'frenos',       carBrand:'ford',       type:'alterno',  price:35.00,  icon:'CircleDot' },
  { id:3,  name:'Filtro de aceite',            brandProduct:'Sakura',      compatible:'Chery Tiggo 5 2.0 · 2019-23',      category:'filtros',      carBrand:'chery',      type:'original', price:12.50,  icon:'Filter' },
  { id:4,  name:'Terminal de dirección',       brandProduct:'Moog',        compatible:'Chevrolet Silverado · 2019-22',    category:'suspension',   carBrand:'chevrolet',  type:'alterno',  price:22.00,  icon:'Spline' },
  { id:5,  name:'Bujía de encendido',          brandProduct:'NGK',         compatible:'DFSK Glory 580 1.5T · 2020-23',   category:'motor',        carBrand:'dfsk',       type:'original', price:8.00,   icon:'Zap' },
  { id:6,  name:'Amortiguador delantero',      brandProduct:'Monroe',      compatible:'BYD Song Plus · 2021-24',          category:'suspension',   carBrand:'byd',        type:'alterno',  price:65.00,  icon:'ArrowUpDown' },
  { id:7,  name:'Radiador de agua',            brandProduct:'Denso',       compatible:'Ford Ranger 2.5 · 2016-20',        category:'enfriamiento', carBrand:'ford',       type:'original', price:120.00, icon:'Thermometer' },
  { id:8,  name:'Pastillas de freno delant.',  brandProduct:'Ferodo',      compatible:'Chery Arrizo 5 · 2018-23',         category:'frenos',       carBrand:'chery',      type:'alterno',  price:28.00,  icon:'Disc' },
  { id:9,  name:'Correa de distribución',      brandProduct:'Gates',       compatible:'MG ZS 1.5 · 2020-24',             category:'motor',        carBrand:'mg',         type:'original', price:45.00,  icon:'Settings2' },
  { id:10, name:'Espejo retrovisor derecho',   brandProduct:'TYC',         compatible:'Chevrolet Blazer · 2019-23',       category:'carroceria',   carBrand:'chevrolet',  type:'alterno',  price:55.00,  icon:'Eye' },
  { id:11, name:'Filtro de aire',              brandProduct:'Mann',        compatible:'JAC T8 2.0T · 2020-24',           category:'filtros',      carBrand:'jac',        type:'original', price:18.00,  icon:'Wind' },
  { id:12, name:'Sensor de oxígeno',           brandProduct:'Bosch',       compatible:'Ford Explorer 2.3 · 2017-21',      category:'motor',        carBrand:'ford',       type:'original', price:72.00,  icon:'Activity' },
]
```

---

## CartContext

```ts
// src/context/CartContext.tsx
'use client'
import { createContext, useContext, useReducer, ReactNode } from 'react'
import { CartItem, Product } from '@/types'

type Action =
  | { type: 'ADD'; product: Product }
  | { type: 'REMOVE'; id: number }
  | { type: 'INCREMENT'; id: number }
  | { type: 'DECREMENT'; id: number }
  | { type: 'CLEAR' }

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find(i => i.id === action.product.id)
      if (exists) return state.map(i => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...state, { ...action.product, qty: 1 }]
    }
    case 'REMOVE':      return state.filter(i => i.id !== action.id)
    case 'INCREMENT':   return state.map(i => i.id === action.id ? { ...i, qty: i.qty + 1 } : i)
    case 'DECREMENT':   return state.map(i => i.id === action.id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i)
    case 'CLEAR':       return []
    default:            return state
  }
}

const CartContext = createContext<{
  cart: CartItem[]
  dispatch: React.Dispatch<Action>
  total: number
  itemCount: number
  buildWhatsAppUrl: () => string
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(reducer, [])
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const itemCount = cart.reduce((s, i) => s + i.qty, 0)

  function buildWhatsAppUrl() {
    const lines = cart.map(i =>
      `• ${i.name} (${i.compatible}) x${i.qty} → $${(i.price * i.qty).toFixed(2)}`
    ).join('\n')
    const msg = `Hola! Quiero hacer el siguiente pedido:\n\n${lines}\n\nTotal estimado: $${total.toFixed(2)}\n\n¿Pueden confirmarme disponibilidad y costo de envío?`
    return `https://wa.me/593984878153?text=${encodeURIComponent(msg)}`
  }

  return (
    <CartContext.Provider value={{ cart, dispatch, total, itemCount, buildWhatsAppUrl }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
```

---

## Componentes — comportamiento esperado

### `Navbar.tsx`
- Fondo `navy` fijo en top
- Logo: badge cuadrado "CA" + texto "El Chino / **Americano**" (Americano en rojo)
- Links de navegación en blanco, hover rojo, transición 150ms
- Botón WhatsApp verde con ícono `MessageCircle`
- Ícono carrito con badge contador rojo animado (scale bounce al agregar)
- Mobile: menú hamburger con Sheet de shadcn/ui
- Al hacer scroll > 20px: añadir sombra sutil con `transition`

### `Hero.tsx`
- Fondo navy con patrón SVG inline (rejilla diagonal, opacidad 0.04, color blanco)
- Grid 2 columnas desktop, 1 columna mobile
- **Columna izquierda:**
  - Badge pill rojo: "Repuestos originales y alternos"
  - H1 Barlow Condensed 64px desktop / 40px mobile: "Tu vehículo merece lo mejor." + `<span className="text-brand">` "Nosotros lo tenemos."
  - Párrafo categorías separadas por ·
  - Dos botones: primario rojo "Ver catálogo" (scroll a #catalogo), secundario outline blanco "Buscar por marca"
- **Columna derecha:** grid 3×2 chips de marcas (nombre + etiqueta Chino/Americano), borde blanco/20, hover borde rojo
- **Framer Motion:** `staggerChildren` 0.1s en entrada de página, cada elemento `fadeIn + y: 20 → 0`

### `FilterBar.tsx`
- `sticky top-[64px] z-40` con fondo blanco y borde inferior
- Input de búsqueda con ícono `Search` de Lucide
- Fila 1 — chips de categoría: Todos · Motor · Frenos · Suspensión · Filtros · Carrocería · Enfriamiento
- Fila 2 — chips de marca de vehículo: Ford · Chevrolet · Chery · Great Wall · DFSK · Jetour · Shineray · BYD · MG · JAC
- Chip activo: fondo navy texto blanco. Hover: fondo navy/10
- Contador debajo: "XX productos encontrados" en texto secundario
- Props: `onFilterChange(filters)` hacia el padre (page.tsx)

### `ProductGrid.tsx`
- Recibe `products: Product[]` ya filtrados
- Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Si no hay productos: estado vacío con ícono y texto "No encontramos repuestos con esos filtros"
- **Framer Motion:** `AnimatePresence` + `layout` para animar entrada/salida de cards al filtrar

### `ProductCard.tsx`
- Border sutil, hover: `border-brand shadow-md -translate-y-1`, transición 200ms
- Área imagen 160px: fondo gris claro, ícono Lucide centrado 48px según `product.icon`
- Badge top-left: "Original" (navy) o "Alterno" (rojo)
- Nombre 14px font-medium
- Compatibilidad 12px text-muted-foreground
- Precio Barlow Condensed 20px navy
- Botón "Agregar al pedido": fondo navy, hover fondo brand, transición. Al click: `dispatch({ type: 'ADD', product })`

### `CartDrawer.tsx`
- Usar `Sheet` de shadcn/ui (`side="right"`, `className="w-[380px] sm:w-[380px]"`)
- Header navy: "Mi pedido (N productos)"
- Lista de ítems: nombre + compatible + controles qty (+ / -) + precio + botón eliminar
- Footer sticky:
  - Total: `$XX.XX` Barlow Condensed 24px
  - Nota muted: "El precio final y envío son confirmados por el vendedor"
  - Botón verde WhatsApp: `onClick={() => window.open(buildWhatsAppUrl(), '_blank')}`

### `WhyUs.tsx`
- Fondo `bg-gray-50`
- 3 columnas con ícono Lucide grande navy + título + descripción
  - `Truck` → Envíos a todo Ecuador
  - `ShieldCheck` → Originales y alternos garantizados
  - `Headphones` → Asesoría por WhatsApp
- Framer Motion ScrollTrigger: `whileInView` fadeUp, `once: true`

### `Brands.tsx`
- Fondo navy
- Título blanco Barlow Condensed
- Dos bloques: "Marcas Chinas" y "Americanas"
- Chips: borde `white/20`, hover borde brand y texto brand, transición 150ms

### `Footer.tsx`
- Fondo `navy-dark` (`#0a1628`)
- Logo + slogan
- 3 columnas: Categorías · Marcas · Contacto
- Número WA como `<a href="tel:+593984878153">`
- Bottom bar: copyright + "Envíos seguros a nivel nacional 🇪🇨"

---

## Animaciones

| Elemento | Librería | Detalle |
|---|---|---|
| Hero entrada | Framer Motion | `staggerChildren: 0.1`, `y: 20 → 0`, `opacity: 0 → 1` |
| Filtrado cards | Framer Motion `AnimatePresence` + `layout` | fade + scale en entrada/salida |
| Badge carrito | CSS keyframe `@keyframes bounce-badge` | scale 1 → 1.4 → 1, 300ms |
| Scroll reveal secciones | Framer Motion `whileInView` | `y: 30 → 0`, `once: true` |
| Card hover | Tailwind `transition` | `-translate-y-1 border-brand`, 200ms |
| Cart drawer | shadcn Sheet | built-in slide desde derecha |

```css
/* globals.css — reducir movimiento */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Lógica de filtros (en `page.tsx`)

```ts
const [search, setSearch] = useState('')
const [category, setCategory] = useState<string>('all')
const [carBrand, setCarBrand] = useState<string>('all')

const filtered = products.filter(p => {
  const matchSearch = search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.compatible.toLowerCase().includes(search.toLowerCase()) ||
    p.brandProduct.toLowerCase().includes(search.toLowerCase())
  const matchCategory = category === 'all' || p.category === category
  const matchBrand = carBrand === 'all' || p.carBrand === carBrand
  return matchSearch && matchCategory && matchBrand
})
```

---

## Checklist antes de dar por terminado

- [ ] `npm run build` sin errores TypeScript
- [ ] Responsive desde 375px hasta 1440px sin scroll horizontal
- [ ] Filtros cruzados funcionan (categoría + marca + búsqueda simultáneos)
- [ ] Carrito persiste en la sesión (no se pierde al navegar entre secciones)
- [ ] Mensaje de WhatsApp se construye con los productos reales del carrito
- [ ] Badge del carrito se actualiza al agregar/quitar productos
- [ ] Animaciones no rompen el layout en mobile
- [ ] `prefers-reduced-motion` respetado

---

## Lo que NO hacer

- No conectar a ninguna API ni base de datos
- No implementar pagos
- No usar colores fuera de la paleta de marca (navy, rojo, blanco, grises neutros)
- No usar fuentes distintas a Barlow Condensed e Inter
- No usar `alert()` ni `console.log()` como feedback visual