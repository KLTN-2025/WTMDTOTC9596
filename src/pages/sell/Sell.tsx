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
  NumberInput,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react'
import { HiOutlineChevronDown, HiOutlinePhoto } from 'react-icons/hi2'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import ReactPlayer from 'react-player'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router'
import { useToast } from '@/hooks/useToast'
import { PATHS } from '@/configs/paths'
import { VEHICLE_STATUSES, ORIGINS, SEATS } from '@/mocks/filters'
import { useMasterData } from '@/hooks/useMasterData'
import { useAuth } from '@/hooks/useAuth'
import { createProduct, getProductById, updateProduct, uploadProductMedia } from '@/api/products'
import { createMasterDataCollection } from '@/utils/collections'
import { SelectFieldController } from '@/components/common/SelectField'
import { isVideo } from '@/utils/media'
import type { ProductDetailData } from '@/types/products'

const specSchema = z.object({
  name: z.string().min(1, 'Tên thông số bắt buộc'),
  value: z.string().min(1, 'Giá trị bắt buộc')
})

const sellSchema = z
  .object({
    title: z.string().min(10, 'Tiêu đề cần ít nhất 10 ký tự').max(100, 'Tiêu đề tối đa 100 ký tự'),
    description: z.string().optional(),
    mileage: z.string().optional(),
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
      .refine(val => {
        const numValue = Number(val.replace(/[^\d]/g, ''))
        return !isNaN(numValue) && numValue > 0
      }, 'Giá bán phải là số lớn hơn 0'),
    specs: z.array(specSchema).min(0),
    media: z.array(z.string().url()).min(1, 'Tối thiểu 1 hình ảnh').max(10, 'Tối đa 10 hình ảnh')
  })
  .refine(
    data => {
      if (data.condition === 'Xe cũ') {
        if (!data.mileage || data.mileage.trim() === '') {
          return false
        }
        return /^\d+$/.test(data.mileage) && Number(data.mileage) >= 0
      }
      return true
    },
    {
      message: 'Số km phải là số không âm',
      path: ['mileage']
    }
  )

type SellFormData = z.infer<typeof sellSchema>

