import { useState, useEffect } from 'react'
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
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useNavigate } from 'react-router'
import { SingleDatepicker } from 'chakra-dayzed-datepicker'
import { getProductById } from '@/api/products'
import { createTestDriveBooking } from '@/api/test-drive'
import { toaster } from '@/components/ui/toaster'
import type { ProductDetailData } from '@/types/products'
import { formatTimeAgo } from '@/utils/date'
import { useAuth } from '@/hooks/useAuth'
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
  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
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
          toaster.create({
            title: 'Lỗi',
            description: 'Không tìm thấy sản phẩm',
            type: 'error'
          })
          navigate('/products')
          return
        }

        setProduct(data)
      } catch (error) {
        toaster.create({
          title: 'Lỗi',
          description: 'Đã xảy ra lỗi khi tải thông tin sản phẩm',
          type: 'error'
        })
        navigate('/products')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, navigate])

  const onSubmit: SubmitHandler<BookingFormData> = async data => {
    if (!product || !id) return

    setIsSubmitting(true)
    try {
      const scheduledAt = new Date(`${data.date}T${data.time}`).toISOString()

      const { error } = await createTestDriveBooking(
        id,
        product.sellerId || null,
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
        toaster.create({
          title: 'Lỗi',
          description: error.message || 'Không thể tạo lịch hẹn lái thử',
          type: 'error'
        })
        return
      }

      toaster.create({
        title: 'Thành công',
        description: 'Đã đặt lịch hẹn lái thử thành công',
        type: 'success'
      })

      navigate('/products')
    } catch (error) {
      toaster.create({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi, vui lòng thử lại',
        type: 'error'
      })
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

  const minDate = new Date()
  minDate.setHours(0, 0, 0, 0)

  const productImage =
    product.mediaUrls && product.mediaUrls.length > 0 ? product.mediaUrls[0] : null

  return (
    <Box bg='#F8FAFC' minH='100vh' py={8}>
      <Container maxW='800px' px={4}>
        <VStack align='stretch' gap={6}>
          <Text fontSize='24px' fontWeight='700' color='#04113E'>
            Đặt lịch hẹn lái thử
          </Text>

          <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' p={6}>
            <VStack align='stretch' gap={6}>
              <HStack gap={4} align='flex-start'>
                {productImage && (
                  <Image
                    src={productImage}
                    alt={product.title}
                    width='200px'
                    height='150px'
                    objectFit='cover'
                    borderRadius='8px'
                    flexShrink={0}
                  />
                )}
                <VStack align='flex-start' gap={2} flex={1}>
                  <Text fontSize='20px' fontWeight='700' color='#04113E'>
                    {product.title}
                  </Text>
                  <Text fontSize='18px' fontWeight='600' color='#204ED3'>
                    {new Intl.NumberFormat('vi-VN').format(product.price)} VNĐ
                  </Text>
                  <Text fontSize='14px' color='#737373'>
                    {product.seller?.storeName || 'N/A'}
                  </Text>
                  <Text fontSize='14px' color='#737373'>
                    Đăng {formatTimeAgo(product.createdAt)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card.Root>

          <Card.Root bg='white' borderRadius='16px' border='1px solid #E5E5E5' p={6}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack align='stretch' gap={5}>
                <Text fontSize='18px' fontWeight='700' color='#04113E'>
                  Thông tin liên hệ
                </Text>

                <Flex gap={4} wrap='wrap'>
                  <Box flex='1 1 300px'>
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
                  </Box>
                  <Box flex='1 1 250px'>
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
                  </Box>
                </Flex>

                <Text fontSize='18px' fontWeight='700' color='#04113E' mt={2}>
                  Thông tin lịch hẹn
                </Text>

                <Flex gap={4} wrap='wrap'>
                  <Box flex='1 1 300px'>
                    <Field.Root invalid={!!errors.date}>
                      <Field.Label>Ngày *</Field.Label>
                      <Controller
                        control={control}
                        name='date'
                        render={({ field }) => (
                          <SingleDatepicker
                            propsConfigs={{
                              dateNavBtnProps: {
                                colorScheme: 'blue'
                              },
                              dayOfMonthBtnProps: {
                                defaultBtnProps: {
                                  _hover: {
                                    bg: '#204ED3',
                                    color: 'white'
                                  }
                                }
                              },
                              inputProps: {
                                placeholder: 'Chọn ngày',
                                borderColor: errors.date ? 'red.500' : '#E5E5E5',
                                borderRadius: '8px',
                                bg: 'white'
                              }
                            }}
                            configs={{
                              dateFormat: 'dd/MM/yyyy',
                              monthNames: [
                                'Tháng 1',
                                'Tháng 2',
                                'Tháng 3',
                                'Tháng 4',
                                'Tháng 5',
                                'Tháng 6',
                                'Tháng 7',
                                'Tháng 8',
                                'Tháng 9',
                                'Tháng 10',
                                'Tháng 11',
                                'Tháng 12'
                              ],
                              dayNames: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
                            }}
                            minDate={minDate}
                            name='date-input'
                            date={field.value ? new Date(field.value) : new Date()}
                            onDateChange={(date: Date) => {
                              const dateStr = date.toISOString().split('T')[0]
                              field.onChange(dateStr)
                            }}
                          />
                        )}
                      />
                      {errors.date && <Field.ErrorText>{errors.date.message}</Field.ErrorText>}
                    </Field.Root>
                  </Box>
                  <Box flex='1 1 200px'>
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
                  </Box>
                </Flex>

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

                <HStack gap={3} justify='flex-end' mt={4}>
                  <Button variant='outline' onClick={() => navigate(-1)} disabled={isSubmitting}>
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
