import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  Menu,
  NativeSelect,
  Pagination,
  Portal,
  Text,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink, useSearchParams } from 'react-router'
import {
  HiOutlineMapPin,
  HiOutlineChevronDown,
  HiOutlineTrash,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2'
import { HiOutlineSearch } from 'react-icons/hi'
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2'
import { FaCar } from 'react-icons/fa'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/useToast'
import { getProducts } from '@/api/products'
import type { Product, ProductFilters, Brand } from '@/types/products'
import { useMasterData } from '@/hooks/useMasterData'
import { AboutSection } from '@/components/common/AboutSection'
import { AppBreadcrumb } from '@/components/common/Breadcrumb'
import { ProductFiltersSidebar } from './components/ProductFiltersSidebar.tsx'
import { ProductCard } from './components/ProductCard.tsx'
import banner from '@/assets/images/banner.png'
import { PATHS } from '@/configs/paths'
import { DEFAULT_VALUES } from '@/configs/constants'
import { getYears } from '@/mocks/filters'
import { PRICE_RANGE_MAP, SORT_OPTIONS } from '@/mocks/products'

const searchSchema = z.object({
  q: z.string().trim().max(200).optional().or(z.literal(''))
})

const ITEMS_PER_PAGE = 12
const LOCATION_DISPLAY_LIMIT = 5

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

  const [appliedFilters, setAppliedFilters] = useState({
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
    sortBy: 'newest' as 'newest' | 'price_asc' | 'price_desc',
    q: ''
  })

  const [uiState, setUiState] = useState({
    isLoading: false,
    products: [] as Product[],
    totalCount: 0,
    currentPage: 1
  })

  const { register, handleSubmit, watch, setValue } = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { q: searchParams.get('q') || '' }
  })
  const q = watch('q') || ''
  const toast = useToast()

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

  const applyFilters = () => {
    setAppliedFilters({
      q,
      location: selectedFilters.location,
      year: selectedFilters.year,
      brand: selectedFilters.brand,
      vehicleStatus: selectedFilters.vehicleStatus,
      priceRange: selectedFilters.priceRange,
      style: selectedFilters.style,
      seats: selectedFilters.seats,
      fuel: selectedFilters.fuel,
      transmission: selectedFilters.transmission,
      color: selectedFilters.color,
      origin: selectedFilters.origin,
      sortBy: selectedFilters.sortBy
    })
    setUiState(prev => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setSelectedFilters({
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
    setValue('q', '')
    setAppliedFilters({
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
      sortBy: 'newest',
      q: ''
    })
    setUiState(prev => ({ ...prev, currentPage: 1 }))
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

    if (qParam) {
      setValue('q', qParam)
      setAppliedFilters(prev => ({ ...prev, q: qParam }))
    }
    if (locationParam) {
      setSelectedFilters(prev => ({ ...prev, location: locationParam }))
      setAppliedFilters(prev => ({ ...prev, location: locationParam }))
    }
    if (brandParam) {
      setSelectedFilters(prev => ({ ...prev, brand: brandParam }))
      setAppliedFilters(prev => ({ ...prev, brand: brandParam }))
    }
  }, [searchParams, setValue])

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
          return {
            ...prev,
            [filterKey]: current.includes(value)
              ? current.filter(item => item !== value)
              : [...current, value]
          }
        })
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
            {/* Search Section */}
            <Card.Root bg='white' borderRadius='16px' p={6} mb={6}>
              <VStack align='stretch' gap={5}>
                <Text fontSize='20px' fontWeight='700' color='#04113E'>
                  Mua xe
                </Text>

                {/* Search Bar */}
                <Box bg='white' border='1px solid #E5E5E5' borderRadius='12px' p={2} pl={4}>
                  <form onSubmit={handleSubmit(() => applyFilters())}>
                    <Flex gap={5} direction={{ base: 'column', md: 'row' }} align='center'>
                      <InputGroup
                        flex={1}
                        endElement={
                          <Icon size='lg' color='#04113E'>
                            <HiOutlineSearch />
                          </Icon>
                        }
                      >
                        <Input
                          placeholder='Tìm xe cộ...'
                          border='none'
                          fontSize='16px'
                          pl={0}
                          _focus={{ boxShadow: 'none' }}
                          {...register('q')}
                        />
                      </InputGroup>

                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <Button
                            variant='outline'
                            borderColor='#04113E'
                            color='#04113E'
                            borderRadius='6px'
                            px={5}
                            py={3}
                            gap={2}
                            fontWeight='700'
                            fontSize='14px'
                          >
                            <Icon size='md'>
                              <HiOutlineMapPin />
                            </Icon>
                            {selectedFilters.location !== 'Tất cả'
                              ? selectedFilters.location
                              : 'Chọn khu vực'}
                            <Icon size='md'>
                              <HiOutlineChevronDown />
                            </Icon>
                          </Button>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              <Menu.Item
                                value='all'
                                onClick={() =>
                                  setSelectedFilters(prev => ({ ...prev, location: 'Tất cả' }))
                                }
                              >
                                Tất cả
                              </Menu.Item>
                              {filterOptions.locations.map(loc => (
                                <Menu.Item
                                  key={loc.id}
                                  value={loc.id}
                                  onClick={() =>
                                    setSelectedFilters(prev => ({ ...prev, location: loc.name }))
                                  }
                                >
                                  {loc.name}
                                </Menu.Item>
                              ))}
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>

                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <Button
                            variant='outline'
                            borderColor='#04113E'
                            color='#04113E'
                            borderRadius='6px'
                            px={5}
                            py={3}
                            gap={2}
                            fontWeight='700'
                            fontSize='14px'
                          >
                            <Icon size='md'>
                              <FaCar />
                            </Icon>
                            {selectedFilters.brand || 'Hãng xe'}
                            <Icon size='md'>
                              <HiOutlineChevronDown />
                            </Icon>
                          </Button>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              <Menu.Item
                                value='all'
                                onClick={() => setSelectedFilters(prev => ({ ...prev, brand: '' }))}
                              >
                                Tất cả
                              </Menu.Item>
                              {filterOptions.brands.map(brand => (
                                <Menu.Item
                                  key={brand.id}
                                  value={brand.id}
                                  onClick={() =>
                                    setSelectedFilters(prev => ({ ...prev, brand: brand.name }))
                                  }
                                >
                                  {brand.name}
                                </Menu.Item>
                              ))}
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>

                      <Button
                        bg='#204ED3'
                        color='white'
                        borderRadius='6px'
                        px={5}
                        py={3}
                        fontWeight='700'
                        fontSize='14px'
                        _hover={{ bg: '#1a3fb0' }}
                        type='submit'
                        disabled={uiState.isLoading}
                        loading={uiState.isLoading}
                      >
                        Tìm xe ngay
                      </Button>
                    </Flex>
                  </form>
                </Box>

                {/* Brand Logos */}
                <Box>
                  <HStack gap={4} overflowX='auto' py={2}>
                    {filterOptions.brands
                      .slice(0, DEFAULT_VALUES.BRAND_DISPLAY_LIMIT)
                      .map(brand => (
                        <Box
                          key={brand.id}
                          minW='120px'
                          p={2}
                          borderRadius='8px'
                          border='1px solid #E5E5E5'
                          textAlign='center'
                          cursor='pointer'
                          _hover={{ bg: 'gray.50' }}
                          onClick={() => {
                            setSelectedFilters(prev => ({ ...prev, brand: brand.name }))
                            setAppliedFilters(prev => ({ ...prev, brand: brand.name }))
                          }}
                        >
                          <Box
                            width='40px'
                            height='40px'
                            bg={brand.logoUrl ? 'transparent' : '#204ED3'}
                            borderRadius='4px'
                            mx='auto'
                            mb={2}
                            display='flex'
                            alignItems='center'
                            justifyContent='center'
                            color='white'
                            fontWeight='bold'
                          >
                            {brand.logoUrl ? (
                              <Image
                                src={brand.logoUrl}
                                alt={brand.name}
                                width='40px'
                                height='40px'
                                objectFit='contain'
                              />
                            ) : (
                              brand.name.charAt(0)
                            )}
                          </Box>
                          <Text fontSize='14px' fontWeight='700' color='#04113E'>
                            {brand.name}
                          </Text>
                        </Box>
                      ))}
                    <RouterLink to={PATHS.PRODUCTS} style={{ textDecoration: 'none' }}>
                      <Box
                        minW='120px'
                        p={2}
                        borderRadius='8px'
                        border='1px solid #E5E5E5'
                        textAlign='center'
                        cursor='pointer'
                        _hover={{ bg: 'gray.50' }}
                      >
                        <Box
                          width='40px'
                          height='36px'
                          mx='auto'
                          mb={2}
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          fontSize='20px'
                          fontWeight='700'
                          color='#171717'
                        >
                          +
                        </Box>
                        <Text fontSize='14px' fontWeight='700' color='#04113E'>
                          Xem thêm
                        </Text>
                      </Box>
                    </RouterLink>
                  </HStack>
                </Box>

                {/* Location Filter */}
                <VStack align='stretch' gap={2}>
                  <Text fontSize='16px' fontWeight='600' color='#04113E'>
                    Khu vực
                  </Text>
                  <HStack gap={4} wrap='wrap'>
                    <Button
                      size='sm'
                      bg={selectedFilters.location === 'Tất cả' ? '#204ED3' : '#F3F4F6'}
                      color={selectedFilters.location === 'Tất cả' ? 'white' : '#04113E'}
                      borderRadius='6px'
                      px={4}
                      py={1}
                      fontWeight='500'
                      fontSize='14px'
                      onClick={() => setSelectedFilters(prev => ({ ...prev, location: 'Tất cả' }))}
                      _hover={{
                        bg: selectedFilters.location === 'Tất cả' ? '#1a3fb0' : '#E5E7EB'
                      }}
                    >
                      Tất cả
                    </Button>
                    {filterOptions.locations.slice(0, LOCATION_DISPLAY_LIMIT).map(location => (
                      <Button
                        key={location.id}
                        size='sm'
                        bg={selectedFilters.location === location.name ? '#204ED3' : '#F3F4F6'}
                        color={selectedFilters.location === location.name ? 'white' : '#04113E'}
                        borderRadius='6px'
                        px={4}
                        py={1}
                        fontWeight='500'
                        fontSize='14px'
                        onClick={() =>
                          setSelectedFilters(prev => ({ ...prev, location: location.name }))
                        }
                        _hover={{
                          bg: selectedFilters.location === location.name ? '#1a3fb0' : '#E5E7EB'
                        }}
                      >
                        {location.name}
                      </Button>
                    ))}
                    {filterOptions.locations.length > LOCATION_DISPLAY_LIMIT && (
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <Button
                            size='sm'
                            bg='#F3F4F6'
                            color='#04113E'
                            borderRadius='6px'
                            px={4}
                            py={1}
                            fontWeight='500'
                            fontSize='14px'
                            _hover={{ bg: '#E5E7EB' }}
                          >
                            Xem thêm
                            <Icon size='xs' ml={1}>
                              <HiOutlineChevronDown />
                            </Icon>
                          </Button>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content maxH='300px' overflowY='auto'>
                              {filterOptions.locations
                                .slice(LOCATION_DISPLAY_LIMIT)
                                .map(location => (
                                  <Menu.Item
                                    key={location.id}
                                    value={location.id}
                                    onClick={() =>
                                      setSelectedFilters(prev => ({
                                        ...prev,
                                        location: location.name
                                      }))
                                    }
                                  >
                                    {location.name}
                                  </Menu.Item>
                                ))}
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    )}
                  </HStack>
                </VStack>

                {/* Year Filter */}
                <VStack align='stretch' gap={2}>
                  <Text fontSize='16px' fontWeight='600' color='#04113E'>
                    Năm sản xuất
                  </Text>
                  <HStack gap={4} wrap='wrap'>
                    {getYears().map(year => (
                      <Button
                        key={year}
                        size='sm'
                        bg={selectedFilters.year === year ? '#204ED3' : '#F3F4F6'}
                        color={selectedFilters.year === year ? 'white' : '#04113E'}
                        borderRadius='6px'
                        px={4}
                        py={1}
                        fontWeight='500'
                        fontSize='14px'
                        onClick={() => setSelectedFilters(prev => ({ ...prev, year }))}
                        _hover={{
                          bg: selectedFilters.year === year ? '#1a3fb0' : '#E5E7EB'
                        }}
                      >
                        {year}
                      </Button>
                    ))}
                  </HStack>
                </VStack>

                {/* Filter Buttons */}
                <HStack gap={5}>
                  <Button
                    bg='#204ED3'
                    color='white'
                    borderRadius='6px'
                    px={5}
                    py={3}
                    gap={2}
                    fontWeight='700'
                    fontSize='14px'
                    _hover={{ bg: '#1a3fb0' }}
                    onClick={applyFilters}
                  >
                    <Icon size='md'>
                      <HiOutlineAdjustmentsHorizontal />
                    </Icon>
                    Lọc
                  </Button>
                  <Button
                    variant='outline'
                    borderColor='#04113E'
                    color='#04113E'
                    borderRadius='6px'
                    px={5}
                    py={3}
                    gap={2}
                    fontWeight='700'
                    fontSize='14px'
                    onClick={clearFilters}
                  >
                    <Icon size='md'>
                      <HiOutlineTrash />
                    </Icon>
                    Xóa lọc
                  </Button>
                </HStack>
              </VStack>
            </Card.Root>

            {/* Results Header */}
            <Flex justify='space-between' align='center' mb={4}>
              <Text fontSize='20px' fontWeight='700' color='#04113E'>
                Tổng {uiState.totalCount} xe đang bán
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
                      const newSortBy = sortOption.value
                      setSelectedFilters(prev => ({ ...prev, sortBy: newSortBy }))
                      setAppliedFilters(prev => ({ ...prev, sortBy: newSortBy }))
                      setUiState(prev => ({ ...prev, currentPage: 1 }))
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
                      appliedFilters.sortBy === 'newest'
                        ? 'Tin mới nhất'
                        : appliedFilters.sortBy === 'price_asc'
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

            <VStack align='stretch' gap={4} mb={6}>
              {uiState.products.map(product => (
                <ProductCard key={product.id} product={product} showActions />
              ))}
            </VStack>

            {uiState.totalCount > ITEMS_PER_PAGE && (
              <Flex justify='center' mt={6} mb={6}>
                <Pagination.Root
                  count={uiState.totalCount}
                  pageSize={ITEMS_PER_PAGE}
                  page={uiState.currentPage}
                  onPageChange={e => setUiState(prev => ({ ...prev, currentPage: e.page }))}
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
                          variant={uiState.currentPage === page.value ? 'outline' : 'ghost'}
                          onClick={() => setUiState(prev => ({ ...prev, currentPage: page.value }))}
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
