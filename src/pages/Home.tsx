import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  Menu,
  Portal,
  SimpleGrid,
  Text,
  VStack
} from '@chakra-ui/react'
import { HiOutlineMapPin, HiOutlineChevronDown } from 'react-icons/hi2'
import { HiOutlineSearch } from 'react-icons/hi'
import {
  FaCheckCircle,
  FaHandHoldingUsd,
  FaMoneyBillWave,
  FaCar,
  FaGasPump,
  FaCog,
  FaStore
} from 'react-icons/fa'
import { AboutSection } from '@/components/common/AboutSection'
import { NewCarModelsSection } from '@/components/common/NewCarModelsSection'
import { useEffect, useState } from 'react'
import { getRecentProducts } from '@/api/products'
import type { Brand, Product } from '@/types/products'
import { useMasterData } from '@/hooks/useMasterData'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import heroBackgroundCar from '@/assets/images/hero/hero-background-car.png'
import heroMainCar from '@/assets/images/hero/vehicle.png'
import logo from '@/assets/images/logo.png'
import { SellCarSection } from '@/components/common/SellCarSection.tsx'
import banner from '@/assets/images/banner.png'
import { formatTimeAgo } from '@/utils/date'
import { Link as RouterLink, useNavigate } from 'react-router'
import background from '@/assets/images/image.png'
import { PATHS } from '@/configs/paths'
import { DEFAULT_VALUES } from '@/configs/constants'
import { useToast } from '@/hooks/useToast'

const searchSchema = z.object({ q: z.string().trim().max(200).optional().or(z.literal('')) })

const buildProductsPath = (params?: {
  q?: string
  location?: string
  brand?: string
  status?: string
}) => {
  if (!params) return PATHS.PRODUCTS

  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.location) searchParams.set('location', params.location)
  if (params.brand) searchParams.set('brand', params.brand)
  if (params.status) searchParams.set('status', params.status)

  const queryString = searchParams.toString()
  return queryString ? `${PATHS.PRODUCTS}?${queryString}` : PATHS.PRODUCTS
}

