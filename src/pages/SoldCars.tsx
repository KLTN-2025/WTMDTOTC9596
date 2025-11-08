import {
  Badge,
  Box,
  Card,
  Container,
  Flex,
  HStack,
  Icon,
  Image,
  NativeSelect,
  Text,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { HiOutlineChevronDown } from 'react-icons/hi2'
import { HiOutlineSearch } from 'react-icons/hi'
import { FaCar, FaGasPump, FaCog } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { toaster } from '@/components/ui/toaster'
import { getProducts } from '@/api/products'
import type { Product, ProductFilters } from '@/types/products'
import { AboutSection } from '@/components/common/AboutSection'
import { formatTimeAgo } from '@/utils/date'

export function SoldCars() {
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const filters: ProductFilters = {
        status: 'sold',
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
  }, [sortBy])

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
              Tổng {products.length} xe đã bán
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
                        <Badge
                          position='absolute'
                          top={4}
                          right={4}
                          bg='#EF4444'
                          color='white'
                          borderRadius='100px'
                          px={4}
                          py={1}
                          fontSize='xs'
                          fontWeight='700'
                        >
                          ĐÃ BÁN
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
                            </Flex>
                          </Box>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  </RouterLink>
                ))
              )}
            </VStack>
          )}
        </Box>

        <AboutSection />
      </Container>
    </Box>
  )
}
