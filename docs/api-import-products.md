# API: Importación de Productos

## Endpoint

```
POST /api/products/import
```

Permite ingresar productos desde un proceso externo (scripts, integraciones, ERPs, etc.). El endpoint es público pero requiere un Bearer token estático.

---

## Autenticación

Header requerido:

```
Authorization: Bearer <PRODUCT_IMPORT_TOKEN>
```

El token se configura en la variable de entorno `PRODUCT_IMPORT_TOKEN` (mínimo 32 caracteres).

Para generar un token seguro:
```bash
openssl rand -base64 32
```

---

## Request

**Content-Type:** `application/json`

### Campos requeridos

| Campo   | Tipo                                    | Descripción             |
|---------|-----------------------------------------|-------------------------|
| `title` | `string` (máx. 255)                     | Nombre del producto     |
| `sku`   | `string` (máx. 100)                     | Código SKU (se convierte a mayúsculas) |
| `type`  | `"original"` \| `"oem"` \| `"aftermarket"` | Tipo de pieza       |
| `price` | `string` \| `number`                    | Precio de venta público |

### Campos opcionales

| Campo              | Tipo                                        | Descripción                                                   | Default   |
|--------------------|---------------------------------------------|---------------------------------------------------------------|-----------|
| `shortTitle`       | `string` (máx. 100)                         | Nombre corto para UI                                          | —         |
| `replacementCode`  | `string` (máx. 100)                         | Código OEM / fabricante (se convierte a mayúsculas)           | —         |
| `description`      | `string`                                    | Descripción larga                                             | —         |
| `shortDescription` | `string` (máx. 500)                         | Descripción corta para catálogo/SEO                           | —         |
| `costPrice`        | `string` \| `number`                        | Precio de costo (interno, no se muestra al público)           | —         |
| `discountPct`      | `string` \| `number`                        | Porcentaje de descuento (0–100)                               | —         |
| `condition`        | `"new"` \| `"used"` \| `"refurbished"`      | Condición de la pieza                                         | `"new"`   |
| `weightKg`         | `string` \| `number`                        | Peso en kilogramos                                            | —         |
| `stock`            | `number` (entero, ≥ 0)                      | Stock inicial                                                 | `0`       |
| `minStockAlert`    | `number` (entero, ≥ 0)                      | Umbral de alerta de stock bajo                                | `5`       |
| `isFeatured`       | `boolean`                                   | Mostrar como producto destacado                               | `false`   |
| `isActive`         | `boolean`                                   | Activar producto inmediatamente                               | `true`    |
| `slug`             | `string` (máx. 255)                         | Slug URL. Si se omite, se genera desde `title` + `sku`        | auto      |
| `metaTitle`        | `string` (máx. 255)                         | Título SEO                                                    | —         |
| `metaDescription`  | `string` (máx. 500)                         | Meta descripción SEO                                          | —         |
| `categoryName`     | `string`                                    | Nombre exacto de la categoría. Si no existe, se deja en blanco | —        |
| `partBrandName`    | `string`                                    | Nombre exacto de la marca de la pieza. Si no existe, se omite  | —        |
| `supplierName`     | `string`                                    | Nombre exacto del proveedor. Si no existe, se omite            | —        |
| `specs`            | `Array<{ label: string, value: string }>`   | Especificaciones técnicas                                     | —         |
| `images`           | `Array<{ url, altText?, isPrimary? }>`      | Imágenes del producto (URLs directas, sin subir a Cloudinary)  | —        |
| `alternateCodes`   | `Array<{ code: string, source?: string }>`  | Códigos alternativos / referencias cruzadas                   | —         |
| `compatibilities`  | `Array<CompatEntry>` (ver abajo)            | Vehículos compatibles — marca/modelo se crean si no existen   | —         |

**Estructura de `CompatEntry`:**

| Campo        | Tipo      | Descripción                                   |
|--------------|-----------|-----------------------------------------------|
| `brandName`  | `string`  | Nombre de la marca del vehículo (ver aliases) |
| `modelName`  | `string`  | Nombre del modelo                             |
| `yearStart`  | `number`  | Año inicial del rango (opcional)              |
| `yearEnd`    | `number`  | Año final del rango (opcional)                |
| `notes`      | `string`  | Notas adicionales (opcional)                  |

> **Aliases de marcas:** los nombres se normalizan antes de buscar en la BD. Todas estas variantes se resuelven a la misma marca:
> - `Dongfeng`, `dong feng`, `Donfeng`, `DFSK`, `dfsk` → **DFSK**
>
> La comparación también ignora mayúsculas/minúsculas. Si la marca o el modelo no existen, se insertan automáticamente.

