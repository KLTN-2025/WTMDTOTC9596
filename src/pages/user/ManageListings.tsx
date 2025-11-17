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
  Portal,
  Select,
  Spinner,
  Text,
  VStack,
  createListCollection
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  HiOutlinePencilSquare,
  HiOutlineEyeSlash,
  HiOutlineTrash,
  HiOutlineCheckCircle
} from 'react-icons/hi2'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { AppBreadcrumb } from '@/components/common/Breadcrumb'
import {
  deleteStoreProduct,
  getStoreProductCounts,
  getStoreProducts,
  updateStoreProductStatus
} from '@/api/products'
import type { StoreProduct, StoreProductCounts } from '@/types/products'
import type { StoreProductsFilters } from '@/api/products'
import { PATHS } from '@/configs/paths'

const filtersSchema = z.object({
  sortBy: z.enum(['updated_desc', 'price_asc', 'price_desc']),
  search: z.string()
})

type FiltersForm = z.output<typeof filtersSchema>
type ListingTab = 'all' | StoreProduct['status']

const STATUS_LABELS: Record<StoreProduct['status'], string> = {
  pending: 'Chờ duyệt',
  available: 'Đang đăng',
  sold: 'Đã bán',
  rejected: 'Bị từ chối'
}

const STATUS_BADGE_COLORS: Record<StoreProduct['status'], string> = {
  available: '#16A34A',
  sold: '#9CA3AF',
  pending: '#F59E0B',
  rejected: '#EF4444'
}

const STATUS_SUMMARY: Record<ListingTab, string> = {
  all: '',
  available: 'đang đăng',
  pending: 'chờ duyệt',
  sold: 'đã bán',
  rejected: 'bị từ chối'
}

const LISTING_TABS: Array<{ key: ListingTab; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Đang đăng' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'sold', label: 'Đã bán' },
  { key: 'rejected', label: 'Bị từ chối' }
]

const SORT_COLLECTION = createListCollection({
  items: [
    { label: 'Mới cập nhật', value: 'updated_desc' },
    { label: 'Giá tăng dần', value: 'price_asc' },
    { label: 'Giá giảm dần', value: 'price_desc' }
  ]
})

