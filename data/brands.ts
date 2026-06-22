export interface BrandData {
  id: string
  name: string
  origin: "china" | "usa"
}

export const brands: BrandData[] = [
  { id: "chery", name: "Chery", origin: "china" },
  { id: "great_wall", name: "Great Wall", origin: "china" },
  { id: "byd", name: "BYD", origin: "china" },
  { id: "dfsk", name: "DFSK", origin: "china" },
  { id: "jetour", name: "Jetour", origin: "china" },
  { id: "shineray", name: "Shineray", origin: "china" },
  { id: "mg", name: "MG", origin: "china" },
  { id: "jac", name: "JAC", origin: "china" },
  { id: "ford", name: "Ford", origin: "usa" },
  { id: "chevrolet", name: "Chevrolet", origin: "usa" },
]

export const chineseBrands = brands.filter((b) => b.origin === "china")
export const americanBrands = brands.filter((b) => b.origin === "usa")
