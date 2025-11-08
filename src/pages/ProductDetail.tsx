import {
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
import { HiX } from 'react-icons/hi'
import { FaCar, FaGasPump, FaCog, FaStar } from 'react-icons/fa'
import { IoSparkles } from 'react-icons/io5'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { toaster } from '@/components/ui/toaster'
import {
  getProductById,
  getSimilarProducts,
  getRelatedProducts,
  addFavorite,
  removeFavoriteByProductId,
  checkFavorite
} from '@/api/products'
import type { ProductDetailData } from '@/types/products'
import { formatTimeAgo } from '@/utils/date'
import { AboutSection } from '@/components/common/AboutSection'
import { supabase } from '@/configs/supabase'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [similarProducts, setSimilarProducts] = useState<any[]>([])
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteId, setFavoriteId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }

    checkAuth()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const { data, error } = await getProductById(id)

        if (error) {
          toaster.create({ title: 'Lỗi tải sản phẩm', description: error.message, type: 'error' })
          return
        }

        if (data) {
          setProduct(data)
          setSelectedImage(0)

          const { data: similar } = await getSimilarProducts(data.modelName || '', id, 3)
          if (similar) {
            setSimilarProducts(similar)
          }

          if (data.bodyStyleId) {
            const { data: related } = await getRelatedProducts(data.bodyStyleId, id, 4)
            if (related) {
              setRelatedProducts(related)
            }
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id])

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!id || !isLoggedIn) {
        setIsFavorite(false)
        setFavoriteId(null)
        return
      }

      const { data, error } = await checkFavorite(id)
      if (!error && data) {
        setIsFavorite(true)
        setFavoriteId(data.id)
      } else {
        setIsFavorite(false)
        setFavoriteId(null)
      }
    }

    checkFavoriteStatus()
  }, [id, isLoggedIn])

  if (isLoading || !product) {
    return (
      <Box bg='#F8FAFC' minH='100vh' py={4}>
        <Container maxW='1200px' px={4}>
          <Text>Đang tải...</Text>
        </Container>
      </Box>
    )
  }

  const images =
    product.mediaUrls && product.mediaUrls.length > 0
      ? product.mediaUrls
      : ['https://via.placeholder.com/588x412']
  const conditionTypeMap: Record<string, string> = {
    new: 'Xe mới',
    used: 'Đã sử dụng',
    demo: 'Xe demo',
    refurbished: 'Đã tân trang'
  }

  return (
    <Box bg='#F8FAFC' minH='100vh' py={4}>
      <Container maxW='1200px' px={4} overflow='hidden'>
        <VStack align='stretch' gap={6}>
          <Breadcrumb productTitle={product.title} />

          <Flex gap={6} direction={{ base: 'column', lg: 'row' }} align='flex-start'>
            <Box flex={1} position='relative' maxW='100%' overflow='hidden'>
              {id ? (
                <ImageGallery
                  images={images}
                  selectedImage={selectedImage}
                  onSelectImage={setSelectedImage}
                  productId={id}
                  isFavorite={isFavorite}
                  favoriteId={favoriteId}
                  onFavoriteChange={(fav: boolean, favId: string | null) => {
                    setIsFavorite(fav)
                    setFavoriteId(favId)
                  }}
                  isLoggedIn={isLoggedIn}
                />
              ) : (
                <ImageGallery
                  images={images}
                  selectedImage={selectedImage}
                  onSelectImage={setSelectedImage}
                  isFavorite={isFavorite}
                  favoriteId={favoriteId}
                  onFavoriteChange={(fav: boolean, favId: string | null) => {
                    setIsFavorite(fav)
                    setFavoriteId(favId)
                  }}
                  isLoggedIn={isLoggedIn}
                />
              )}

              <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' p={6} mt={5}>
                <VStack align='stretch' gap={4}>
                  <Text fontSize='18px' fontWeight='700' color='#222222'>
                    Mô tả chi tiết
                  </Text>
                  <Text fontSize='16px' fontWeight='400' color='#222222' whiteSpace='pre-line'>
                    {product.description || 'Chưa có mô tả'}
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
                      onClick={() => setShowPhone(!showPhone)}
                    >
                      {showPhone ? 'SĐT liên hệ: 0933******' : 'SĐT liên hệ: 0933******'}
                    </Button>
                    <Button
                      bg='#F4F4F4'
                      color={showPhone ? '#306BD9' : '#737373'}
                      borderRadius='99px'
                      px={4}
                      py={2}
                      fontSize='14px'
                      fontWeight='700'
                      onClick={() => setShowPhone(!showPhone)}
                    >
                      {showPhone ? 'Ẩn số' : 'Hiện số'}
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
                      <SimpleGrid columns={4} gap={6} borderRight='1px solid #E5E5E5'>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Số Km đã đi
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.mileageKm
                              ? `${product.mileageKm.toLocaleString('vi-VN')} km`
                              : 'N/A'}
                          </Text>
                        </VStack>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Xuất xứ
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.origin || 'N/A'}
                          </Text>
                        </VStack>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Tình trạng
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {conditionTypeMap[product.conditionType] || product.conditionType}
                          </Text>
                        </VStack>
                        <VStack align='flex-start' gap={1}>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Chính sách bảo hành
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.warrantyPolicy || 'N/A'}
                          </Text>
                        </VStack>
                      </SimpleGrid>
                    </Box>

                    <Separator />

                    <Box>
                      <Text fontSize='16px' fontWeight='500' color='#04113E' mb={3}>
                        Thông số kỹ thuật
                      </Text>
                      <SimpleGrid columns={4} gap={6}>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Hãng
                          </Text>
                          <RouterLink to='/products'>
                            <Text
                              fontSize='14px'
                              fontWeight='400'
                              color='#204ED3'
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {product.brands?.name || 'N/A'}
                            </Text>
                          </RouterLink>
                        </VStack>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Dòng xe
                          </Text>
                          <RouterLink to='/products'>
                            <Text
                              fontSize='14px'
                              fontWeight='400'
                              color='#204ED3'
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {product.modelName || 'N/A'}
                            </Text>
                          </RouterLink>
                        </VStack>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Năm sản xuất
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.yearManufactured || 'N/A'}
                          </Text>
                        </VStack>
                        <VStack align='flex-start' gap={1}>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Phiên bản xe
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.versionName || 'N/A'}
                          </Text>
                        </VStack>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Hộp số
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.transmissions?.name || 'N/A'}
                          </Text>
                        </VStack>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Nhiên liệu
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.fuels?.name || 'N/A'}
                          </Text>
                        </VStack>
                        <VStack align='flex-start' gap={1} pr={3} borderRight='1px solid #E5E5E5'>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Kiểu dáng
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.bodyStyles?.name || 'N/A'}
                          </Text>
                        </VStack>
                        <VStack align='flex-start' gap={1}>
                          <Text fontSize='14px' fontWeight='400' color='#737373'>
                            Số chỗ
                          </Text>
                          <Text fontSize='14px' fontWeight='400' color='#04113E'>
                            {product.seats || 'N/A'}
                          </Text>
                        </VStack>
                        {product.productSpecifications && (
                          <>
                            <VStack
                              align='flex-start'
                              gap={1}
                              pr={3}
                              borderRight='1px solid #E5E5E5'
                            >
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Hệ dẫn động
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.drive || 'N/A'}
                              </Text>
                            </VStack>
                            <VStack
                              align='flex-start'
                              gap={1}
                              pr={3}
                              borderRight='1px solid #E5E5E5'
                            >
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Công suất động cơ
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.power || 'N/A'}
                              </Text>
                            </VStack>
                            <VStack
                              align='flex-start'
                              gap={1}
                              pr={3}
                              borderRight='1px solid #E5E5E5'
                            >
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Momen xoắn
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.torque || 'N/A'}
                              </Text>
                            </VStack>
                            <VStack align='flex-start' gap={1}>
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Dung tích động cơ
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.engineCapacity || 'N/A'}
                              </Text>
                            </VStack>
                            <VStack
                              align='flex-start'
                              gap={1}
                              pr={3}
                              borderRight='1px solid #E5E5E5'
                            >
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Nhiên liệu tiêu thụ
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.fuelConsumption || 'N/A'}
                              </Text>
                            </VStack>
                            <VStack
                              align='flex-start'
                              gap={1}
                              pr={3}
                              borderRight='1px solid #E5E5E5'
                            >
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Số cửa
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.doors || 'N/A'}
                              </Text>
                            </VStack>
                            <VStack
                              align='flex-start'
                              gap={1}
                              pr={3}
                              borderRight='1px solid #E5E5E5'
                            >
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Trọng lượng
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.weight || 'N/A'}
                              </Text>
                            </VStack>
                            <VStack align='flex-start' gap={1}>
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Trọng tải
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.payload || 'N/A'}
                              </Text>
                            </VStack>
                            <VStack
                              align='flex-start'
                              gap={1}
                              pr={3}
                              borderRight='1px solid #E5E5E5'
                            >
                              <Text fontSize='14px' fontWeight='400' color='#737373'>
                                Khoảng sáng gầm xe
                              </Text>
                              <Text fontSize='14px' fontWeight='400' color='#04113E'>
                                {product.productSpecifications.groundClearance || 'N/A'}
                              </Text>
                            </VStack>
                          </>
                        )}
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </VStack>
              </Card.Root>
            </Box>

            <Box width={{ base: '100%', lg: '588px' }} flexShrink={0}>
              <ProductInfoCard product={product} />
              <StoreInfoCard
                store={{
                  name: product.seller?.storeName || 'N/A',
                  rating: 0,
                  activeTime: formatTimeAgo(product.createdAt),
                  responseRate: '86%',
                  stats: { selling: 71, sold: 65, favorites: 625 }
                }}
                quickChat={[
                  'Xe này còn không ạ?',
                  'Xe chính chủ hay được uỷ quyền ạ?',
                  'Giá xe có thể thương lượng được không ạ?',
                  'Xe có còn bảo hiểm không?',
                  'Xe đã qua bao nhiêu đời chủ?'
                ]}
              />
              <Box mt={6}>
                <CommentsSection />
                <EmotionReactionSection />
              </Box>
            </Box>
          </Flex>

          <SimilarProductsSection products={similarProducts} currentProduct={product} />
          <RelatedProductsSection products={relatedProducts} />
          <AboutSection />
        </VStack>
      </Container>
    </Box>
  )
}

