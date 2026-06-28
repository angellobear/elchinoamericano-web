import { uploadImage, deleteImage } from '@/lib/cloudinary'

export async function parseImagesFormData(formData: FormData) {
  const toDelete: string[] = []
  let r = 0
  while (formData.has(`removed_publicIds[${r}]`)) {
    const pid = String(formData.get(`removed_publicIds[${r}]`))
    if (pid) toDelete.push(pid)
    r++
  }
  await Promise.all(toDelete.map(pid => deleteImage(pid).catch(() => {})))

  const kept: { url: string; cloudinaryPublicId: string | null; isPrimary: boolean; sortOrder: number }[] = []
  let i = 0
  while (formData.has(`existing_images[${i}][url]`)) {
    kept.push({
      url: String(formData.get(`existing_images[${i}][url]`)),
      cloudinaryPublicId: String(formData.get(`existing_images[${i}][publicId]`)) || null,
      isPrimary: formData.get(`existing_images[${i}][isPrimary]`) === '1',
      sortOrder: i,
    })
    i++
  }

  const newFiles = formData.getAll('new_images') as File[]
  const newPrimary: boolean[] = []
  for (let j = 0; j < newFiles.length; j++) {
    newPrimary.push(formData.get(`new_images_primary[${j}]`) === '1')
  }

  const uploaded = await Promise.all(
    newFiles
      .filter(f => f instanceof File && f.size > 0)
      .map(f => uploadImage(f, 'products'))
  )

  const newImages = uploaded.map((u, j) => ({
    url: u.url,
    cloudinaryPublicId: u.publicId,
    isPrimary: newPrimary[j] ?? false,
    sortOrder: kept.length + j,
  }))

  const finalImages = [...kept, ...newImages]
  if (finalImages.length && !finalImages.some(img => img.isPrimary)) {
    finalImages[0].isPrimary = true
  }

  return { finalImages }
}
