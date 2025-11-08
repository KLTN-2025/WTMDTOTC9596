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
  NativeSelect,
  Text,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
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
import type { Product, ProductFilters } from '@/types/products'
import { AboutSection } from '@/components/common/AboutSection'
import { formatTimeAgo } from '@/utils/date'

const searchSchema = z.object({
  q: z.string().trim().max(200).optional().or(z.literal(''))
})

const carBrands = [
  { name: 'Toyota', logo: 'T' },
  { name: 'Ford', logo: 'F' },
  { name: 'Mitsubishi', logo: 'M' },
  { name: 'Hyundai', logo: 'H' },
  { name: 'Honda', logo: 'H' },
  { name: 'Mazda', logo: 'M' }
]

const locations = [
  'Tất cả',
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Cần Thơ',
  'Bình Dương',
  'An Giang',
  'Xem thêm'
]
const years = ['Tất cả', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', 'Xem thêm']

export function Products() {
  const [selectedLocation, setSelectedLocation] = useState('Tất cả')
  const [selectedYear, setSelectedYear] = useState('Tất cả')
  const [vehicleStatus, setVehicleStatus] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string[]>([])
  const [style, setStyle] = useState<string[]>([])
  const [seats, setSeats] = useState<string[]>([])
  const [fuel, setFuel] = useState<string[]>([])
  const [transmission, setTransmission] = useState<string[]>([])
  const [color, setColor] = useState<string[]>([])
  const [origin, setOrigin] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  const { register, handleSubmit, watch } = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { q: '' }
  })
  const q = watch('q') || ''

  const mappedPriceRange = useMemo(() => {
    return priceRange
      .map(label => {
        if (label === 'Dưới 300 triệu') return { min: 0, max: 300_000_000 }
        if (label === '300 - 500 triệu') return { min: 300_000_000, max: 500_000_000 }
        if (label === '500 - 700 triệu') return { min: 500_000_000, max: 700_000_000 }
        if (label === '700 triệu - 1 tỷ') return { min: 700_000_000, max: 1_000_000_000 }
        if (label === '1 tỷ - 2 tỷ') return { min: 1_000_000_000, max: 2_000_000_000 }
        if (label === 'Trên 2 tỷ') return { min: 2_000_000_000, max: Number.MAX_SAFE_INTEGER }
        return null
      })
      .filter(Boolean) as { min: number; max: number }[]
  }, [priceRange])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const filters: ProductFilters = {
        ...(q && { q }),
        ...(selectedLocation !== 'Tất cả' && { location: selectedLocation }),
        ...(selectedYear !== 'Tất cả' && { year: selectedYear }),
        ...(vehicleStatus.length > 0 && { conditionTypes: vehicleStatus }),
        ...(fuel.length > 0 && { fuels: fuel }),
        ...(transmission.length > 0 && { transmissions: transmission }),
        ...(color.length > 0 && { colors: color }),
        ...(origin.length > 0 && { origins: origin }),
        ...(style.length > 0 && { bodyStyles: style }),
        ...(mappedPriceRange.length > 0 && { priceRange: mappedPriceRange }),
        sortBy
      }

      const { data, error } = await getProducts(filters)
      if (error) {
        toaster.create({ title: 'Lỗi tải dữ liệu', description: error.message, type: 'error' })
        setProducts([])
        return
      }
      setProducts(data ?? [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    q,
    selectedLocation,
    selectedYear,
    vehicleStatus,
    priceRange,
    style,
    seats,
    fuel,
    transmission,
    color,
    origin,
    sortBy
  ])

  const toggleFilter = (value: string, setter: (value: string[]) => void, current: string[]) => {
    if (current.includes(value)) {
      setter(current.filter(item => item !== value))
    } else {
      setter([...current, value])
    }
  }

  return (
    <Box bg='#F8FAFC' minH='100vh'>
      <Container maxW='1200px' px={4} py={6}>
        {/* Breadcrumb */}
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
                <Box bg='white' border='1px solid #E5E5E5' borderRadius='12px' p={2}>
                  <form onSubmit={handleSubmit(() => fetchProducts())}>
                    <Flex gap={4} direction={{ base: 'column', md: 'row' }} align='flex-end'>
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
                          pl={4}
                          _focus={{ boxShadow: 'none' }}
                          {...register('q')}
                        />
                      </InputGroup>

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
                        Chọn khu vực
                        <Icon size='md'>
                          <HiOutlineChevronDown />
                        </Icon>
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
                      >
                        <Icon size='md'>
                          <FaCar />
                        </Icon>
                        Hãng xe
                        <Icon size='md'>
                          <HiOutlineChevronDown />
                        </Icon>
                      </Button>

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
                        disabled={isLoading}
                        loading={isLoading}
                      >
                        Tìm xe ngay
                      </Button>
                    </Flex>
                  </form>
                </Box>

                {/* Brand Logos */}
                <Box>
                  <HStack gap={4} overflowX='auto' py={2}>
                    {carBrands.map((brand, index) => (
                      <Box
                        key={index}
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
                          height='40px'
                          bg='#204ED3'
                          borderRadius='4px'
                          mx='auto'
                          mb={2}
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          color='white'
                          fontWeight='bold'
                        >
                          {brand.logo}
                        </Box>
                        <Text fontSize='14px' fontWeight='700' color='#04113E'>
                          {brand.name}
                        </Text>
                      </Box>
                    ))}
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
                  </HStack>
                </Box>

                {/* Location Filter */}
                <VStack align='stretch' gap={2}>
                  <Text fontSize='16px' fontWeight='600' color='#04113E'>
                    Khu vực
                  </Text>
                  <HStack gap={4} wrap='wrap'>
                    {locations.map(location => (
                      <Button
                        key={location}
                        size='sm'
                        bg={selectedLocation === location ? '#204ED3' : '#F3F4F6'}
                        color={selectedLocation === location ? 'white' : '#04113E'}
                        borderRadius='6px'
                        px={4}
                        py={1}
                        fontWeight='500'
                        fontSize='14px'
                        onClick={() => setSelectedLocation(location)}
                        _hover={{
                          bg: selectedLocation === location ? '#1a3fb0' : '#E5E7EB'
                        }}
                      >
                        {location}
                      </Button>
                    ))}
                  </HStack>
                </VStack>

                {/* Year Filter */}
                <VStack align='stretch' gap={2}>
                  <Text fontSize='16px' fontWeight='600' color='#04113E'>
                    Năm sản xuất
                  </Text>
                  <HStack gap={4} wrap='wrap'>
                    {years.map(year => (
                      <Button
                        key={year}
                        size='sm'
                        bg={selectedYear === year ? '#204ED3' : '#F3F4F6'}
                        color={selectedYear === year ? 'white' : '#04113E'}
                        borderRadius='6px'
                        px={4}
                        py={1}
                        fontWeight='500'
                        fontSize='14px'
                        onClick={() => setSelectedYear(year)}
                        _hover={{
                          bg: selectedYear === year ? '#1a3fb0' : '#E5E7EB'
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
                Tổng 1202 xe đang bán
              </Text>
              <HStack gap={5}>
                <Text fontSize='18px' fontWeight='400' color='#737373'>
                  Xắp xếp theo
                </Text>
                <NativeSelect.Root
                  size='md'
                  maxW='200px'
                  onChange={e => {
                    const v = (e.target as HTMLSelectElement).value
                    if (v === 'Tin mới nhất') setSortBy('newest')
                    if (v === 'Giá tăng dần') setSortBy('price_asc')
                    if (v === 'Giá giảm dần') setSortBy('price_desc')
                  }}
                >
                  <NativeSelect.Field
                    bg='white'
                    borderColor='#E5E5E5'
                    borderRadius='8px'
                    px={4}
                    py={2}
                  >
                    <option>Tin mới nhất</option>
                    <option>Giá tăng dần</option>
                    <option>Giá giảm dần</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </HStack>
            </Flex>

            {/* Product List */}
            <VStack align='stretch' gap={4} mb={6}>
              {products.map(product => (
                <RouterLink
                  key={product.id}
                  to={`/products/${product.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card.Root
                    bg='white'
                    borderRadius='16px'
                    overflow='hidden'
                    direction={{ base: 'column', md: 'row' }}
                    cursor='pointer'
                    _hover={{ boxShadow: 'lg' }}
                  >
                    <Box
                      width={{ base: '100%', md: '250px' }}
                      height={{ base: '200px', md: '231px' }}
                      position='relative'
                      flexShrink={0}
                    >
                      <Image
                        src={product.image}
                        alt={product.title}
                        width='100%'
                        height='100%'
                        objectFit='cover'
                      />
                      <Badge
                        position='absolute'
                        top={4}
                        left={4}
                        bg='rgba(0,0,0,0.3)'
                        color='white'
                        borderRadius='100px'
                        px={4}
                        py={1}
                        gap={2}
                      >
                        <Icon size='sm'>
                          <HiOutlineSearch />
                        </Icon>
                        {product.imageCount}
                      </Badge>
                    </Box>

                    <Card.Body p={4} flex={1}>
                      <VStack align='stretch' gap={3}>
                        <Text
                          fontSize='16px'
                          fontWeight='700'
                          color='#04113E'
                          textTransform='uppercase'
                        >
                          {product.title}
                        </Text>

                        <HStack gap={4} wrap='wrap'>
                          <HStack gap={1}>
                            <Icon size='sm' color='#A1A1A1'>
                              <FaCar />
                            </Icon>
                            <Text fontSize='14px' color='#A1A1A1'>
                              {product.bodyStyles?.name || 'N/A'}
                            </Text>
                          </HStack>
                          <HStack gap={1}>
                            <Icon size='sm' color='#A1A1A1'>
                              <FaGasPump />
                            </Icon>
                            <Text fontSize='14px' color='#A1A1A1'>
                              {product.fuels?.name || 'N/A'}
                            </Text>
                          </HStack>
                          <HStack gap={1}>
                            <Icon size='sm' color='#A1A1A1'>
                              <FaCog />
                            </Icon>
                            <Text fontSize='14px' color='#A1A1A1'>
                              {product.transmissions?.name || 'N/A'}
                            </Text>
                          </HStack>
                        </HStack>

                        <HStack gap={2}>
                          <Text fontSize='20px' fontWeight='700' color='#204ED3'>
                            {new Intl.NumberFormat('vi-VN').format(product.price)}
                          </Text>
                          <Text fontSize='16px' fontWeight='700' color='#04113E'>
                            VNĐ
                          </Text>
                        </HStack>

                        <Box borderTop='1px solid #E5E7EB' pt={3}>
                          <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
                            <Text fontSize='14px' color='#A1A1A1'>
                              {formatTimeAgo(product.createdAt)}
                            </Text>
                            <Badge
                              bg='#9CA3AF'
                              color='white'
                              borderRadius='9999px'
                              px={2}
                              py={1}
                              fontSize='xs'
                            >
                              {product.locations?.name || 'N/A'}
                            </Badge>
                          </Flex>
                        </Box>

                        {/* Dealer Info */}
                        <Box borderTop='1px solid #E5E7EB' pt={3}>
                          <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
                            <HStack gap={2}>
                              {product.seller?.storeLogo && (
                                <Image
                                  src={product.seller.storeLogo}
                                  alt={product.seller.storeName}
                                  width='32px'
                                  height='32px'
                                  borderRadius='full'
                                />
                              )}
                              <Text fontSize='14px' fontWeight='600' color='#1B2C5D'>
                                {product.seller?.storeName || 'N/A'}
                              </Text>
                            </HStack>
                            <HStack gap={4}>
                              <VStack gap={0} align='flex-start'>
                                <Text fontSize='12px' color='#4B5563'>
                                  Đang bán
                                </Text>
                                <Text fontSize='18px' fontWeight='700' color='#4B5563'>
                                  {product.statsSelling}
                                </Text>
                              </VStack>
                              <VStack gap={0} align='flex-start'>
                                <Text fontSize='12px' color='#4B5563'>
                                  Đã bán
                                </Text>
                                <Text fontSize='18px' fontWeight='700' color='#4B5563'>
                                  {product.statsSold}
                                </Text>
                              </VStack>
                            </HStack>
                          </Flex>
                          <HStack gap={2} mt={3}>
                            <Button
                              variant='outline'
                              borderColor='#E5E5E5'
                              color='#1B2C5D'
                              borderRadius='6px'
                              px={4}
                              py={2}
                              fontSize='14px'
                              flex={1}
                            >
                              📞 0933.******
                            </Button>
                            <Button
                              variant='outline'
                              borderColor='#E5E5E5'
                              color='#171717'
                              borderRadius='6px'
                              px={4}
                              py={2}
                              fontSize='14px'
                              flex={1}
                            >
                              💬 Chat
                            </Button>
                            <Button
                              bg='#204ED3'
                              color='white'
                              borderRadius='6px'
                              px={4}
                              py={2}
                              fontSize='14px'
                              flex={1}
                              _hover={{ bg: '#1a3fb0' }}
                            >
                              Đặt hẹn lái thử
                            </Button>
                          </HStack>
                        </Box>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                </RouterLink>
              ))}
            </VStack>

            {/* Pagination */}
            <Flex justify='center' gap={4} mb={6}>
              <Button
                variant='outline'
                borderColor='#E5E5E5'
                color='#04113E'
                borderRadius='6px'
                px={4}
                py={2}
                fontSize='14px'
                fontWeight='500'
              >
                ←
              </Button>
              <Button
                bg='#204ED3'
                color='white'
                borderRadius='6px'
                px={4}
                py={2}
                fontSize='14px'
                fontWeight='500'
                _hover={{ bg: '#1a3fb0' }}
              >
                1
              </Button>
              {[2, 3, 4, 5, 6, 7, 8].map(page => (
                <Button
                  key={page}
                  variant='outline'
                  borderColor='#E5E5E5'
                  color='#04113E'
                  borderRadius='6px'
                  px={4}
                  py={2}
                  fontSize='14px'
                  fontWeight='500'
                >
                  {page}
                </Button>
              ))}
              <Button
                variant='outline'
                borderColor='#E5E5E5'
                color='#04113E'
                borderRadius='6px'
                px={4}
                py={2}
                fontSize='14px'
                fontWeight='500'
              >
                ...
              </Button>
              <Button
                variant='outline'
                borderColor='#E5E5E5'
                color='#04113E'
                borderRadius='6px'
                px={4}
                py={2}
                fontSize='14px'
                fontWeight='500'
              >
                →
              </Button>
            </Flex>
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
                      {['Xe cũ', 'Xe mới'].map(status => (
                        <HStack key={status} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={vehicleStatus.includes(status)}
                            onCheckedChange={() =>
                              toggleFilter(status, setVehicleStatus, vehicleStatus)
                            }
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
                      {[
                        'Dưới 300 triệu',
                        '300 - 500 triệu',
                        '500 - 700 triệu',
                        '700 triệu - 1 tỷ',
                        '1 tỷ - 2 tỷ',
                        'Trên 2 tỷ'
                      ].map(price => (
                        <HStack key={price} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={priceRange.includes(price)}
                            onCheckedChange={() => toggleFilter(price, setPriceRange, priceRange)}
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
                      {[
                        'Hatchback',
                        'MPV',
                        'Sedan',
                        'SUV',
                        'Pickup',
                        'CUV',
                        'Coupe',
                        'Van/Minibus',
                        'Xe tải',
                        'Xe du lịch',
                        'Xe khách'
                      ].map(st => (
                        <HStack key={st} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={style.includes(st)}
                            onCheckedChange={() => toggleFilter(st, setStyle, style)}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {st}
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
                      {[
                        '2 chỗ',
                        '3 chỗ',
                        '4 chỗ',
                        '5 chỗ',
                        '7 chỗ',
                        '8 chỗ',
                        '9 chỗ',
                        '16 chỗ',
                        '29 chỗ',
                        '47 chỗ'
                      ].map(seat => (
                        <HStack key={seat} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={seats.includes(seat)}
                            onCheckedChange={() => toggleFilter(seat, setSeats, seats)}
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
                      {['Xăng', 'Dầu', 'Điện', 'Hybrid', 'Plug-in hybrid'].map(f => (
                        <HStack key={f} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={fuel.includes(f)}
                            onCheckedChange={() => toggleFilter(f, setFuel, fuel)}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {f}
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
                      {['Số tự động', 'Số sàn', 'Số hỗn hợp'].map(trans => (
                        <HStack key={trans} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={transmission.includes(trans)}
                            onCheckedChange={() =>
                              toggleFilter(trans, setTransmission, transmission)
                            }
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {trans}
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
                      {[
                        'Đen',
                        'Đỏ',
                        'Trắng',
                        'Bạc',
                        'Xanh',
                        'Xám',
                        'Nâu',
                        'Cam',
                        'Vàng',
                        'Đồng',
                        'Hồng'
                      ].map(c => (
                        <HStack key={c} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={color.includes(c)}
                            onCheckedChange={() => toggleFilter(c, setColor, color)}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control borderRadius='8px' />
                          </Checkbox.Root>
                          <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                            {c}
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
                      {['Nhập khẩu', 'Việt Nam'].map(o => (
                        <HStack key={o} gap={2} py={0.5}>
                          <Checkbox.Root
                            checked={origin.includes(o)}
                            onCheckedChange={() => toggleFilter(o, setOrigin, origin)}
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
          <Image
            src='https://via.placeholder.com/1200x150'
            alt='Banner'
            width='100%'
            height='100%'
            objectFit='cover'
          />
        </Box>

        {/* About Section */}
        <AboutSection />
      </Container>
    </Box>
  )
}
