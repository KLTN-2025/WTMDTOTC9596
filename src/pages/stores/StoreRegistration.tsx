import {
  Box,
  Button,
  Card,
  Field,
  Grid,
  Image,
  Input,
  Portal,
  Select,
  Text,
  Textarea,
  VStack,
  createListCollection
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toaster } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/useAuth'
import { getStore, upsertStore, uploadStoreAsset } from '@/api/stores'
import { useNavigate } from 'react-router'
import { FiCheckCircle } from 'react-icons/fi'
import { useMasterData } from '@/hooks/useMasterData'
import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import { useAppDispatch } from '@/stores/hooks'
import { fetchUserData } from '@/stores/auth/authSlice'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

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
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { locations } = useMasterData()
  const locationCollection = useMemo(
    () =>
      createListCollection({
        items: locations.map(location => ({
          label: location.name,
          value: location.id
        }))
      }),
    [locations]
  )
  const [isLoading, setIsLoading] = useState(true)
  const [hasStore, setHasStore] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const loadStore = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await getStore(user)

        if (error) {
          setIsLoading(false)
          return
        }

        if (data) {
          setHasStore(true)
          reset({
            storeName: data.name || '',
            storeLogo: data.logoUrl || '',
            storeBanner: data.bannerUrl || '',
            description: data.description || '',
            taxCode: data.taxCode || '',
            address: data.address || '',
            storePhone: data.contactPhone || '',
            zalo: data.zalo || '',
            email: data.contactEmail || '',
            websiteLink: data.websiteLink || ''
          })
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false)
      }
    }

    loadStore()
  }, [user, reset])

  const handleFileUpload = async (file: File, variant: 'logo' | 'banner') => {
    if (!user) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toaster.create({
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, WebP)',
        type: 'error'
      })
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toaster.create({
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 5MB',
        type: 'error'
      })
      return
    }

    if (variant === 'logo') {
      setIsUploadingLogo(true)
    } else {
      setIsUploadingBanner(true)
    }

    try {
      const { data, error } = await uploadStoreAsset(file, variant, user)

      if (error) {
        toaster.create({
          title: 'Lỗi tải lên',
          description: error.message || 'Không thể tải lên hình ảnh',
          type: 'error'
        })
        return
      }

      if (data?.url) {
        if (variant === 'logo') {
          setValue('storeLogo', data.url)
          clearErrors('storeLogo')
        } else {
          setValue('storeBanner', data.url)
          clearErrors('storeBanner')
        }
        toaster.create({
          title: 'Tải lên thành công',
          description: 'Hình ảnh đã được tải lên',
          type: 'success'
        })
      }
    } catch {
      toaster.create({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi khi tải lên hình ảnh',
        type: 'error'
      })
    } finally {
      if (variant === 'logo') {
        setIsUploadingLogo(false)
      } else {
        setIsUploadingBanner(false)
      }
    }
  }

  const onLogoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) {
      return
    }
    await handleFileUpload(file, 'logo')
    input.value = ''
  }

  const onBannerFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) {
      return
    }
    await handleFileUpload(file, 'banner')
    input.value = ''
  }

  const triggerFileDialog = (variant: 'logo' | 'banner') => {
    if (variant === 'logo') {
      logoInputRef.current?.click()
    } else {
      bannerInputRef.current?.click()
    }
  }

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
      toaster.create({
        title: 'Đăng ký thất bại',
        description: error.message || 'Không thể lưu thông tin cửa hàng',
        type: 'error'
      })
      return
    }

    if (profile?.role === 'buyer') {
      const { error: roleError } = await supabase
        .from(TABLES.PROFILES)
        .update({ role: 'seller', updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (roleError) {
        toaster.create({
          title: 'Cảnh báo',
          description: 'Cửa hàng đã được tạo nhưng không thể cập nhật vai trò',
          type: 'warning'
        })
      } else {
        dispatch(fetchUserData(user))
      }
    }

    toaster.create({
      title: 'Đăng ký thành công',
      description: 'Thông tin cửa hàng đã được lưu',
      type: 'success'
    })
    setHasStore(true)
  }

  if (isLoading) {
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
          <Card.Root className='rounded-2xl border border-[#E5E5E5]'>
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
        <Card.Root className='rounded-2xl border border-[#E5E5E5]'>
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
                  <Field.Label>Tên cửa hàng *</Field.Label>
                  <Controller
                    control={control}
                    name='storeName'
                    render={({ field }) => (
                      <Input
                        placeholder='Nhập tên cửa hàng'
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
                    <Field.Label>Logo cửa hàng *</Field.Label>
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
                      <input
                        ref={logoInputRef}
                        type='file'
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        style={{ display: 'none' }}
                        onChange={onLogoFileChange}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => triggerFileDialog('logo')}
                        loading={isUploadingLogo}
                      >
                        {watchedLogo ? 'Thay đổi logo' : 'Tải lên logo'}
                      </Button>
                    </VStack>
                    {errors.storeLogo && (
                      <Field.ErrorText>{errors.storeLogo.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.storeBanner}>
                    <Field.Label>Banner cửa hàng</Field.Label>
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
                      <input
                        ref={bannerInputRef}
                        type='file'
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        style={{ display: 'none' }}
                        onChange={onBannerFileChange}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => triggerFileDialog('banner')}
                        loading={isUploadingBanner}
                      >
                        {watchedBanner ? 'Thay đổi banner' : 'Tải lên banner'}
                      </Button>
                    </VStack>
                    {errors.storeBanner && (
                      <Field.ErrorText>{errors.storeBanner.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Grid>

                <Field.Root invalid={!!errors.description}>
                  <Field.Label>Mô tả cửa hàng</Field.Label>
                  <Controller
                    control={control}
                    name='description'
                    render={({ field }) => (
                      <Textarea
                        placeholder='Nhập mô tả về cửa hàng của bạn'
                        bg='white'
                        borderColor='#E5E5E5'
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
                    <Field.Label>Mã số thuế *</Field.Label>
                    <Controller
                      control={control}
                      name='taxCode'
                      render={({ field }) => (
                        <Input
                          placeholder='Nhập mã số thuế'
                          bg='white'
                          borderColor='#E5E5E5'
                          borderRadius='8px'
                          {...field}
                        />
                      )}
                    />
                    {errors.taxCode && <Field.ErrorText>{errors.taxCode.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.address}>
                    <Field.Label>Địa chỉ *</Field.Label>
                    <Controller
                      control={control}
                      name='address'
                      render={({ field }) => (
                        <Select.Root
                          collection={locationCollection}
                          value={[field.value]}
                          onValueChange={e => {
                            field.onChange(e.value[0] || '')
                          }}
                        >
                          <Select.Trigger bg='white' borderColor='#E5E5E5' borderRadius='8px'>
                            <Select.ValueText placeholder='Chọn địa chỉ' />
                          </Select.Trigger>
                          <Portal>
                            <Select.Content>
                              <Select.ItemGroup id='locations'>
                                {locations.map(location => (
                                  <Select.Item key={location.id} item={location.id}>
                                    {location.name}
                                  </Select.Item>
                                ))}
                              </Select.ItemGroup>
                            </Select.Content>
                          </Portal>
                        </Select.Root>
                      )}
                    />
                    {errors.address && <Field.ErrorText>{errors.address.message}</Field.ErrorText>}
                  </Field.Root>
                </Grid>

                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  <Field.Root invalid={!!errors.storePhone}>
                    <Field.Label>Số điện thoại *</Field.Label>
                    <Controller
                      control={control}
                      name='storePhone'
                      render={({ field }) => (
                        <Input
                          placeholder='Nhập số điện thoại'
                          bg='white'
                          borderColor='#E5E5E5'
                          borderRadius='8px'
                          {...field}
                        />
                      )}
                    />
                    {errors.storePhone && (
                      <Field.ErrorText>{errors.storePhone.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.email}>
                    <Field.Label>Email *</Field.Label>
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
                          {...field}
                        />
                      )}
                    />
                    {errors.email && <Field.ErrorText>{errors.email.message}</Field.ErrorText>}
                  </Field.Root>
                </Grid>

                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  <Field.Root invalid={!!errors.zalo}>
                    <Field.Label>Zalo</Field.Label>
                    <Controller
                      control={control}
                      name='zalo'
                      render={({ field }) => (
                        <Input
                          placeholder='Nhập số Zalo'
                          bg='white'
                          borderColor='#E5E5E5'
                          borderRadius='8px'
                          {...field}
                        />
                      )}
                    />
                    {errors.zalo && <Field.ErrorText>{errors.zalo.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.websiteLink}>
                    <Field.Label>Website</Field.Label>
                    <Controller
                      control={control}
                      name='websiteLink'
                      render={({ field }) => (
                        <Input
                          placeholder='https://example.com'
                          bg='white'
                          borderColor='#E5E5E5'
                          borderRadius='8px'
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
