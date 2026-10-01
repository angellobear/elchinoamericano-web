# Módulo Pedidos (abonos y entrega-recepción) — Diseño

Estado: **aprobado**
Fecha: 2026-10-01

## Objetivo

Dar al cliente un respaldo escrito en dos momentos en los que hoy no recibe nada:

1. Cuando deja un **abono** para separar un producto o mandarlo a traer bajo pedido.
2. Cuando se le **entrega** la mercadería y firma "recibí conforme".

Ambos documentos se imprimen o se envían como PDF, y se pueden verificar en un enlace público.

El módulo registra **solo lo que se le cobró al cliente**. No maneja costos, márgenes de
ganancia ni porcentajes de descuento.

## Alcance legal

- Son documentos **internos, no tributarios**. No reemplazan la factura.
- No se usan los nombres "nota de venta" ni "guía de remisión" (son comprobantes autorizados por el SRI). Se usan **"Recibo de abono"** y **"Acta de entrega-recepción"**.
- Cada documento lleva la leyenda: *"Este documento no constituye comprobante de venta."*
  El recibo de abono añade: *"La factura se emitirá al momento de la entrega."*
- Pendiente de confirmar con el contador: tratamiento de anticipos y obligación de facturar.

## Enfoque

Módulo nuevo **Pedidos** en el admin, con el mismo patrón que Anuncios
(`app/admin/orders/**` como capa de rutas, `modules/admin/orders/**` con la lógica).

Un **pedido** tiene cliente (opcional), ítems y pagos. De él salen los dos documentos.
Los documentos son páginas con CSS de impresión; el PDF se obtiene con
"Guardar como PDF" del navegador. No se genera PDF en el servidor.

## Datos

### Normalización vs. JSON

- **Ítems y abonos: tablas normalizadas.** Los ítems necesitan la referencia al producto para
  descontar inventario; los abonos necesitan número propio (el del recibo), poder anularse
  uno a uno y sumarse para el saldo. Todo eso es frágil o imposible dentro de un JSON.
- **Datos del cliente: columnas en `orders`**, todas opcionales. Sin tabla de clientes.
- **Fotos de entrega: una columna JSON** en `orders`. Son máximo 2, no se consultan ni se
  relacionan con nada; una tabla aparte sería exceso.

### `orders`

| Columna | Notas |
|---|---|
| `id` | Número secuencial visible (`PED-000123`) |
| `public_token` | 256 bits aleatorios, único; para el enlace público |
| `customer_name` | **Opcional.** Si está vacío se muestra "Consumidor final" |
| `customer_id_number` | Cédula/RUC, opcional |
| `customer_phone` | Opcional |
| `discount` | Descuento **global** del pedido, en dólares (no porcentaje). Por defecto 0 |
| `invoice_number` | **Opcional.** Número de factura asociada a la entrega |
| `notes` | Condiciones u observaciones |
| `estimated_date` | Fecha estimada de llegada/entrega, opcional |
| `status` | `pending` \| `delivered` \| `cancelled` |
| `delivered_at`, `received_by_name`, `received_by_id_number` | Se llenan al entregar; nombre y cédula opcionales |
| `delivery_photos` | JSON opcional: hasta 2 fotos `{ url, publicId }` (Cloudinary) |
| `created_by`, `created_at`, `updated_at` | |

Estados: tres constantes en base de datos; la etiqueta es solo de interfaz.

| Constante | Etiqueta |
|---|---|
| `pending` | Pendiente |
| `delivered` | Entregado |
| `cancelled` | Anulado |

### `order_items`

| Columna | Notas |
|---|---|
| `order_id` | |
| `product_id` | Opcional. Solo si el ítem se eligió del catálogo |
| `description` | **Texto libre.** Si viene del catálogo se precarga y se puede editar |
| `quantity` | Entero ≥ 1. En la interfaz arranca en 1 |
| `unit_price` | Valor unitario cobrado |

### `order_payments`

| Columna | Notas |
|---|---|
| `id` | Número del recibo (`ABO-000045`) |
| `order_id` | |
| `amount` | |
| `method` | efectivo, transferencia, depósito, tarjeta |
| `reference` | Número de comprobante del depósito/transferencia, opcional |
| `paid_at`, `user_id` | |
| `voided_at` | Los abonos no se editan ni se borran, solo se anulan |

### Reglas

- **Subtotal** = suma de `quantity × unit_price` de cada línea.
- **Total** = subtotal − `discount`. El descuento no puede superar el subtotal.
- **Saldo** = total − abonos no anulados. Siempre calculado, nunca guardado.
- Los ítems solo se editan mientras el pedido está `pending`.
- Un abono no puede superar el saldo.
- `invoice_number` y las fotos se pueden agregar o cambiar mientras el pedido no esté `cancelled`
  (la factura puede emitirse después de la entrega).

## Pantallas del admin

- **Listado** `/admin/orders`: número, cliente, total, abonado, saldo, estado; buscador y filtro por estado.
- **Nuevo / editar** `/admin/orders/new`, `/admin/orders/[id]`: datos del cliente (opcionales),
  ítems (buscar producto del catálogo para precargar, o escribir la línea a mano),
  notas, fecha estimada.
