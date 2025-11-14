export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_BOOKING: (id: string) => `/products/${id}/booking`,
  USED_CARS: '/used-cars',
  SOLD_CARS: '/sold-cars',
  FAVORITES: '/favorites',
  HISTORY: '/history',
  MANAGE: '/manage',
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    SELLER: '/settings/seller'
  },
  STORES: '/stores'
} as const
