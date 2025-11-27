import {
  Box,
  Button,
  Card,
  Field,
  Grid,
  Image,
  Input,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { upsertStore, uploadStoreAsset } from '@/api/stores'
import { useNavigate } from 'react-router'
import { FiCheckCircle } from 'react-icons/fi'
import { useMasterData } from '@/hooks/useMasterData'
import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import { useAppDispatch } from '@/stores/hooks'
import { fetchUserData } from '@/stores/auth/authSlice'
import { createMasterDataCollection } from '@/utils/collections'
import { SelectFieldController } from '@/components/common/SelectField'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(value => {
    if (!value) return true
    return isValidUrl(value)
  }, 'Đường dẫn không hợp lệ')

const requiredUrlSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng chọn hình ảnh')
  .refine(value => isValidUrl(value), 'Đường dẫn không hợp lệ')

const storeSchema = z.object({
  storeName: z.string().trim().min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự'),
  storeLogo: requiredUrlSchema,
  storeBanner: optionalUrlSchema,
  description: z.string().trim().optional().or(z.literal('')),
  taxCode: z.string().trim().min(6, 'Mã số thuế phải có ít nhất 6 ký tự'),
  address: z.string().trim().min(1, 'Vui lòng chọn địa chỉ'),
  storePhone: z.string().trim().min(8, 'Số điện thoại không hợp lệ'),
  zalo: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Email không hợp lệ'),
  websiteLink: optionalUrlSchema
})

type StoreFormData = z.infer<typeof storeSchema>

export function StoreRegistration() {
  const { user, profile, store, isLoading: isLoadingAuth } = useAuth()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { locations } = useMasterData()
  const locationCollection = useMemo(
    () => createMasterDataCollection(locations),
    [locations]
  )
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: '',
      storeLogo: '',
      storeBanner: '',
      description: '',
      taxCode: '',
      address: '',
      storePhone: '',
      zalo: '',
      email: '',
      websiteLink: ''
    }
  })

  const watchedLogo = watch('storeLogo')
  const watchedBanner = watch('storeBanner')
  const hasStore = !!store

  useEffect(() => {
    if (store) {
      reset({
        storeName: store.name || '',
        storeLogo: store.logoUrl || '',
        storeBanner: store.bannerUrl || '',
        description: store.description || '',
        taxCode: store.taxCode || '',
        address: store.address || '',
        storePhone: store.contactPhone || '',
        zalo: store.zalo || '',
        email: store.contactEmail || '',
        websiteLink: store.websiteLink || ''
      })
    }
  }, [store, reset])

  const handleLogoUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user || acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      if (!file) return
      setIsUploadingLogo(true)

      try {
        const { data, error } = await uploadStoreAsset(file, user, 'logo')

        if (error) {
          toast.error(error.message || 'Không thể tải lên hình ảnh', {
            title: 'Lỗi tải lên'
          })
          return
        }

        if (data?.url) {
          setValue('storeLogo', data.url)
          clearErrors('storeLogo')
          toast.success('Hình ảnh đã được tải lên', {
            title: 'Tải lên thành công'
          })
        }
      } catch {
        toast.error('Đã xảy ra lỗi khi tải lên hình ảnh')
      } finally {
        setIsUploadingLogo(false)
      }
    },
    [user, setValue, clearErrors, toast]
  )

  const handleBannerUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user || acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      if (!file) return
      setIsUploadingBanner(true)

      try {
        const { data, error } = await uploadStoreAsset(file, user, 'banner')

        if (error) {
          toast.error(error.message || 'Không thể tải lên hình ảnh', {
            title: 'Lỗi tải lên'
          })
          return
        }

        if (data?.url) {
          setValue('storeBanner', data.url)
          clearErrors('storeBanner')
          toast.success('Hình ảnh đã được tải lên', {
            title: 'Tải lên thành công'
          })
        }
      } catch {
        toast.error('Đã xảy ra lỗi khi tải lên hình ảnh')
      } finally {
        setIsUploadingBanner(false)
      }
    },
    [user, setValue, clearErrors, toast]
  )

  const onLogoDropRejected = useCallback(
    (fileRejections: any[]) => {
      for (const { file, errors } of fileRejections) {
        for (const error of errors) {
          if (error.code === 'file-too-large') {
            toast.error('Kích thước file không được vượt quá 5MB', {
              title: 'File quá lớn'
            })
          } else if (error.code === 'file-invalid-type') {
            toast.error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, WebP)', {
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

  const onBannerDropRejected = useCallback(
    (fileRejections: any[]) => {
      for (const { file, errors } of fileRejections) {
        for (const error of errors) {
          if (error.code === 'file-too-large') {
            toast.error('Kích thước file không được vượt quá 5MB', {
              title: 'File quá lớn'
            })
          } else if (error.code === 'file-invalid-type') {
            toast.error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, WebP)', {
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

  const ACCEPTED_IMAGE_TYPES_OBJ = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  }

  const logoDropzone = useDropzone({
    onDrop: handleLogoUpload,
    onDropRejected: onLogoDropRejected,
    accept: ACCEPTED_IMAGE_TYPES_OBJ,
    maxSize: MAX_IMAGE_SIZE,
    maxFiles: 1,
    multiple: false,
    disabled: isUploadingLogo
  })

  const bannerDropzone = useDropzone({
    onDrop: handleBannerUpload,
    onDropRejected: onBannerDropRejected,
    accept: ACCEPTED_IMAGE_TYPES_OBJ,
    maxSize: MAX_IMAGE_SIZE,
    maxFiles: 1,
    multiple: false,
    disabled: isUploadingBanner
  })

  const onSubmit = async (formData: StoreFormData) => {
    if (!user) return

    const banner = (formData.storeBanner ?? '').trim()
    const desc = (formData.description ?? '').trim()
    const payload = {
      storeName: formData.storeName.trim(),
      storeLogo: formData.storeLogo.trim(),
      storeBanner: banner,
      description: desc,
      taxCode: formData.taxCode.trim(),
      address: formData.address.trim(),
      storePhone: formData.storePhone.trim(),
      zalo: formData.zalo?.trim() || null,
      email: formData.email.trim(),
      websiteLink: formData.websiteLink?.trim() || null
    }
    const { error } = await upsertStore(
      {
        name: payload.storeName,
        logoUrl: payload.storeLogo!,
        bannerUrl: payload.storeBanner!,
        description: payload.description,
        taxCode: payload.taxCode || null,
        invoiceInfo: null,
        contactEmail: payload.email,
        contactPhone: payload.storePhone,
        address: payload.address,
        websiteLink: payload.websiteLink,
        zalo: payload.zalo,
        storeType: 'personal'
      },
      user
    )
    if (error) {
      toast.error(error.message || 'Không thể lưu thông tin cửa hàng', {
        title: 'Đăng ký thất bại'
      })
      return
    }

    if (profile?.role === 'buyer') {
      const { error: roleError } = await supabase
        .from(TABLES.PROFILES)
        .update({ role: 'seller', updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (roleError) {
        toast.warning('Cửa hàng đã được tạo nhưng không thể cập nhật vai trò', {
          title: 'Cảnh báo'
        })
      } else {
        dispatch(fetchUserData(user))
      }
    }

    toast.success('Thông tin cửa hàng đã được lưu', {
      title: 'Đăng ký thành công'
    })
    dispatch(fetchUserData(user))
  }

  if (isLoadingAuth) {
    return (
      <Box bg='#F8FAFC' minH='calc(100vh - 200px)' py={8}>
        <Box maxW='1200px' mx='auto' px={4}>
          <Card.Root className='rounded-2xl border border-[#E5E5E5]'>
            <Card.Body p={8}>
              <Text textAlign='center'>Đang tải...</Text>
            </Card.Body>
          </Card.Root>
        </Box>
      </Box>
    )
  }

  if (hasStore) {
    return (
      <Box bg='#F8FAFC' minH='calc(100vh - 200px)' py={8}>
        <Box maxW='1200px' mx='auto' px={4}>
          <Card.Root className='rounded-2xl border border-[#E5E5E5] !bg-white'>
            <Card.Body p={8}>
              <VStack align='center' gap={6} py={8}>
                <Box color='#16a34a' display='flex' alignItems='center' justifyContent='center'>
                  <FiCheckCircle size={56} />
                </Box>
                <VStack align='center' gap={2}>
                  <Text fontSize='xl' fontWeight='700' color='#04113E' textAlign='center'>
                    Bạn đã đăng ký cửa hàng
                  </Text>
                  <Text fontSize='sm' color='#6B7280' textAlign='center'>
                    Cửa hàng của bạn đã được đăng ký thành công. Bạn có thể quản lý cửa hàng tại
                    trang quản lý cửa hàng.
                  </Text>
                </VStack>
                <Button
                  bg='#204ED3'
                  color='white'
                  borderRadius='6px'
                  px={6}
                  py={3}
                  fontSize='14px'
                  fontWeight='600'
                  onClick={() => navigate('/stores')}
                >
                  Tới cửa hàng
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Box>
      </Box>
    )
  }

  return (
    <Box bg='#F8FAFC' minH='calc(100vh - 200px)' py={8}>
      <Box maxW='1200px' mx='auto' px={4}>
        <Card.Root className='rounded-2xl border border-[#E5E5E5] !bg-white'>
          <Card.Header>
            <VStack align='flex-start' gap={2}>
              <Text fontSize='xl' fontWeight='700' color='#04113E'>
                Đăng ký cửa hàng
              </Text>
              <Text fontSize='sm' color='#6B7280'>
                Điền thông tin để đăng ký cửa hàng
              </Text>
            </VStack>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack align='stretch' gap={6}>
                <Field.Root invalid={!!errors.storeName}>
                  <Field.Label color='#04113E'>Tên cửa hàng *</Field.Label>
                  <Controller
                    control={control}
                    name='storeName'
                    render={({ field }) => (
                      <Input
                        placeholder='Nhập tên cửa hàng'
                        color='#04113E'
                        bg='white'
                        borderColor='#E5E5E5'
                        borderRadius='8px'
                        {...field}
                      />
                    )}
                  />
                  {errors.storeName && (
                    <Field.ErrorText>{errors.storeName.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  <Field.Root invalid={!!errors.storeLogo}>
                    <Field.Label color='#04113E'>Logo cửa hàng *</Field.Label>
                    <VStack align='stretch' gap={2}>
                      {watchedLogo && (
                        <Box
                          position='relative'
                          w='full'
                          h='200px'
                          borderRadius='8px'
                          overflow='hidden'
                        >
                          <Image
                            src={watchedLogo}
                            alt='Store logo'
                            w='full'
                            h='full'
                            objectFit='cover'
                          />
                        </Box>
                      )}
                      <Box
                        {...logoDropzone.getRootProps()}
                        borderRadius='8px'
                        border='2px dashed'
                        borderColor={logoDropzone.isDragActive ? '#204ED3' : '#E5E5E5'}
                        bg={logoDropzone.isDragActive ? '#F0F4FF' : '#F5F5F5'}
                        p={4}
                        textAlign='center'
                        cursor='pointer'
                        transition='all 0.2s'
                        _hover={{
                          borderColor: '#204ED3',
                          bg: '#F0F4FF'
                        }}
                      >
                        <input {...logoDropzone.getInputProps()} />
                        <VStack gap={2}>
                          <Text fontSize='14px' color='#6B7280'>
                            {logoDropzone.isDragActive
                              ? 'Thả file vào đây'
                              : watchedLogo
                                ? 'Kéo thả hoặc click để thay đổi logo'
                                : 'Kéo thả hoặc click để tải lên logo'}
                          </Text>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={e => e.stopPropagation()}
                            color='#04113E'
                            loading={isUploadingLogo}
                            disabled={isUploadingLogo}
                          >
                            {watchedLogo ? 'Thay đổi logo' : 'Chọn file'}
                          </Button>
                        </VStack>
                      </Box>
                    </VStack>
                    {errors.storeLogo && (
                      <Field.ErrorText>{errors.storeLogo.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.storeBanner}>
                    <Field.Label color='#04113E'>Banner cửa hàng</Field.Label>
                    <VStack align='stretch' gap={2}>
                      {watchedBanner && (
                        <Box
                          position='relative'
                          w='full'
                          h='200px'
                          borderRadius='8px'
                          overflow='hidden'
                        >
                          <Image
                            src={watchedBanner}
                            alt='Store banner'
                            w='full'
                            h='full'
                            objectFit='cover'
                          />
                        </Box>
                      )}
                      <Box
                        {...bannerDropzone.getRootProps()}
                        borderRadius='8px'
                        border='2px dashed'
                        borderColor={bannerDropzone.isDragActive ? '#204ED3' : '#E5E5E5'}
                        bg={bannerDropzone.isDragActive ? '#F0F4FF' : '#F5F5F5'}
                        p={4}
                        textAlign='center'
                        cursor='pointer'
                        transition='all 0.2s'
                        _hover={{
                          borderColor: '#204ED3',
                          bg: '#F0F4FF'
                        }}
                      >
                        <input {...bannerDropzone.getInputProps()} />
                        <VStack gap={2}>
                          <Text fontSize='14px' color='#6B7280'>
                            {bannerDropzone.isDragActive
                              ? 'Thả file vào đây'
                              : watchedBanner
                                ? 'Kéo thả hoặc click để thay đổi banner'
                                : 'Kéo thả hoặc click để tải lên banner'}
                          </Text>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={e => e.stopPropagation()}
                            loading={isUploadingBanner}
                            disabled={isUploadingBanner}
                            color='#04113E'
                          >
                            {watchedBanner ? 'Thay đổi banner' : 'Chọn file'}
                          </Button>
                        </VStack>
                      </Box>
                    </VStack>
                    {errors.storeBanner && (
                      <Field.ErrorText>{errors.storeBanner.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Grid>

                <Field.Root invalid={!!errors.description}>
                  <Field.Label color='#04113E'>Mô tả cửa hàng</Field.Label>
                  <Controller
                    control={control}
                    name='description'
                    render={({ field }) => (
                      <Textarea
                        placeholder='Nhập mô tả về cửa hàng của bạn'
                        bg='white'
                        borderColor='#E5E5E5'
                        color='#04113E'
                        borderRadius='8px'
                        rows={4}
                        {...field}
                      />
                    )}
                  />
                  {errors.description && (
                    <Field.ErrorText>{errors.description.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  <Field.Root invalid={!!errors.taxCode}>
                    <Field.Label color='#04113E'>Mã số thuế *</Field.Label>
                    <Controller
                      control={control}
                      name='taxCode'
                      render={({ field }) => (
                        <Input
                          placeholder='Nhập mã số thuế'
                          color='#04113E'
                          bg='white'
                          borderColor='#E5E5E5'
                          borderRadius='8px'
                          {...field}
                        />
                      )}
                    />
                    {errors.taxCode && <Field.ErrorText>{errors.taxCode.message}</Field.ErrorText>}
                  </Field.Root>

                  <SelectFieldController
                    label='Địa chỉ *'
                    collection={locationCollection}
                    control={control}
                    name='address'
                    placeholder='Chọn địa chỉ'
                  />
                </Grid>

                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  <Field.Root invalid={!!errors.storePhone}>
                    <Field.Label color='#04113E'>Số điện thoại *</Field.Label>
                    <Controller
                      control={control}
                      name='storePhone'
                      render={({ field }) => (
                        <Input
                          placeholder='Nhập số điện thoại'
                          bg='white'
                          borderColor='#E5E5E5'
                          borderRadius='8px'
                          color='#04113E'
                          {...field}
                        />
                      )}
                    />
                    {errors.storePhone && (
                      <Field.ErrorText>{errors.storePhone.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.email}>
                    <Field.Label color='#04113E'>Email *</Field.Label>
                    <Controller
                      control={control}
                      name='email'
                      render={({ field }) => (
                        <Input
                          type='email'
                          placeholder='Nhập email'
                          bg='white'
                          borderColor='#E5E5E5'
                          borderRadius='8px'
                          color='#04113E'
                          {...field}
                        />
                      )}
                    />
                    {errors.email && <Field.ErrorText>{errors.email.message}</Field.ErrorText>}
                  </Field.Root>
                </Grid>

                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  <Field.Root invalid={!!errors.zalo}>
                    <Field.Label color='#04113E'>Zalo</Field.Label>
                    <Controller
                      control={control}
                      name='zalo'
                      render={({ field }) => (
                        <Input
                          placeholder='Nhập số Zalo'
                          bg='white'
                          borderColor='#E5E5E5'
                          color='#04113E'
                          borderRadius='8px'
                          {...field}
                        />
                      )}
                    />
                    {errors.zalo && <Field.ErrorText>{errors.zalo.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.websiteLink}>
                    <Field.Label color='#04113E'>Website</Field.Label>
                    <Controller
                      control={control}
                      name='websiteLink'
                      render={({ field }) => (
                        <Input
                          placeholder='https://example.com'
                          bg='white'
                          borderColor='#E5E5E5'
                          borderRadius='8px'
                          color='#04113E'
                          {...field}
                        />
                      )}
                    />
                    {errors.websiteLink && (
                      <Field.ErrorText>{errors.websiteLink.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Grid>

                <Button
                  type='submit'
                  bg='#204ED3'
                  color='white'
                  size='lg'
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {hasStore ? 'Cập nhật cửa hàng' : 'Đăng ký cửa hàng'}
                </Button>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>
      </Box>
    </Box>
  )
}