export function Home() {
  const navigate = useNavigate()
  const toast = useToast()
  const { brands: masterBrands, locations: masterLocations } = useMasterData()
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const { register, handleSubmit, watch } = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { q: '' }
  })
  const searchQuery = watch('q') || ''

  const brands: Brand[] = masterBrands.slice(0, DEFAULT_VALUES.BRAND_LIMIT).map(brand => ({
    id: brand.id,
    name: brand.name,
    logoUrl: brand.logoUrl || null
  }))

  const locations = masterLocations.map(loc => ({
    id: loc.id,
    name: loc.name
  }))

  useEffect(() => {
    const loadRecent = async () => {
      setIsLoading(true)
      try {
        const { data, error, count } = await getRecentProducts(DEFAULT_VALUES.RECENT_PRODUCTS_LIMIT)
        if (error) {
          toast.error(error.message, { title: 'Lỗi tải sản phẩm' })
          return
        }
        setRecentProducts(
          (data ?? []).map(p => ({
            ...p,
            image: p.image || p.mediaUrls?.[0] || ''
          }))
        )
        if (count !== null) {
          setTotalProducts(count)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadRecent()
  }, [])

  const handleBrandClick = (brandName: string) => {
    navigate(buildProductsPath({ brand: brandName }))
  }

  const onSearch = handleSubmit(() => {
    navigate(
      buildProductsPath({
        q: searchQuery,
        location: selectedLocation,
        brand: selectedBrand
      })
    )
  })

  const handleViewAllProducts = () => {
    navigate(PATHS.PRODUCTS)
  }

  return (
    <Box bg='#F8FAFC'>
      {/* Hero Banner Section */}
      <Box
        bg='#204ED3'
        borderRadius='16px'
        position='relative'
        overflow='hidden'
        mb={6}
        height='490.79px'
        mx='auto'
        maxW='1200px'
        mt={6}
      >
        {/* Background Pattern */}
        <Box
          position='absolute'
          inset='0'
          opacity={0.1}
          backgroundImage="url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%2220%22 height=%2220%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 20 0 L 0 0 0 20%22 fill=%22none%22 stroke=%22%23ffffff%22 stroke-width=%221%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22url(%23grid)%22/%3E%3C/svg%3E')"
          zIndex={1}
        />

        {/* Background Car Image */}
        <Box
          position='absolute'
          left='-342.13px'
          top='-77px'
          width='1407.31px'
          height='1056.24px'
          zIndex={1}
        >
          <Image
            src={heroBackgroundCar}
            alt='Background Car'
            width='100%'
            height='100%'
            objectFit='contain'
          />
        </Box>

        {/* Main Content */}
        <Flex
          position='relative'
          zIndex={2}
          direction='column'
          align='center'
          justify='center'
          height='100%'
          p={12}
        >
          <Box position='absolute' top={0} right={10}>
            <Image
              src={logo}
              alt='Logo'
              display='flex'
              justifyContent='end'
              objectFit='contain'
              height='20'
              marginLeft='auto'
            />
            {/* Text */}
            <Text
              fontSize='91px'
              fontWeight='400'
              color='white'
              fontFamily='Dela Gothic One'
              textAlign='center'
              lineHeight='1.448'
              mb={8}
              position='relative'
              zIndex={3}
            >
              Bán xe đê!!!
            </Text>
          </Box>

          {/* Main Car Image */}
          <Box
            position='relative'
            bottom={-100}
            left={-20}
            width='586.71px'
            height='364.54px'
            borderRadius='8px'
            zIndex={3}
          >
            <Image
              src={heroMainCar}
              alt='Main Car'
              width='100%'
              height='100%'
              objectFit='cover'
              position='relative'
              zIndex={0}
            />
          </Box>
        </Flex>
      </Box>

      <Container maxW='1200px' px={4}>
        {/* Search Section */}
        <Box bg='white' borderRadius='16px' p={6} mb={6}>
          <VStack align='stretch' gap={5}>
            <Text fontSize='20px' fontWeight='700' color='#04113E'>
              Mua xe
            </Text>

            <Box bg='white' border='1px solid #E5E5E5' borderRadius='12px' py={2} px={2} pl={4}>
              <form onSubmit={onSearch}>
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
                        {selectedLocation || 'Chọn khu vực'}
                        <Icon size='md'>
                          <HiOutlineChevronDown />
                        </Icon>
                      </Button>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item value='all' onClick={() => setSelectedLocation('')}>
                            Tất cả
                          </Menu.Item>
                          {locations.map(loc => (
                            <Menu.Item
                              key={loc.id}
                              value={loc.id}
                              onClick={() => setSelectedLocation(loc.name)}
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
                        {selectedBrand || 'Hãng xe'}
                        <Icon size='md'>
                          <HiOutlineChevronDown />
                        </Icon>
                      </Button>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item value='all' onClick={() => setSelectedBrand('')}>
                            Tất cả
                          </Menu.Item>
                          {brands.map(brand => (
                            <Menu.Item
                              key={brand.id}
                              value={brand.id}
                              onClick={() => setSelectedBrand(brand.name)}
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
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Tìm xe ngay
                  </Button>
                </Flex>
              </form>
            </Box>

            {/* Banner Card */}
            <Box width='full' height='130px' borderRadius='8px' overflow='hidden'>
              <Image src={background} alt='Banner' width='100%' height='100%' objectFit='cover' />
            </Box>

            {/* Brand Logos */}
            <Box>
              <HStack gap={4} overflowX='auto' py={2}>
                {brands.slice(0, DEFAULT_VALUES.BRAND_DISPLAY_LIMIT).map(brand => (
                  <Box
                    key={brand.id}
                    minW='120px'
                    p={2}
                    borderRadius='8px'
                    border='1px solid #E5E5E5'
                    textAlign='center'
                    cursor='pointer'
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => handleBrandClick(brand.name)}
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
          </VStack>
        </Box>

        {/* Features Section */}
        <Box mb={6}>
          <Flex
            justify='space-between'
            align='center'
            mb={6}
            direction={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <Text fontSize='20px' fontWeight='700' color='#1B2C5D' lineHeight='28px'>
              {totalProducts > 0 ? `${totalProducts} Xe chính hãng` : 'Xe chính hãng'}
            </Text>
            <Box
              border='1px solid #1B2C5D'
              borderRadius='8px'
              px='20px'
              py='12px'
              display='flex'
              gap='24px'
              flexWrap='wrap'
            >
              <HStack gap={2}>
                <Icon size='md' color='#1B2C5D'>
                  <FaMoneyBillWave />
                </Icon>
                <Text fontSize='16px' fontWeight='700' color='#1B2C5D' lineHeight='24px'>
                  Giao dịch tận nơi
                </Text>
              </HStack>
              <HStack gap={2}>
                <Icon size='md' color='#1B2C5D'>
                  <FaHandHoldingUsd />
                </Icon>
                <Text fontSize='16px' fontWeight='700' color='#1B2C5D' lineHeight='24px'>
                  Trả góp ưu đãi
                </Text>
              </HStack>
              <HStack gap={2}>
                <Icon size='md' color='#1B2C5D'>
                  <FaCheckCircle />
                </Icon>
                <Text fontSize='16px' fontWeight='700' color='#1B2C5D' lineHeight='24px'>
                  Chính hãng 100%
                </Text>
              </HStack>
            </Box>
          </Flex>

          {/* Car Listings */}
          <VStack gap={4} align='stretch'>
            {/* Featured Item - Large */}
            {recentProducts.length > 0 && recentProducts[0] && (
              <RouterLink
                to={PATHS.PRODUCT_DETAIL(recentProducts[0].id)}
                style={{ textDecoration: 'none' }}
              >
                <Card.Root
                  bg='white'
                  borderRadius='16px'
                  overflow='hidden'
                  direction={{ base: 'column', lg: 'row' }}
                  cursor='pointer'
                  _hover={{ boxShadow: 'xl', transform: 'translateY(-2px)' }}
                  transition='all 0.3s'
                >
                  <Box
                    width={{ base: '100%' }}
                    height={{ base: '300px', lg: '400px' }}
                    position='relative'
                    flexShrink={0}
                  >
                    <Image
                      src={recentProducts[0].mediaUrls?.[0]}
                      alt={recentProducts[0].title}
                      width='100%'
                      height='100%'
                      objectFit='cover'
                    />
                    <Badge
                      position='absolute'
                      top={4}
                      left={4}
                      bg='rgba(0,0,0,0.5)'
                      color='white'
                      borderRadius='100px'
                      px={4}
                      py={1}
                      gap={2}
                      display='flex'
                      alignItems='center'
                      fontSize='sm'
                      fontWeight='700'
                    >
                      <Icon size='sm'>
                        <HiOutlineSearch />
                      </Icon>
                      {recentProducts[0].mediaUrls?.length ?? 0} ảnh
                    </Badge>
                    <Badge
                      position='absolute'
                      top={4}
                      right={4}
                      bg='#204ED3'
                      color='white'
                      borderRadius='8px'
                      px={3}
                      py={1}
                      fontSize='sm'
                      fontWeight='700'
                    >
                      NỔI BẬT
                    </Badge>
                  </Box>

                  <Card.Body
                    p={6}
                    flex={1}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                  >
                    <Text
                      fontSize={{ base: '18px', md: '24px' }}
                      fontWeight='700'
                      color='#04113E'
                      textTransform='uppercase'
                      mb={4}
                      lineHeight='1.4'
                    >
                      {recentProducts[0].title}
                    </Text>

                    <HStack gap={4} mb={4} wrap='wrap'>
                      <HStack gap={2}>
                        <Icon size='md' color='#204ED3'>
                          <FaCar />
                        </Icon>
                        <Text fontSize='16px' color='#04113E' fontWeight='600'>
                          {recentProducts[0].bodyStyles?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                        </Text>
                      </HStack>
                      <HStack gap={2}>
                        <Icon size='md' color='#204ED3'>
                          <FaGasPump />
                        </Icon>
                        <Text fontSize='16px' color='#04113E' fontWeight='600'>
                          {recentProducts[0].fuels?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                        </Text>
                      </HStack>
                      <HStack gap={2}>
                        <Icon size='md' color='#204ED3'>
                          <FaCog />
                        </Icon>
                        <Text fontSize='16px' color='#04113E' fontWeight='600'>
                          {recentProducts[0].transmissions?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                        </Text>
                      </HStack>
                    </HStack>

                    <Flex justify='space-between' align='center' mb={4}>
                      <HStack gap={2}>
                        <Text
                          fontSize={{ base: '24px', md: '32px' }}
                          fontWeight='700'
                          color='#204ED3'
                        >
                          {new Intl.NumberFormat('vi-VN').format(recentProducts[0].price)}
                        </Text>
                        <Text fontSize='20px' fontWeight='700' color='#04113E'>
                          VNĐ
                        </Text>
                      </HStack>
                    </Flex>

                    <Box borderTop='1px solid #E5E7EB' pt={4}>
                      <Flex justify='space-between' align='center' wrap='wrap' gap={4}>
                        <Text fontSize='14px' color='#A1A1A1' lineHeight='20px'>
                          {formatTimeAgo(recentProducts[0].createdAt)}
                        </Text>
                        <Badge
                          bg='#204ED3'
                          color='white'
                          borderRadius='9999px'
                          px={3}
                          py={1}
                          fontSize='14px'
                          lineHeight='20px'
                          fontWeight='600'
                        >
                          {recentProducts[0].locations?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                        </Badge>
                        <HStack gap={2}>
                          <Icon size='md' color='#204ED3'>
                            <FaStore />
                          </Icon>
                          <Text fontSize='16px' fontWeight='700' color='#04113E' lineHeight='20px'>
                            {recentProducts[0].store?.storeName || DEFAULT_VALUES.NOT_AVAILABLE}
                          </Text>
                        </HStack>
                      </Flex>
                    </Box>
                  </Card.Body>
                </Card.Root>
              </RouterLink>
            )}

            {/* Grid of 7 items */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={4}>
              {recentProducts.slice(1, 8).map(car => (
                <RouterLink
                  key={car.id}
                  to={PATHS.PRODUCT_DETAIL(car.id)}
                  style={{ textDecoration: 'none' }}
                >
                  <Card.Root
                    bg='white'
                    borderRadius='16px'
                    overflow='hidden'
                    direction='column'
                    cursor='pointer'
                    _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                    transition='all 0.3s'
                    height='100%'
                  >
                    <Box width='100%' height='200px' position='relative' flexShrink={0}>
                      {car.mediaUrls?.[0] && (
                        <Image
                          src={car.mediaUrls[0]}
                          alt={car.title}
                          width='100%'
                          height='100%'
                          objectFit='cover'
                        />
                      )}
                      <Badge
                        position='absolute'
                        top={3}
                        left={3}
                        bg='rgba(0,0,0,0.3)'
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
                        {car.mediaUrls?.length ?? 0}
                      </Badge>
                    </Box>

                    <Card.Body p={4} flex={1} display='flex' flexDirection='column'>
                      <Text
                        fontSize='14px'
                        fontWeight='700'
                        color='#04113E'
                        textTransform='uppercase'
                        mb={2}
                        lineHeight='20px'
                        css={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {car.title}
                      </Text>

                      <HStack gap={3} mb={3} wrap='wrap' fontSize='12px'>
                        <HStack gap={1}>
                          <Icon size='xs' color='#A1A1A1'>
                            <FaCar />
                          </Icon>
                          <Text fontSize='12px' color='#A1A1A1' lineHeight='18px'>
                            {car.bodyStyles?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                          </Text>
                        </HStack>
                        <HStack gap={1}>
                          <Icon size='xs' color='#A1A1A1'>
                            <FaGasPump />
                          </Icon>
                          <Text fontSize='12px' color='#A1A1A1' lineHeight='18px'>
                            {car.fuels?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                          </Text>
                        </HStack>
                      </HStack>

                      <Flex justify='space-between' align='center' mb={3}>
                        <HStack gap={1}>
                          <Text fontSize='18px' fontWeight='700' color='#204ED3' lineHeight='24px'>
                            {new Intl.NumberFormat('vi-VN').format(car.price)}
                          </Text>
                          <Text fontSize='14px' fontWeight='700' color='#04113E' lineHeight='20px'>
                            VNĐ
                          </Text>
                        </HStack>
                      </Flex>

                      <Box borderTop='1px solid #E5E7EB' pt={2} mt='auto'>
                        <Flex
                          justify='space-between'
                          align='center'
                          wrap='wrap'
                          gap={2}
                          fontSize='12px'
                        >
                          <Text fontSize='12px' color='#A1A1A1' lineHeight='18px'>
                            {formatTimeAgo(car.createdAt)}
                          </Text>
                          <Badge
                            bg='#9CA3AF'
                            color='white'
                            borderRadius='9999px'
                            px={2}
                            py={0.5}
                            fontSize='11px'
                            lineHeight='14px'
                          >
                            {car.locations?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                          </Badge>
                        </Flex>
                      </Box>
                    </Card.Body>
                  </Card.Root>
                </RouterLink>
              ))}
            </SimpleGrid>
          </VStack>

          <Box display='flex' justifyContent='center' mt={6}>
            <Button
              variant='outline'
              borderColor='#04113E'
              color='#04113E'
              borderRadius='6px'
              px={5}
              py={3}
              fontWeight='700'
              fontSize='14px'
              onClick={handleViewAllProducts}
            >
              Xem tất cả {totalProducts > 0 ? totalProducts : ''} tin đăng
            </Button>
          </Box>
        </Box>

        <NewCarModelsSection />
        <Box display='flex' flexDirection='column' gap={4}>
          <SellCarSection />

          {/* Banner Section */}
          <Box
            width='full'
            height='150px'
            bg='gray.200'
            borderRadius='6px'
            overflow='hidden'
            mb={6}
          >
            <Image src={banner} alt='Banner' width='100%' height='100%' objectFit='cover' />
          </Box>

          {/* About Section */}
          <AboutSection />
        </Box>
      </Container>
    </Box>
  )
}
