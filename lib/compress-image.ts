// Reduce una foto en el navegador antes de subirla: las cámaras de los teléfonos generan
// archivos de 5-15 MB y el server action acepta 10 MB en total. Redimensiona el lado mayor
// a `maxSide` y la guarda como JPEG. Si el navegador no puede decodificarla (p. ej. HEIC en
// Chrome) o el resultado no es más liviano, devuelve el archivo original sin tocarlo.
export async function compressImage(file: File, maxSide = 1600, quality = 0.8): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  try {
    // createImageBitmap respeta la orientación EXIF, así la foto no sale girada.
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file

    return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'foto'}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}