- **Detalle**: lista de abonos con "Registrar abono" e "Imprimir recibo" por cada uno;
  "Marcar como entregado" (quién recibe, n.º de factura y fotos, todo opcional);
  "Imprimir acta"; "Copiar enlace público"; "Anular".

## Documentos

Rutas de impresión dentro del admin (requieren sesión):

- `/admin/orders/[id]/recibo/[paymentId]` — **Recibo de abono**
- `/admin/orders/[id]/entrega` — **Acta de entrega-recepción**

Los dos documentos **no son alternativos**: salen del mismo pedido en momentos distintos.

| Documento | Cuándo | Cuántos por pedido |
|---|---|---|
| Recibo de abono | Cada vez que el cliente paga algo antes de la entrega | 0 o más |
| Acta de entrega-recepción | Al entregar la mercadería | 1 |

Una venta directa sin abono previo solo genera el acta. Un pedido con abonos genera un
recibo por abono y, al final, el acta.

En la base hay **un solo pedido** que avanza de `pending` a `delivered`; los documentos son
impresiones de ese pedido en momentos distintos. Todos llevan **el mismo QR** (el token del
pedido), y la página pública muestra siempre el estado actual: quien escanea un recibo de
abono antiguo ve los abonos posteriores y, si ya ocurrió, la entrega.

Comparten encabezado, cliente, tabla de ítems y totales, así que se implementan como
**una sola plantilla** con un parámetro de tipo. Cambia: el título y número, el bloque de
pagos (un abono resaltado vs. lista de todos los pagos), las firmas, y que solo el acta
lleva n.º de factura y fotos.

### Recibo de abono

Encabezado con logo y datos del local · número y fecha · cliente o "Consumidor final" ·
ítems (descripción, cantidad, valor unitario, importe) · subtotal · descuento · total ·
abonos anteriores · este abono (monto, forma de pago, referencia) · **saldo pendiente** ·
fecha estimada · condiciones · leyenda legal · firma/sello · QR de verificación.

### Acta de entrega-recepción

Encabezado · número y fecha de entrega · cliente o "Consumidor final" · **n.º de factura** (si existe) ·
ítems entregados · pagos recibidos y saldo · **fotos de entrega** (si existen) · leyenda legal ·
líneas de firma **"Entregué conforme"** y **"Recibí conforme"** · QR.

## Fotos de entrega

- Opcionales, máximo 2 por pedido.
- Se suben a Cloudinary con el componente de subida existente; en la base solo se guardan los enlaces.
- Aparecen en el detalle del admin, en el acta impresa y en el enlace público.
- Al quitar una foto se borra también de Cloudinary.

## Entrega e inventario

"Marcar como entregado" ejecuta en **una sola transacción**:

1. Verifica stock suficiente de cada ítem con `product_id`. Si falta, no se entrega nada.
2. Crea una salida en `stock_movements` por ítem, con motivo `Pedido #N`.
3. Descuenta `products.stock`.
4. Cambia el estado a `delivered` y guarda los datos de entrega.

Anular un pedido entregado revierte los movimientos. Los ítems sin `product_id` no tocan inventario.

## Enlace público verificable

Ruta `/pedido/[token]`, solo lectura.

- **Token**: 32 bytes de `crypto.randomBytes` en base64url. Sin relación con el número de pedido;
  no se puede adivinar ni recorrer por fuerza bruta. El número secuencial nunca va en la URL.
- **Datos mínimos**: ítems, abonos, saldo, estado, n.º de factura, fotos de entrega y nombre del
  cliente (o "Consumidor final"). Sin teléfono; cédula enmascarada (`09******12`).
- **Sin indexación**: `noindex`, fuera del sitemap, `Referrer-Policy: no-referrer`.
- **Token fijo**: se genera al crear el pedido y no cambia, para que los QR ya impresos
  sigan funcionando siempre. No hay "regenerar enlace".
- **Sin acciones**: la página no modifica nada. Todo cambio exige sesión de admin con permiso.
- Token inexistente → 404 genérico. Un pedido anulado sigue visible, marcado como "Anulado",
  para que el QR de un recibo ya entregado nunca lleve a una página de error.

## Permisos y auditoría

- Módulo `orders` ("Pedidos") en `modules` y `role_permissions`, con script idempotente
  `lib/db/scripts/apply-orders-tables.ts` (igual que el de anuncios).
- Crear, editar, abonar, anular abono, entregar y anular pedido se registran en `audit_log`.

## Pruebas

- `scripts/check-order-balance.ts`: subtotal, descuento global, total, saldo y transiciones de estado válidas.
- Prueba manual del flujo completo: crear pedido → abono → recibo → entrega con fotos → acta → enlace público.

## Supuestos

1. Precios finales con IVA incluido, sin desglose de impuestos.
2. El descuento es global del pedido, no por línea.
3. Se puede entregar con saldo pendiente; el acta lo muestra.
4. Sin entregas parciales: el pedido se entrega completo.
5. Las fotos se suben desde el admin (no se pegan enlaces externos) y se ven en el enlace público.
6. Una dependencia nueva, `qrcode`, para el QR.

## Fuera de alcance

Facturación electrónica, envío automático por correo/WhatsApp, PDF generado en servidor,
entregas parciales, tabla de clientes, devoluciones de dinero, costos y márgenes.
