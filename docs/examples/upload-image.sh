#!/usr/bin/env bash
# Sube UNA imagen a Cloudinary y devuelve { url, publicId }. Usa la url en "images" del import.
#   BASE_URL=http://localhost:3000 PRODUCT_IMPORT_TOKEN=... ./upload-image.sh ./foto.jpg
set -euo pipefail
curl -sS -X POST "${BASE_URL:-http://localhost:3000}/api/products/images" \
  -H "Authorization: Bearer ${PRODUCT_IMPORT_TOKEN}" \
  -F "file=@$1"
echo
