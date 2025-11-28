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
  Text,
  VStack
} from '@chakra-ui/react'
import { useNavigate } from 'react-router'
import { HiOutlineSearch } from 'react-icons/hi'
import { HiHeart } from 'react-icons/hi2'
import { FaCar, FaGasPump, FaCog } from 'react-icons/fa'
import { useEffect, useMemo, useState } from 'react'
import { getFavorites, removeFavorite } from '@/api/products'
import { useToast } from '@/hooks/useToast'
import { AppBreadcrumb } from '@/components/common/Breadcrumb'
import { formatTimeAgo } from '@/utils/date'
import { SORT_OPTIONS } from '@/mocks/products'
import { PATHS } from '@/configs/paths'
import { DEFAULT_VALUES } from '@/configs/constants'
import { useAuth } from '@/hooks/useAuth'
import { SortSelect } from '@/components/common/SortSelect'
const ITEMS_PER_PAGE = 12

type FavoriteItem = {
  id: string
  favoriteId: string
  productId: string
  title: string
  price: number
  image: string
  store?: {
    storeName: string
    storeLogo: string | null
  } | null
  createdAt: string | null
  likedAt: string
  imageCount: number
  bodyStyles?: { name: string } | null
  fuels?: { name: string } | null
  transmissions?: { name: string } | null
  locations?: { name: string } | null
  colors?: { name: string } | null
}

export function Liked() {
  const { user, store } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getFavorites(user)
      if (error) {
        toast.error(error.message || 'Không thể tải danh sách yêu thích', {
          title: 'Lỗi tải dữ liệu'
        })
        setItems([])
        return
      }
      const filtered = (data ?? []).filter(item => item !== null) as FavoriteItem[]
      setItems(filtered)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const handleRemoveFavorite = async (e: React.MouseEvent, favoriteId: string) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const { error } = await removeFavorite(favoriteId, user)
      if (error) {
        toast.error(error.message || 'Không thể bỏ thích sản phẩm', {
          title: 'Lỗi'
        })
        return
      }

      toast.success('Sản phẩm đã được xóa khỏi danh sách yêu thích', {
        title: 'Đã bỏ thích'
      })

      setItems(items.filter(item => item.favoriteId !== favoriteId))
    } catch (error) {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại', {
        title: 'Lỗi'
      })
    }
  }

  const sorted = useMemo(() => {
    let result = [...items]
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else {
      result.sort((a, b) => {
        const dateA = new Date(a.likedAt).getTime()
        const dateB = new Date(b.likedAt).getTime()
        return dateB - dateA
      })
    }
    return result
  }, [items, sortBy])

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const paged = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sorted.slice(start, start + ITEMS_PER_PAGE)
  }, [sorted, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy])

  return (
    <Box bg='#F8FAFC' minH='100vh'>
      <Container maxW='1200px' px={4} py={6}>
        <Box mb={4}>
          <AppBreadcrumb
            items={[{ label: 'Trang chủ', path: PATHS.HOME }, { label: 'Tin đã thích' }]}
          />
        </Box>

        <Flex justify='space-between' align='center' mb={4} wrap='wrap' gap={3}>
          <Text fontSize='20px' fontWeight='700' color='#04113E'>
            Tổng {sorted.length} tin đã thích
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
            {sorted.length === 0 ? (
              <Text textAlign='center' py={8} color='#6B7280'>
                Chưa có tin đã thích
              </Text>
            ) : (
              paged.map(item => (
                <Box key={item.favoriteId} position='relative'>
                  <Card.Root
                    bg='white'
                    borderRadius='16px'
                    overflow='hidden'
                    display='flex'
                    flexDirection='row'
                    cursor='pointer'
                    _hover={{ boxShadow: 'lg' }}
                    mb={4}
                    minH='200px'
                    onClick={() => navigate(PATHS.PRODUCT_DETAIL(item.productId))}
                  >
                    <Box
                      width='40%'
                      flex='0 0 40%'
                      position='relative'
                      flexShrink={0}
                      minH='200px'
                      maxH='300px'
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
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
                        {item.imageCount}
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
                          {item.title}
                        </Text>

                        <HStack gap={3} wrap='wrap' fontSize='12px'>
                          <HStack gap={1}>
                            <Icon size='xs' color='#A1A1A1'>
                              <FaCar />
                            </Icon>
                            <Text fontSize='12px' color='#A1A1A1'>
                              {item.bodyStyles?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                            </Text>
                          </HStack>
                          <HStack gap={1}>
                            <Icon size='xs' color='#A1A1A1'>
                              <FaGasPump />
                            </Icon>
                            <Text fontSize='12px' color='#A1A1A1'>
                              {item.fuels?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                            </Text>
                          </HStack>
                          <HStack gap={1}>
                            <Icon size='xs' color='#A1A1A1'>
                              <FaCog />
                            </Icon>
                            <Text fontSize='12px' color='#A1A1A1'>
                              {item.transmissions?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                            </Text>
                          </HStack>
                        </HStack>

                        <HStack gap={2} mt='auto'>
                          <Text fontSize='20px' fontWeight='700' color='#204ED3'>
                            {new Intl.NumberFormat('vi-VN').format(item.price)}
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
                            {formatTimeAgo(item.likedAt)}
                          </Text>
                          <Badge
                            bg='#9CA3AF'
                            color='white'
                            borderRadius='9999px'
                            px={2}
                            py={0.5}
                            fontSize='xs'
                          >
                            {item.locations?.name || DEFAULT_VALUES.NOT_AVAILABLE}
                          </Badge>
                        </Flex>

                        <Box borderTop='1px solid #E5E7EB' pt={2} mt={2}>
                          <Flex justify='space-between' align='center' wrap='wrap' gap={2}>
                            <HStack gap={2}>
                              {item.store?.storeLogo && (
                                <Image
                                  src={item.store.storeLogo}
                                  alt={item.store.storeName}
                                  width='24px'
                                  height='24px'
                                  borderRadius='full'
                                />
                              )}
                              <Text fontSize='12px' fontWeight='600' color='#1B2C5D'>
                                {item.store?.storeName || DEFAULT_VALUES.NOT_AVAILABLE}
                              </Text>
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
                              📞 {store?.contactPhone || 'N/A'}
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
                                navigate(PATHS.PRODUCT_BOOKING(item.productId))
                              }}
                            >
                              Đặt hẹn lái thử
                            </Button>
                          </HStack>
                        </Box>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                  <Button
                    position='absolute'
                    top={4}
                    right={4}
                    bg='white'
                    color='#EF4444'
                    borderRadius='full'
                    p={2}
                    minW='auto'
                    h='auto'
                    onClick={e => handleRemoveFavorite(e, item.favoriteId)}
                    _hover={{ bg: 'gray.100' }}
                    zIndex={10}
                    boxShadow='md'
                  >
                    <Icon size='lg'>
                      <HiHeart />
                    </Icon>
                  </Button>
                </Box>
              ))
            )}
          </VStack>
        )}

        {sorted.length > 0 && (
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
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              →
            </Button>
          </Flex>
        )}
      </Container>
    </Box>
  )
}
