import { Box, Container, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react'
import { useSearchParams } from 'react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { getProducts } from '@/api/products'
import type { Product, ProductFilters, Brand } from '@/types/products'
import { useMasterData } from '@/hooks/useMasterData'
import { AboutSection } from '@/components/common/AboutSection'
import { AppBreadcrumb } from '@/components/common/Breadcrumb'
import { ProductFiltersSidebar } from './components/ProductFiltersSidebar.tsx'
import { ProductCard } from './components/ProductCard.tsx'
import { ProductSearchSection } from './components/ProductSearchSection.tsx'
import banner from '@/assets/images/banner.png'
import { PATHS } from '@/configs/paths'
import { PRICE_RANGE_MAP, SORT_OPTIONS } from '@/mocks/products'
import { SortSelect } from '@/components/common/SortSelect.tsx'
import { PaginationControls } from '@/components/common/PaginationControls'

const ITEMS_PER_PAGE = 12
type SortOptionValue = (typeof SORT_OPTIONS)[number]['value']

export function Products() {
  const [searchParams] = useSearchParams()
  const { brands, locations, fuels, transmissions, colors, bodyStyles } = useMasterData()

  const filterOptions = useMemo(
    () => ({
      brands: brands.map(b => ({ id: b.id, name: b.name, logoUrl: b.logoUrl || null })) as Brand[],
      locations: locations.map(l => ({ id: l.id, name: l.name })),
      fuels: fuels.map(f => ({ id: f.id, name: f.name })),
      transmissions: transmissions.map(t => ({ id: t.id, name: t.name })),
      colors: colors.map(c => ({ id: c.id, name: c.name })),
      bodyStyles: bodyStyles.map(bs => ({ id: bs.id, name: bs.name }))
    }),
    [brands, locations, fuels, transmissions, colors, bodyStyles]
  )

  const [selectedFilters, setSelectedFilters] = useState({
    vehicleStatus: [] as string[],
    priceRange: [] as string[],
    style: [] as string[],
    seats: [] as string[],
    fuel: [] as string[],
    transmission: [] as string[],
    color: [] as string[],
    origin: [] as string[]
  })

  const [appliedFilters, setAppliedFilters] = useState({
    q: '',
    location: 'Tất cả',
    year: 'Tất cả',
    brand: '',
    vehicleStatus: [] as string[],
    priceRange: [] as string[],
    style: [] as string[],
    seats: [] as string[],
    fuel: [] as string[],
    transmission: [] as string[],
    color: [] as string[],
    origin: [] as string[],
    sortBy: 'newest' as 'newest' | 'price_asc' | 'price_desc'
  })

  const [uiState, setUiState] = useState({
    isLoading: false,
    products: [] as Product[],
    totalCount: 0,
    currentPage: 1
  })

  const toast = useToast()

  const handleSearch = useCallback(
    (searchFilters: { q?: string; location: string; year: string; brand: string }) => {
      setAppliedFilters(prev => ({
        ...prev,
        q: searchFilters.q || '',
        location: searchFilters.location,
        year: searchFilters.year,
        brand: searchFilters.brand
      }))
      setUiState(prev => ({ ...prev, currentPage: 1 }))
    },
    []
  )

  const handleClearSearch = useCallback(() => {
    setSelectedFilters({
      vehicleStatus: [],
      priceRange: [],
      style: [],
      seats: [],
      fuel: [],
      transmission: [],
      color: [],
      origin: []
    })
    setAppliedFilters({
      q: '',
      location: 'Tất cả',
      year: 'Tất cả',
      brand: '',
      vehicleStatus: [],
      priceRange: [],
      style: [],
      seats: [],
      fuel: [],
      transmission: [],
      color: [],
      origin: [],
      sortBy: 'newest'
    })
    setUiState(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleSortChange = useCallback((nextValue: string) => {
    const safeValue = (nextValue as SortOptionValue) || 'newest'
    setAppliedFilters(prev => ({ ...prev, sortBy: safeValue }))
    setUiState(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const mappedPriceRange = useMemo(() => {
    return appliedFilters.priceRange.map(label => PRICE_RANGE_MAP[label]).filter(Boolean) as {
      min: number
      max: number
    }[]
  }, [appliedFilters.priceRange])

  const fetchProducts = async () => {
    setUiState(prev => ({ ...prev, isLoading: true }))
    try {
      let brandFilter: string[] | undefined
      if (appliedFilters.brand) {
        brandFilter = [appliedFilters.brand]
      }

      const offset = (uiState.currentPage - 1) * ITEMS_PER_PAGE

      const filters: ProductFilters = {
        ...(appliedFilters.q && { q: appliedFilters.q }),
        ...(appliedFilters.location !== 'Tất cả' && { location: appliedFilters.location }),
        ...(appliedFilters.year !== 'Tất cả' && { year: appliedFilters.year }),
        ...(brandFilter && brandFilter.length > 0 && { brands: brandFilter }),
        ...(appliedFilters.vehicleStatus.length > 0 && {
          conditionTypes: appliedFilters.vehicleStatus
        }),
        ...(appliedFilters.fuel.length > 0 && { fuels: appliedFilters.fuel }),
        ...(appliedFilters.transmission.length > 0 && {
          transmissions: appliedFilters.transmission
        }),
        ...(appliedFilters.color.length > 0 && { colors: appliedFilters.color }),
        ...(appliedFilters.origin.length > 0 && { origins: appliedFilters.origin }),
        ...(appliedFilters.style.length > 0 && { bodyStyles: appliedFilters.style }),
        ...(mappedPriceRange.length > 0 && { priceRange: mappedPriceRange }),
        sortBy: appliedFilters.sortBy,
        limit: ITEMS_PER_PAGE,
        offset
      }

      const { data, error, count } = await getProducts(filters)
      if (error) {
        toast.error(error.message || 'Lỗi tải dữ liệu')
        setUiState({
          isLoading: false,
          products: [],
          totalCount: 0,
          currentPage: uiState.currentPage
        })
        return
      }
      setUiState(prev => ({
        ...prev,
        isLoading: false,
        products: data ?? [],
        totalCount: count ?? 0
      }))
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }))
    }
  }

  useEffect(() => {
    setUiState(prev => ({ ...prev, currentPage: 1 }))
  }, [
    appliedFilters.q,
    appliedFilters.location,
    appliedFilters.year,
    appliedFilters.brand,
    appliedFilters.vehicleStatus,
    appliedFilters.priceRange,
    appliedFilters.style,
    appliedFilters.seats,
    appliedFilters.fuel,
    appliedFilters.transmission,
    appliedFilters.color,
    appliedFilters.origin,
    appliedFilters.sortBy
  ])

  useEffect(() => {
    const qParam = searchParams.get('q')
    const locationParam = searchParams.get('location')
    const brandParam = searchParams.get('brand')

    if (qParam || locationParam || brandParam) {
      setAppliedFilters(prev => ({
        ...prev,
        ...(qParam && { q: qParam }),
        ...(locationParam && { location: locationParam }),
        ...(brandParam && { brand: brandParam })
      }))
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    appliedFilters.q,
    appliedFilters.location,
    appliedFilters.year,
    appliedFilters.brand,
    appliedFilters.vehicleStatus,
    appliedFilters.priceRange,
    appliedFilters.style,
    appliedFilters.seats,
    appliedFilters.fuel,
    appliedFilters.transmission,
    appliedFilters.color,
    appliedFilters.origin,
    appliedFilters.sortBy,
    uiState.currentPage
  ])

  const toggleFilter = useCallback(
    (value: string, filterKey: keyof typeof selectedFilters, isArray: boolean = true) => {
      if (isArray) {
        setSelectedFilters(prev => {
          const current = prev[filterKey] as string[]
          const newValue = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value]
          return {
            ...prev,
            [filterKey]: newValue
          }
        })
        setAppliedFilters(prev => {
          const current = prev[filterKey] as string[]
          const newValue = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value]
          return {
            ...prev,
            [filterKey]: newValue
          }
        })
        setUiState(prev => ({ ...prev, currentPage: 1 }))
      }
    },
    []
  )
  return (
    <Box bg='#F8FAFC' minH='100vh'>
      <Container maxW='1200px' px={4} py={6}>
        <Box mb={4}>
          <AppBreadcrumb items={[{ label: 'Trang chủ', path: PATHS.HOME }, { label: 'Mua xe' }]} />
        </Box>

        {/* Page Title */}
        <Text fontSize='18px' fontWeight='600' color='#04113E' mb={6}>
          Mua bán xe ô tô cũ mới giá tốt ưu đãi 08/2025 cũ mới giá tốt ưu đãi 10/2025
        </Text>

        <Flex gap={5} align='flex-start'>
          {/* Main Content */}
          <Box flex={1}>
            <ProductSearchSection
              filterOptions={filterOptions}
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isLoading={uiState.isLoading}
              initialSearchQuery={searchParams.get('q') || ''}
            />

            {/* Results Header */}
            <Flex justify='space-between' align='center' mb={4}>
              <Text fontSize='20px' fontWeight='700' color='#04113E'>
                Tổng {uiState.totalCount} xe đang bán
              </Text>
              <HStack gap={5}>
                <SortSelect
                  value={appliedFilters.sortBy}
                  onChange={handleSortChange}
                  options={SORT_OPTIONS}
                  size='md'
                  minW='150px'
                  maxW='200px'
                />
              </HStack>
            </Flex>

            <VStack align='stretch' gap={4} mb={6}>
              {uiState.products.map(product => (
                <ProductCard key={product.id} product={product} showActions />
              ))}
            </VStack>

            <PaginationControls
              totalCount={uiState.totalCount}
              pageSize={ITEMS_PER_PAGE}
              currentPage={uiState.currentPage}
              onPageChange={page => setUiState(prev => ({ ...prev, currentPage: page }))}
            />
          </Box>

          <ProductFiltersSidebar
            selectedFilters={selectedFilters}
            filterOptions={filterOptions}
            toggleFilter={toggleFilter}
          />
        </Flex>

        {/* Banner Section */}
        <Box width='full' height='150px' bg='gray.200' borderRadius='6px' overflow='hidden' mb={6}>
          <Image src={banner} alt='Banner' width='100%' height='100%' objectFit='cover' />
        </Box>

        {/* About Section */}
        <AboutSection />
      </Container>
    </Box>
  )
}
