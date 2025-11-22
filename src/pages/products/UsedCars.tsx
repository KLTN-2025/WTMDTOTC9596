import { useCallback } from 'react'
import type { ProductFilters } from '@/types/products'
import { ProductListPage } from './components/ProductListPage'

const ITEMS_PER_PAGE = 12

export function UsedCars() {
  const buildFilters = useCallback(
    (sortBy: 'newest' | 'price_asc' | 'price_desc', offset: number): ProductFilters => ({
      conditionTypes: ['used'],
      status: 'available',
      sortBy,
      limit: ITEMS_PER_PAGE,
      offset
    }),
    []
  )

  return (
    <ProductListPage
      breadcrumbLabel='Xe cũ'
      pageTitle='Danh sách xe cũ đã qua sử dụng'
      emptyMessage='Không có xe cũ nào'
      buildFilters={buildFilters}
      productCardProps={{ showActions: true }}
    />
  )
}