export function Sell() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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
  const selectedCondition = watch('condition')
  const isUsedCar = selectedCondition === 'Xe cũ'
  const [isUploading, setIsUploading] = useState(false)
  const productId = searchParams.get('product-id')
  const isEditMode = Boolean(productId)

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

  useEffect(() => {
    if (selectedCondition !== 'Xe cũ') {
      setValue('mileage', '')
    }
  }, [selectedCondition, setValue])

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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
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

    const conditionType: 'new' | 'used' = data.condition === 'Xe mới' ? 'new' : 'used'
    const seatsNumber = parseInt(data.seats.replace(' chỗ', ''))
    const priceValue = Number(data.price.replace(/[^\d]/g, ''))
    const isUsedCarSubmit = data.condition === 'Xe cũ'

    const payload: Parameters<typeof createProduct>[0] = {
      title: data.title,
      description: data.description || null,
      price: priceValue,
      mileageKm: isUsedCarSubmit && data.mileage ? Number(data.mileage) : null,
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
    }

    const response =
      isEditMode && productId
        ? await updateProduct(productId, payload, user)
        : await createProduct(payload, user)

    if (response.error) {
      toast.error(
        response.error.message || (isEditMode ? 'Không thể cập nhật tin' : 'Không thể đăng tin'),
        {
          title: isEditMode ? 'Lỗi cập nhật' : 'Lỗi đăng tin'
        }
      )
      return
    }

    toast.success(
      isEditMode
        ? 'Tin đăng đã được cập nhật và đang chờ kiểm duyệt'
        : 'Tin đăng của bạn đang chờ kiểm duyệt',
      {
        title: isEditMode ? 'Cập nhật thành công' : 'Đăng tin thành công'
      }
    )
    if (isEditMode && response.data) {
      reset(mapProductToFormValues(response.data as ProductDetailData))
    } else {
      reset(defaultValues)
    }
    navigate(PATHS.USER.MANAGE_LISTINGS)
  }

  const handleCancel = () => {
    reset(defaultValues)
    navigate(-1)
  }

  const mapProductToFormValues = useCallback((product: ProductDetailData): SellFormData => {
    const extendedProduct = product as ProductDetailData & {
      fuelId?: string | null
      transmissionId?: string | null
      colorId?: string | null
      specs?: Array<{ name: string; value: string }> | null
      mediaUrls?: string[] | null
    }

    const specs = Array.isArray(extendedProduct.specs)
      ? extendedProduct.specs.map(spec => ({
          name: spec.name || '',
          value: spec.value || ''
        }))
      : []

    return {
      title: product.title || '',
      description: product.description || '',
      mileage: product.mileageKm ? String(product.mileageKm) : '',
      condition: product.conditionType === 'new' ? 'Xe mới' : 'Xe cũ',
      origin: product.origin || '',
      warranty: product.warrantyPolicy || '',
      brandId: product.brandId || '',
      modelId: product.modelId || '',
      year: product.yearManufactured || '',
      versionId: product.versionId || '',
      transmissionId: extendedProduct.transmissionId || '',
      fuelId: extendedProduct.fuelId || '',
      bodyStyleId: product.bodyStyleId || '',
      seats: product.seats ? `${product.seats} chỗ` : '',
      colorId: extendedProduct.colorId || '',
      price: product.price ? product.price.toString() : '',
      specs,
      media: extendedProduct.mediaUrls ?? []
    }
  }, [])

  useEffect(() => {
    if (!productId || !user || !store) {
      return
    }
    ;(async () => {
      const { data, error } = await getProductById(productId)
      if (error || !data) {
        toast.error('Không thể tải dữ liệu tin đăng', {
          title: 'Lỗi tải dữ liệu'
        })
        navigate(PATHS.USER.MANAGE_LISTINGS)
        return
      }

      if (data.storeId !== store.id) {
        toast.error('Bạn không có quyền chỉnh sửa tin đăng này', {
          title: 'Không có quyền'
        })
        navigate(PATHS.USER.MANAGE_LISTINGS)
        return
      }

      reset(mapProductToFormValues(data))
    })()
  }, [user?.id, store])

  const brandCollection = useMemo(() => createMasterDataCollection(brands), [brands])
  const transmissionCollection = useMemo(
    () => createMasterDataCollection(transmissions),
    [transmissions]
  )
  const fuelCollection = useMemo(() => createMasterDataCollection(fuels), [fuels])
  const bodyStyleCollection = useMemo(() => createMasterDataCollection(bodyStyles), [bodyStyles])
  const colorCollection = useMemo(() => createMasterDataCollection(colors), [colors])

  const conditionCollection = useMemo(
    () => createMasterDataCollection(VEHICLE_STATUSES.map(c => ({ label: c, value: c }))),
    []
  )

  const originCollection = useMemo(
    () => createMasterDataCollection(ORIGINS.map(o => ({ label: o, value: o }))),
    []
  )

  const seatsCollection = useMemo(
    () => createMasterDataCollection(SEATS.map(s => ({ label: s, value: s }))),
    []
  )

  const modelCollection = useMemo(
    () => createMasterDataCollection(models.map(m => ({ label: m.name, value: m.id }))),
    [models]
  )

  const versionCollection = useMemo(() => createMasterDataCollection(versions), [versions])

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
                      type='button'
                      variant='outline'
                      borderColor='#204ED3'
                      color='#204ED3'
                      borderRadius='6px'
                      px={5}
                      py={3}
                      fontWeight='600'
                      fontSize='14px'
                      disabled={isUploading}
                      onClick={e => {
                        e.stopPropagation()
                        open()
                      }}
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
                        {isVideo(url) ? (
                          <ReactPlayer
                            src={url}
                            width='100%'
                            height='100%'
                            controls
                            light={false}
                          />
                        ) : (
                          <Image
                            src={url}
                            alt={`media-${index}`}
                            width='100%'
                            height='100%'
                            objectFit='cover'
                          />
                        )}
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
                  <SelectFieldController
                    label='Tình trạng'
                    collection={conditionCollection}
                    control={control}
                    name='condition'
                    placeholder='Chọn tình trạng'
                  />

                  {isUsedCar && (
                    <Field.Root invalid={!!errors.mileage}>
                      <Field.Label>Số Km đã đi (*)</Field.Label>
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
                      {errors.mileage && (
                        <Field.ErrorText>{errors.mileage.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                  )}

                  <SelectFieldController
                    label='Xuất xứ'
                    collection={originCollection}
                    control={control}
                    name='origin'
                    placeholder='Chọn xuất xứ'
                  />

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
                  <SelectFieldController
                    label='Hãng'
                    collection={brandCollection}
                    control={control}
                    name='brandId'
                    placeholder='Chọn hãng xe'
                  />

                  <SelectFieldController
                    label='Dòng xe'
                    collection={modelCollection}
                    control={control}
                    name='modelId'
                    placeholder={
                      !selectedBrandId
                        ? 'Chọn hãng xe trước'
                        : isLoadingMasterData
                          ? 'Đang tải...'
                          : 'Chọn dòng xe'
                    }
                    disabled={!selectedBrandId || isLoadingMasterData}
                  />

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

                  <SelectFieldController
                    label='Phiên bản xe'
                    collection={versionCollection}
                    control={control}
                    name='versionId'
                    placeholder='Chọn phiên bản'
                  />

                  <SelectFieldController
                    label='Hộp số'
                    collection={transmissionCollection}
                    control={control}
                    name='transmissionId'
                    placeholder='Chọn hộp số'
                  />

                  <SelectFieldController
                    label='Nhiên liệu'
                    collection={fuelCollection}
                    control={control}
                    name='fuelId'
                    placeholder='Chọn nhiên liệu'
                  />

                  <SelectFieldController
                    label='Kiểu dáng'
                    collection={bodyStyleCollection}
                    control={control}
                    name='bodyStyleId'
                    placeholder='Chọn kiểu dáng'
                  />

                  <SelectFieldController
                    label='Số chỗ'
                    collection={seatsCollection}
                    control={control}
                    name='seats'
                    placeholder='Chọn số chỗ'
                  />

                  <SelectFieldController
                    label='Màu sắc'
                    collection={colorCollection}
                    control={control}
                    name='colorId'
                    placeholder='Chọn màu sắc'
                  />
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
                    <Controller
                      name='price'
                      control={control}
                      render={({ field }) => (
                        <NumberInput.Root
                          value={field.value ?? ''}
                          onValueChange={({ value }) => field.onChange(value)}
                          clampValueOnBlur={false}
                          min={0}
                          formatOptions={{
                            style: 'currency',
                            maximumFractionDigits: 0,
                            currency: 'VND',
                            currencyDisplay: 'code'
                          }}
                        >
                          <NumberInput.Input
                            ref={field.ref}
                            name={field.name}
                            placeholder='Nhập giá bán'
                            bg='white'
                            borderColor='#E5E5E5'
                            borderRadius='8px'
                            px={4}
                            py={3}
                            fontSize='16px'
                            color='#737373'
                            onBlur={field.onBlur}
                          />
                        </NumberInput.Root>
                      )}
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
                  {isSubmitting
                    ? isEditMode
                      ? 'Đang cập nhật...'
                      : 'Đang đăng...'
                    : isEditMode
                      ? 'Cập nhật tin'
                      : 'Đăng tin'}
                </Button>
              </Flex>
            </VStack>
          </form>
        </Card.Root>
      </Box>
    </Box>
  )
}
