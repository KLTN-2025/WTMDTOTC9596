import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Grid,
  Image,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { upsertStore, uploadStoreAsset } from '@/api/stores'
import { PATHS } from '@/configs/paths'
import { Link as RouterLink } from 'react-router'
import { useAppDispatch } from '@/stores/hooks'
import { fetchUserData } from '@/stores/auth/authSlice'

const storeSchema = z.object({
  avatarUrl: z.string().url('Ảnh đại diện không hợp lệ').min(1, 'Vui lòng tải ảnh đại diện'),
  bannerUrl: z.string().url('Banner không hợp lệ').or(z.literal('')),
  storeUrl: z.string().url('Vui lòng nhập đường dẫn cửa hàng hợp lệ').or(z.literal('')),
  storeName: z.string().min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự'),
  storeAddress: z.string().min(5, 'Địa chỉ cửa hàng phải có ít nhất 5 ký tự').or(z.literal('')),
  zalo: z.string().min(5, 'Zalo không hợp lệ').or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Số điện thoại không hợp lệ')
    .max(15, 'Số điện thoại không hợp lệ')
    .or(z.literal('')),
  externalLink: z.string().url('Liên kết ngoài không hợp lệ').or(z.literal('')),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự').or(z.literal(''))
})

type StoreFormData = z.infer<typeof storeSchema>

