export type Category =
  | "motor"
  | "frenos"
  | "suspension"
  | "filtros"
  | "carroceria"
  | "enfriamiento"

export type CarBrand =
  | "ford"
  | "chevrolet"
  | "chery"
  | "great_wall"
  | "dfsk"
  | "jetour"
  | "shineray"
  | "byd"
  | "mg"
  | "jac"

export type ProductType = "original" | "oem" | "alterno"

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: number
  name: string
  brandProduct: string
  compatible: string
  compatibleList?: string[]
  category: Category
  carBrand: CarBrand
  type: ProductType
  price: number
  icon: string
  description?: string
  specs?: ProductSpec[]
}

export interface CartItem extends Product {
  qty: number
}