export function ManageListings() {
  const { user, store, isLoading: isLoadingAuth } = useAuth()
  const toast = useToast()
  const storeId = store?.id ?? null
  const [listings, setListings] = useState<StoreProduct[]>([])
  const [counts, setCounts] = useState<StoreProductCounts | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [tab, setTab] = useState<ListingTab>('all')
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [hasFetched, setHasFetched] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const pageSize = 6

  const { register, handleSubmit, watch, control } = useForm<FiltersForm>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      sortBy: 'updated_desc',
      search: ''
    }
  })

  const sortBy = watch('sortBy')

  const statusCounts = useMemo((): Record<ListingTab, number> => {
    return {
      all: counts?.total ?? totalItems,
      available: counts?.available ?? 0,
      pending: counts?.pending ?? 0,
      sold: counts?.sold ?? 0,
      rejected: counts?.rejected ?? 0
    }
  }, [counts, totalItems])

  const totalPages = useMemo(() => {
    if (totalItems === 0) {
      return 1
    }
    return Math.max(1, Math.ceil(totalItems / pageSize))
  }, [totalItems, pageSize])

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  )

  const refreshCounts = useCallback(async () => {
    if (!storeId) {
      setCounts(null)
      return
    }

    const { data, error } = await getStoreProductCounts(storeId)

    if (error) {
      toast.error(error.message || 'Không thể lấy thống kê tin đăng', {
        title: 'Lỗi tải thống kê'
      })
      return
    }

    setCounts(data)
  }, [storeId])

  const refreshListings = useCallback(async () => {
    if (!storeId) {
      setListings([])
      setTotalItems(0)
      return
    }
    setIsFetching(true)
    setFetchError(null)
    const statusFilter = tab === 'all' ? undefined : tab
    const payload: StoreProductsFilters = {
      storeId,
      sortBy,
      search: searchTerm,
      page,
      pageSize
    }
    if (statusFilter) {
      payload.status = statusFilter
    }

    const { data, error, count } = await getStoreProducts(payload)

    if (error) {
      setListings([])
      setTotalItems(0)
      setFetchError(error.message || 'Không thể tải danh sách tin đăng')
      toast.error(error.message || 'Không thể tải danh sách tin đăng', {
        title: 'Lỗi tải danh sách'
      })
    } else {
      setListings(data ?? [])
      const total = count ?? 0
      setTotalItems(total)
      setHasFetched(true)
      const nextPage = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
      if (page > nextPage) {
        setPage(nextPage)
      }
    }

    setIsFetching(false)
  }, [storeId, tab, sortBy, searchTerm, page, pageSize])

  useEffect(() => {
    if (storeId) {
      refreshCounts()
    }
  }, [storeId, refreshCounts])

  useEffect(() => {
    refreshListings()
  }, [refreshListings])

  useEffect(() => {
    setPage(1)
  }, [sortBy])

  const onSubmitFilters = handleSubmit(values => {
    setSearchTerm(values.search.trim())
    setPage(1)
  })

  const formatCurrency = useMemo(() => new Intl.NumberFormat('vi-VN'), [])
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
    []
  )

  const formatUpdatedAt = useCallback(
    (value: string | null) => {
      if (!value) {
        return 'Chưa cập nhật'
      }
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return 'Chưa cập nhật'
      }
      return dateFormatter.format(date)
    },
    [dateFormatter]
  )

  const handleTabChange = (next: ListingTab) => {
    setTab(next)
    setPage(1)
  }

  const handleToggleVisibility = async (product: StoreProduct) => {
    if (!storeId || !user) {
      return
    }
    if (product.status === 'sold' || product.status === 'rejected') {
      return
    }
    const nextStatus: StoreProduct['status'] =
      product.status === 'available' ? 'pending' : 'available'
    setActionLoadingId(product.id)
    const { error } = await updateStoreProductStatus(product.id, storeId, nextStatus, user)
    if (error) {
      toast.error(error.message || 'Không thể cập nhật trạng thái tin', {
        title: 'Lỗi cập nhật trạng thái'
      })
    } else {
      toast.success(
        nextStatus === 'available'
          ? 'Tin đã hiển thị trở lại'
          : 'Tin đã chuyển sang trạng thái chờ duyệt',
        {
          title: 'Cập nhật trạng thái'
        }
      )
      await refreshListings()
      await refreshCounts()
    }
    setActionLoadingId(null)
  }

  const handleMarkSold = async (product: StoreProduct) => {
    if (!storeId || !user || product.status === 'sold') {
      return
    }
    setActionLoadingId(product.id)
    const { error } = await updateStoreProductStatus(product.id, storeId, 'sold', user)
    if (error) {
      toast.error(error.message || 'Không thể đánh dấu đã bán', {
        title: 'Lỗi cập nhật trạng thái'
      })
    } else {
      toast.success('Tin đã được đánh dấu là đã bán', {
        title: 'Đánh dấu thành công'
      })
      await refreshListings()
      await refreshCounts()
    }
    setActionLoadingId(null)
  }

  const handleDelete = async (productId: string) => {
    if (!storeId || !user) {
      return
    }
    setActionLoadingId(productId)
    const { error } = await deleteStoreProduct(productId, storeId, user)
    if (error) {
      toast.error(error.message || 'Không thể xóa tin đăng', {
        title: 'Lỗi xóa tin'
      })
    } else {
      toast.success('Tin đăng đã được xóa', {
        title: 'Xóa tin thành công'
      })
      if (page > 1 && listings.length === 1) {
        setPage(prev => Math.max(1, prev - 1))
      } else {
        await refreshListings()
      }
      await refreshCounts()
    }
    setActionLoadingId(null)
  }

  if (isLoadingAuth) {
    return (
      <Box bg='#F8FAFC' minH='100vh'>
        <Container maxW='1200px' px={4} py={10}>
          <Flex justify='center'>
            <Spinner size='lg' color='#204ED3' />
          </Flex>
        </Container>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box bg='#F8FAFC' minH='100vh' py={10}>
        <Container maxW='1200px' px={4}>
          <Card.Root
            bg='white'
            borderRadius='16px'
            p={10}
            textAlign='center'
            className='rounded-2xl'
          >
            <VStack gap={4}>
              <Text fontSize='18px' fontWeight='700' color='#04113E'>
                Bạn cần đăng nhập để xem tin đã đăng
              </Text>
              <RouterLink to={PATHS.LOGIN}>
                <Button
                  bg='#204ED3'
                  color='white'
                  borderRadius='6px'
                  px={6}
                  py={3}
                  fontWeight='600'
                  fontSize='14px'
                  className='rounded-md px-6 py-3 font-semibold text-sm'
                >
                  Đăng nhập
                </Button>
              </RouterLink>
            </VStack>
          </Card.Root>
        </Container>
      </Box>
    )
  }

  if (!storeId) {
    return (
      <Box bg='#F8FAFC' minH='100vh' py={10}>
        <Container maxW='1200px' px={4}>
          <Card.Root bg='white' borderRadius='16px' p={{ base: 6, md: 10 }} className='rounded-2xl'>
            <VStack gap={4} textAlign='center'>
              <Text fontSize='20px' fontWeight='700' color='#04113E'>
                Bạn chưa đăng ký cửa hàng
              </Text>
              <Text fontSize='16px' color='#6B7280'>
                Hãy đăng ký cửa hàng để quản lý các tin đăng bán xe của bạn
              </Text>
              <RouterLink to={PATHS.STORE_REGISTRATION}>
                <Button
                  bg='#204ED3'
                  color='white'
                  borderRadius='6px'
                  px={6}
                  py={3}
                  fontWeight='600'
                  fontSize='14px'
                  className='rounded-md px-6 py-3 font-semibold text-sm'
                >
                  Đăng ký cửa hàng
                </Button>
              </RouterLink>
            </VStack>
          </Card.Root>
        </Container>
      </Box>
    )
  }

  const currentCount = statusCounts[tab] ?? 0
  const summary = STATUS_SUMMARY[tab]

  return (
    <Box bg='#F8FAFC' minH='100vh'>
      <Container maxW='1200px' px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
        <Box mb={3}>
          <AppBreadcrumb
            items={[{ label: 'Trang chủ', path: PATHS.HOME }, { label: 'Quản lý tin' }]}
          />
        </Box>

        <Flex
          justify='space-between'
          align='center'
          mb={{ base: 4, md: 5 }}
          wrap='wrap'
          gap={3}
          className='mb-5'
        >
          <Text
            fontSize='18px'
            fontWeight='700'
            color='#04113E'
            className='text-[18px] font-bold text-[#04113E]'
          >
            Quản lý tin của bạn
          </Text>
          <HStack gap={3} flexWrap='wrap'>
            <RouterLink to={PATHS.SELL}>
              <Button
                bg='#204ED3'
                color='white'
                borderRadius='6px'
                px={4}
                py={2.5}
                fontWeight='700'
                fontSize='13px'
                _hover={{ bg: '#1a3fb0' }}
                className='rounded-md px-4 py-2.5 font-bold text-xs md:text-sm'
              >
                Đăng tin mới
              </Button>
            </RouterLink>
          </HStack>
        </Flex>

        <Card.Root
          bg='white'
          borderRadius='14px'
          p={{ base: 4, md: 5 }}
          mb={5}
          className='rounded-xl'
        >
          <Flex
            as='form'
            onSubmit={onSubmitFilters}
            align='center'
            gap={3}
            direction={{ base: 'column', md: 'row' }}
            justify='space-between'
            wrap='wrap'
          >
            <HStack gap={3} flex='1' minW='220px' justify='flex-start'>
              <Text fontSize='15px' color='#6B7280' whiteSpace='nowrap'>
                Tổng {currentCount} tin {summary ? summary : ''}
              </Text>
            </HStack>
            <Box display='flex' gap={2}>
              <HStack gap={2} align='center'>
                <Controller
                  control={control}
                  name='sortBy'
                  render={({ field }) => (
                    <Select.Root
                      collection={SORT_COLLECTION}
                      value={field.value ? [field.value] : []}
                      onValueChange={({ value }) => field.onChange(value[0] ?? 'updated_desc')}
                      onInteractOutside={() => field.onBlur()}
                      size='sm'
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger minW='140px' className='min-w-[140px]'>
                          <Select.ValueText placeholder='Chọn sắp xếp' />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {SORT_COLLECTION.items.map(item => (
                              <Select.Item item={item} key={item.value}>
                                {item.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  )}
                />
              </HStack>
              <HStack gap={2} flex='1' minW='260px'>
                <Input
                  placeholder='Tìm theo tiêu đề tin'
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={2}
                  className='bg-white border border-[#E5E5E5] rounded-lg px-4 py-2'
                  {...register('search')}
                />
                <Button
                  type='submit'
                  variant='outline'
                  borderColor='#204ED3'
                  color='#204ED3'
                  borderRadius='6px'
                  px={4}
                  py={2}
                  fontWeight='600'
                  fontSize='13px'
                  className='rounded-md px-4 py-2 font-semibold text-xs md:text-sm'
                >
                  Lọc
                </Button>
              </HStack>
            </Box>
          </Flex>
        </Card.Root>

        <Card.Root
          bg='white'
          borderRadius='14px'
          p={{ base: 4, md: 5 }}
          mb={5}
          className='rounded-xl'
        >
          <HStack gap={3} wrap='wrap'>
            {LISTING_TABS.map(item => (
              <Button
                key={item.key}
                size='sm'
                bg={tab === item.key ? '#204ED3' : '#F3F4F6'}
                color={tab === item.key ? 'white' : '#04113E'}
                borderRadius='9999px'
                px={4}
                py={1}
                fontWeight='600'
                fontSize='13px'
                className='rounded-full px-4 py-1 text-xs md:text-sm font-semibold'
                onClick={() => handleTabChange(item.key)}
              >
                <HStack gap={2}>
                  <Text>{item.label}</Text>
                  <Badge
                    bg={tab === item.key ? 'white' : '#E5E7EB'}
                    color={tab === item.key ? '#204ED3' : '#04113E'}
                    borderRadius='9999px'
                    px={2}
                    className='rounded-full px-2'
                  >
                    {statusCounts[item.key]}
                  </Badge>
                </HStack>
              </Button>
            ))}
          </HStack>
        </Card.Root>

        <VStack align='stretch' gap={4}>
          {!hasFetched && isFetching && (
            <Card.Root bg='white' borderRadius='14px' p={10} textAlign='center'>
              <Spinner size='lg' color='#204ED3' />
            </Card.Root>
          )}

          {fetchError && !isFetching && (
            <Card.Root bg='white' borderRadius='14px' p={10} textAlign='center'>
              <Text fontSize='16px' color='#EF4444'>
                {fetchError}
              </Text>
            </Card.Root>
          )}

          {listings.map(item => {
            const cover = item.mediaUrls[0] ?? 'https://via.placeholder.com/250x231'
            const isActionLoading = actionLoadingId === item.id
            return (
              <Card.Root
                key={item.id}
                bg='white'
                borderRadius='14px'
                overflow='hidden'
                className='rounded-xl transition-shadow hover:shadow-lg'
              >
                <Flex direction={{ base: 'column', md: 'row' }}>
                  <Box
                    width={{ base: '100%', md: '200px' }}
                    height={{ base: '160px', md: '180px' }}
                    position='relative'
                    flexShrink={0}
                  >
                    <Image
                      src={cover}
                      alt={item.title}
                      width='100%'
                      height='100%'
                      objectFit='cover'
                    />
                    <Badge
                      position='absolute'
                      top={3}
                      left={3}
                      bg={STATUS_BADGE_COLORS[item.status]}
                      color='white'
                      borderRadius='9999px'
                      px={2.5}
                      py={0.5}
                      fontSize='12px'
                      className='rounded-full px-2.5 py-0.5'
                    >
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </Box>

                  <Card.Body p={{ base: 4, md: 4 }} flex={1}>
                    <VStack align='stretch' gap={2.5}>
                      <Flex justify='space-between' align='start' gap={2} wrap='wrap'>
                        <Text
                          fontSize='15px'
                          fontWeight='700'
                          color='#04113E'
                          textTransform='uppercase'
                          className='text-[14px] md:text-[15px] font-bold text-[#04113E] uppercase'
                        >
                          {item.title}
                        </Text>
                        <Text fontSize='12px' color='#6B7280' className='text-xs text-[#6B7280]'>
                          Cập nhật: {formatUpdatedAt(item.updatedAt)}
                        </Text>
                      </Flex>
                      <HStack gap={2} align='baseline'>
                        <Text
                          fontSize='18px'
                          fontWeight='700'
                          color='#204ED3'
                          className='text-[18px] font-bold text-[#204ED3]'
                        >
                          {formatCurrency.format(item.price)}
                        </Text>
                        <Text
                          fontSize='13px'
                          fontWeight='600'
                          color='#04113E'
                          className='text-[13px] font-semibold text-[#04113E]'
                        >
                          VNĐ
                        </Text>
                      </HStack>

                      <Box h='1px' bg='#E5E7EB' />

                      <Flex gap={3} flexWrap='wrap' className='text-xs text-[#6B7280]'>
                        <Text fontSize='12px' color='#6B7280'>
                          Lượt xem: 0
                        </Text>
                        <Text fontSize='12px' color='#6B7280'>
                          Liên hệ: 0
                        </Text>
                        <Text fontSize='12px' color='#6B7280'>
                          Cập nhật: {formatUpdatedAt(item.updatedAt)}
                        </Text>
                      </Flex>

                      <Box h='1px' bg='#E5E7EB' />

                      <Flex gap={2} flexWrap='wrap'>
                        <Button
                          variant='outline'
                          borderColor='#E5E5E5'
                          color='#1B2C5D'
                          borderRadius='6px'
                          size='sm'
                          px={3}
                          py={2}
                          fontSize='12px'
                          className='rounded-md px-3 py-2 text-xs'
                          disabled={isActionLoading}
                        >
                          <HStack gap={1.5}>
                            <Icon boxSize={4}>
                              <HiOutlinePencilSquare />
                            </Icon>
                            <Text fontSize='12px'>Chỉnh sửa</Text>
                          </HStack>
                        </Button>
                        <Button
                          variant='outline'
                          borderColor='#E5E5E5'
                          color='#171717'
                          borderRadius='6px'
                          size='sm'
                          px={3}
                          py={2}
                          fontSize='12px'
                          className='rounded-md px-3 py-2 text-xs'
                          onClick={() => handleToggleVisibility(item)}
                          disabled={
                            isActionLoading || item.status === 'sold' || item.status === 'rejected'
                          }
                        >
                          <HStack gap={1.5}>
                            <Icon boxSize={4}>
                              <HiOutlineEyeSlash />
                            </Icon>
                            <Text fontSize='12px'>
                              {item.status === 'available' ? 'Ẩn tin' : 'Hiển thị'}
                            </Text>
                          </HStack>
                        </Button>
                        <Button
                          bg='#204ED3'
                          color='white'
                          borderRadius='6px'
                          size='sm'
                          px={3}
                          py={2}
                          fontSize='12px'
                          _hover={{ bg: '#1a3fb0' }}
                          className='rounded-md px-3 py-2 text-xs'
                          onClick={() => handleMarkSold(item)}
                          disabled={isActionLoading || item.status === 'sold'}
                        >
                          <HStack gap={1.5}>
                            <Icon boxSize={4}>
                              <HiOutlineCheckCircle />
                            </Icon>
                            <Text fontSize='12px'>Đánh dấu đã bán</Text>
                          </HStack>
                        </Button>
                        <Button
                          variant='outline'
                          borderColor='#E5E5E5'
                          color='#EF4444'
                          borderRadius='6px'
                          size='sm'
                          px={3}
                          py={2}
                          fontSize='12px'
                          className='rounded-md px-3 py-2 text-xs'
                          onClick={() => handleDelete(item.id)}
                          disabled={isActionLoading}
                        >
                          <HStack gap={1.5}>
                            <Icon boxSize={4}>
                              <HiOutlineTrash />
                            </Icon>
                            <Text fontSize='12px'>Xóa tin</Text>
                          </HStack>
                        </Button>
                      </Flex>
                    </VStack>
                  </Card.Body>
                </Flex>
              </Card.Root>
            )
          })}

          {hasFetched && listings.length === 0 && !isFetching && !fetchError && (
            <Card.Root bg='white' borderRadius='14px' p={10} textAlign='center'>
              <Text fontSize='16px' color='#6B7280'>
                Chưa có tin phù hợp
              </Text>
            </Card.Root>
          )}

          {listings.length > 0 && (
            <Flex justify='center' gap={3} mb={5} className='mb-5'>
              <Button
                variant='outline'
                borderColor='#E5E5E5'
                color='#04113E'
                borderRadius='6px'
                px={4}
                py={2}
                fontSize='13px'
                fontWeight='500'
                className='rounded-md px-4 py-2 text-xs md:text-sm font-medium'
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                ←
              </Button>
              {pages.map(p => (
                <Button
                  key={p}
                  variant={p === page ? undefined : 'outline'}
                  bg={p === page ? '#204ED3' : undefined}
                  color={p === page ? 'white' : '#04113E'}
                  borderColor='#E5E5E5'
                  borderRadius='6px'
                  px={4}
                  py={2}
                  fontSize='13px'
                  fontWeight='500'
                  className={`rounded-md px-4 py-2 text-xs md:text-sm font-medium ${p === page ? 'bg-[#204ED3] text-white' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant='outline'
                borderColor='#E5E5E5'
                color='#04113E'
                borderRadius='6px'
                px={4}
                py={2}
                fontSize='13px'
                fontWeight='500'
                className='rounded-md px-4 py-2 text-xs md:text-sm font-medium'
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                →
              </Button>
            </Flex>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
