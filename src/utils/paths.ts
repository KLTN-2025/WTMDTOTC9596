import { PATHS } from '@/configs/paths'

type ProductsPathParams = {
  q?: string
  location?: string
  brand?: string
  status?: string
  year?: string
}

export const buildProductsPath = (params?: ProductsPathParams): string => {
  if (!params) return PATHS.PRODUCTS

  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.location) searchParams.set('location', params.location)
  if (params.brand) searchParams.set('brand', params.brand)
  if (params.status) searchParams.set('status', params.status)
  if (params.year) searchParams.set('year', params.year)

  const queryString = searchParams.toString()
  return queryString ? `${PATHS.PRODUCTS}?${queryString}` : PATHS.PRODUCTS
}
