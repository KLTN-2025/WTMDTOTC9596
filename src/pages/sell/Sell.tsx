import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  Input,
  Portal,
  Select,
  Text,
  Textarea,
  VStack,
  createListCollection
} from '@chakra-ui/react'
import { HiOutlineChevronDown, HiOutlinePhoto } from 'react-icons/hi2'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link as RouterLink } from 'react-router'
import { useToast } from '@/hooks/useToast'
import { PATHS } from '@/configs/paths'
import { VEHICLE_STATUSES, ORIGINS, SEATS } from '@/mocks/filters'
import { useMasterData } from '@/hooks/useMasterData'
import { useAuth } from '@/hooks/useAuth'
import { createProduct, uploadProductMedia } from '@/api/products'

const specSchema = z.object({
  name: z.string().min(1, 'Tên thông số bắt buộc'),
  value: z.string().min(1, 'Giá trị bắt buộc')
})

const sellSchema = z.object({
  title: z.string().min(10, 'Tiêu đề cần ít nhất 10 ký tự').max(100, 'Tiêu đề tối đa 100 ký tự'),
  description: z.string().optional(),
  mileage: z
    .string()
    .min(1, 'Số km không hợp lệ')
    .refine(val => /^\d+$/.test(val) && Number(val) >= 0, 'Số km phải là số không âm'),
  condition: z.string().min(1, 'Vui lòng chọn tình trạng'),
  origin: z.string().min(1, 'Vui lòng chọn xuất xứ'),
  warranty: z.string().optional(),
  brandId: z.string().min(1, 'Chọn hãng xe'),
  modelId: z.string().min(1, 'Chọn dòng xe'),
  year: z
    .string()
    .min(1, 'Chọn năm sản xuất')
    .refine(val => /^\d{4}$/.test(val), 'Năm sản xuất không hợp lệ'),
  versionId: z.string().min(1, 'Chọn phiên bản'),
  transmissionId: z.string().min(1, 'Chọn hộp số'),
  fuelId: z.string().min(1, 'Chọn nhiên liệu'),
  bodyStyleId: z.string().min(1, 'Chọn kiểu dáng'),
  seats: z.string().min(1, 'Chọn số chỗ'),
  colorId: z.string().min(1, 'Chọn màu sắc'),
  price: z
    .string()
    .min(1, 'Nhập giá bán')
    .refine(
      val => /^\d+$/.test(val) && Number(val) >= 10000000,
      'Giá bán tối thiểu 10.000.000 VND'
    ),
  specs: z.array(specSchema).min(0),
  media: z.array(z.string().url()).min(1, 'Tối thiểu 1 hình ảnh').max(10, 'Tối đa 10 hình ảnh')
})

type SellFormData = z.infer<typeof sellSchema>