function Breadcrumb({ productTitle }: { productTitle: string }) {
  return (
    <HStack gap={0} fontSize='14px' fontWeight='400' color='#6B7280'>
      <RouterLink to='/'>
        <Text fontWeight='600' color='#1B2C5D'>
          Trang chủ
        </Text>
      </RouterLink>
      <Icon size='md' color='#B6B6B6'>
        <HiOutlineChevronDown style={{ transform: 'rotate(-90deg)' }} />
      </Icon>
      <RouterLink to='/products'>
        <Text>Mua xe</Text>
      </RouterLink>
      <Icon size='md' color='#B6B6B6'>
        <HiOutlineChevronDown style={{ transform: 'rotate(-90deg)' }} />
      </Icon>
      <Text>{productTitle}</Text>
    </HStack>
  )
}

function ImageGallery({
  images,
  selectedImage,
  onSelectImage,
  productId,
  isFavorite,
  favoriteId,
  onFavoriteChange,
  isLoggedIn
}: {
  images: string[]
  selectedImage: number
  onSelectImage: (index: number) => void
  productId?: string | undefined
  isFavorite: boolean
  favoriteId: string | null
  onFavoriteChange: (isFavorite: boolean, favoriteId: string | null) => void
  isLoggedIn: boolean
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(selectedImage)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      toaster.create({
        title: 'Vui lòng đăng nhập',
        description: 'Bạn cần đăng nhập để thêm sản phẩm vào yêu thích',
        type: 'warning'
      })
      return
    }

    if (!productId) return

    setIsProcessing(true)
    try {
      if (isFavorite && favoriteId) {
        const { error } = await removeFavoriteByProductId(productId)
        if (error) {
          toaster.create({
            title: 'Lỗi',
            description: error.message || 'Không thể bỏ thích sản phẩm',
            type: 'error'
          })
          return
        }
        toaster.create({
          title: 'Đã bỏ thích',
          description: 'Sản phẩm đã được xóa khỏi danh sách yêu thích',
          type: 'success'
        })
        onFavoriteChange(false, null)
      } else {
        const { data, error } = await addFavorite(productId)
        if (error) {
          toaster.create({
            title: 'Lỗi',
            description: error.message || 'Không thể thêm sản phẩm vào yêu thích',
            type: 'error'
          })
          return
        }
        toaster.create({
          title: 'Đã thêm vào yêu thích',
          description: 'Sản phẩm đã được thêm vào danh sách yêu thích',
          type: 'success'
        })
        onFavoriteChange(true, data?.id || null)
      }
    } catch (error) {
      toaster.create({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi, vui lòng thử lại',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

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
              {images.map((image, index) => (
                <Carousel.Item key={index} index={index}>
                  <Box
                    width='100%'
                    height='412px'
                    position='relative'
                    overflow='hidden'
                    borderRadius='16px'
                  >
                    <Image
                      src={image}
                      alt={`Product ${index + 1}`}
                      width='100%'
                      height='100%'
                      objectFit='cover'
                      objectPosition='center'
                    />
                  </Box>
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>
          </Carousel.Control>
        </Carousel.Root>
        <Button
          position='absolute'
          top={4}
          right={4}
          bg='white'
          color={isFavorite ? '#EF4444' : '#6B7280'}
          borderRadius='full'
          p={3}
          minW='auto'
          h='auto'
          onClick={handleToggleFavorite}
          disabled={isProcessing}
          _hover={{ bg: 'gray.100' }}
          zIndex={10}
          boxShadow='md'
        >
          <Icon size='lg'>{isFavorite ? <HiHeart /> : <HiOutlineHeart />}</Icon>
        </Button>
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
                {images.map((image, index) => (
                  <Carousel.Item key={index} index={index}>
                    <Box
                      width='120px'
                      height='120px'
                      borderRadius='8px'
                      overflow='hidden'
                      cursor='pointer'
                      border={currentPage === index ? '2px solid #204ED3' : '1px solid #E5E5E5'}
                      flexShrink={0}
                      onClick={() => {
                        setCurrentPage(index)
                        onSelectImage(index)
                      }}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        width='100%'
                        height='100%'
                        objectFit='cover'
                      />
                    </Box>
                  </Carousel.Item>
                ))}
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

function ProductInfoCard({ product }: { product: ProductDetailData }) {
  return (
    <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' p={8}>
      <VStack align='stretch' gap={6}>
        <VStack align='flex-start' gap={2}>
          <Text fontSize='32px' fontWeight='700' color='#04113E' textTransform='uppercase'>
            {product.title}
          </Text>
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
          <HStack gap={2}>
            <Text fontSize='32px' fontWeight='700' color='#204ED3' lineHeight='0.875em'>
              {new Intl.NumberFormat('vi-VN').format(product.price)}
            </Text>
            <Text fontSize='16px' fontWeight='700' color='#04113E'>
              VNĐ
            </Text>
          </HStack>
          <Box borderTop='1px solid #E5E7EB' pt={4} width='100%'>
            <Text fontSize='14px' fontWeight='400' color='#A1A1A1'>
              {formatTimeAgo(product.createdAt)}
            </Text>
          </Box>
        </VStack>

        <HStack gap={6}>
          <Button
            variant='outline'
            borderColor='#DADADA'
            color='#222222'
            borderRadius='9999px'
            px={4}
            py={2}
            gap={2}
            fontWeight='700'
            fontSize='16px'
          >
            <Icon size='md'>
              <HiOutlineHeart />
            </Icon>
            Lưu
          </Button>
        </HStack>

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
            0933.******
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
        >
          Đặt hẹn lái thử
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
          <Image
            src='https://via.placeholder.com/60x60'
            alt={store.name}
            width='60px'
            height='60px'
            borderRadius='full'
          />
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

function CommentsSection() {
  return (
    <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' alignSelf='stretch'>
      <VStack align='stretch' gap={10}>
        <Box px={6} pt={6}>
          <Text fontSize='16px' fontWeight='600' color='#222222'>
            Bình luận
          </Text>
        </Box>
        <VStack align='center' gap={3} px={6}>
          <Image
            src='https://via.placeholder.com/80x80'
            alt='Empty comments'
            width='80px'
            height='80px'
          />
          <Text fontSize='14px' fontWeight='400' color='#8C8C8C' textAlign='center'>
            Chưa có bình luận nào.
            <br />
            Hãy để lại bình luận cho người bán.
          </Text>
        </VStack>
        <Separator />
        <HStack gap={5} align='flex-end' px={6} pb={6}>
          <Box
            flex={1}
            bg='#F5F5F5'
            border='1px solid #E5E5E5'
            borderRadius='8px'
            p={2}
            height='44px'
          >
            <Textarea
              placeholder='Bình luận...'
              border='none'
              fontSize='16px'
              fontWeight='400'
              color='#737373'
              resize='none'
              bg='transparent'
              _focus={{ boxShadow: 'none' }}
              height='100%'
            />
          </Box>
          <Icon size='lg' color='#000000' cursor='pointer' width='32px' height='32px'>
            <HiX />
          </Icon>
        </HStack>
      </VStack>
    </Card.Root>
  )
}

function EmotionReactionSection() {
  const emotions = [
    { emoji: '😊', label: 'Hài lòng' },
    { emoji: '😍', label: 'Yêu thích' },
    { emoji: '😮', label: 'Ngạc nhiên' },
    { emoji: '😢', label: 'Buồn' },
    { emoji: '😡', label: 'Tức giận' }
  ]

  return (
    <Card.Root bg='white' borderRadius='12px' border='1px solid #E5E5E5' alignSelf='stretch' mt={6}>
      <VStack align='center' gap={6} p={6}>
        <Text fontSize='18px' fontWeight='700' color='#222222' textAlign='center' maxW='548px'>
          Bạn có cảm thấy tin đăng này rõ ràng và đáng tin cậy để mua hàng không?
        </Text>
        <HStack gap={6} justify='center' wrap='wrap'>
          {emotions.map(emotion => (
            <Button
              key={emotion.label}
              variant='ghost'
              borderRadius='full'
              width='45px'
              height='45px'
              p={0}
              display='flex'
              alignItems='center'
              justifyContent='center'
              fontSize='24px'
              _hover={{ bg: 'gray.100', transform: 'scale(1.1)' }}
              transition='all 0.2s'
            >
              {emotion.emoji}
            </Button>
          ))}
        </HStack>
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
      <VStack align='stretch' gap={5}>
        <HStack justify='space-between' align='center'>
          <Text fontSize='24px' fontWeight='700' color='#04113E'>
            So sánh sản phẩm tương tự
          </Text>
          <HStack gap={2} border='1px solid #204ED3' borderRadius='12px' px={2.5} py={2.5}>
            <Icon size='md' color='#204ED3'>
              <IoSparkles />
            </Icon>
            <Text fontSize='24px' fontWeight='700' color='#204ED3'>
              Gợi ý bởi AI
            </Text>
          </HStack>
        </HStack>

        <HStack gap={5} align='flex-end'>
          <Box flex={1} bg='white' border='1px solid #E5E5E5' borderRadius='12px' p={2}>
            <Text fontSize='16px' fontWeight='400' color='#04113E' pl={4}>
              Tìm sản phẩm khác để so sánh...
            </Text>
          </Box>
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
        </HStack>

        <Flex gap={5} position='relative'>
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
              <Text fontSize='16px' fontWeight='400' color='white'>
                Xe đang xem
              </Text>
            </Badge>
            <ProductComparisonCard product={currentProduct} isCurrent />
          </Box>
          <Icon
            size='lg'
            color='#204ED3'
            position='absolute'
            right='calc(100% + 10px)'
            top='50%'
            transform='translateY(-50%)'
            cursor='pointer'
          >
            <HiX />
          </Icon>
          {products.map(product => (
            <ProductComparisonCard key={product.id} product={product} />
          ))}
        </Flex>
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
        : 'https://via.placeholder.com/318x231'

  return (
    <Card.Root
      bg='white'
      borderRadius='16px'
      border={isCurrent ? '2px solid #204ED3' : '1px solid #EDEDED'}
      overflow='hidden'
      width='318px'
    >
      <Box position='relative' height='250px'>
        <Image src={imageUrl} alt={product.title} width='100%' height='100%' objectFit='cover' />
      </Box>
      <Card.Body p={4}>
        <VStack align='stretch' gap={2}>
          <Text fontSize='16px' fontWeight='700' color='#04113E' textTransform='uppercase'>
            {product.title}
          </Text>
          <HStack gap={2}>
            <Text fontSize='20px' fontWeight='700' color='#204ED3'>
              {typeof product.price === 'number'
                ? new Intl.NumberFormat('vi-VN').format(product.price)
                : product.price}
            </Text>
            <Text fontSize='16px' fontWeight='700' color='#04113E'>
              VNĐ
            </Text>
          </HStack>
          <SimpleGrid columns={4} gap={3} borderTop='1px solid #E5E5E5' pt={4} mt={2}>
            <VStack align='flex-start' gap={1} borderRight='1px solid #E5E5E5' pr={3}>
              <Text
                fontSize='18px'
                fontWeight='400'
                color='#737373'
                borderBottom='1px solid #E5E5E5'
                pb={2}
              >
                Số Km đã đi
              </Text>
              <Text fontSize='18px' fontWeight='400' color='#04113E'>
                {product.mileageKm
                  ? `${product.mileageKm.toLocaleString('vi-VN')} km`
                  : product.condition?.km || 'N/A'}
              </Text>
            </VStack>
            <VStack align='flex-start' gap={1} borderRight='1px solid #E5E5E5' pr={3}>
              <Text
                fontSize='18px'
                fontWeight='400'
                color='#737373'
                borderBottom='1px solid #E5E5E5'
                pb={2}
              >
                Xuất xứ
              </Text>
              <Text fontSize='18px' fontWeight='400' color='#04113E'>
                {product.origin || product.condition?.origin || 'N/A'}
              </Text>
            </VStack>
            <VStack align='flex-start' gap={1} borderRight='1px solid #E5E5E5' pr={3}>
              <Text
                fontSize='18px'
                fontWeight='400'
                color='#737373'
                borderBottom='1px solid #E5E5E5'
                pb={2}
              >
                Tình trạng
              </Text>
              <Text fontSize='18px' fontWeight='400' color='#04113E'>
                {product.conditionType
                  ? product.conditionType === 'new'
                    ? 'Xe mới'
                    : product.conditionType === 'used'
                      ? 'Đã sử dụng'
                      : product.conditionType
                  : product.condition?.status || 'N/A'}
              </Text>
            </VStack>
            <VStack align='flex-start' gap={1}>
              <Text
                fontSize='18px'
                fontWeight='400'
                color='#737373'
                borderBottom='1px solid #E5E5E5'
                pb={2}
              >
                Chính sách bảo hành
              </Text>
              <Text fontSize='18px' fontWeight='400' color='#04113E'>
                {product.warrantyPolicy || product.condition?.warranty || 'N/A'}
              </Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

function RelatedProductsSection({ products }: { products: any[] }) {
  return (
    <Box bg='#04113E' borderRadius='16px' p={8} mt={6}>
      <VStack align='stretch' gap={5}>
        <Text fontSize='24px' fontWeight='700' color='white' textAlign='center'>
          Thông tin dòng xe tương tự
        </Text>
        <SimpleGrid columns={{ base: 1, md: 4 }} gap={5}>
          {products.map(product => (
            <Card.Root key={product.id} bg='white' borderRadius='16px' overflow='hidden'>
              <Box position='relative' height='231px'>
                <Image
                  src={
                    product.image || product.mediaUrls?.[0] || 'https://via.placeholder.com/318x231'
                  }
                  alt={product.title}
                  width='100%'
                  height='100%'
                  objectFit='cover'
                />
                <Badge
                  position='absolute'
                  top={4}
                  right={4}
                  bg='rgba(0,0,0,0.3)'
                  color='white'
                  borderRadius='100px'
                  px={2}
                  py={1}
                  gap={1}
                >
                  <Icon size='sm' color='white'>
                    <HiOutlineChevronRight />
                  </Icon>
                  {product.imageCount || product.mediaUrls?.length || 0}
                </Badge>
              </Box>
              <Card.Body p={4}>
                <VStack align='stretch' gap={2}>
                  <HStack gap={2} wrap='wrap'>
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
                  <Text fontSize='16px' fontWeight='700' color='#04113E' textTransform='uppercase'>
                    {product.title}
                  </Text>
                  <HStack gap={2}>
                    <Text fontSize='20px' fontWeight='700' color='#204ED3'>
                      {typeof product.price === 'number'
                        ? new Intl.NumberFormat('vi-VN').format(product.price)
                        : product.price}
                    </Text>
                    <Text fontSize='16px' fontWeight='700' color='#04113E'>
                      VNĐ
                    </Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
        <Button
          variant='outline'
          borderColor='white'
          color='white'
          borderRadius='6px'
          px={5}
          py={3}
          fontWeight='700'
          fontSize='14px'
          alignSelf='center'
          _hover={{ bg: 'rgba(255,255,255,0.1)' }}
        >
          Xem thêm
        </Button>
      </VStack>
    </Box>
  )
}
