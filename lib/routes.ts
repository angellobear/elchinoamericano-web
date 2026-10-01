export const routes = {
  home: '/',
  login: '/login',
  publicOrder: (token: string) => `/pedido/${token}`,
  admin: {
    dashboard: '/admin/dashboard',
    forbidden: '/admin/forbidden',
    products: {
      index: '/admin/products',
      create: '/admin/products/new',
      edit: (id: number | string) => `/admin/products/${id}`,
    },
    categories: {
      index: '/admin/categories',
      create: '/admin/categories/new',
      edit: (id: number | string) => `/admin/categories/${id}`,
    },
    vehicleBrands: {
      index: '/admin/vehicle-brands',
      create: '/admin/vehicle-brands/new',
      edit: (id: number | string) => `/admin/vehicle-brands/${id}`,
      models: (id: number | string) => `/api/admin/vehicle-brands/${id}/models`,
      model: (brandId: number | string, modelId: number | string) =>
        `/api/admin/vehicle-brands/${brandId}/models/${modelId}`,
    },
    partBrands: {
      index: '/admin/part-brands',
      create: '/admin/part-brands/new',
      edit: (id: number | string) => `/admin/part-brands/${id}`,
    },
    suppliers: {
      index: '/admin/suppliers',
      create: '/admin/suppliers/new',
      edit: (id: number | string) => `/admin/suppliers/${id}`,
    },
    users: {
      index: '/admin/users',
      create: '/admin/users/new',
      edit: (id: string) => `/admin/users/${id}`,
    },
    announcements: {
      index: '/admin/announcements',
      create: '/admin/announcements/new',
      edit: (id: number | string) => `/admin/announcements/${id}`,
    },
    orders: {
      index: '/admin/orders',
      create: '/admin/orders/new',
      detail: (id: number | string) => `/admin/orders/${id}`,
      edit: (id: number | string) => `/admin/orders/${id}/edit`,
      receipt: (id: number | string, paymentId: number | string) => `/admin/orders/${id}/recibo/${paymentId}`,
      delivery: (id: number | string) => `/admin/orders/${id}/entrega`,
    },
    inventory: {
      index: '/admin/inventory',
    },
  },
} as const
