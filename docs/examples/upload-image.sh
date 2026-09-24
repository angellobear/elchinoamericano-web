#!/usr/bin/env bash
# Sube UNA imagen a un producto existente. Uso:
#   BASE_URL=http://localhost:3000 PRODUCT_IMPORT_TOKEN=... ./upload-image.sh TEST-API-IMG-001 ./foto.jpg "Texto alternativo" [true]
set -euo pipefail
SKU="$1"; FILE="$2"; ALT="${3:-}"; PRIMARY="${4:-false}"
curl -sS -X POST "${BASE_URL:-http://localhost:3000}/api/products/images" \
  -H "Authorization: Bearer ${PRODUCT_IMPORT_TOKEN}" \
  -F "sku=${SKU}" -F "altText=${ALT}" -F "isPrimary=${PRIMARY}" -F "file=@${FILE}"
echo
