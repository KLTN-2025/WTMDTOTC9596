import {
  Box,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  NativeSelect,
  Pagination,
  Text,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { HiOutlineChevronDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { getProducts } from '@/api/products'
import type { Product, ProductFilters } from '@/types/products'
import { AboutSection } from '@/components/common/AboutSection'
import { ProductCard } from './components/ProductCard.tsx'
import { SORT_OPTIONS } from '@/mocks/products'

const ITEMS_PER_PAGE = 12

export function SoldCars() {
  const toast = useToast()
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      const filters: ProductFilters = {
        status: 'sold',
        sortBy,
        limit: ITEMS_PER_PAGE,
        offset
      }

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
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy])

  useEffect(() => {
    fetchProducts()
  }, [sortBy, currentPage])

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
            Xe đã bán
          </Text>
        </HStack>

        <Text fontSize='18px' fontWeight='600' color='#04113E' mb={6}>
          Danh sách xe đã bán
        </Text>

        <Box>
          <Flex justify='space-between' align='center' mb={4}>
            <Text fontSize='20px' fontWeight='700' color='#04113E'>
              Tổng {totalCount} xe đã bán
            </Text>
            <HStack gap={5}>
              <Text fontSize='18px' fontWeight='400' color='#737373' textWrap='nowrap'>
                Xắp xếp theo
              </Text>
              <NativeSelect.Root
                size='md'
                maxW='200px'
                minW='150px'
                onChange={e => {
                  const v = (e.target as HTMLSelectElement).value
                  const sortOption = SORT_OPTIONS.find(opt => opt.label === v)
                  if (sortOption) {
                    setSortBy(sortOption.value)
                    setCurrentPage(1)
                  }
                }}
              >
                <NativeSelect.Field
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={2}
                  value={
                    sortBy === 'newest'
                      ? 'Tin mới nhất'
                      : sortBy === 'price_asc'
                        ? 'Giá tăng dần'
                        : 'Giá giảm dần'
                  }
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value}>{opt.label}</option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
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
                  Không có xe đã bán nào
                </Text>
              ) : (
                products.map(product => (
                  <ProductCard key={product.id} product={product} showSoldBadge />
                ))
              )}
            </VStack>
          )}

          {totalCount > ITEMS_PER_PAGE && (
            <Flex justify='center' mt={6} mb={6}>
              <Pagination.Root
                count={totalCount}
                pageSize={ITEMS_PER_PAGE}
                page={currentPage}
                onPageChange={e => setCurrentPage(e.page)}
              >
                <ButtonGroup variant='ghost' size='sm'>
                  <Pagination.PrevTrigger asChild>
                    <IconButton>
                      <HiChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>
                  <Pagination.Items
                    render={page => (
                      <IconButton
                        variant={currentPage === page.value ? 'outline' : 'ghost'}
                        onClick={() => setCurrentPage(page.value)}
                      >
                        {page.value}
                      </IconButton>
                    )}
                  />
                  <Pagination.NextTrigger asChild>
                    <IconButton>
                      <HiChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Flex>
          )}
        </Box>

        <AboutSection />
      </Container>
    </Box>
  )
}
