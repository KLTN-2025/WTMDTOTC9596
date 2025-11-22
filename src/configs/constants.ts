export const DEFAULT_VALUES = {
  NOT_AVAILABLE: 'N/A',
  UNKNOWN: 'Unknown',
  BRAND_LIMIT: 12,
  BRAND_DISPLAY_LIMIT: 6,
  RECENT_PRODUCTS_LIMIT: 8,
  NEW_CAR_MODELS_LIMIT: 8,
  NEW_CAR_MODELS_DISPLAY_LIMIT: 4
} as const

export const USER_ROLE = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
} as const

export const PRODUCT_STATUS = {
  PENDING: 'pending',
  AVAILABLE: 'available',
  SOLD: 'sold',
  REJECTED: 'rejected'
} as const

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const
