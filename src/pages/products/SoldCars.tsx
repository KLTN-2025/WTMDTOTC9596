import { useCallback } from 'react'
import type { ProductFilters } from '@/types/products'
import { ProductListPage } from './components/ProductListPage'

const ITEMS_PER_PAGE = 12

export function SoldCars() {
  const buildFilters = useCallback(
    (sortBy: 'newest' | 'price_asc' | 'price_desc', offset: number): ProductFilters => ({
      status: 'sold',
      sortBy,
      limit: ITEMS_PER_PAGE,
      offset
    }),
    []
  )

  return (
    <ProductListPage
      breadcrumbLabel='Xe đã bán'
      pageTitle='Danh sách xe đã bán'
      emptyMessage='Không có xe đã bán nào'
      buildFilters={buildFilters}
      productCardProps={{ showSoldBadge: true }}
    />
  )
}
