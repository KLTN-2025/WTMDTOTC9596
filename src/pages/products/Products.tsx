import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapsible,
  Container,
  Flex,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  Menu,
  NativeSelect,
  Portal,
  Text,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router'
import { HiOutlineMapPin, HiOutlineChevronDown, HiOutlineTrash } from 'react-icons/hi2'
import { HiOutlineSearch } from 'react-icons/hi'
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2'
import { FaCar, FaGasPump, FaCog } from 'react-icons/fa'
import { HiOutlineChevronRight } from 'react-icons/hi2'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toaster } from '@/components/ui/toaster'
import { getProducts } from '@/api/products'
import type { Product, ProductFilters, Brand } from '@/types/products'
import { useMasterData } from '@/hooks/useMasterData'
import { AboutSection } from '@/components/common/AboutSection'
import { formatTimeAgo } from '@/utils/date'
import banner from '@/assets/images/banner.png'
import { PATHS } from '@/configs/paths'
import { DEFAULT_VALUES } from '@/configs/constants'
import { PRICE_RANGES, VEHICLE_STATUSES, SEATS, ORIGINS, getYears } from '@/mocks/filters'
import { PRICE_RANGE_MAP, SORT_OPTIONS } from '@/mocks/products'

const searchSchema = z.object({
  q: z.string().trim().max(200).optional().or(z.literal(''))
})

const ITEMS_PER_PAGE = 12
const LOCATION_DISPLAY_LIMIT = 5

