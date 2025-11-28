import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Carousel,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Separator,
  SimpleGrid,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import {
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineHeart,
  HiHeart,
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2'
import { FaCar, FaGasPump, FaCog, FaStar } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { useParams, useNavigate } from 'react-router'
import { useToast } from '@/hooks/useToast'
import {
  getProductById,
  getSimilarProductsBySpecs,
  getRelatedProducts,
  addFavorite,
  removeFavoriteByProductId,
  checkFavorite
} from '@/api/products'
import { getStoreStats } from '@/api/stores'
import { getProductComments, createComment, deleteComment } from '@/api/comments'
import { getProductReactions, setProductReaction } from '@/api/reactions'
import type { ProductDetailData } from '@/types/products'
import type { ProductComment, ReactionType } from '@/types/comments'
import { formatTimeAgo } from '@/utils/date'
import { isVideo } from '@/utils/media'
import { AboutSection } from '@/components/common/AboutSection'
import { NewCarModelsSection } from '@/components/common/NewCarModelsSection'
import { AppBreadcrumb } from '@/components/common/Breadcrumb'
import { CONDITION_TYPE_MAP, QUICK_CHAT_MESSAGES, EMOTION_REACTIONS } from '@/mocks/product-detail'
import { useAuth } from '@/hooks/useAuth'
import { PATHS } from '@/configs/paths'
import { CurrencyFormat } from '@/components/ui/currency-format'
import type { StoreStats } from '@/types/stores'

type DetailItem = {
  label: string
  value: string
  isLink?: boolean
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user, store } = useAuth()
  const toast = useToast()
  const [productData, setProductData] = useState({
    product: null as ProductDetailData | null,
    similarProducts: [] as any[],
    relatedProducts: [] as any[]
  })

  const [uiState, setUiState] = useState({
    selectedImage: 0,
    isLoading: true
  })

  const [userState, setUserState] = useState({
    isFavorite: false,
    favoriteId: null as string | null
  })

  const [interactionState, setInteractionState] = useState({
    comments: [] as ProductComment[],
    reactionStats: {
      happy: 0,
      love: 0,
      surprised: 0,
      sad: 0,
      angry: 0,
      userReaction: null as ReactionType | null
    }
  })
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null)
  const storeId = productData.product?.storeId || null

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      setUiState(prev => ({ ...prev, isLoading: true }))
      try {
        const { data, error } = await getProductById(id)

        if (error) {
          toast.error(error.message, {
            title: 'Lỗi tải sản phẩm'
          })
          return
        }

        if (data) {
          setProductData(prev => ({ ...prev, product: data }))
          setUiState(prev => ({ ...prev, selectedImage: 0 }))

          const { data: similar } = await getSimilarProductsBySpecs(data, id, 3)
          if (similar) {
            setProductData(prev => ({ ...prev, similarProducts: similar }))
          }

          if (data.bodyStyleId) {
            const { data: related } = await getRelatedProducts(data.bodyStyleId, id, 4)
            if (related) {
              setProductData(prev => ({ ...prev, relatedProducts: related }))
            }
          }
        }
      } finally {
        setUiState(prev => ({ ...prev, isLoading: false }))
      }
    }

    loadProduct()
  }, [id])

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!id || !isAuthenticated) {
        setUserState(prev => ({ ...prev, isFavorite: false, favoriteId: null }))
        return
      }

      const { data, error } = await checkFavorite(id, user)
      if (!error && data) {
        setUserState(prev => ({ ...prev, isFavorite: true, favoriteId: data.id }))
      } else {
        setUserState(prev => ({ ...prev, isFavorite: false, favoriteId: null }))
      }
    }

    checkFavoriteStatus()
  }, [id, isAuthenticated])

  useEffect(() => {
    const loadComments = async () => {
      if (!id) return
      const { data, error } = await getProductComments(id)
      if (!error && data) {
        setInteractionState(prev => ({ ...prev, comments: data }))
      }
    }

    loadComments()
  }, [id])

  useEffect(() => {
    const loadReactions = async () => {
      if (!id) return
      const { data, error } = await getProductReactions(id, user)
      if (!error && data) {
        setInteractionState(prev => ({ ...prev, reactionStats: data }))
      }
    }

    loadReactions()
  }, [id])

  useEffect(() => {
    const loadStoreStats = async () => {
      if (!storeId) {
        setStoreStats(null)
        return
      }
      const { data } = await getStoreStats(storeId)
      setStoreStats(data ?? null)
    }

    loadStoreStats()
  }, [storeId])

  if (uiState.isLoading || !productData.product) {
    return (
      <Box bg='#F8FAFC' minH='100vh' py={4}>
        <Container maxW='1200px' px={4}>
          <Text>Đang tải...</Text>
        </Container>
      </Box>
    )
  }

  const images =
    productData.product.mediaUrls && productData.product.mediaUrls.length > 0
      ? productData.product.mediaUrls
      : []

  const mileageDisplay = productData.product.mileageKm
    ? `${productData.product.mileageKm.toLocaleString('vi-VN')} km`
    : 'N/A'
  const conditionDetails: DetailItem[] = [
    { label: 'Số Km đã đi', value: mileageDisplay },
    { label: 'Xuất xứ', value: productData.product.origin || 'N/A' },
    {
      label: 'Tình trạng',
      value:
        CONDITION_TYPE_MAP[productData.product.conditionType] ||
        productData.product.conditionType ||
        'N/A'
    },
    { label: 'Chính sách bảo hành', value: productData.product.warrantyPolicy || 'N/A' },
    { label: 'Khu vực', value: productData.product.locations?.name || 'N/A' }
  ]

  const technicalDetails: DetailItem[] = [
    { label: 'Hãng', value: productData.product.brands?.name || 'N/A', isLink: true },
    { label: 'Dòng xe', value: productData.product.models?.name || 'N/A', isLink: true },
    { label: 'Năm sản xuất', value: productData.product.yearManufactured || 'N/A' },
    { label: 'Phiên bản xe', value: productData.product.versions?.name || 'N/A' },
    { label: 'Hộp số', value: productData.product.transmissions?.name || 'N/A' },
    { label: 'Nhiên liệu', value: productData.product.fuels?.name || 'N/A' },
    { label: 'Kiểu dáng', value: productData.product.bodyStyles?.name || 'N/A' },
    {
      label: 'Số chỗ',
      value: productData.product.seats ? `${productData.product.seats} chỗ` : 'N/A'
    },
    { label: 'Màu sắc', value: productData.product.colors?.name || 'N/A' },
    { label: 'Hệ dẫn động', value: productData.product.drive || 'N/A' },
    { label: 'Công suất động cơ', value: productData.product.power || 'N/A' },
    { label: 'Momen xoắn', value: productData.product.torque || 'N/A' },
    { label: 'Dung tích động cơ', value: productData.product.engineCapacity || 'N/A' },
    { label: 'Nhiên liệu tiêu thụ', value: productData.product.fuelConsumption || 'N/A' },
    {
      label: 'Số cửa',
      value:
        typeof productData.product.doors === 'number' ? `${productData.product.doors} cửa` : 'N/A'
    },
    { label: 'Trọng lượng', value: productData.product.weight || 'N/A' },
    { label: 'Trọng tải', value: productData.product.payload || 'N/A' },
    { label: 'Khoảng sáng gầm xe', value: productData.product.groundClearance || 'N/A' }
  ]

  const additionalSpecs =
    Array.isArray(productData.product.specs) && productData.product.specs.length > 0
      ? productData.product.specs.filter(spec => spec.name && spec.value)
      : []

  const renderDetailGrid = (items: DetailItem[], keyPrefix: string) => (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6}>
      {items.map((item, index) => {
        const key = `${keyPrefix}-${item.label}-${index}`
        const itemContent =
          item.isLink && item.value !== 'N/A' ? (
            <RouterLink to={PATHS.PRODUCTS}>
              <Text
                fontSize='14px'
                fontWeight='400'
                color='#204ED3'
                _hover={{ textDecoration: 'underline' }}
              >
                {item.value}
              </Text>
            </RouterLink>
          ) : (
            <Text fontSize='14px' fontWeight='400' color='#04113E'>
              {item.value}
            </Text>
          )

        return (
          <VStack
            key={key}
            align='flex-start'
            gap={1}
            borderRight={{
              base: 'none',
              lg: (index + 1) % 4 === 0 ? 'none' : '1px solid #E5E5E5'
            }}
            pr={{ base: 0, lg: 3 }}
          >
            <Text fontSize='14px' fontWeight='400' color='#737373'>
              {item.label}
            </Text>
            {itemContent}
          </VStack>
        )
      })}
    </SimpleGrid>
  )

  return (
    <Box bg='#F8FAFC' minH='100vh' py={4}>
      <Container maxW='1200px' px={4} overflow='hidden'>
        <VStack align='stretch' gap={6}>
          <AppBreadcrumb
            items={[
              { label: 'Trang chủ', path: PATHS.HOME },
              { label: 'Mua xe', path: PATHS.PRODUCTS },
              { label: productData.product?.title || '' }
            ]}
          />

          <Flex gap={6} direction={{ base: 'column', lg: 'row' }} align='flex-start'>
            <Box flex={1} position='relative' maxW='100%' overflow='hidden'>
              <ImageGallery
                images={images}
                selectedImage={uiState.selectedImage}
                onSelectImage={idx => setUiState(prev => ({ ...prev, selectedImage: idx }))}
              />

              <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' p={6} mt={5}>
                <VStack align='stretch' gap={4}>
                  <Text fontSize='18px' fontWeight='700' color='#222222'>
                    Mô tả chi tiết
                  </Text>
                  <Text fontSize='16px' fontWeight='400' color='#222222' whiteSpace='pre-line'>
                    {productData.product?.description || 'Chưa có mô tả'}
                  </Text>
                  <HStack gap={2}>
                    <Button
                      bg='#F4F4F4'
                      color='#222222'
                      borderRadius='99px'
                      px={4}
                      py={2}
                      fontSize='14px'
                      fontWeight='700'
                    >
                      SĐT liên hệ: {store?.contactPhone || 'N/A'}
                    </Button>
                  </HStack>
                </VStack>
              </Card.Root>

              <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' p={6} mt={5}>
                <VStack align='stretch' gap={4}>
                  <Text fontSize='18px' fontWeight='700' color='#04113E'>
                    Thông số chi tiết
                  </Text>

                  <VStack align='stretch' gap={4}>
                    <Box>
                      <Text fontSize='16px' fontWeight='500' color='#04113E' mb={3}>
                        Tình trạng xe
                      </Text>
                      {renderDetailGrid(conditionDetails, 'condition')}
                    </Box>

                    <Separator />

                    <Box>
                      <Text fontSize='16px' fontWeight='500' color='#04113E' mb={3}>
                        Thông số kỹ thuật
                      </Text>
                      {renderDetailGrid(technicalDetails, 'technical')}
                    </Box>

                    {additionalSpecs.length > 0 && (
                      <>
                        <Separator />
                        <Box>
                          <Text fontSize='16px' fontWeight='500' color='#04113E' mb={3}>
                            Thông số bổ sung
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                            {additionalSpecs.map((spec, index) => (
                              <Box
                                key={`${spec.name}-${spec.value}-${index}`}
                                border='1px solid #E5E5E5'
                                borderRadius='12px'
                                p={4}
                              >
                                <Text fontSize='14px' fontWeight='400' color='#737373'>
                                  {spec.name}
                                </Text>
                                <Text fontSize='14px' fontWeight='500' color='#04113E'>
                                  {spec.value}
                                </Text>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>
                      </>
                    )}
                  </VStack>
                </VStack>
              </Card.Root>
            </Box>

            <Box width={{ base: '100%', lg: '588px' }} flexShrink={0}>
              <ProductInfoCard
                product={productData.product}
                isFavorite={userState.isFavorite}
                favoriteId={userState.favoriteId}
                onFavoriteChange={(fav: boolean, favId: string | null) => {
                  setUserState(prev => ({ ...prev, isFavorite: fav, favoriteId: favId }))
                }}
                isLoggedIn={isAuthenticated}
              />
              <StoreInfoCard
                store={{
                  name: productData.product?.store?.storeName || 'N/A',
                  rating: 0,
                  activeTime: formatTimeAgo(productData.product?.createdAt || ''),
                  responseRate: '86%',
                  stats: {
                    selling: storeStats?.selling ?? 0,
                    sold: storeStats?.sold ?? 0,
                    favorites: storeStats?.favorites ?? 0
                  }
                }}
                quickChat={QUICK_CHAT_MESSAGES}
              />
              <Box mt={6}>
                <CommentsSection
                  productId={id || ''}
                  comments={interactionState.comments}
                  onCommentsChange={comments =>
                    setInteractionState(prev => ({ ...prev, comments }))
                  }
                  isLoggedIn={isAuthenticated}
                />
                <EmotionReactionSection
                  productId={id || ''}
                  reactionStats={interactionState.reactionStats}
                  onReactionChange={stats =>
                    setInteractionState(prev => ({ ...prev, reactionStats: stats }))
                  }
                  isLoggedIn={isAuthenticated}
                />
              </Box>
            </Box>
          </Flex>

          <SimilarProductsSection
            products={productData.similarProducts}
            currentProduct={productData.product}
          />
          <RelatedProductsSection
            products={productData.relatedProducts}
            bodyStyleName={productData.product?.bodyStyles?.name || null}
          />
          <NewCarModelsSection />
          <AboutSection />
        </VStack>
      </Container>
    </Box>
  )
}

function ImageGallery({
  images,
  selectedImage,
  onSelectImage
}: {
  images: string[]
  selectedImage: number
  onSelectImage: (index: number) => void
}) {
  const [currentPage, setCurrentPage] = useState(selectedImage)

  return (
    <VStack align='stretch' gap={5} maxW='100%' overflow='hidden'>
      <Box position='relative' borderRadius='16px' overflow='hidden' bg='white' maxW='100%'>
        <Carousel.Root
          slideCount={images.length}
          page={currentPage}
          onPageChange={e => {
            setCurrentPage(e.page)
            onSelectImage(e.page)
          }}
          allowMouseDrag
        >
          <Carousel.Control width='100%' position='relative'>
            <Carousel.ItemGroup>
              {images.map((mediaUrl, index) => (
                <Carousel.Item key={index} index={index} width='100%' maxH='420px'>
                  {isVideo(mediaUrl) ? (
                    <ReactPlayer
                      src={mediaUrl}
                      width='100%'
                      height='100%'
                      controls
                      playing={currentPage === index}
                      style={{ borderRadius: '16px', overflow: 'hidden' }}
                    />
                  ) : (
                    <Image
                      src={mediaUrl}
                      alt={`Product ${index + 1}`}
                      width='100%'
                      height='100%'
                      objectFit='cover'
                      objectPosition='center'
                    />
                  )}
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>
          </Carousel.Control>
        </Carousel.Root>
      </Box>

      {images.length > 1 && (
        <Box maxW='100%' overflow='hidden'>
          <Carousel.Root
            slideCount={images.length}
            slidesPerPage={4}
            spacing='20px'
            page={currentPage}
            onPageChange={e => {
              setCurrentPage(e.page)
              onSelectImage(e.page)
            }}
          >
            <Carousel.Control width='100%' justifyContent='center' gap={2}>
              <Carousel.PrevTrigger asChild>
                <IconButton size='sm' variant='ghost' aria-label='Previous'>
                  <Icon>
                    <HiOutlineChevronDown style={{ transform: 'rotate(90deg)' }} />
                  </Icon>
                </IconButton>
              </Carousel.PrevTrigger>

              <Carousel.ItemGroup gap={5} flex={1} maxW='100%' overflow='hidden'>
                {images.map((mediaUrl, index) => {
                  return (
                    <Carousel.Item key={index} index={index}>
                      <Box
                        width='120px'
                        height='120px'
                        borderRadius='8px'
                        overflow='hidden'
                        cursor='pointer'
                        border={currentPage === index ? '2px solid #204ED3' : '1px solid #E5E5E5'}
                        flexShrink={0}
                        position='relative'
                        onClick={() => {
                          setCurrentPage(index)
                          onSelectImage(index)
                        }}
                      >
                        {isVideo(mediaUrl) ? (
                          <ReactPlayer
                            src={mediaUrl}
                            width='100%'
                            height='100%'
                            light
                            playing={false}
                            style={{ borderRadius: '8px', overflow: 'hidden', objectFit: 'cover' }}
                          />
                        ) : (
                          <Image
                            src={mediaUrl}
                            alt={`Thumbnail ${index + 1}`}
                            width='100%'
                            height='100%'
                            objectFit='cover'
                          />
                        )}
                      </Box>
                    </Carousel.Item>
                  )
                })}
              </Carousel.ItemGroup>

              <Carousel.NextTrigger asChild>
                <IconButton size='sm' variant='ghost' aria-label='Next'>
                  <Icon>
                    <HiOutlineChevronDown style={{ transform: 'rotate(-90deg)' }} />
                  </Icon>
                </IconButton>
              </Carousel.NextTrigger>
            </Carousel.Control>
          </Carousel.Root>
        </Box>
      )}
    </VStack>
  )
}

function ProductInfoCard({
  product,
  isFavorite,
  favoriteId,
  onFavoriteChange,
  isLoggedIn
}: {
  product: ProductDetailData
  isFavorite: boolean
  favoriteId: string | null
  onFavoriteChange: (isFavorite: boolean, favoriteId: string | null) => void
  isLoggedIn: boolean
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, store } = useAuth()
  const toast = useToast()

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.warning('Bạn cần đăng nhập để thêm sản phẩm vào yêu thích', {
        title: 'Vui lòng đăng nhập'
      })
      return
    }

    if (!product.id) return

    setIsProcessing(true)
    try {
      if (isFavorite && favoriteId) {
        const { error } = await removeFavoriteByProductId(product.id, user)
        if (error) {
          toast.error(error.message || 'Không thể bỏ thích sản phẩm', {
            title: 'Lỗi'
          })
          return
        }
        toast.success('Sản phẩm đã được xóa khỏi danh sách yêu thích', {
          title: 'Đã bỏ thích'
        })
        onFavoriteChange(false, null)
      } else {
        const { data, error } = await addFavorite(product.id, user)
        if (error) {
          toast.error(error.message || 'Không thể thêm sản phẩm vào yêu thích', {
            title: 'Lỗi'
          })
          return
        }
        toast.success('Sản phẩm đã được thêm vào danh sách yêu thích', {
          title: 'Đã thêm vào yêu thích'
        })
        onFavoriteChange(true, data?.id || null)
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại', {
        title: 'Lỗi'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' p={8}>
      <VStack align='stretch' gap={6}>
        <VStack align='flex-start' gap={2}>
          <HStack justify='space-between' align='flex-start' width='100%' wrap='wrap' gap={4}>
            <Text
              fontSize='32px'
              fontWeight='700'
              color='#04113E'
              textTransform='uppercase'
              flex={1}
            >
              {product.title}
            </Text>
            <Button
              variant='outline'
              borderColor='#DADADA'
              color={isFavorite ? '#EF4444' : '#222222'}
              borderRadius='9999px'
              px={4}
              py={2}
              gap={2}
              fontWeight='700'
              fontSize='16px'
              onClick={handleToggleFavorite}
              disabled={isProcessing}
              _hover={{ bg: 'gray.50' }}
              flexShrink={0}
            >
              <Icon size='md'>{isFavorite ? <HiHeart /> : <HiOutlineHeart />}</Icon>
              Lưu
            </Button>
          </HStack>
          <Text fontSize='24px' fontWeight='500' color='#04113E' textTransform='uppercase'>
            {product.yearManufactured || ''}
          </Text>
          <HStack gap={4} wrap='wrap'>
            <HStack gap={1}>
              <Icon size='sm' color='#313647'>
                <FaCar />
              </Icon>
              <Text fontSize='16px' fontWeight='400' color='#A1A1A1'>
                {product.bodyStyles?.name || 'N/A'}
              </Text>
            </HStack>
            <HStack gap={1}>
              <Icon size='sm' color='#A1A1A1'>
                <FaGasPump />
              </Icon>
              <Text fontSize='16px' fontWeight='400' color='#A1A1A1'>
                {product.fuels?.name || 'N/A'}
              </Text>
            </HStack>
            <HStack gap={1}>
              <Icon size='sm' color='#A1A1A1'>
                <FaCog />
              </Icon>
              <Text fontSize='16px' fontWeight='400' color='#A1A1A1'>
                {product.transmissions?.name || 'N/A'}
              </Text>
            </HStack>
          </HStack>
          {Array.isArray(product.specs) && product.specs.length > 0 && (
            <VStack align='flex-start' gap={2} width='100%' pt={2}>
              {product.specs
                .filter(spec => spec.name && spec.value)
                .slice(0, 3)
                .map((spec, index) => (
                  <HStack key={`${spec.name}-${index}`} gap={2} width='100%'>
                    <Text fontSize='14px' fontWeight='500' color='#737373' minW='120px'>
                      {spec.name}:
                    </Text>
                    <Text fontSize='14px' fontWeight='400' color='#04113E'>
                      {spec.value}
                    </Text>
                  </HStack>
                ))}
            </VStack>
          )}
          <HStack gap={2}>
            {typeof product.price === 'number' ? (
              <Text fontSize='32px' fontWeight='700' color='#204ED3' lineHeight='0.875em'>
                <CurrencyFormat value={product.price} currency='VND' currencyDisplay='code' />
              </Text>
            ) : (
              <Text fontSize='32px' fontWeight='700' color='#204ED3' lineHeight='0.875em'>
                {product.price || 'N/A'}
              </Text>
            )}
          </HStack>
          <Box borderTop='1px solid #E5E7EB' pt={4} width='100%'>
            <Text fontSize='14px' fontWeight='400' color='#A1A1A1'>
              {formatTimeAgo(product.createdAt)}
            </Text>
          </Box>
        </VStack>

        <HStack gap={2}>
          <Button
            bg='#F5F5F5'
            color='#171717'
            borderRadius='8px'
            px={5}
            py={3}
            gap={2}
            flex={1}
            fontWeight='400'
            fontSize='20px'
          >
            <Icon size='md'>
              <HiOutlineChatBubbleLeftRight />
            </Icon>
            Chat
          </Button>
          <Button
            bg='#F5F5F5'
            color='#1B2C5D'
            borderRadius='8px'
            px={5}
            py={3}
            gap={2}
            flex={1}
            fontWeight='400'
            fontSize='20px'
          >
            <Icon size='md'>
              <HiOutlinePhone />
            </Icon>
            {store?.contactPhone || 'N/A'}
          </Button>
        </HStack>

        <Button
          bg='#204ED3'
          color='white'
          borderRadius='6px'
          px={5}
          py={3}
          fontWeight='700'
          fontSize='18px'
          width='100%'
          _hover={{ bg: '#1a3fb0' }}
          asChild
        >
          <RouterLink to={`/products/${product.id}/booking`}>Đặt hẹn lái thử</RouterLink>
        </Button>
      </VStack>
    </Card.Root>
  )
}

function StoreInfoCard({
  store,
  quickChat
}: {
  store: {
    name: string
    storeLogo?: string
    rating: number
    activeTime: string
    responseRate: string
    stats: {
      selling: number
      sold: number
      favorites: number
    }
  }
  quickChat: string[]
}) {
  return (
    <Card.Root bg='#204ED3' borderRadius='16px' border='1px solid #E4E4E7' p={6} mt={6}>
      <VStack align='stretch' gap={6}>
        <HStack gap={6} align='flex-start'>
          {store.storeLogo && (
            <Image
              src={store.storeLogo}
              alt={store.name}
              width='60px'
              height='60px'
              borderRadius='full'
            />
          )}
          <VStack align='flex-start' gap={2} flex={1}>
            <HStack justify='space-between' width='100%'>
              <Text fontSize='16px' fontWeight='700' color='white'>
                {store.name}
              </Text>
              <HStack gap={1}>
                <Text fontSize='16px' fontWeight='700' color='white'>
                  ({store.rating})
                </Text>
                <Icon size='sm' color='white'>
                  <FaStar />
                </Icon>
              </HStack>
            </HStack>
            <HStack gap={2}>
              <HStack gap={1} bg='white' borderRadius='4px' px={2} py={1}>
                <Box width='8px' height='8px' bg='white' borderRadius='full' />
                <Text fontSize='14px' fontWeight='400' color='#204ED3'>
                  Hoạt động {store.activeTime}
                </Text>
              </HStack>
              <Text fontSize='14px' fontWeight='400' color='white'>
                Phản hồi: {store.responseRate}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <HStack justify='space-between'>
          <VStack gap={1}>
            <Text fontSize='16px' fontWeight='400' color='white' textAlign='center'>
              Đang bán
            </Text>
            <Text fontSize='24px' fontWeight='700' color='white' textAlign='center'>
              {store.stats.selling}
            </Text>
          </VStack>
          <VStack gap={1}>
            <Text fontSize='16px' fontWeight='400' color='white' textAlign='center'>
              Đã bán
            </Text>
            <Text fontSize='24px' fontWeight='700' color='white' textAlign='center'>
              {store.stats.sold}
            </Text>
          </VStack>
          <VStack gap={1}>
            <Text fontSize='16px' fontWeight='400' color='white' textAlign='center'>
              Yêu thích
            </Text>
            <Text fontSize='24px' fontWeight='700' color='white' textAlign='center'>
              {store.stats.favorites}
            </Text>
          </VStack>
        </HStack>

        <VStack align='stretch' gap={3}>
          <Text fontSize='14px' fontWeight='700' color='white'>
            Chat nhanh:
          </Text>
          <Flex gap={3} wrap='wrap' position='relative'>
            {quickChat.map(message => (
              <Button
                key={message}
                bg={quickChat.indexOf(message) < 2 ? '#4FC479' : 'white'}
                color={quickChat.indexOf(message) < 2 ? 'white' : '#204ED3'}
                borderRadius='20px'
                px={3}
                py={1}
                fontSize='14px'
                fontWeight='500'
                height='auto'
              >
                {message}
              </Button>
            ))}
            <Icon
              size='lg'
              color='white'
              position='absolute'
              right='0'
              top='50%'
              transform='translateY(-50%)'
              cursor='pointer'
            >
              <HiOutlineChevronRight />
            </Icon>
          </Flex>
        </VStack>
      </VStack>
    </Card.Root>
  )
}

function CommentsSection({
  productId,
  comments,
  onCommentsChange,
  isLoggedIn
}: {
  productId: string
  comments: ProductComment[]
  onCommentsChange: (comments: ProductComment[]) => void
  isLoggedIn: boolean
}) {
  const { user } = useAuth()
  const toast = useToast()
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const getInitials = (name?: string | null) => {
    if (!name) return 'ND'
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !isLoggedIn) {
      if (!isLoggedIn) {
        toast.warning('Bạn cần đăng nhập để bình luận', {
          title: 'Vui lòng đăng nhập'
        })
      }
      return
    }

    setIsSubmitting(true)
    const { error } = await createComment(
      {
        productId,
        content: commentText.trim()
      },
      user
    )

    if (error) {
      toast.error(error.message || 'Không thể đăng bình luận', {
        title: 'Lỗi'
      })
    } else {
      setCommentText('')
      const { data: updatedComments } = await getProductComments(productId)
      if (updatedComments) {
        onCommentsChange(updatedComments)
      }
    }
    setIsSubmitting(false)
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !isLoggedIn) {
      if (!isLoggedIn) {
        toast.warning('Bạn cần đăng nhập để trả lời', {
          title: 'Vui lòng đăng nhập'
        })
      }
      return
    }

    setIsSubmitting(true)
    const { error } = await createComment(
      {
        productId,
        content: replyText.trim(),
        parentId
      },
      user
    )

    if (error) {
      toast.error(error.message || 'Không thể đăng trả lời', {
        title: 'Lỗi'
      })
    } else {
      setReplyText('')
      setReplyingTo(null)
      const { data: updatedComments } = await getProductComments(productId)
      if (updatedComments) {
        onCommentsChange(updatedComments)
      }
    }
    setIsSubmitting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId)
    try {
      const { error } = await deleteComment(commentId, user)
      if (error) {
        toast.error(error.message || 'Không thể xóa bình luận', {
          title: 'Lỗi'
        })
      } else {
        const { data: updatedComments } = await getProductComments(productId)
        if (updatedComments) {
          onCommentsChange(updatedComments)
        }
      }
    } finally {
      setDeletingCommentId(null)
    }
  }

  const currentUserId = user?.id || null

  return (
    <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' alignSelf='stretch'>
      <VStack align='stretch' gap={6}>
        <Box px={6} pt={6}>
          <Text fontSize='16px' fontWeight='600' color='#222222'>
            Bình luận ({comments.length})
          </Text>
        </Box>

        {comments.length === 0 ? (
          <VStack align='center' gap={3} px={6} py={8}>
            <Text fontSize='14px' fontWeight='400' color='#8C8C8C' textAlign='center'>
              Chưa có bình luận nào.
              <br />
              Hãy để lại bình luận cho người bán.
            </Text>
          </VStack>
        ) : (
          <VStack align='stretch' gap={2} px={6} maxH='600px' overflowY='auto'>
            {comments.map(comment => (
              <Box key={comment.id} borderBottom='1px solid #E5E5E5' pb={2}>
                <HStack align='flex-start' gap={3}>
                  <Avatar.Root
                    boxSize='40px'
                    borderRadius='full'
                    bg='#E2E8F0'
                    color='#1F2937'
                    fontSize='14px'
                  >
                    <Avatar.Image
                      src={comment.user?.avatarUrl || undefined}
                      alt={comment.user?.fullName || 'Người dùng'}
                    />
                    <Avatar.Fallback>{getInitials(comment.user?.fullName)}</Avatar.Fallback>
                  </Avatar.Root>
                  <VStack align='flex-start' gap={1} flex={1}>
                    <HStack justify='space-between' width='100%'>
                      <Text fontSize='14px' fontWeight='600' color='#222222'>
                        {comment.user?.fullName || 'Người dùng'}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize='12px' fontWeight='400' color='#8C8C8C'>
                          {formatTimeAgo(comment.createdAt)}
                        </Text>
                        {currentUserId === comment.userId && (
                          <Button
                            variant='ghost'
                            size='xs'
                            color='#EF4444'
                            onClick={() => handleDeleteComment(comment.id)}
                            loading={deletingCommentId === comment.id}
                          >
                            Xóa
                          </Button>
                        )}
                      </HStack>
                    </HStack>
                    <Text fontSize='14px' fontWeight='400' color='#222222' whiteSpace='pre-wrap'>
                      {comment.content}
                    </Text>
                    {isLoggedIn && (
                      <Button
                        variant='ghost'
                        size='xs'
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        {replyingTo === comment.id ? 'Hủy' : 'Trả lời'}
                      </Button>
                    )}
                    {replyingTo === comment.id && (
                      <HStack gap={2} width='100%' mt={2}>
                        <Textarea
                          placeholder='Viết trả lời...'
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          size='sm'
                          resize='none'
                          flex={1}
                        />
                        <Button
                          size='sm'
                          bg='#204ED3'
                          color='white'
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={isSubmitting || !replyText.trim()}
                        >
                          Gửi
                        </Button>
                      </HStack>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                      <VStack align='stretch' gap={3} mt={3} pl={4} borderLeft='2px solid #E5E5E5'>
                        {comment.replies.map(reply => (
                          <HStack key={reply.id} align='flex-start' gap={2}>
                            <Avatar.Root
                              boxSize='32px'
                              borderRadius='full'
                              bg='#E2E8F0'
                              color='#1F2937'
                              fontSize='12px'
                            >
                              <Avatar.Image
                                src={reply.user?.avatarUrl || undefined}
                                alt={reply.user?.fullName || 'Người dùng'}
                              />
                              <Avatar.Fallback>{getInitials(reply.user?.fullName)}</Avatar.Fallback>
                            </Avatar.Root>
                            <VStack align='flex-start' gap={1} flex={1}>
                              <HStack justify='space-between' width='100%'>
                                <Text fontSize='13px' fontWeight='600' color='#222222'>
                                  {reply.user?.fullName || 'Người dùng'}
                                </Text>
                                <HStack gap={2}>
                                  <Text fontSize='11px' fontWeight='400' color='#8C8C8C'>
                                    {formatTimeAgo(reply.createdAt)}
                                  </Text>
                                  {currentUserId === reply.userId && (
                                    <Button
                                      variant='ghost'
                                      size='xs'
                                      color='#EF4444'
                                      onClick={() => handleDeleteComment(reply.id)}
                                      loading={deletingCommentId === reply.id}
                                    >
                                      Xóa
                                    </Button>
                                  )}
                                </HStack>
                              </HStack>
                              <Text
                                fontSize='13px'
                                fontWeight='400'
                                color='#222222'
                                whiteSpace='pre-wrap'
                              >
                                {reply.content}
                              </Text>
                            </VStack>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        <Separator />
        <HStack gap={5} align='flex-end' px={6} pb={6}>
          <Box
            flex={1}
            bg='#F5F5F5'
            border='1px solid #E5E5E5'
            borderRadius='8px'
            p={2}
            minH='44px'
          >
            <Textarea
              placeholder={isLoggedIn ? 'Bình luận...' : 'Đăng nhập để bình luận'}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              border='none'
              fontSize='16px'
              fontWeight='400'
              color='#737373'
              resize='none'
              bg='transparent'
              _focus={{ boxShadow: 'none' }}
              disabled={!isLoggedIn}
              rows={3}
            />
          </Box>
          <Button
            bg='#204ED3'
            color='white'
            borderRadius='8px'
            px={4}
            py={2}
            onClick={handleSubmitComment}
            disabled={isSubmitting || !commentText.trim() || !isLoggedIn}
            _hover={{ bg: '#1a3fb0' }}
          >
            Gửi
          </Button>
        </HStack>
      </VStack>
    </Card.Root>
  )
}

function EmotionReactionSection({
  productId,
  reactionStats,
  onReactionChange,
  isLoggedIn
}: {
  productId: string
  reactionStats: {
    happy: number
    love: number
    surprised: number
    sad: number
    angry: number
    userReaction: ReactionType | null
  }
  onReactionChange: (stats: typeof reactionStats) => void
  isLoggedIn: boolean
}) {
  const { user } = useAuth()
  const toast = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const emotions = EMOTION_REACTIONS

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!isLoggedIn) {
      toast.warning('Bạn cần đăng nhập để đánh giá', {
        title: 'Vui lòng đăng nhập'
      })
      return
    }

    setIsProcessing(true)
    const newReaction = reactionStats.userReaction === reactionType ? null : reactionType
    const { error } = await setProductReaction(productId, newReaction, user)

    if (error) {
      toast.error(error.message || 'Không thể cập nhật đánh giá', {
        title: 'Lỗi'
      })
    } else {
      const { data: updatedStats } = await getProductReactions(productId, user)
      if (updatedStats) {
        onReactionChange(updatedStats)
      }
    }
    setIsProcessing(false)
  }

  const totalReactions =
    reactionStats.happy +
    reactionStats.love +
    reactionStats.surprised +
    reactionStats.sad +
    reactionStats.angry

  return (
    <Card.Root bg='white' borderRadius='12px' border='1px solid #E5E5E5' alignSelf='stretch' mt={6}>
      <VStack align='center' gap={6} p={6}>
        <Text fontSize='18px' fontWeight='700' color='#222222' textAlign='center' maxW='548px'>
          Bạn có cảm thấy tin đăng này rõ ràng và đáng tin cậy để mua hàng không?
        </Text>
        <HStack gap={6} justify='center' wrap='wrap'>
          {emotions.map(emotion => {
            const isSelected = reactionStats.userReaction === emotion.type
            const count = reactionStats[emotion.type]
            return (
              <VStack key={emotion.label} gap={1}>
                <Button
                  variant='ghost'
                  borderRadius='full'
                  width='45px'
                  height='45px'
                  p={0}
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  fontSize='24px'
                  bg={isSelected ? 'blue.50' : 'transparent'}
                  border={isSelected ? '2px solid #204ED3' : 'none'}
                  onClick={() => handleReactionClick(emotion.type)}
                  disabled={isProcessing || !isLoggedIn}
                  _hover={{ bg: isSelected ? 'blue.100' : 'gray.100', transform: 'scale(1.1)' }}
                  transition='all 0.2s'
                  cursor={isLoggedIn ? 'pointer' : 'not-allowed'}
                >
                  {emotion.emoji}
                </Button>
                {count > 0 && (
                  <Text fontSize='12px' fontWeight='600' color='#737373'>
                    {count}
                  </Text>
                )}
              </VStack>
            )
          })}
        </HStack>
        {totalReactions > 0 && (
          <Text fontSize='14px' fontWeight='400' color='#8C8C8C'>
            Tổng cộng {totalReactions} đánh giá
          </Text>
        )}
      </VStack>
    </Card.Root>
  )
}

function SimilarProductsSection({
  products,
  currentProduct
}: {
  products: any[]
  currentProduct: ProductDetailData
}) {
  return (
    <Box bg='white' borderRadius='16px' p={8} mt={6}>
      <VStack align='stretch' gap={6}>
        <Box display='flex' justifyContent='space-between' alignItems='center' gap={5}>
          <Text fontSize='24px' fontWeight='700' color='#04113E' textWrap='nowrap'>
            So sánh sản phẩm tương tự
          </Text>

          <HStack gap={5} align='flex-end'>
            <Box flex={1} bg='white' border='1px solid #E5E5E5' borderRadius='12px' p={2}>
              <Text fontSize='16px' fontWeight='400' color='#04113E' pl={4}>
                Tìm sản phẩm khác để so sánh...
              </Text>
            </Box>
            <RouterLink to={PATHS.PRODUCTS}>
              <Button
                bg='#204ED3'
                color='white'
                borderRadius='6px'
                px={5}
                py={2.5}
                fontWeight='700'
                fontSize='14px'
                _hover={{ bg: '#1a3fb0' }}
              >
                Tìm xe ngay
              </Button>
            </RouterLink>
          </HStack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
          <Box position='relative'>
            <Badge
              position='absolute'
              top={4}
              left={4}
              bg='#204ED3'
              color='white'
              borderRadius='100px'
              px={4}
              py={1}
              zIndex={1}
            >
              <Text fontSize='14px' fontWeight='600' color='white'>
                Xe đang xem
              </Text>
            </Badge>
            <ProductComparisonCard product={currentProduct} isCurrent />
          </Box>
          {products.slice(0, 3).map(product => (
            <ProductComparisonCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

function ProductComparisonCard({
  product,
  isCurrent = false
}: {
  product: ProductDetailData | any
  isCurrent?: boolean
}) {
  const imageUrl =
    'mediaUrls' in product && Array.isArray(product.mediaUrls) && product.mediaUrls.length > 0
      ? product.mediaUrls[0]
      : 'image' in product
        ? product.image
        : null

  return (
    <Card.Root
      bg='white'
      borderRadius='16px'
      border={isCurrent ? '2px solid #204ED3' : '1px solid #EDEDED'}
      overflow='hidden'
      width='100%'
      asChild
    >
      <RouterLink to={`/products/${product.id}`}>
        {imageUrl && (
          <Box position='relative' height='200px'>
            <Image
              src={imageUrl}
              alt={product.title}
              width='100%'
              height='100%'
              objectFit='cover'
            />
          </Box>
        )}
        <Card.Body p={4}>
          <VStack align='stretch' gap={3}>
            <Text
              fontSize='16px'
              fontWeight='700'
              color='#04113E'
              textTransform='uppercase'
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {product.title}
            </Text>
            <HStack gap={2}>
              {typeof product.price === 'number' ? (
                <Text fontSize='20px' fontWeight='700' color='#204ED3'>
                  <CurrencyFormat value={product.price} currency='VND' currencyDisplay='code' />
                </Text>
              ) : (
                <Text fontSize='20px' fontWeight='700' color='#204ED3'>
                  {product.price || 'N/A'}
                </Text>
              )}
            </HStack>
            <SimpleGrid columns={2} gap={3} borderTop='1px solid #E5E5E5' pt={3}>
              <VStack align='flex-start' gap={1} borderRight='1px solid #E5E5E5' pr={3}>
                <Text fontSize='12px' fontWeight='400' color='#737373'>
                  Số Km đã đi
                </Text>
                <Text fontSize='14px' fontWeight='500' color='#04113E'>
                  {product.mileageKm ? `${product.mileageKm.toLocaleString('vi-VN')} km` : 'N/A'}
                </Text>
              </VStack>
              <VStack align='flex-start' gap={1}>
                <Text fontSize='12px' fontWeight='400' color='#737373'>
                  Xuất xứ
                </Text>
                <Text fontSize='14px' fontWeight='500' color='#04113E'>
                  {product.origin || 'N/A'}
                </Text>
              </VStack>
              <VStack align='flex-start' gap={1} borderRight='1px solid #E5E5E5' pr={3}>
                <Text fontSize='12px' fontWeight='400' color='#737373'>
                  Tình trạng
                </Text>
                <Text fontSize='14px' fontWeight='500' color='#04113E'>
                  {product.conditionType
                    ? CONDITION_TYPE_MAP[product.conditionType] || product.conditionType
                    : 'N/A'}
                </Text>
              </VStack>
              <VStack align='flex-start' gap={1}>
                <Text fontSize='12px' fontWeight='400' color='#737373'>
                  Bảo hành
                </Text>
                <Text
                  fontSize='14px'
                  fontWeight='500'
                  color='#04113E'
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {product.warrantyPolicy || 'N/A'}
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Card.Body>
      </RouterLink>
    </Card.Root>
  )
}

function RelatedProductsSection({
  products,
  bodyStyleName
}: {
  products: any[]
  bodyStyleName?: string | null | undefined
}) {
  const navigate = useNavigate()

  const handleViewMore = () => {
    if (bodyStyleName) {
      const searchParams = new URLSearchParams()
      searchParams.set('style', bodyStyleName)
      navigate(`/products?${searchParams.toString()}`)
    } else {
      navigate('/products')
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <Box bg='white' borderRadius='16px' border='1px solid #E5E5E5' p={8} mt={6}>
      <VStack align='stretch' gap={6}>
        <HStack justify='space-between' align='center' wrap='wrap' gap={4}>
          <Text fontSize='24px' fontWeight='700' color='#04113E'>
            Thông tin dòng xe tương tự
          </Text>
          <Button
            variant='outline'
            borderColor='#204ED3'
            color='#204ED3'
            borderRadius='6px'
            px={5}
            py={2.5}
            fontWeight='700'
            fontSize='14px'
            _hover={{ bg: '#204ED3', color: 'white' }}
            onClick={handleViewMore}
          >
            Xem thêm
          </Button>
        </HStack>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={5}>
          {products.map(product => (
            <Card.Root
              key={product.id}
              bg='white'
              borderRadius='16px'
              border='1px solid #EDEDED'
              overflow='hidden'
              asChild
            >
              <RouterLink to={`/products/${product.id}`}>
                <Box position='relative' height='200px'>
                  {(product.image || product.mediaUrls?.[0]) && (
                    <Image
                      src={product.image || product.mediaUrls?.[0]}
                      alt={product.title}
                      width='100%'
                      height='100%'
                      objectFit='cover'
                    />
                  )}
                  <Badge
                    position='absolute'
                    top={4}
                    right={4}
                    bg='rgba(0,0,0,0.5)'
                    color='white'
                    borderRadius='100px'
                    px={2}
                    py={1}
                    gap={1}
                    display='flex'
                    alignItems='center'
                  >
                    <Icon size='xs' color='white'>
                      <HiOutlineChevronRight />
                    </Icon>
                    {product.imageCount || product.mediaUrls?.length || 0}
                  </Badge>
                </Box>
                <Card.Body p={4}>
                  <VStack align='stretch' gap={3}>
                    <HStack gap={2} wrap='wrap'>
                      <HStack gap={1}>
                        <Icon size='sm' color='#313647'>
                          <FaCar />
                        </Icon>
                        <Text fontSize='14px' fontWeight='400' color='#A1A1A1'>
                          {product.bodyStyles?.name || 'N/A'}
                        </Text>
                      </HStack>
                      <HStack gap={1}>
                        <Icon size='sm' color='#A1A1A1'>
                          <FaGasPump />
                        </Icon>
                        <Text fontSize='14px' fontWeight='400' color='#A1A1A1'>
                          {product.fuels?.name || 'N/A'}
                        </Text>
                      </HStack>
                      <HStack gap={1}>
                        <Icon size='sm' color='#A1A1A1'>
                          <FaCog />
                        </Icon>
                        <Text fontSize='14px' fontWeight='400' color='#A1A1A1'>
                          {product.transmissions?.name || 'N/A'}
                        </Text>
                      </HStack>
                    </HStack>
                    <Text
                      fontSize='16px'
                      fontWeight='700'
                      color='#04113E'
                      textTransform='uppercase'
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {product.title}
                    </Text>
                    <HStack gap={2}>
                      {typeof product.price === 'number' ? (
                        <Text fontSize='20px' fontWeight='700' color='#204ED3'>
                          <CurrencyFormat
                            value={product.price}
                            currency='VND'
                            currencyDisplay='code'
                          />
                        </Text>
                      ) : (
                        <Text fontSize='20px' fontWeight='700' color='#204ED3'>
                          {product.price || 'N/A'}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </Card.Body>
              </RouterLink>
            </Card.Root>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
