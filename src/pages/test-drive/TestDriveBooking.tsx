import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  Container,
  Field,
  Flex,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useNavigate } from 'react-router'
import { getProductById } from '@/api/products'
import { createTestDriveBooking } from '@/api/test-drive'
import { useToast } from '@/hooks/useToast'
import type { ProductDetailData } from '@/types/products'
import { formatTimeAgo } from '@/utils/date'
import { useAuth } from '@/hooks/useAuth'
import { DatePicker } from '@/components/ui/date-picker'
const bookingSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z
    .string()
    .min(10, 'Số điện thoại không hợp lệ')
    .regex(/^[0-9+\-()\s]+$/, 'Số điện thoại chỉ được chứa số và ký tự +, -, (, )'),
  date: z.string().min(1, 'Vui lòng chọn ngày'),
  time: z.string().min(1, 'Vui lòng chọn giờ'),
  location: z.string().min(1, 'Vui lòng nhập địa điểm'),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().or(z.literal(''))
})

type BookingFormData = z.infer<typeof bookingSchema>

export function TestDriveBooking() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const formatDateForInput = (date: Date | null): string => {
    if (!date) {
      return ''
    }
    const offsetMs = date.getTimezoneOffset() * 60000
    const [isoDate] = new Date(date.getTime() - offsetMs).toISOString().split('T')
    return isoDate ?? ''
  }

  const parseDateFromInput = (value: string | null | undefined): Date | null => {
    if (!value) {
      return null
    }
    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) {
      return null
    }
    return new Date(year, month - 1, day)
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      date: formatDateForInput(today),
      time: '',
      location: '',
      note: ''
    }
  })

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        navigate('/products')
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await getProductById(id)

        if (error || !data) {
          toast.error('Không tìm thấy sản phẩm')
          navigate('/products')
          return
        }

        setProduct(data)
      } catch (error) {
        toast.error('Đã xảy ra lỗi khi tải thông tin sản phẩm')
        navigate('/products')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, navigate])

  const onSubmit = async (data: BookingFormData) => {
    if (!product || !id) return

    setIsSubmitting(true)
    try {
      const scheduledAt = new Date(`${data.date}T${data.time}`).toISOString()

      const { error } = await createTestDriveBooking(
        id,
        (product as any).storeId || null,
        {
          fullName: data.fullName,
          phone: data.phone,
          scheduledAt,
          location: data.location,
          ...(data.note && { note: data.note })
        },
        user
      )

      if (error) {
        toast.error(error.message || 'Không thể tạo lịch hẹn lái thử')
        return
      }

      toast.success('Đã đặt lịch hẹn lái thử thành công', {
        title: 'Thành công'
      })

      navigate('/products')
    } catch (error) {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Box bg='#F8FAFC' minH='100vh' py={8}>
        <Container maxW='800px' px={4}>
          <Text>Đang tải...</Text>
        </Container>
      </Box>
    )
  }

  if (!product) {
    return null
  }

  const minDate = today

  const productImage =
    product.mediaUrls && product.mediaUrls.length > 0 ? product.mediaUrls[0] : null

  return (
    <Box bg='#F8FAFC' minH='100vh' py={{ base: 6, md: 8 }}>
      <Container maxW='900px' px={{ base: 4, md: 6 }}>
        <VStack align='stretch' gap={6}>
          <Text fontSize={{ base: '22px', md: '24px' }} fontWeight='700' color='#04113E'>
            Đặt lịch hẹn lái thử
          </Text>

          <Card.Root
            bg='white'
            borderRadius='16px'
            border='1px solid #E5E5E5'
            p={{ base: 5, md: 6 }}
            className='rounded-2xl'
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'center' }}
              gap={{ base: 4, md: 6 }}
            >
              <Box
                w={{ base: '100%', md: '220px' }}
                h={{ base: '160px', md: '160px' }}
                borderRadius='12px'
                overflow='hidden'
                bg='#F3F4F6'
                flexShrink={0}
              >
                {productImage && (
                  <Image
                    src={productImage}
                    alt={product.title}
                    width='100%'
                    height='100%'
                    objectFit='cover'
                  />
                )}
              </Box>

              <VStack align='flex-start' gap={2} flex={1}>
                <Text fontSize={{ base: '18px', md: '20px' }} fontWeight='700' color='#04113E'>
                  {product.title}
                </Text>
                <Text fontSize='18px' fontWeight='600' color='#204ED3'>
                  {new Intl.NumberFormat('vi-VN').format(product.price)} VNĐ
                </Text>
                <Text fontSize='14px' color='#737373'>
                  {product.store?.storeName || 'N/A'}
                </Text>
                <Text fontSize='14px' color='#737373'>
                  Đăng {formatTimeAgo(product.createdAt)}
                </Text>
              </VStack>
            </Flex>
          </Card.Root>

          <Card.Root
            bg='white'
            borderRadius='16px'
            border='1px solid #E5E5E5'
            p={{ base: 5, md: 6 }}
            className='rounded-2xl'
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack align='stretch' gap={6}>
                <VStack align='stretch' gap={4}>
                  <Text fontSize='18px' fontWeight='700' color='#04113E'>
                    Thông tin liên hệ
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root invalid={!!errors.fullName}>
                      <Field.Label>Họ và tên *</Field.Label>
                      <Input
                        placeholder='Nhập họ và tên'
                        {...register('fullName')}
                        borderColor={errors.fullName ? 'red.500' : '#E5E5E5'}
                        borderRadius='8px'
                      />
                      {errors.fullName && (
                        <Field.ErrorText>{errors.fullName.message}</Field.ErrorText>
                      )}
                    </Field.Root>

                    <Field.Root invalid={!!errors.phone}>
                      <Field.Label>Số điện thoại *</Field.Label>
                      <Input
                        placeholder='Nhập số điện thoại'
                        {...register('phone')}
                        borderColor={errors.phone ? 'red.500' : '#E5E5E5'}
                        borderRadius='8px'
                      />
                      {errors.phone && <Field.ErrorText>{errors.phone.message}</Field.ErrorText>}
                    </Field.Root>
                  </SimpleGrid>
                </VStack>

                <VStack align='stretch' gap={4}>
                  <Text fontSize='18px' fontWeight='700' color='#04113E'>
                    Thông tin lịch hẹn
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root invalid={!!errors.date}>
                      <Field.Label>Ngày *</Field.Label>
                      <Controller
                        control={control}
                        name='date'
                        render={({ field }) => (
                          <DatePicker
                            value={parseDateFromInput(field.value) ?? today}
                            onChange={selected => field.onChange(formatDateForInput(selected))}
                            minDate={minDate}
                            isInvalid={!!errors.date}
                            name='test-drive-date'
                          />
                        )}
                      />
                      {errors.date && <Field.ErrorText>{errors.date.message}</Field.ErrorText>}
                    </Field.Root>

                    <Field.Root invalid={!!errors.time}>
                      <Field.Label>Giờ *</Field.Label>
                      <Input
                        type='time'
                        {...register('time')}
                        borderColor={errors.time ? 'red.500' : '#E5E5E5'}
                        borderRadius='8px'
                      />
                      {errors.time && <Field.ErrorText>{errors.time.message}</Field.ErrorText>}
                    </Field.Root>
                  </SimpleGrid>
                </VStack>

                <Field.Root invalid={!!errors.location}>
                  <Field.Label>Địa điểm *</Field.Label>
                  <Input
                    placeholder='Ví dụ: Đại lý Hà Nội, 123 Đường ABC...'
                    {...register('location')}
                    borderColor={errors.location ? 'red.500' : '#E5E5E5'}
                    borderRadius='8px'
                  />
                  {errors.location && <Field.ErrorText>{errors.location.message}</Field.ErrorText>}
                </Field.Root>

                <Field.Root invalid={!!errors.note}>
                  <Field.Label>Ghi chú (tùy chọn)</Field.Label>
                  <Textarea
                    placeholder='Nhập ghi chú nếu có...'
                    rows={4}
                    {...register('note')}
                    borderColor={errors.note ? 'red.500' : '#E5E5E5'}
                    borderRadius='8px'
                  />
                  {errors.note && <Field.ErrorText>{errors.note.message}</Field.ErrorText>}
                </Field.Root>

                <HStack gap={3} justify='flex-end'>
                  <Button
                    variant='outline'
                    borderColor='#E5E5E5'
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    type='submit'
                    bg='#204ED3'
                    color='white'
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    _hover={{ bg: '#1a3fb0' }}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hẹn'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Card.Root>
        </VStack>
      </Container>
    </Box>
  )
}
