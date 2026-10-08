"use client"

import Image, { type ImageLoader, type ImageProps } from "next/image"

const UPLOAD = "res.cloudinary.com/"
const UPLOAD_SEGMENT = "/image/upload/"

// Cloudinary already resizes/optimizes, so its URLs skip Vercel's optimizer
// (Hobby caps it at 5K transformations/month).
const cloudinaryLoader: ImageLoader = ({ src, width, quality }) =>
  src.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}f_auto,c_limit,w_${width},q_${quality ?? "auto"}/`)

export function isCloudinaryUrl(src: ImageProps["src"]): src is string {
  return typeof src === "string" && src.includes(UPLOAD) && src.includes(UPLOAD_SEGMENT)
}

// Drop-in for next/image: Cloudinary URLs use Cloudinary, local files keep Vercel's optimizer.
export default function CloudImage({ alt, ...props }: ImageProps) {
  return <Image alt={alt} {...props} loader={isCloudinaryUrl(props.src) ? cloudinaryLoader : undefined} />
}