export function Sell() {
  const navigate = useNavigate()
  const { user, store, isLoading: isLoadingAuth } = useAuth()
  const toast = useToast()
  const {
    brands,
    fuels,
    transmissions,
    bodyStyles,
    colors,
    versions,
    models: allModels,
    loading: isLoadingMasterData
  } = useMasterData()

  const defaultValues = useMemo<SellFormData>(() => {
    return {
      title: '',
      description: '',
      mileage: '',
      condition: '',
      origin: '',
      warranty: '',
      brandId: '',
      modelId: '',
      year: '',
      versionId: '',
      transmissionId: '',
      fuelId: '',
      bodyStyleId: '',
      seats: '',
      colorId: '',
      price: '',
      specs: [],
      media: []
    }
  }, [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<SellFormData>({
    resolver: zodResolver(sellSchema),
    defaultValues
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specs'
  })

  const mediaList = watch('media')
  const selectedBrandId = watch('brandId')
  const [isUploading, setIsUploading] = useState(false)

  const models = useMemo(() => {
    if (!selectedBrandId) {
      return []
    }
    return allModels.filter(model => model.brandId === selectedBrandId)
  }, [allModels, selectedBrandId])

  useEffect(() => {
    if (!selectedBrandId) {
      setValue('modelId', '')
    }
  }, [selectedBrandId, setValue])

  const hasStore = !!store
  const isLoadingStore = isLoadingAuth

  const MAX_FILE_SIZE_MB = 50
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
  const ACCEPTED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm']
  }

  const handleFiles = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) return

      if (mediaList.length + acceptedFiles.length > 10) {
        toast.error('Bạn chỉ có thể thêm tối đa 10 hình ảnh', {
          title: 'Giới hạn hình ảnh'
        })
        return
      }

      setIsUploading(true)
      const uploadPromises: Promise<string>[] = []

      for (const file of acceptedFiles) {
        uploadPromises.push(
          uploadProductMedia(file, user).then(result => {
            if (result.error) {
              throw new Error(result.error.message || 'Upload failed')
            }
            return result.data!.url
          })
        )
      }

      try {
        const uploadedUrls = await Promise.all(uploadPromises)
        setValue('media', [...mediaList, ...uploadedUrls], {
          shouldDirty: true,
          shouldTouch: true
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể tải lên file', {
          title: 'Lỗi upload'
        })
      } finally {
        setIsUploading(false)
      }
    },
    [user, mediaList, setValue, toast]
  )

  const onDropRejected = useCallback(
    (fileRejections: any[]) => {
      for (const { file, errors } of fileRejections) {
        for (const error of errors) {
          if (error.code === 'file-too-large') {
            toast.error(`File ${file.name} vượt quá ${MAX_FILE_SIZE_MB}MB`, {
              title: 'File quá lớn'
            })
          } else if (error.code === 'file-invalid-type') {
            toast.error(`File ${file.name} không phải là hình ảnh hoặc video hợp lệ`, {
              title: 'Định dạng không hợp lệ'
            })
          } else {
            toast.error(`File ${file.name}: ${error.message}`, {
              title: 'Lỗi file'
            })
          }
        }
      }
    },
    [toast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    onDropRejected,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    maxFiles: 10 - mediaList.length,
    multiple: true,
    disabled: isUploading
  })

  const removeMedia = (index: number) => {
    if (mediaList.length <= 1) {
      toast.error('Cần tối thiểu 1 hình ảnh trước khi xóa', {
        title: 'Thiếu hình ảnh'
      })
      return
    }
    const updated = mediaList.filter((_, idx) => idx !== index)
    setValue('media', updated, {
      shouldDirty: true,
      shouldTouch: true
    })
  }

  const onSubmit = async (data: SellFormData) => {
    if (!user || !store) {
      toast.error('Bạn cần đăng ký cửa hàng trước khi đăng tin')
      return
    }

    const conditionType = data.condition === 'Xe mới' ? 'new' : 'used'
    const seatsNumber = parseInt(data.seats.replace(' chỗ', ''))

    const { error } = await createProduct(
      {
        title: data.title,
        description: data.description || null,
        price: Number(data.price),
        mileageKm: data.mileage ? Number(data.mileage) : null,
        conditionType,
        origin: data.origin,
        warrantyPolicy: data.warranty || null,
        brandId: data.brandId,
        modelId: data.modelId,
        yearManufactured: data.year,
        versionId: data.versionId,
        transmissionId: data.transmissionId,
        fuelId: data.fuelId,
        bodyStyleId: data.bodyStyleId,
        seats: seatsNumber,
        colorId: data.colorId,
        mediaUrls: data.media,
        specs: data.specs,
        storeId: store.id
      },
      user
    )

    if (error) {
      toast.error(error.message || 'Không thể đăng tin', {
        title: 'Lỗi đăng tin'
      })
      return
    }

    toast.success('Tin đăng của bạn đang chờ kiểm duyệt', {
      title: 'Đăng tin thành công'
    })
    reset(defaultValues)
    navigate(PATHS.USER.MANAGE_LISTINGS)
  }

  const handleCancel = () => {
    reset(defaultValues)
  }

  const brandCollection = useMemo(
    () =>
      createListCollection({
        items: brands.map(b => ({ label: b.name, value: b.id }))
      }),
    [brands]
  )

  const transmissionCollection = useMemo(
    () =>
      createListCollection({
        items: transmissions.map(t => ({ label: t.name, value: t.id }))
      }),
    [transmissions]
  )

  const fuelCollection = useMemo(
    () =>
      createListCollection({
        items: fuels.map(f => ({ label: f.name, value: f.id }))
      }),
    [fuels]
  )

  const bodyStyleCollection = useMemo(
    () =>
      createListCollection({
        items: bodyStyles.map(b => ({ label: b.name, value: b.id }))
      }),
    [bodyStyles]
  )

  const colorCollection = useMemo(
    () =>
      createListCollection({
        items: colors.map(c => ({ label: c.name, value: c.id }))
      }),
    [colors]
  )

  const conditionCollection = useMemo(
    () =>
      createListCollection({
        items: VEHICLE_STATUSES.map(c => ({ label: c, value: c }))
      }),
    []
  )

  const originCollection = useMemo(
    () =>
      createListCollection({
        items: ORIGINS.map(o => ({ label: o, value: o }))
      }),
    []
  )

  const seatsCollection = useMemo(
    () =>
      createListCollection({
        items: SEATS.map(s => ({ label: s, value: s }))
      }),
    []
  )

  const modelCollection = useMemo(
    () =>
      createListCollection({
        items: models.map(m => ({ label: m.name, value: m.id }))
      }),
    [models]
  )

  const versionCollection = useMemo(
    () =>
      createListCollection({
        items: versions.map(v => ({ label: v.name, value: v.id }))
      }),
    [versions]
  )

  if (isLoadingStore) {
    return (
      <Box bg='#F8FAFC' minH='100vh' py={10}>
        <Box maxW='1200px' mx='auto' px={{ base: 4, md: 6 }}>
          <Text>Đang tải...</Text>
        </Box>
      </Box>
    )
  }

  if (!hasStore) {
    return (
      <Box bg='#F8FAFC' minH='100vh' py={10}>
        <Box maxW='1200px' mx='auto' px={{ base: 4, md: 6 }}>
          <Card.Root bg='white' borderRadius='16px' p={{ base: 5, md: 8 }}>
            <VStack align='center' gap={6} py={8}>
              <Text fontSize='20px' fontWeight='700' color='#04113E' textAlign='center'>
                Bạn chưa đăng ký cửa hàng
              </Text>
              <Text fontSize='16px' color='#6B7280' textAlign='center'>
                Vui lòng đăng ký cửa hàng trước khi đăng tin bán xe
              </Text>
              <Button
                bg='#204ED3'
                color='white'
                borderRadius='6px'
                px={6}
                py={3}
                fontSize='14px'
                fontWeight='600'
                onClick={() => navigate(PATHS.STORE_REGISTRATION)}
                className='rounded-md px-6 py-3 font-semibold text-sm'
              >
                Đăng ký cửa hàng
              </Button>
            </VStack>
          </Card.Root>
        </Box>
      </Box>
    )
  }

  return (
    <Box bg='#F8FAFC' minH='100vh' py={10}>
      <Box maxW='1200px' mx='auto' px={{ base: 4, md: 6 }} className='max-w-[1200px]'>
        <HStack gap={2} mb={6}>
          <RouterLink to={PATHS.HOME}>
            <Text
              fontSize='14px'
              fontWeight='600'
              color='#1B2C5D'
              className='text-sm font-semibold'
            >
              Trang chủ
            </Text>
          </RouterLink>
          <Box transform='rotate(-90deg)'>
            <HiOutlineChevronDown size={16} color='#B6B6B6' />
          </Box>
          <Text fontSize='14px' fontWeight='400' color='#6B7280' className='text-sm text-[#6B7280]'>
            Bán xe
          </Text>
        </HStack>

        <Card.Root bg='white' borderRadius='16px' p={{ base: 5, md: 8 }} className='rounded-2xl'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack align='stretch' gap={12}>
              <VStack align='stretch' gap={3}>
                <Text
                  fontSize='20px'
                  fontWeight='700'
                  color='#04113E'
                  className='text-[20px] font-bold text-[#04113E]'
                >
                  Tiêu đề tin đăng và Mô tả chi tiết
                </Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <Field.Root invalid={!!errors.title}>
                    <Field.Label>Tiêu đề tin đăng</Field.Label>
                    <Input
                      placeholder='Nhập tiêu đề hấp dẫn... (tối đa 100 ký tự)'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={3}
                      fontSize='16px'
                      color='#737373'
                      maxLength={100}
                      {...register('title')}
                    />
                    {errors.title && <Field.ErrorText>{errors.title.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root
                    invalid={!!errors.description}
                    gridColumn={{ base: 'auto', md: 'span 2' }}
                  >
                    <Field.Label>Mô tả chi tiết</Field.Label>
                    <Textarea
                      placeholder='Chia sẻ chi tiết về tình trạng xe, lịch sử sử dụng và điểm nổi bật...'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={3}
                      fontSize='16px'
                      color='#737373'
                      minH='160px'
                      {...register('description')}
                    />
                    {errors.description && (
                      <Field.ErrorText>{errors.description.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Grid>
              </VStack>

              <VStack align='stretch' gap={5}>
                <Text
                  fontSize='20px'
                  fontWeight='700'
                  color='#04113E'
                  className='text-[20px] font-bold text-[#04113E]'
                >
                  Hình ảnh và Video xe (*)
                </Text>
                <Box
                  {...getRootProps()}
                  borderRadius='12px'
                  border='2px dashed'
                  borderColor={isDragActive ? '#204ED3' : '#E5E5E5'}
                  bg={isDragActive ? '#F0F4FF' : '#F5F5F5'}
                  p={6}
                  textAlign='center'
                  cursor='pointer'
                  transition='all 0.2s'
                  _hover={{
                    borderColor: '#204ED3',
                    bg: '#F0F4FF'
                  }}
                  className='rounded-xl border-2 border-dashed p-6 text-center'
                >
                  <input {...getInputProps()} />
                  <VStack gap={3}>
                    <Icon as={HiOutlinePhoto} w={8} h={8} color='#204ED3' />
                    <Text fontSize='16px' fontWeight='600' color='#04113E'>
                      {isDragActive
                        ? 'Thả file vào đây để tải lên'
                        : 'Kéo thả hoặc chọn tệp để tải lên'}
                    </Text>
                    <Text fontSize='14px' color='#6B7280'>
                      Chọn từ 1 đến 10 hình ảnh/video (tối đa {MAX_FILE_SIZE_MB}MB mỗi file)
                    </Text>
                    <Button
                      variant='outline'
                      borderColor='#204ED3'
                      color='#204ED3'
                      borderRadius='6px'
                      px={5}
                      py={3}
                      fontWeight='600'
                      fontSize='14px'
                      disabled={isUploading}
                      onClick={e => e.stopPropagation()}
                      className='rounded-md px-5 py-3 font-semibold text-sm'
                    >
                      {isUploading ? 'Đang tải lên...' : 'Chọn file'}
                    </Button>
                  </VStack>
                </Box>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }} gap={4}>
                  {mediaList.map((url, index) => (
                    <VStack
                      key={url}
                      borderRadius='12px'
                      border='1px solid #E5E5E5'
                      overflow='hidden'
                      gap={0}
                      className='rounded-xl border border-[#E5E5E5] overflow-hidden'
                    >
                      <Box w='full' h='120px' bg='gray.100'>
                        <Image
                          src={url}
                          alt={`media-${index}`}
                          width='100%'
                          height='100%'
                          objectFit='cover'
                        />
                      </Box>
                      <Button
                        onClick={() => removeMedia(index)}
                        variant='outline'
                        borderColor='#E5E5E5'
                        color='#171717'
                        borderRadius='0'
                        fontSize='14px'
                        w='full'
                        disabled={mediaList.length <= 1}
                      >
                        Xóa
                      </Button>
                    </VStack>
                  ))}
                </Grid>
                {errors.media && (
                  <Text color='red.500' fontSize='sm'>
                    {errors.media.message}
                  </Text>
                )}
              </VStack>

              <VStack align='stretch' gap={6}>
                <Text
                  fontSize='20px'
                  fontWeight='700'
                  color='#04113E'
                  className='text-[20px] font-bold text-[#04113E]'
                >
                  Thông số chi tiết (*)
                </Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={5}>
                  <Field.Root invalid={!!errors.mileage}>
                    <Field.Label>Số Km đã đi</Field.Label>
                    <Input
                      placeholder='Nhập số km đã đi'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={3}
                      fontSize='16px'
                      color='#737373'
                      {...register('mileage')}
                    />
                    {errors.mileage && <Field.ErrorText>{errors.mileage.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.condition}>
                    <Field.Label>Tình trạng</Field.Label>
                    <Controller
                      control={control}
                      name='condition'
                      render={({ field }) => (
                        <Select.Root
                          collection={conditionCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn tình trạng' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {conditionCollection.items.map(item => (
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
                    {errors.condition && (
                      <Field.ErrorText>{errors.condition.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.origin}>
                    <Field.Label>Xuất xứ</Field.Label>
                    <Controller
                      control={control}
                      name='origin'
                      render={({ field }) => (
                        <Select.Root
                          collection={originCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn xuất xứ' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {originCollection.items.map(item => (
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
                    {errors.origin && <Field.ErrorText>{errors.origin.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.warranty}>
                    <Field.Label>Chính sách bảo hành</Field.Label>
                    <Input
                      placeholder='Nhập thông tin bảo hành'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={3}
                      fontSize='16px'
                      color='#737373'
                      {...register('warranty')}
                    />
                    {errors.warranty && (
                      <Field.ErrorText>{errors.warranty.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Grid>
              </VStack>

              <VStack align='stretch' gap={6}>
                <Text
                  fontSize='20px'
                  fontWeight='700'
                  color='#04113E'
                  className='text-[20px] font-bold text-[#04113E]'
                >
                  Thông số kỹ thuật (*)
                </Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={5}>
                  <Field.Root invalid={!!errors.brandId}>
                    <Field.Label>Hãng</Field.Label>
                    <Controller
                      control={control}
                      name='brandId'
                      render={({ field }) => (
                        <Select.Root
                          collection={brandCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn hãng xe' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {brandCollection.items.map(item => (
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
                    {errors.brandId && <Field.ErrorText>{errors.brandId.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.modelId}>
                    <Field.Label>Dòng xe</Field.Label>
                    <Controller
                      control={control}
                      name='modelId'
                      render={({ field }) => (
                        <Select.Root
                          collection={modelCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                          disabled={!selectedBrandId || isLoadingMasterData}
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText
                                placeholder={
                                  !selectedBrandId
                                    ? 'Chọn hãng xe trước'
                                    : isLoadingMasterData
                                      ? 'Đang tải...'
                                      : 'Chọn dòng xe'
                                }
                              />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {modelCollection.items.map(item => (
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
                    {errors.modelId && <Field.ErrorText>{errors.modelId.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.year}>
                    <Field.Label>Năm sản xuất</Field.Label>
                    <Input
                      type='number'
                      placeholder='Ví dụ: 2022'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={3}
                      fontSize='16px'
                      color='#737373'
                      {...register('year')}
                    />
                    {errors.year && <Field.ErrorText>{errors.year.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.versionId}>
                    <Field.Label>Phiên bản xe</Field.Label>
                    <Controller
                      control={control}
                      name='versionId'
                      render={({ field }) => (
                        <Select.Root
                          collection={versionCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn phiên bản' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {versionCollection.items.map(item => (
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
                    {errors.versionId && (
                      <Field.ErrorText>{errors.versionId.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.transmissionId}>
                    <Field.Label>Hộp số</Field.Label>
                    <Controller
                      control={control}
                      name='transmissionId'
                      render={({ field }) => (
                        <Select.Root
                          collection={transmissionCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn hộp số' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {transmissionCollection.items.map(item => (
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
                    {errors.transmissionId && (
                      <Field.ErrorText>{errors.transmissionId.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.fuelId}>
                    <Field.Label>Nhiên liệu</Field.Label>
                    <Controller
                      control={control}
                      name='fuelId'
                      render={({ field }) => (
                        <Select.Root
                          collection={fuelCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn nhiên liệu' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {fuelCollection.items.map(item => (
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
                    {errors.fuelId && <Field.ErrorText>{errors.fuelId.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.bodyStyleId}>
                    <Field.Label>Kiểu dáng</Field.Label>
                    <Controller
                      control={control}
                      name='bodyStyleId'
                      render={({ field }) => (
                        <Select.Root
                          collection={bodyStyleCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn kiểu dáng' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {bodyStyleCollection.items.map(item => (
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
                    {errors.bodyStyleId && (
                      <Field.ErrorText>{errors.bodyStyleId.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.seats}>
                    <Field.Label>Số chỗ</Field.Label>
                    <Controller
                      control={control}
                      name='seats'
                      render={({ field }) => (
                        <Select.Root
                          collection={seatsCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn số chỗ' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {seatsCollection.items.map(item => (
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
                    {errors.seats && <Field.ErrorText>{errors.seats.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.colorId}>
                    <Field.Label>Màu sắc</Field.Label>
                    <Controller
                      control={control}
                      name='colorId'
                      render={({ field }) => (
                        <Select.Root
                          collection={colorCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0] || '')}
                          onInteractOutside={() => field.onBlur()}
                          size='md'
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder='Chọn màu sắc' />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {colorCollection.items.map(item => (
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
                    {errors.colorId && <Field.ErrorText>{errors.colorId.message}</Field.ErrorText>}
                  </Field.Root>
                </Grid>

                <VStack align='stretch' gap={4}>
                  <Text fontSize='16px' fontWeight='600' color='#04113E'>
                    Thêm thông số kỹ thuật
                  </Text>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    {fields.map((field, index) => (
                      <HStack key={field.id} gap={3} align='flex-start'>
                        <Field.Root flex={1} invalid={!!errors.specs?.[index]?.name}>
                          <Field.Label>Tên thông số</Field.Label>
                          <Input
                            placeholder='Ví dụ: Chiều dài cơ sở'
                            bg='white'
                            borderColor='#E5E5E5'
                            borderRadius='8px'
                            px={4}
                            py={3}
                            fontSize='16px'
                            color='#737373'
                            {...register(`specs.${index}.name` as const)}
                          />
                          {errors.specs?.[index]?.name && (
                            <Field.ErrorText>{errors.specs[index]?.name?.message}</Field.ErrorText>
                          )}
                        </Field.Root>
                        <Field.Root flex={1} invalid={!!errors.specs?.[index]?.value}>
                          <Field.Label>Giá trị</Field.Label>
                          <Input
                            placeholder='Ví dụ: 2.960 mm'
                            bg='white'
                            borderColor='#E5E5E5'
                            borderRadius='8px'
                            px={4}
                            py={3}
                            fontSize='16px'
                            color='#737373'
                            {...register(`specs.${index}.value` as const)}
                          />
                          {errors.specs?.[index]?.value && (
                            <Field.ErrorText>{errors.specs[index]?.value?.message}</Field.ErrorText>
                          )}
                        </Field.Root>
                        <Button
                          variant='outline'
                          borderColor='#E5E5E5'
                          color='#04113E'
                          borderRadius='8px'
                          height='fit-content'
                          mt='32px'
                          onClick={() => remove(index)}
                        >
                          Xóa
                        </Button>
                      </HStack>
                    ))}
                  </Grid>
                  <Button
                    variant='outline'
                    borderColor='#E5E5E5'
                    color='#04113E'
                    borderRadius='8px'
                    px={5}
                    py={3}
                    fontWeight='600'
                    fontSize='14px'
                    onClick={() => append({ name: '', value: '' })}
                    className='rounded-md px-5 py-3 font-semibold text-sm'
                  >
                    + Thêm thông số kỹ thuật
                  </Button>
                </VStack>
              </VStack>

              <VStack align='stretch' gap={6}>
                <Text
                  fontSize='20px'
                  fontWeight='700'
                  color='#04113E'
                  className='text-[20px] font-bold text-[#04113E]'
                >
                  Giá bán (*)
                </Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={5}>
                  <Field.Root invalid={!!errors.price}>
                    <Field.Label>Giá mong muốn (VND)</Field.Label>
                    <Input
                      placeholder='Nhập giá bán'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={3}
                      fontSize='16px'
                      color='#737373'
                      {...register('price')}
                    />
                    {errors.price && <Field.ErrorText>{errors.price.message}</Field.ErrorText>}
                  </Field.Root>
                </Grid>
              </VStack>

              <Flex justify='flex-end' gap={4} wrap='wrap'>
                <Button
                  variant='outline'
                  borderColor='#04113E'
                  color='#04113E'
                  borderRadius='6px'
                  px={5}
                  py={3}
                  fontWeight='600'
                  fontSize='14px'
                  onClick={handleCancel}
                  className='rounded-md px-5 py-3 font-semibold text-sm'
                >
                  Hủy bỏ
                </Button>
                <Button
                  type='submit'
                  bg='#204ED3'
                  color='white'
                  borderRadius='6px'
                  px={5}
                  py={3}
                  fontWeight='600'
                  fontSize='14px'
                  disabled={isSubmitting}
                  className='rounded-md px-5 py-3 font-semibold text-sm'
                >
                  {isSubmitting ? 'Đang đăng...' : 'Đăng tin'}
                </Button>
              </Flex>
            </VStack>
          </form>
        </Card.Root>
      </Box>
    </Box>
  )
}
