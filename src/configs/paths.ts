export const PATHS = {
  ROOT: '/',
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
  SELL: '/sell',
  SETTINGS: {
    ROOT: '/settings'
  },
  STORE_REGISTRATION: '/store-registration',
  USER: {
    MANAGE_LISTINGS: '/manage-listings'
  },
  STORES: '/stores',
  TEST_DRIVES: '/test-drives',
  CUSTOMER_CONTACTS: '/customer-contacts',
  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    CATEGORIES: '/admin/categories',
    CAR_LISTINGS: '/admin/car-listings'
  }
} as const
