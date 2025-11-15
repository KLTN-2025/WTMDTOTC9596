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
  NativeSelect,
  Text,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { HiOutlineChevronDown } from 'react-icons/hi2'
import { HiOutlineSearch } from 'react-icons/hi'
import { FaCar, FaGasPump, FaCog } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { toaster } from '@/components/ui/toaster'
import { getProducts } from '@/api/products'
import type { Product, ProductFilters } from '@/types/products'
import { AboutSection } from '@/components/common/AboutSection'
import { formatTimeAgo } from '@/utils/date'
import { SORT_OPTIONS } from '@/mocks/products'
import { PATHS } from '@/configs/paths'
import { DEFAULT_VALUES } from '@/configs/constants'

const ITEMS_PER_PAGE = 12

export function SoldCars() {
  const navigate = useNavigate()
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
        toaster.create({ title: 'Lỗi tải dữ liệu', description: error.message, type: 'error' })
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
                      <Badge
                        position='absolute'
                        top={3}
                        right={3}
                        bg='#EF4444'
                        color='white'
                        borderRadius='100px'
                        px={3}
                        py={1}
                        fontSize='xs'
                        fontWeight='700'
                      >
                        ĐÃ BÁN
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
                          style={{
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
                              {product.store?.storeLogo && (
                                <Image
                                  src={product.store.storeLogo}
                                  alt={product.store.storeName}
                                  width='24px'
                                  height='24px'
                                  borderRadius='full'
                                />
                              )}
                              <Text fontSize='12px' fontWeight='600' color='#1B2C5D'>
                                {product.store?.storeName || DEFAULT_VALUES.NOT_AVAILABLE}
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
                        </Box>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))
              )}
            </VStack>
          )}

          {totalCount > 0 && (
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
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                ←
              </Button>
              {(() => {
                const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
                const pages: (number | string)[] = []

                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i)
                  }
                } else {
                  if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                      pages.push(i)
                    }
                    pages.push('...')
                    pages.push(totalPages)
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1)
                    pages.push('...')
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    pages.push(1)
                    pages.push('...')
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
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
                      bg={currentPage === page ? '#204ED3' : 'transparent'}
                      color={currentPage === page ? 'white' : '#04113E'}
                      borderColor={currentPage === page ? '#204ED3' : '#E5E5E5'}
                      borderRadius='6px'
                      px={4}
                      py={2}
                      fontSize='14px'
                      fontWeight='500'
                      _hover={{ bg: currentPage === page ? '#1a3fb0' : 'gray.50' }}
                      onClick={() => setCurrentPage(page as number)}
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
                disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
                onClick={() =>
                  setCurrentPage(prev => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), prev + 1))
                }
                _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                →
              </Button>
            </Flex>
          )}
        </Box>

        <AboutSection />
      </Container>
    </Box>
  )
}