export function StoreInfoTab() {
  const { user, store, isLoading: authLoading } = useAuth()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const bannerInputRef = useRef<HTMLInputElement | null>(null)

  const storeDefaults = useMemo<StoreFormData>(
    () => ({
      avatarUrl: '',
      bannerUrl: '',
      storeUrl: '',
      storeName: '',
      storeAddress: '',
      zalo: '',
      phone: '',
      externalLink: '',
      description: ''
    }),
    []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: storeDefaults
  })

  const avatarPreview = watch('avatarUrl')
  const bannerPreview = watch('bannerUrl')

  useEffect(() => {
    if (store) {
      reset({
        avatarUrl: store.logoUrl ?? '',
        bannerUrl: store.bannerUrl ?? '',
        storeUrl: store.websiteLink ?? '',
        storeName: store.name ?? '',
        storeAddress: store.address ?? '',
        zalo: store.zalo ?? '',
        phone: store.contactPhone ?? '',
        externalLink: store.websiteLink ?? '',
        description: store.description ?? ''
      })
    }
  }, [store, reset])

  const handleUpload =
    (type: 'avatar' | 'banner') => async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!user) {
        toast.error('Bạn cần đăng nhập để tải ảnh', {
          title: 'Lỗi'
        })
        return
      }
      const file = event.target.files?.[0]
      if (!file) return

      const isAvatar = type === 'avatar'
      if (isAvatar) {
        setIsUploadingAvatar(true)
      } else {
        setIsUploadingBanner(true)
      }

      try {
        const { data, error } = await uploadStoreAsset(file, user, isAvatar ? 'logo' : 'banner')
        if (error || !data) {
          toast.error(error?.message || 'Không thể tải ảnh, vui lòng thử lại', {
            title: 'Tải ảnh thất bại'
          })
        } else {
          const key = isAvatar ? 'avatarUrl' : 'bannerUrl'
          setValue(key, data.url, { shouldDirty: true, shouldTouch: true })
          toast.success(isAvatar ? 'Ảnh đại diện đã được cập nhật' : 'Banner đã được cập nhật', {
            title: 'Tải ảnh thành công'
          })
        }
      } finally {
        if (isAvatar) {
          setIsUploadingAvatar(false)
        } else {
          setIsUploadingBanner(false)
        }
        event.target.value = ''
      }
    }

  const onSubmit = async (data: StoreFormData) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để cập nhật thông tin cửa hàng', {
        title: 'Lỗi'
      })
      return
    }

    setIsSaving(true)
    try {
      const trim = (value: string) => value?.trim?.() ?? ''
      const websiteLink = trim(data.storeUrl) || trim(data.externalLink)
      const descriptionValue = trim(data.description) || 'Thông tin cửa hàng đang được cập nhật.'

      const { data: updatedStore, error } = await upsertStore(
        {
          name: trim(data.storeName),
          logoUrl: trim(data.avatarUrl),
          bannerUrl: trim(data.bannerUrl),
          description: descriptionValue,
          taxCode: store?.taxCode ?? null,
          invoiceInfo: store?.invoiceInfo ?? null,
          contactEmail: store?.contactEmail ?? '',
          contactPhone: trim(data.phone),
          address: trim(data.storeAddress) || null,
          websiteLink: websiteLink || null,
          zalo: trim(data.zalo) || null,
          storeType: store?.storeType ?? 'personal'
        },
        user
      )

      if (error) {
        toast.error(error.message || 'Không thể lưu thông tin cửa hàng, vui lòng thử lại', {
          title: 'Lưu thất bại'
        })
        return
      }

      if (updatedStore && user) {
        reset({
          avatarUrl: updatedStore.logoUrl ?? '',
          bannerUrl: updatedStore.bannerUrl ?? '',
          storeUrl: updatedStore.websiteLink ?? '',
          storeName: updatedStore.name ?? '',
          storeAddress: updatedStore.address ?? '',
          zalo: updatedStore.zalo ?? '',
          phone: updatedStore.contactPhone ?? '',
          externalLink: updatedStore.websiteLink ?? '',
          description: updatedStore.description ?? ''
        })
        dispatch(fetchUserData(user))
      }

      toast.success('Thông tin cửa hàng đã được cập nhật', {
        title: 'Lưu thành công'
      })
    } catch {
      toast.error('Không thể lưu thông tin cửa hàng, vui lòng thử lại', {
        title: 'Lưu thất bại'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <Card.Root bg='white' borderRadius='16px' p={{ base: 6, md: 8 }} className='rounded-2xl'>
        <Flex justify='center' align='center' minH='200px'>
          <Spinner size='lg' color='#204ED3' />
        </Flex>
      </Card.Root>
    )
  }

  if (!store) {
    return (
      <Card.Root bg='white' borderRadius='16px' p={{ base: 6, md: 8 }} className='rounded-2xl'>
        <VStack gap={4} textAlign='center'>
          <Text fontSize='18px' fontWeight='700' color='#04113E'>
            Bạn chưa có cửa hàng
          </Text>
          <Text fontSize='14px' color='#6B7280'>
            Hãy đăng ký cửa hàng để quản lý thông tin và sản phẩm của bạn.
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
              _hover={{ bg: '#1a3fb0' }}
              className='rounded-md px-6 py-3 font-semibold text-sm'
            >
              Đăng ký cửa hàng
            </Button>
          </RouterLink>
        </VStack>
      </Card.Root>
    )
  }

  return (
    <Card.Root bg='white' borderRadius='16px' p={{ base: 5, md: 8 }} className='rounded-2xl'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align='stretch' gap={10}>
          <VStack align='stretch' gap={3}>
            <Text
              fontSize='20px'
              fontWeight='700'
              color='#04113E'
              className='text-[20px] font-bold text-[#04113E]'
            >
              Thông tin cửa hàng
            </Text>
            <Text fontSize='14px' color='#6B7280' className='text-sm text-[#6B7280]'>
              Những thông tin công khai người dùng khác có thể thấy được
            </Text>
          </VStack>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <Field.Root invalid={!!errors.avatarUrl}>
              <Field.Label>Ảnh đại diện</Field.Label>
              <VStack align='stretch' gap={3}>
                <Box
                  borderRadius='12px'
                  border='1px solid #E5E5E5'
                  overflow='hidden'
                  bg='#F5F5F5'
                  height='180px'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt='Ảnh đại diện cửa hàng'
                      width='100%'
                      height='100%'
                      objectFit='cover'
                    />
                  ) : (
                    <Text color='#6B7280'>Chưa có ảnh đại diện</Text>
                  )}
                </Box>
                <input
                  ref={avatarInputRef}
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  onChange={handleUpload('avatar')}
                />
                <Button
                  variant='outline'
                  borderColor='#204ED3'
                  color='#204ED3'
                  borderRadius='6px'
                  px={4}
                  py={2}
                  fontWeight='600'
                  fontSize='14px'
                  disabled={isUploadingAvatar}
                  className='rounded-md px-4 py-2 text-sm font-semibold'
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {isUploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh đại diện'}
                </Button>
                <Input type='hidden' {...register('avatarUrl')} />
                {errors.avatarUrl && <Field.ErrorText>{errors.avatarUrl.message}</Field.ErrorText>}
              </VStack>
            </Field.Root>

            <Field.Root invalid={!!errors.bannerUrl}>
              <Field.Label>Banner</Field.Label>
              <VStack align='stretch' gap={3} w='100%'>
                <Box
                  borderRadius='12px'
                  border='1px solid #E5E5E5'
                  overflow='hidden'
                  bg='#F5F5F5'
                  height='180px'
                  width='100%'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                >
                  {bannerPreview ? (
                    <Image
                      src={bannerPreview}
                      alt='Banner cửa hàng'
                      width='100%'
                      height='100%'
                      objectFit='cover'
                    />
                  ) : (
                    <Text color='#6B7280'>Chưa có banner</Text>
                  )}
                </Box>
                <input
                  ref={bannerInputRef}
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  onChange={handleUpload('banner')}
                />
                <Button
                  variant='outline'
                  borderColor='#204ED3'
                  color='#204ED3'
                  borderRadius='6px'
                  px={4}
                  py={2}
                  fontWeight='600'
                  fontSize='14px'
                  disabled={isUploadingBanner}
                  className='rounded-md px-4 py-2 text-sm font-semibold'
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {isUploadingBanner ? 'Đang tải lên...' : 'Tải banner'}
                </Button>
                <Input type='hidden' {...register('bannerUrl')} />
                {errors.bannerUrl && <Field.ErrorText>{errors.bannerUrl.message}</Field.ErrorText>}
              </VStack>
            </Field.Root>
          </Grid>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <Field.Root invalid={!!errors.storeUrl}>
              <Field.Label>Link cửa hàng</Field.Label>
              <Input
                placeholder='Nhập link cửa hàng'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('storeUrl')}
              />
              {errors.storeUrl && <Field.ErrorText>{errors.storeUrl.message}</Field.ErrorText>}
            </Field.Root>

            <Field.Root invalid={!!errors.storeName}>
              <Field.Label>Tên cửa hàng</Field.Label>
              <Input
                placeholder='Nhập tên cửa hàng'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('storeName')}
              />
              {errors.storeName && <Field.ErrorText>{errors.storeName.message}</Field.ErrorText>}
            </Field.Root>

            <Field.Root invalid={!!errors.storeAddress}>
              <Field.Label>Địa chỉ cửa hàng</Field.Label>
              <Input
                placeholder='Nhập địa chỉ cửa hàng'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('storeAddress')}
              />
              {errors.storeAddress && (
                <Field.ErrorText>{errors.storeAddress.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.zalo}>
              <Field.Label>Zalo</Field.Label>
              <Input
                placeholder='Nhập link hoặc số Zalo'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('zalo')}
              />
              {errors.zalo && <Field.ErrorText>{errors.zalo.message}</Field.ErrorText>}
            </Field.Root>

            <Field.Root invalid={!!errors.phone}>
              <Field.Label>Số điện thoại</Field.Label>
              <Input
                placeholder='Nhập số điện thoại'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('phone')}
              />
              {errors.phone && <Field.ErrorText>{errors.phone.message}</Field.ErrorText>}
            </Field.Root>

            <Field.Root invalid={!!errors.externalLink}>
              <Field.Label>Liên kết ngoài</Field.Label>
              <Input
                placeholder='Nhập liên kết ngoài'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('externalLink')}
              />
              {errors.externalLink && (
                <Field.ErrorText>{errors.externalLink.message}</Field.ErrorText>
              )}
            </Field.Root>
          </Grid>

          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <Field.Root invalid={!!errors.description}>
                <Field.Label>Mô tả cửa hàng</Field.Label>
                <Textarea
                  placeholder='Nhập mô tả cửa hàng'
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={3}
                  fontSize='16px'
                  color='#737373'
                  minH='140px'
                  {...field}
                />
                {errors.description && (
                  <Field.ErrorText>{errors.description.message}</Field.ErrorText>
                )}
              </Field.Root>
            )}
          />

          <Flex justify='flex-end'>
            <Button
              type='submit'
              bg='#204ED3'
              color='white'
              borderRadius='6px'
              px={6}
              py={3}
              fontWeight='600'
              fontSize='14px'
              _hover={{ bg: '#1a3fb0' }}
              loading={isSaving}
              disabled={isSaving}
              className='rounded-md px-6 py-3 font-semibold text-sm'
            >
              Lưu thay đổi
            </Button>
          </Flex>
        </VStack>
      </form>
    </Card.Root>
  )
}