export function Products() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
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
        toaster.create({ title: 'Lỗi tải dữ liệu', description: error.message, type: 'error' })
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

  const toggleFilter = (
    value: string,
    filterKey: keyof typeof selectedFilters,
    isArray: boolean = true
  ) => {
    if (isArray) {
      const current = selectedFilters[filterKey] as string[]
      setSelectedFilters(prev => ({
        ...prev,
        [filterKey]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      }))
    }
  }

  return (
    <Box bg='#F8FAFC' minH='100vh'>
      <Container maxW='1200px' px={4} py={6}>
        {/* Breadcrumb */}
        <HStack gap={2} mb={4}>
          <RouterLink to={PATHS.HOME}>
            <Text fontSize='14px' fontWeight='600' color='#1B2C5D'>
              Trang chủ
            </Text>
          </RouterLink>
          <Icon size='md' color='#B6B6B6'>
            <HiOutlineChevronDown style={{ transform: 'rotate(-90deg)' }} />
          </Icon>
          <Text fontSize='14px' fontWeight='400' color='#6B7280'>
            Mua xe
          </Text>
        </HStack>

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

            {/* Product List */}
            <VStack align='stretch' gap={4} mb={6}>
              {uiState.products.map(product => (
                <Card.Root
                  key={product.id}
                  bg='white'
                  borderRadius='16px'
                  overflow='hidden'
                  display='flex'
                  flexDirection='row'
                  cursor='pointer'
                  _hover={{ boxShadow: 'lg' }}
                  mb={4}
                  minH='200px'
                  onClick={() => navigate(PATHS.PRODUCT_DETAIL(product.id))}
                >
                  <Box
                    width='40%'
                    flex='0 0 40%'
                    position='relative'
                    flexShrink={0}
                    minH='200px'
                    maxH='300px'
                  >
                    {product.mediaUrls?.[0] && (
                      <Image
                        src={product.mediaUrls[0]}
                        alt={product.title}
                        width='100%'
                        height='100%'
                        objectFit='cover'
                        minH='200px'
                      />
                    )}
                    <Badge
                      position='absolute'
                      top={3}
                      left={3}
                      bg='rgba(0,0,0,0.5)'
                      color='white'
                      borderRadius='100px'
                      px={3}
                      py={1}
                      gap={1}
                      display='flex'
                      alignItems='center'
                      fontSize='xs'
                    >
                      <Icon size='xs'>
                        <HiOutlineSearch />
                      </Icon>
                      {product.imageCount}
                    </Badge>
                  </Box>

                  <Card.Body
                    p={4}
                    width='60%'
                    flex='0 0 60%'
                    flexShrink={0}
                    display='flex'
                    flexDirection='column'
                    justifyContent='space-between'
                  >
                    <VStack align='stretch' gap={2} flex={1}>
                      <Text
                        fontSize='16px'
                        fontWeight='700'
                        color='#04113E'
                        textTransform='uppercase'
                        lineHeight='1.4'
                        css={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {product.title}
                      </Text>

                      <HStack gap={3} wrap='wrap' fontSize='12px'>
                        <HStack gap={1}>
                          <Icon size='xs' color='#A1A1A1'>
                            <FaCar />
                          </Icon>
                          <Text fontSize='12px' color='#A1A1A1'>
                            {product.bodyStyles?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                          </Text>
                        </HStack>
                        <HStack gap={1}>
                          <Icon size='xs' color='#A1A1A1'>
                            <FaGasPump />
                          </Icon>
                          <Text fontSize='12px' color='#A1A1A1'>
                            {product.fuels?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                          </Text>
                        </HStack>
                        <HStack gap={1}>
                          <Icon size='xs' color='#A1A1A1'>
                            <FaCog />
                          </Icon>
                          <Text fontSize='12px' color='#A1A1A1'>
                            {product.transmissions?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                          </Text>
                        </HStack>
                      </HStack>

                      <HStack gap={2} mt='auto'>
                        <Text fontSize='20px' fontWeight='700' color='#204ED3'>
                          {new Intl.NumberFormat('vi-VN').format(product.price)}
                        </Text>
                        <Text fontSize='14px' fontWeight='700' color='#04113E'>
                          VNĐ
                        </Text>
                      </HStack>

                      <Flex
                        justify='space-between'
                        align='center'
                        wrap='wrap'
                        gap={2}
                        fontSize='12px'
                        mt={2}
                      >
                        <Text fontSize='12px' color='#A1A1A1'>
                          {formatTimeAgo(product.createdAt)}
                        </Text>
                        <Badge
                          bg='#9CA3AF'
                          color='white'
                          borderRadius='9999px'
                          px={2}
                          py={0.5}
                          fontSize='xs'
                        >
                          {product.locations?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                        </Badge>
                      </Flex>

                      <Box borderTop='1px solid #E5E7EB' pt={2} mt={2}>
                        <Flex justify='space-between' align='center' wrap='wrap' gap={2}>
                          <HStack gap={2}>
                            {product.seller?.storeLogo && (
                              <Image
                                src={product.seller.storeLogo}
                                alt={product.seller.storeName}
                                width='24px'
                                height='24px'
                                borderRadius='full'
                              />
                            )}
                            <Text fontSize='12px' fontWeight='600' color='#1B2C5D'>
                              {product.seller?.storeName || DEFAULT_VALUES.NOT_AVAILABLE}
                            </Text>
                          </HStack>
                          <HStack gap={3}>
                            <VStack gap={0} align='flex-start'>
                              <Text fontSize='10px' color='#4B5563'>
                                Đang bán
                              </Text>
                              <Text fontSize='14px' fontWeight='700' color='#4B5563'>
                                {product.statsSelling || 0}
                              </Text>
                            </VStack>
                            <VStack gap={0} align='flex-start'>
                              <Text fontSize='10px' color='#4B5563'>
                                Đã bán
                              </Text>
                              <Text fontSize='14px' fontWeight='700' color='#4B5563'>
                                {product.statsSold || 0}
                              </Text>
                            </VStack>
                          </HStack>
                        </Flex>
                        <HStack gap={2} mt={2}>
                          <Button
                            variant='outline'
                            borderColor='#E5E5E5'
                            color='#1B2C5D'
                            borderRadius='6px'
                            px={3}
                            py={1.5}
                            fontSize='12px'
                            flex={1}
                          >
                            📞 0933.******
                          </Button>
                          <Button
                            variant='outline'
                            borderColor='#E5E5E5'
                            color='#171717'
                            borderRadius='6px'
                            px={3}
                            py={1.5}
                            fontSize='12px'
                            flex={1}
                          >
                            💬 Chat
                          </Button>
                          <Button
                            bg='#204ED3'
                            color='white'
                            borderRadius='6px'
                            px={3}
                            py={1.5}
                            fontSize='12px'
                            flex={1}
                            _hover={{ bg: '#1a3fb0' }}
                            onClick={e => {
                              e.stopPropagation()
                              navigate(PATHS.PRODUCT_BOOKING(product.id))
                            }}
                          >
                            Đặt hẹn lái thử
                          </Button>
                        </HStack>
                      </Box>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>

            {/* Pagination */}
            {uiState.totalCount > 0 && (
              <Flex justify='center' gap={2} mb={6} flexWrap='wrap'>
                <Button
                  variant='outline'
                  borderColor='#E5E5E5'
                  color='#04113E'
                  borderRadius='6px'
                  px={4}
                  py={2}
                  fontSize='14px'
                  fontWeight='500'
                  disabled={uiState.currentPage === 1}
                  onClick={() =>
                    setUiState(prev => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1)
                    }))
                  }
                  _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                >
                  ←
                </Button>
                {(() => {
                  const totalPages = Math.ceil(uiState.totalCount / ITEMS_PER_PAGE)
                  const pages: (number | string)[] = []

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    if (uiState.currentPage <= 3) {
                      for (let i = 1; i <= 4; i++) {
                        pages.push(i)
                      }
                      pages.push('...')
                      pages.push(totalPages)
                    } else if (uiState.currentPage >= totalPages - 2) {
                      pages.push(1)
                      pages.push('...')
                      for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i)
                      }
                    } else {
                      pages.push(1)
                      pages.push('...')
                      for (let i = uiState.currentPage - 1; i <= uiState.currentPage + 1; i++) {
                        pages.push(i)
                      }
                      pages.push('...')
                      pages.push(totalPages)
                    }
                  }

                  return pages.map((page, index) => {
                    if (page === '...') {
                      return (
                        <Button
                          key={`ellipsis-${index}`}
                          variant='outline'
                          borderColor='transparent'
                          color='#04113E'
                          borderRadius='6px'
                          px={4}
                          py={2}
                          fontSize='14px'
                          fontWeight='500'
                          disabled
                          _disabled={{ opacity: 0.5, cursor: 'default' }}
                        >
                          ...
                        </Button>
                      )
                    }
                    return (
                      <Button
                        key={page}
                        bg={uiState.currentPage === page ? '#204ED3' : 'transparent'}
                        color={uiState.currentPage === page ? 'white' : '#04113E'}
                        borderColor={uiState.currentPage === page ? '#204ED3' : '#E5E5E5'}
                        borderRadius='6px'
                        px={4}
                        py={2}
                        fontSize='14px'
                        fontWeight='500'
                        _hover={{ bg: uiState.currentPage === page ? '#1a3fb0' : 'gray.50' }}
                        onClick={() =>
                          setUiState(prev => ({ ...prev, currentPage: page as number }))
                        }
                      >
                        {page}
                      </Button>
                    )
                  })
                })()}
                <Button
                  variant='outline'
                  borderColor='#E5E5E5'
                  color='#04113E'
                  borderRadius='6px'
                  px={4}
                  py={2}
                  fontSize='14px'
                  fontWeight='500'
                  disabled={uiState.currentPage >= Math.ceil(uiState.totalCount / ITEMS_PER_PAGE)}
                  onClick={() =>
                    setUiState(prev => ({
                      ...prev,
                      currentPage: Math.min(
                        Math.ceil(uiState.totalCount / ITEMS_PER_PAGE),
                        prev.currentPage + 1
                      )
                    }))
                  }
                  _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                >
                  →
                </Button>
              </Flex>
            )}
          </Box>

          {/* Sidebar Filters */}
          <Box width='280px' flexShrink={0} display={{ base: 'none', lg: 'block' }}>
            <VStack align='stretch' gap={4}>
              {/* Trạng thái xe */}
              <Card.Root
                bg='white'
                borderRadius='8px'
                border='1px solid #F0F0F0'
                boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
              >
                <Collapsible.Root defaultOpen>
                  <Collapsible.Trigger
                    px={4}
                    py={3}
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    width='100%'
                    bg='white'
                    borderRadius='8px 8px 0px 0px'
                  >
                    <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
                      Trạng thái xe
                    </Text>
                    <Collapsible.Indicator>
                      <Icon size='md'>
                        <HiOutlineChevronRight />
                      </Icon>
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align='stretch' gap={2} px={4} pb={4}>
                      {VEHICLE_STATUSES.map(status => (
                        <HStack key={status} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={selectedFilters.vehicleStatus.includes(status)}
                            onCheckedChange={() => toggleFilter(status, 'vehicleStatus')}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {status}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>

              {/* Khoảng giá */}
              <Card.Root
                bg='white'
                borderRadius='8px'
                border='1px solid #F0F0F0'
                boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
              >
                <Collapsible.Root>
                  <Collapsible.Trigger
                    px={4}
                    py={3}
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    width='100%'
                    bg='white'
                  >
                    <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
                      Khoảng giá
                    </Text>
                    <Collapsible.Indicator>
                      <Icon size='md'>
                        <HiOutlineChevronRight />
                      </Icon>
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align='stretch' gap={2} px={4} pb={4}>
                      {PRICE_RANGES.map(price => (
                        <HStack key={price} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={selectedFilters.priceRange.includes(price)}
                            onCheckedChange={() => toggleFilter(price, 'priceRange')}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {price}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>

              {/* Kiểu dáng */}
              <Card.Root
                bg='white'
                borderRadius='8px'
                border='1px solid #F0F0F0'
                boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
              >
                <Collapsible.Root>
                  <Collapsible.Trigger
                    px={4}
                    py={3}
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    width='100%'
                    bg='white'
                  >
                    <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
                      Kiểu dáng
                    </Text>
                    <Collapsible.Indicator>
                      <Icon size='md'>
                        <HiOutlineChevronRight />
                      </Icon>
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align='stretch' gap={2} px={4} pb={4}>
                      {filterOptions.bodyStyles.map(bs => (
                        <HStack key={bs.id} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={selectedFilters.style.includes(bs.name)}
                            onCheckedChange={() => toggleFilter(bs.name, 'style')}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {bs.name}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>

              {/* Số chỗ ngồi */}
              <Card.Root
                bg='white'
                borderRadius='8px'
                border='1px solid #F0F0F0'
                boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
              >
                <Collapsible.Root>
                  <Collapsible.Trigger
                    px={4}
                    py={3}
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    width='100%'
                    bg='white'
                  >
                    <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
                      Số chỗ ngồi
                    </Text>
                    <Collapsible.Indicator>
                      <Icon size='md'>
                        <HiOutlineChevronRight />
                      </Icon>
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align='stretch' gap={2} px={4} pb={4}>
                      {SEATS.map(seat => (
                        <HStack key={seat} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={selectedFilters.seats.includes(seat)}
                            onCheckedChange={() => toggleFilter(seat, 'seats')}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {seat}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>

              {/* Nhiên liệu */}
              <Card.Root
                bg='white'
                borderRadius='8px'
                border='1px solid #F0F0F0'
                boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
              >
                <Collapsible.Root>
                  <Collapsible.Trigger
                    px={4}
                    py={3}
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    width='100%'
                    bg='white'
                  >
                    <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
                      Nhiên liệu
                    </Text>
                    <Collapsible.Indicator>
                      <Icon size='md'>
                        <HiOutlineChevronRight />
                      </Icon>
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align='stretch' gap={2} px={4} pb={4}>
                      {filterOptions.fuels.map(f => (
                        <HStack key={f.id} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={selectedFilters.fuel.includes(f.name)}
                            onCheckedChange={() => toggleFilter(f.name, 'fuel')}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {f.name}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>

              {/* Hộp số */}
              <Card.Root
                bg='white'
                borderRadius='8px'
                border='1px solid #F0F0F0'
                boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
              >
                <Collapsible.Root>
                  <Collapsible.Trigger
                    px={4}
                    py={3}
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    width='100%'
                    bg='white'
                  >
                    <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
                      Hộp số
                    </Text>
                    <Collapsible.Indicator>
                      <Icon size='md'>
                        <HiOutlineChevronRight />
                      </Icon>
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align='stretch' gap={2} px={4} pb={4}>
                      {filterOptions.transmissions.map(trans => (
                        <HStack key={trans.id} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={selectedFilters.transmission.includes(trans.name)}
                            onCheckedChange={() => toggleFilter(trans.name, 'transmission')}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {trans.name}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>

              {/* Màu sắc */}
              <Card.Root
                bg='white'
                borderRadius='8px'
                border='1px solid #F0F0F0'
                boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
              >
                <Collapsible.Root>
                  <Collapsible.Trigger
                    px={4}
                    py={3}
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    width='100%'
                    bg='white'
                  >
                    <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
                      Màu sắc
                    </Text>
                    <Collapsible.Indicator>
                      <Icon size='md'>
                        <HiOutlineChevronRight />
                      </Icon>
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align='stretch' gap={2} px={4} pb={4}>
                      {filterOptions.colors.map(c => (
                        <HStack key={c.id} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={selectedFilters.color.includes(c.name)}
                            onCheckedChange={() => toggleFilter(c.name, 'color')}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {c.name}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>

              {/* Xuất xứ */}
              <Card.Root
                bg='white'
                borderRadius='8px'
                border='1px solid #F0F0F0'
                boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
              >
                <Collapsible.Root>
                  <Collapsible.Trigger
                    px={4}
                    py={3}
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    width='100%'
                    bg='white'
                    borderRadius='0px 0px 8px 8px'
                  >
                    <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
                      Xuất xứ
                    </Text>
                    <Collapsible.Indicator>
                      <Icon size='md'>
                        <HiOutlineChevronRight />
                      </Icon>
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align='stretch' gap={2} px={4} pb={4}>
                      {ORIGINS.map(o => (
                        <HStack key={o} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={selectedFilters.origin.includes(o)}
                            onCheckedChange={() => toggleFilter(o, 'origin')}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {o}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Root>
            </VStack>
          </Box>
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
