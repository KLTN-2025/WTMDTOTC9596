import { Box, Container, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { HiOutlineChevronDown } from 'react-icons/hi2'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/hooks/useToast'
import { getProducts } from '@/api/products'
import type { Product, ProductFilters } from '@/types/products'
import { AboutSection } from '@/components/common/AboutSection'
import { ProductCard } from './ProductCard.tsx'
import { SORT_OPTIONS } from '@/mocks/products'
import { SortSelect } from '@/components/common/SortSelect'
import { PaginationControls } from '@/components/common/PaginationControls'

const ITEMS_PER_PAGE = 12

type ProductListPageProps = {
  breadcrumbLabel: string
  pageTitle: string
  emptyMessage: string
  buildFilters: (sortBy: 'newest' | 'price_asc' | 'price_desc', offset: number) => ProductFilters
  productCardProps?: {
    showActions?: boolean
    showSoldBadge?: boolean
  }
}

export function ProductListPage({
  breadcrumbLabel,
  pageTitle,
  emptyMessage,
  buildFilters,
  productCardProps = {}
}: ProductListPageProps) {
  const toast = useToast()
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      const filters = buildFilters(sortBy, offset)

      const { data, error, count } = await getProducts(filters)
      if (error) {
        toast.error(error.message || 'Lỗi tải dữ liệu')
        setProducts([])
        setTotalCount(0)
        return
      }
      setProducts(data ?? [])
      setTotalCount(count ?? 0)
    } finally {
      setIsLoading(false)
    }
  }, [sortBy, currentPage, buildFilters, toast])

  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <Box bg='#F8FAFC' minH='100vh'>
      <Container maxW='1200px' px={4} py={6}>
        <HStack gap={2} mb={4}>
          <RouterLink to='/'>
            <Text fontSize='14px' fontWeight='600' color='#1B2C5D'>
              Trang chủ
            </Text>
          </RouterLink>
          <Icon size='md' color='#B6B6B6'>
            <HiOutlineChevronDown style={{ transform: 'rotate(-90deg)' }} />
          </Icon>
          <Text fontSize='14px' fontWeight='400' color='#6B7280'>
            {breadcrumbLabel}
          </Text>
        </HStack>

        <Text fontSize='18px' fontWeight='600' color='#04113E' mb={6}>
          {pageTitle}
        </Text>

        <Box>
          <Flex justify='space-between' align='center' mb={4}>
            <Text fontSize='20px' fontWeight='700' color='#04113E'>
              Tổng {totalCount} {breadcrumbLabel === 'Xe đã bán' ? 'xe đã bán' : 'xe đang bán'}
            </Text>
            <HStack gap={5}>
              <SortSelect
                value={sortBy}
                options={SORT_OPTIONS}
                minW='150px'
                maxW='200px'
                onChange={value => {
                  setSortBy(value as 'newest' | 'price_asc' | 'price_desc')
                  setCurrentPage(1)
                }}
              />
            </HStack>
          </Flex>

          {isLoading ? (
            <Text textAlign='center' py={8}>
              Đang tải...
            </Text>
          ) : (
            <VStack align='stretch' gap={4} mb={6}>
              {products.length === 0 ? (
                <Text textAlign='center' py={8} color='#6B7280'>
                  {emptyMessage}
                </Text>
              ) : (
                products.map(product => (
                  <ProductCard key={product.id} product={product} {...productCardProps} />
                ))
              )}
            </VStack>
          )}

          <PaginationControls
            totalCount={totalCount}
            pageSize={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </Box>

        <AboutSection />
      </Container>
    </Box>
  )
}