> **Nota sobre categorías, marcas de pieza y proveedores:** se buscan por nombre exacto. Si no se encuentran, el campo se guarda como `null` sin causar error.

---

## Ejemplo de Request

### Mínimo (solo campos requeridos)

```bash
curl -X POST https://tu-dominio.com/api/products/import \
  -H "Authorization: Bearer <tu-PRODUCT_IMPORT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bomba de Agua Toyota Corolla",
    "sku": "BWP-TC-001",
    "type": "oem",
    "price": "89.99"
  }'
```

### Completo

```json
{
  "title": "Bomba de Agua Toyota Corolla 1.8L 2010–2020",
  "shortTitle": "Bomba Agua Corolla",
  "sku": "BWP-TC-001",
  "replacementCode": "16100-09561",
  "type": "oem",
  "condition": "new",
  "price": "89.99",
  "costPrice": "45.00",
  "discountPct": "10",
  "stock": 15,
  "minStockAlert": 3,
  "weightKg": 1.2,
  "categoryName": "Bombas de Agua",
  "partBrandName": "GMB",
  "supplierName": "Importaciones Pérez",
  "shortDescription": "Bomba de agua OEM para Toyota Corolla 1.8L.",
  "description": "Bomba de agua de alta calidad compatible con Toyota Corolla 2010–2020 motor 1.8L...",
  "metaTitle": "Bomba de Agua Toyota Corolla 1.8L | El Chino Americano",
  "metaDescription": "Bomba de agua OEM GMB para Toyota Corolla 1.8L 2010–2020. Envío rápido.",
  "isFeatured": false,
  "isActive": true,
  "specs": [
    { "label": "Material", "value": "Aluminio" },
    { "label": "Incluye", "value": "Junta de sellado" }
  ],
  "images": [
    { "url": "https://ejemplo.com/imagenes/bwp-tc-001-front.jpg", "altText": "Bomba de agua frente", "isPrimary": true },
    { "url": "https://ejemplo.com/imagenes/bwp-tc-001-side.jpg", "altText": "Bomba de agua lateral" }
  ],
  "alternateCodes": [
    { "code": "16100-09561", "source": "Toyota OEM" },
    { "code": "GMB-GWT-97A", "source": "GMB" }
  ]
}
```

---

## Respuesta exitosa

**HTTP 200**

```json
{
  "success": true,
  "code": "CA-0042",
  "id": 42,
  "slug": "ca-0042-bomba-de-agua-toyota-corolla-bwp-tc-001"
}
```

| Campo     | Descripción                                     |
|-----------|-------------------------------------------------|
| `success` | Siempre `true` en respuesta exitosa             |
| `code`    | Código interno generado automáticamente (`CA-XXXX`) |
| `id`      | ID numérico del producto en la base de datos    |
| `slug`    | Slug URL del producto (ruta: `/catalogo/{slug}`) |

---

## Errores

| HTTP | Descripción                              | Body ejemplo                                                                 |
|------|------------------------------------------|------------------------------------------------------------------------------|
| `400` | Campos inválidos o faltantes            | `{ "error": "Datos inválidos", "details": { "title": ["Required"] } }`     |
| `401` | Token ausente o incorrecto              | `{ "error": "No autorizado" }`                                               |
| `409` | SKU o slug duplicado en la base de datos | `{ "error": "Ya existe un producto con ese SKU o slug", "detail": "..." }` |
| `500` | `PRODUCT_IMPORT_TOKEN` no configurado   | `{ "error": "PRODUCT_IMPORT_TOKEN no configurado correctamente" }`          |
| `500` | Error inesperado del servidor           | `{ "error": "mensaje del error" }`                                           |

---

## Configuración del entorno

Agregar al `.env` o `.env.local`:

```env
# Genera con: openssl rand -base64 32
PRODUCT_IMPORT_TOKEN=tu-token-aqui
```

Y en producción (variables de entorno del servidor / Vercel / etc.), configurar la misma variable con el mismo valor.

---

## Notas

- El código interno (`CA-XXXX`) se genera automáticamente — no se puede especificar.
- El `slug` se genera automáticamente como `{código}-{título-normalizado}-{sku}` si no se provee.
- Las imágenes se almacenan con URL directa (sin subir a Cloudinary). Para imágenes alojadas en Cloudinary, proporcionar la URL completa.
- La categoría, marca y proveedor se resuelven por nombre exacto. Si no se encuentra coincidencia, el campo se guarda como vacío (`null`) sin reportar error.
- El endpoint no tiene límite de tasa por defecto — implementar a nivel de infraestructura si es necesario.
