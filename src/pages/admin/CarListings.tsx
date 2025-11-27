import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  Dialog,
  Field,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  Table,
  Text,
  Textarea,
  VStack,
  ScrollArea,
  Spinner,
  Badge
} from '@chakra-ui/react'
import { Tooltip } from '@/components/ui/tooltip'
import { FiSearch, FiCheck, FiX } from 'react-icons/fi'
import { getAdminProducts, approveProduct, rejectProduct, type AdminProduct } from '@/api/products'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/utils/date'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { useDebouncedFilter } from '@/hooks/useDebouncedFilter'
import { PaginationControls } from '@/components/common/PaginationControls'
import { SelectField } from '@/components/common/SelectField'
import { createMasterDataCollection } from '@/utils/collections'

const ITEMS_PER_PAGE = 10

const rejectSchema = z.object({
  reason: z.string().min(1, 'Vui lòng nhập lý do từ chối')
})

type RejectFormData = z.infer<typeof rejectSchema>

type FilterState = {
  q: string
  status: 'all' | 'pending' | 'available' | 'sold' | 'rejected'
}

export function CarListings() {
  const { user } = useAuth()
  const toast = useToast()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    status: 'pending'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null)
  const [processingProductId, setProcessingProductId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatCurrency = useMemo(() => new Intl.NumberFormat('vi-VN'), [])

  const statusCollection = useMemo(
    () =>
      createMasterDataCollection([
        { label: 'Tất cả trạng thái', value: 'all' },
        { label: 'Chờ duyệt', value: 'pending' },
        { label: 'Đã duyệt', value: 'available' },
        { label: 'Đã bán', value: 'sold' },
        { label: 'Đã từ chối', value: 'rejected' }
      ]),
    []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: ''
    }
  })

  const { debouncedFilter: debouncedSearch } = useDebouncedFilter(filters.q, {
    onFilterChange: () => setCurrentPage(1)
  })

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const options: {
        page: number
        pageSize: number
        search?: string
        status?: 'all' | 'pending' | 'available' | 'sold' | 'rejected'
      } = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        status: filters.status
      }

      if (debouncedSearch.trim()) {
        options.search = debouncedSearch.trim()
      }

      const { data, error, totalCount: count } = await getAdminProducts(options)

      if (error) {
        toast.error(error.message || 'Không thể tải danh sách sản phẩm', {
          title: 'Lỗi tải danh sách'
        })
        return
      }

      setProducts(data || [])
      setTotalCount(count || 0)
    } catch {
      toast.error('Đã xảy ra lỗi khi tải danh sách sản phẩm', {
        title: 'Lỗi'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [currentPage, debouncedSearch, filters.status])

  const handleApprove = async (product: AdminProduct) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để thực hiện thao tác này', {
        title: 'Lỗi'
      })
      return
    }

    setProcessingProductId(product.id)
    try {
      const { error } = await approveProduct(product.id, user.id)

      if (error) {
        toast.error(error.message || 'Không thể duyệt sản phẩm', {
          title: 'Duyệt thất bại'
        })
        return
      }

      toast.success('Sản phẩm đã được duyệt', {
        title: 'Duyệt thành công'
      })

      loadProducts()
    } catch {
      toast.error('Đã xảy ra lỗi khi duyệt sản phẩm', {
        title: 'Lỗi'
      })
    } finally {
      setProcessingProductId(null)
    }
  }

  const openRejectDialog = (product: AdminProduct) => {
    setSelectedProduct(product)
    setIsRejectDialogOpen(true)
  }

  const handleReject = async (formData: RejectFormData) => {
    if (!selectedProduct || !user) return

    setProcessingProductId(selectedProduct.id)
    setIsSubmitting(true)
    try {
      const { error } = await rejectProduct(selectedProduct.id, user.id, formData.reason)

      if (error) {
        toast.error(error.message || 'Không thể từ chối sản phẩm', {
          title: 'Từ chối thất bại'
        })
        return
      }

      toast.success('Sản phẩm đã được từ chối', {
        title: 'Từ chối thành công'
      })

      setIsRejectDialogOpen(false)
      setSelectedProduct(null)
      reset()
      loadProducts()
    } catch {
      toast.error('Đã xảy ra lỗi khi từ chối sản phẩm', {
        title: 'Lỗi'
      })
    } finally {
      setProcessingProductId(null)
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow'
      case 'available':
        return 'green'
      case 'sold':
        return 'blue'
      case 'rejected':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt'
      case 'available':
        return 'Đã duyệt'
      case 'sold':
        return 'Đã bán'
      case 'rejected':
        return 'Đã từ chối'
      default:
        return status
    }
  }

  if (isLoading && products.length === 0) {
    return (
      <Box p={6}>
        <Card.Root bg='white' borderRadius='16px' p={8}>
          <Flex justify='center' align='center' minH='400px'>
            <Spinner size='lg' color='#204ED3' />
          </Flex>
        </Card.Root>
      </Box>
    )
  }

  return (
    <Box p={2}>
      <VStack align='stretch' gap={6}>
        <VStack align='start' gap={2}>
          <Heading fontSize='24px' fontWeight='700' color='#04113E'>
            Kiểm duyệt tin đăng xe
          </Heading>
          <Text fontSize='14px' color='#6B7280'>
            Quản lý và kiểm duyệt các tin đăng xe trong hệ thống
          </Text>
        </VStack>

        <Card.Root bg='white' borderRadius='16px' p={6}>
          <VStack align='stretch' gap={4}>
            <HStack gap={3}>
              <Box position='relative' flex={1}>
                <Icon
                  position='absolute'
                  left={3}
                  top='50%'
                  transform='translateY(-50%)'
                  color='#737373'
                  fontSize='16px'
                  zIndex={1}
                >
                  <FiSearch />
                </Icon>
                <Input
                  placeholder='Tìm kiếm theo tiêu đề...'
                  color='#04113E'
                  pl={9}
                  pr={4}
                  py={2}
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  fontSize='14px'
                  value={filters.q}
                  onChange={e => setFilters({ ...filters, q: e.target.value })}
                />
              </Box>
              <Box minW='180px' maxW='200px'>
                <SelectField
                  collection={statusCollection}
                  value={filters.status}
                  onChange={value =>
                    setFilters(prev => {
                      setCurrentPage(1)
                      return {
                        ...prev,
                        status: (value as FilterState['status']) || 'all'
                      }
                    })
                  }
                  placeholder='Chọn trạng thái'
                  size='md'
                />
              </Box>
            </HStack>

            <ScrollArea.Root>
              <ScrollArea.Viewport>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Sản phẩm</Table.ColumnHeader>
                      <Table.ColumnHeader>Thông tin</Table.ColumnHeader>
                      <Table.ColumnHeader>Giá</Table.ColumnHeader>
                      <Table.ColumnHeader>Trạng thái</Table.ColumnHeader>
                      <Table.ColumnHeader>Ngày tạo</Table.ColumnHeader>
                      <Table.ColumnHeader>Thao tác</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {products.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={6}>
                          <Flex justify='center' align='center' py={8}>
                            <Text fontSize='14px' color='#6B7280'>
                              Không có sản phẩm nào
                            </Text>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      products.map(product => (
                        <Table.Row key={product.id}>
                          <Table.Cell>
                            <HStack gap={3}>
                              {product.mediaUrls && product.mediaUrls.length > 0 ? (
                                <Image
                                  src={product.mediaUrls[0]}
                                  alt={product.title}
                                  width='60px'
                                  height='60px'
                                  borderRadius='8px'
                                  objectFit='cover'
                                  bg='#E5E5E5'
                                />
                              ) : (
                                <Box
                                  width='60px'
                                  height='60px'
                                  borderRadius='8px'
                                  bg='#E5E5E5'
                                  display='flex'
                                  alignItems='center'
                                  justifyContent='center'
                                >
                                  <Text fontSize='12px' color='#737373'>
                                    No Image
                                  </Text>
                                </Box>
                              )}
                              <VStack align='start' gap={0}>
                                <Text
                                  fontSize='14px'
                                  fontWeight='600'
                                  color='#04113E'
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '300px'
                                  }}
                                >
                                  {product.title}
                                </Text>
                                {product.store && (
                                  <Text fontSize='12px' color='#6B7280'>
                                    {product.store.name}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <VStack align='start' gap={1}>
                              {product.brands && (
                                <Text fontSize='13px' color='#04113E'>
                                  {product.brands.name}
                                  {product.models && ` - ${product.models.name}`}
                                </Text>
                              )}
                              {product.yearManufactured && (
                                <Text fontSize='12px' color='#6B7280'>
                                  Năm: {product.yearManufactured}
                                </Text>
                              )}
                              {product.mileageKm !== null && (
                                <Text fontSize='12px' color='#6B7280'>
                                  Số km: {formatCurrency.format(product.mileageKm)}
                                </Text>
                              )}
                            </VStack>
                          </Table.Cell>
                          <Table.Cell>
                            <VStack align='start' gap={0}>
                              <Text fontSize='14px' fontWeight='600' color='#204ED3'>
                                {formatCurrency.format(product.price)}
                              </Text>
                              <Text fontSize='12px' color='#6B7280'>
                                VNĐ
                              </Text>
                            </VStack>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={getStatusBadgeColor(product.status)}>
                              {getStatusLabel(product.status)}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontSize='14px' color='#04113E'>
                              {formatDate(product.createdAt, 'dd/MM/yyyy')}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            {product.status === 'pending' && (
                              <HStack gap={2}>
                                <Tooltip content='Duyệt sản phẩm' showArrow>
                                  <IconButton
                                    size='sm'
                                    variant='ghost'
                                    colorPalette='green'
                                    onClick={() => handleApprove(product)}
                                    loading={processingProductId === product.id}
                                  >
                                    <FiCheck />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip content='Từ chối sản phẩm' showArrow>
                                  <IconButton
                                    size='sm'
                                    variant='ghost'
                                    colorPalette='red'
                                    onClick={() => openRejectDialog(product)}
                                    disabled={processingProductId === product.id}
                                  >
                                    <FiX />
                                  </IconButton>
                                </Tooltip>
                              </HStack>
                            )}
                            {product.status === 'rejected' && product.rejectedReason && (
                              <Tooltip content={product.rejectedReason} showArrow>
                                <Text fontSize='12px' color='#6B7280' cursor='help'>
                                  Lý do
                                </Text>
                              </Tooltip>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table.Root>
              </ScrollArea.Viewport>
            </ScrollArea.Root>

            <PaginationControls
              totalCount={totalCount}
              pageSize={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </VStack>
        </Card.Root>
      </VStack>

      <Dialog.Root open={isRejectDialogOpen} onOpenChange={e => setIsRejectDialogOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Từ chối sản phẩm</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit(handleReject)}>
              <Dialog.Body>
                <VStack align='stretch' gap={4}>
                  <Text fontSize='14px' color='#6B7280'>
                    Bạn có chắc chắn muốn từ chối sản phẩm "{selectedProduct?.title}"?
                  </Text>
                  <Field.Root invalid={!!errors.reason}>
                    <Field.Label>Lý do từ chối</Field.Label>
                    <Textarea
                      placeholder='Nhập lý do từ chối...'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      rows={4}
                      {...register('reason')}
                    />
                    {errors.reason && <Field.ErrorText>{errors.reason.message}</Field.ErrorText>}
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={2}>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsRejectDialogOpen(false)
                      setSelectedProduct(null)
                      reset()
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type='submit' bg='#dc2626' color='white' loading={isSubmitting}>
                    Từ chối
                  </Button>
                </HStack>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}
