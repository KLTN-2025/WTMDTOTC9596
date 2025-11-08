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
  SimpleGrid,
  Tabs,
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
import { useEffect, useState } from 'react'
import { toaster } from '@/components/ui/toaster'
import { getBrands, getRecentProducts, getNewCarModels } from '@/api/products'
import type { Brand, Product, NewCarModel } from '@/types/products'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import heroBackgroundCar from '@/assets/images/hero/hero-background-car.png'
import heroMainCar from '@/assets/images/hero/vehicle.png'
import logo from '@/assets/images/logo.png'
import { SellCarSection } from '@/components/shared/SellCarSection'
import banner from '@/assets/images/banner.png'
import { formatTimeAgo } from '@/utils/date'
import { Link as RouterLink } from 'react-router'

const searchSchema = z.object({ q: z.string().trim().max(200).optional().or(z.literal('')) })

export function Home() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [newCarModels, setNewCarModels] = useState<NewCarModel[]>([])
  const [selectedTab, setSelectedTab] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)
  const { register, handleSubmit } = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { q: '' }
  })

  useEffect(() => {
    const loadBrands = async () => {
      const { data, error } = await getBrands(12)
      if (error) {
        toaster.create({ title: 'Lỗi tải hãng xe', description: error.message, type: 'error' })
        return
      }
      setBrands(data ?? [])
    }

    const loadRecent = async () => {
      setIsLoading(true)
      try {
        const { data, error, count } = await getRecentProducts(8)
        if (error) {
          toaster.create({ title: 'Lỗi tải sản phẩm', description: error.message, type: 'error' })
          return
        }
        setRecentProducts(data ?? [])
        if (count !== null) {
          setTotalProducts(count)
        }
      } finally {
        setIsLoading(false)
      }
    }

    const loadNewCarModels = async () => {
      try {
        const bodyStyleMap: Record<string, string> = {
          all: '',
          hatchback: 'Hatchback',
          mpv: 'MPV',
          sedan: 'Sedan',
          suv: 'SUV',
          pickup: 'Pickup',
          cuv: 'CUV',
          coupe: 'Coupe',
          van: 'Van/Minibus',
          truck: 'Xe tải',
          tourist: 'Xe du lịch',
          bus: 'Xe khách'
        }

        const bodyStyleName = selectedTab !== 'all' ? bodyStyleMap[selectedTab] : undefined
        const { data, error } = await getNewCarModels(bodyStyleName, 8)

        if (error) {
          toaster.create({
            title: 'Lỗi tải dòng xe mới',
            description: error.message,
            type: 'error'
          })
          return
        }

        const grouped = (data ?? []).reduce(
          (acc, product) => {
            const key = `${product.modelName}-${product.yearManufactured}`
            if (!acc[key]) {
              let brandName = 'Unknown'
              if (product.brands) {
                const brandData = Array.isArray(product.brands) ? product.brands[0] : product.brands
                brandName = (brandData as { name: string } | null)?.name || 'Unknown'
              }
              acc[key] = {
                id: product.id,
                brand: brandName,
                name: product.modelName || 'Unknown',
                year: product.yearManufactured || '',
                priceRange: '',
                image:
                  (product.mediaUrls as string[] | null)?.[0] ||
                  'https://via.placeholder.com/200x153',
                modelName: product.modelName || '',
                brandId: product.brandId,
                prices: []
              }
            }
            const model = acc[key]
            if (model && model.prices) {
              model.prices.push(product.price)
            }
            return acc
          },
          {} as Record<string, NewCarModel & { prices: number[] }>
        )

        const models = Object.values(grouped).map(model => {
          const prices = model.prices
          const min = Math.min(...prices)
          const max = Math.max(...prices)
          const minFormatted = new Intl.NumberFormat('vi-VN', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 0
          }).format(min)
          const maxFormatted = new Intl.NumberFormat('vi-VN', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 0
          }).format(max)
          return {
            ...model,
            priceRange: min === max ? `${minFormatted}` : `${minFormatted} - ${maxFormatted}`
          }
        })

        setNewCarModels(models.slice(0, 4))
      } catch (error) {
        toaster.create({
          title: 'Lỗi tải dòng xe mới',
          description: 'Đã xảy ra lỗi',
          type: 'error'
        })
      }
    }

    loadBrands()
    loadRecent()
    loadNewCarModels()
  }, [selectedTab])

  const onSearch = handleSubmit(() => {})

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
            <Text fontSize='xl' fontWeight='700' color='#04113E'>
              Mua xe
            </Text>

            <Box bg='white' border='1px solid #E5E5E5' borderRadius='12px' p={4}>
              <form onSubmit={onSearch}>
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
                      fontSize='md'
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
                    fontSize='sm'
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
                    fontSize='sm'
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
                    fontSize='sm'
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
                {brands.map(brand => (
                  <Box
                    key={brand.id}
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
                    <Text fontSize='sm' fontWeight='700' color='#04113E'>
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
                  <Text fontSize='sm' fontWeight='700' color='#04113E'>
                    Xem thêm
                  </Text>
                </Box>
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
                to={`/products/${recentProducts[0].id}`}
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
                          {recentProducts[0].bodyStyles?.name || 'N/A'}
                        </Text>
                      </HStack>
                      <HStack gap={2}>
                        <Icon size='md' color='#204ED3'>
                          <FaGasPump />
                        </Icon>
                        <Text fontSize='16px' color='#04113E' fontWeight='600'>
                          {recentProducts[0].fuels?.name || 'N/A'}
                        </Text>
                      </HStack>
                      <HStack gap={2}>
                        <Icon size='md' color='#204ED3'>
                          <FaCog />
                        </Icon>
                        <Text fontSize='16px' color='#04113E' fontWeight='600'>
                          {recentProducts[0].transmissions?.name || 'N/A'}
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
                          {recentProducts[0].locations?.name || 'N/A'}
                        </Badge>
                        <HStack gap={2}>
                          <Icon size='md' color='#204ED3'>
                            <FaStore />
                          </Icon>
                          <Text fontSize='16px' fontWeight='700' color='#04113E' lineHeight='20px'>
                            {recentProducts[0].seller?.storeName || 'N/A'}
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
                  to={`/products/${car.id}`}
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
                      <Image
                        src={car.mediaUrls?.[0] ?? 'https://via.placeholder.com/300x200'}
                        alt={car.title}
                        width='100%'
                        height='100%'
                        objectFit='cover'
                      />
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
                            {car.bodyStyles?.name || 'N/A'}
                          </Text>
                        </HStack>
                        <HStack gap={1}>
                          <Icon size='xs' color='#A1A1A1'>
                            <FaGasPump />
                          </Icon>
                          <Text fontSize='12px' color='#A1A1A1' lineHeight='18px'>
                            {car.fuels?.name || 'N/A'}
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
                            {car.locations?.name || 'N/A'}
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
            <RouterLink to='/products' style={{ textDecoration: 'none' }}>
              <Button
                variant='outline'
                borderColor='#04113E'
                color='#04113E'
                borderRadius='6px'
                px={5}
                py={3}
                fontWeight='700'
                fontSize='14px'
              >
                Xem tất cả {totalProducts > 0 ? totalProducts : ''} tin đăng
              </Button>
            </RouterLink>
          </Box>
        </Box>

        {/* New Car Models Section */}
        <Box bg='#04113E' borderRadius='16px' p={8} mb={6}>
          <VStack align='stretch' gap={5}>
            <Text fontSize='2xl' fontWeight='700' color='white' textAlign='center'>
              THÔNG TIN DÒNG XE MỚI
            </Text>

            <Tabs.Root
              value={selectedTab}
              onValueChange={e => setSelectedTab(e.value ?? 'all')}
              colorPalette='blue'
            >
              <Tabs.List borderBottom='1px solid #F0F0F0' overflowX='auto' pb={0}>
                <Tabs.Trigger value='all'>Tất cả</Tabs.Trigger>
                <Tabs.Trigger value='hatchback'>Hatchback</Tabs.Trigger>
                <Tabs.Trigger value='mpv'>MPV</Tabs.Trigger>
                <Tabs.Trigger value='sedan'>Sedan</Tabs.Trigger>
                <Tabs.Trigger value='suv'>SUV</Tabs.Trigger>
                <Tabs.Trigger value='pickup'>Pickup</Tabs.Trigger>
                <Tabs.Trigger value='cuv'>CUV</Tabs.Trigger>
                <Tabs.Trigger value='coupe'>Coupe</Tabs.Trigger>
                <Tabs.Trigger value='van'>Van/Minibus</Tabs.Trigger>
                <Tabs.Trigger value='truck'>Xe tải</Tabs.Trigger>
                <Tabs.Trigger value='tourist'>Xe du lịch</Tabs.Trigger>
                <Tabs.Trigger value='bus'>Xe khách</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value={selectedTab} pt={6}>
                <SimpleGrid columns={{ base: 1, md: 4 }} gap={5}>
                  {newCarModels.map(car => (
                    <Card.Root key={car.id} bg='white' borderRadius='16px' overflow='hidden'>
                      <Image
                        src={car.image}
                        alt={car.name}
                        width='100%'
                        height='153px'
                        objectFit='cover'
                      />
                      <Card.Body p={4}>
                        <HStack gap={2} mb={2}>
                          <Badge bg='#204ED3' color='white' borderRadius='8px' px={2} py={1}>
                            {car.brand}
                          </Badge>
                          <Text fontSize='md' color='#04113E'>
                            {car.year}
                          </Text>
                        </HStack>
                        <Text fontSize='xl' fontWeight='700' color='#04113E' mb={2}>
                          {car.name}
                        </Text>
                        <HStack gap={2}>
                          <Text fontSize='md' fontWeight='700' color='#204ED3'>
                            {car.priceRange}
                          </Text>
                          <Text fontSize='sm' color='#204ED3'>
                            VNĐ
                          </Text>
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </SimpleGrid>
              </Tabs.Content>
            </Tabs.Root>

            <Button
              variant='outline'
              borderColor='white'
              color='white'
              borderRadius='6px'
              px={5}
              py={3}
              fontWeight='700'
              fontSize='sm'
              alignSelf='center'
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
              Xem tất cả
            </Button>
          </VStack>
        </Box>
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
