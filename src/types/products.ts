export type Brand = {
  id: string
  name: string
  logoUrl: string | null
}

export type ProductListItem = {
  id: string
  title: string
  price: number
  seller?: {
    storeName: string
    storeLogo: string | null
  } | null
  createdAt: string | null
  mediaUrls?: string[] | null
  bodyStyles?: { name: string } | null
  fuels?: { name: string } | null
  transmissions?: { name: string } | null
  locations?: { name: string } | null
  colors?: { name: string } | null
}

export type ProductDetailData = {
  id: string
  title: string
  price: number
  yearManufactured: string | null
  sellerId: string | null
  seller?: {
    storeName: string
    storeLogo: string | null
  } | null
  description: string | null
  warrantyPolicy: string | null
  mileageKm: number | null
  origin: string | null
  conditionType: string
  seats: number | null
  modelName: string | null
  versionName: string | null
  mediaUrls: string[] | null
  createdAt: string | null
  brandId: string | null
  bodyStyleId: string | null
  brands: { name: string } | null
  fuels: { name: string } | null
  transmissions: { name: string } | null
  locations: { name: string } | null
  colors: { name: string } | null
  bodyStyles: { name: string } | null
  drive: string | null
  power: string | null
  torque: string | null
  engineCapacity: string | null
  fuelConsumption: string | null
  doors: number | null
  weight: string | null
  payload: string | null
  groundClearance: string | null
}

export type ProductFilters = {
  q?: string
  location?: string
  year?: string
  brands?: string[]
  conditionTypes?: string[]
  fuels?: string[]
  transmissions?: string[]
  colors?: string[]
  origins?: string[]
  bodyStyles?: string[]
  priceRange?: { min: number; max: number }[]
  sortBy?: 'newest' | 'price_asc' | 'price_desc'
  limit?: number
  offset?: number
  status?: 'available' | 'sold'
}

export type Product = {
  id: string
  title: string
  price: number
  image: string
  seller?: {
    storeName: string
    storeLogo: string | null
  } | null
  createdAt: string | null
  imageCount: number
  statsSelling?: number
  statsSold?: number
  year?: string
  origin?: string
  status?: 'available' | 'sold'
  mediaUrls?: string[]
  bodyStyles?: { name: string } | null
  fuels?: { name: string } | null
  transmissions?: { name: string } | null
  locations?: { name: string } | null
  colors?: { name: string } | null
}

export type NewCarModel = {
  id: string
  brand: string
  name: string
  year: string
  priceRange: string
  image: string
  modelName: string
  brandId: string | null
}
