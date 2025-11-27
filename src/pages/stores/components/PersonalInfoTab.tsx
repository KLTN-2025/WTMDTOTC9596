import { Box, Button, Card, Field, Flex, Grid, Image, Input, Text, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/useToast'
import { updateProfile, uploadAvatar, type UpdateProfileData } from '@/api/profile'
import { useAuth } from '@/hooks/useAuth'
import { DatePicker } from '@/components/ui/date-picker'
import { useAppDispatch } from '@/stores/hooks'
import { fetchUserData } from '@/stores/auth/authSlice'

const personalSchema = z.object({
  avatarUrl: z.string().url('Ảnh đại diện không hợp lệ').or(z.literal('')),
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  cid: z.string().optional().or(z.literal('')),
  doi: z.string().optional().or(z.literal(''))
})

type PersonalFormData = z.infer<typeof personalSchema>

export function PersonalInfoTab() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      avatarUrl: ''
    }
  })

  const avatarPreview = watch('avatarUrl')

  useEffect(() => {
    if (profile) {
      reset({
        avatarUrl: profile.avatarUrl || '',
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        email: profile.email || user?.email || '',
        dob: profile.dob || '',
        cid: profile.cid || '',
        doi: profile.doi || ''
      })
    }
  }, [profile, reset, user])

  const onSubmit = async (formData: PersonalFormData) => {
    setIsSaving(true)
    try {
      const updateData = {
        avatarUrl: formData.avatarUrl,
        fullName: formData.fullName,
        address: formData.address,
        email: formData.email,
        dob: formData.dob,
        cid: formData.cid,
        doi: formData.doi
      }

      const { data, error } = await updateProfile(updateData as UpdateProfileData, user)

      if (error) {
        toast.error(error.message || 'Đã xảy ra lỗi khi cập nhật', {
          title: 'Cập nhật thất bại'
        })
        return
      }

      if (data && user) {
        reset({
          avatarUrl: data.avatarUrl || '',
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
          email: data.email || user?.email || '',
          dob: data.dob || '',
          cid: data.cid || '',
          doi: data.doi || ''
        })
        dispatch(fetchUserData(user))
      }

      toast.success('Thông tin của bạn đã được cập nhật', {
        title: 'Cập nhật thành công'
      })
    } catch {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại', {
        title: 'Lỗi cập nhật'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để tải ảnh', {
        title: 'Lỗi'
      })
      return
    }

    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const { data, error } = await uploadAvatar(file, user)
      if (error || !data) {
        toast.error(error?.message || 'Không thể tải ảnh, vui lòng thử lại', {
          title: 'Tải ảnh thất bại'
        })
        return
      }
      setValue('avatarUrl', data.url, { shouldDirty: true, shouldTouch: true })
      toast.success('Ảnh đại diện đã được cập nhật', {
        title: 'Thành công'
      })
    } finally {
      setIsUploadingAvatar(false)
      event.target.value = ''
    }
  }

  if (authLoading) {
    return (
      <Card.Root bg='white' borderRadius='16px' p={{ base: 5, md: 8 }} className='rounded-2xl !bg-white'>
        <Flex align='center' justify='center' minH='200px'>
          <Text fontSize='14px' color='#6B7280'>
            Đang tải thông tin...
          </Text>
        </Flex>
      </Card.Root>
    )
  }

  return (
    <Card.Root bg='white' borderRadius='16px' p={{ base: 5, md: 8 }} className='rounded-2xl'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          templateColumns={{ base: '1fr', lg: '280px 1fr' }}
          gap={{ base: 8, lg: 12 }}
          alignItems='flex-start'
        >
          <Field.Root invalid={!!errors.avatarUrl} w='100%'>
            <Field.Label color='#04113E'>Ảnh đại diện</Field.Label>
            <VStack
              align='center'
              gap={4}
              bg='#F9FAFB'
              borderRadius='16px'
              p={6}
              className='rounded-2xl'
            >
              <Box
                width='150px'
                height='150px'
                borderRadius='full'
                overflow='hidden'
                border='2px dashed #E5E7EB'
                display='flex'
                alignItems='center'
                justifyContent='center'
                bg='#F3F4F6'
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt='Ảnh đại diện'
                    width='100%'
                    height='100%'
                    objectFit='cover'
                  />
                ) : (
                  <Text color='#6B7280' fontSize='14px'>
                    Chưa có ảnh
                  </Text>
                )}
              </Box>
              <input
                ref={avatarInputRef}
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
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
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className='rounded-md px-4 py-2 text-sm font-semibold'
              >
                {isUploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh đại diện'}
              </Button>
              <Input type='hidden' {...register('avatarUrl')} />
              {errors.avatarUrl && <Field.ErrorText>{errors.avatarUrl.message}</Field.ErrorText>}
            </VStack>
          </Field.Root>

          <VStack align='stretch' gap={10}>
            <VStack align='stretch' gap={3}>
              <Text
                fontSize='20px'
                fontWeight='700'
                color='#04113E'
                className='text-[20px] font-bold text-[#04113E]'
              >
                Thông tin cá nhân
              </Text>
              <Text fontSize='14px' color='#6B7280' className='text-sm text-[#6B7280]'>
                Các thông tin này sẽ được đồng bộ với hồ sơ của bạn.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <Field.Root invalid={!!errors.fullName}>
                <Field.Label color='#04113E'>Họ và tên</Field.Label>
                <Input
                  placeholder='Nhập họ và tên'
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={3}
                  fontSize='16px'
                  color='#04113E'
                  {...register('fullName')}
                />
                {errors.fullName && <Field.ErrorText>{errors.fullName.message}</Field.ErrorText>}
              </Field.Root>

              <Field.Root>
                <Field.Label color='#04113E'>Số điện thoại</Field.Label>
                <Input
                  placeholder='Chưa cập nhật'
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={3}
                  fontSize='16px'
                  color='#04113E'
                  disabled
                  {...register('phone')}
                />
                <Field.HelperText>Số điện thoại được quản lý bởi hệ thống</Field.HelperText>
              </Field.Root>

              <Field.Root invalid={!!errors.address}>
                <Field.Label color='#04113E'>Địa chỉ</Field.Label>
                <Input
                  placeholder='Nhập địa chỉ'
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={3}
                  fontSize='16px'
                  color='#04113E'
                  {...register('address')}
                />
                {errors.address && <Field.ErrorText>{errors.address.message}</Field.ErrorText>}
              </Field.Root>
            </Grid>

            <VStack align='stretch' gap={3}>
              <Text
                fontSize='20px'
                fontWeight='700'
                color='#04113E'
                className='text-[20px] font-bold text-[#04113E]'
              >
                Thông tin bảo mật
              </Text>
              <Text fontSize='14px' color='#6B7280' className='text-sm text-[#6B7280]'>
                Những thông tin dưới đây mang tính bảo mật. Chỉ bạn mới có thể thấy và chỉnh sửa
                những thông tin này.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <Field.Root invalid={!!errors.email}>
                <Field.Label color='#04113E'>Email</Field.Label>
                <Input
                  placeholder='Nhập email'
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={3}
                  fontSize='16px'
                  color='#04113E'
                  {...register('email')}
                />
                {errors.email && <Field.ErrorText>{errors.email.message}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.dob} w='100%'>
                <Field.Label color='#04113E'>Ngày sinh</Field.Label>
                <Controller
                  control={control}
                  name='dob'
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : null}
                      onChange={date => {
                        const dateStr = date ? date.toISOString().split('T')[0] : ''
                        field.onChange(dateStr)
                      }}
                      containerProps={{
                        display: 'flex',
                        width: '100%'
                      }}
                      inputProps={{
                        width: '100%'
                      }}
                      placeholder='Chọn ngày sinh'
                      isInvalid={!!errors.dob}
                      {...(errors.dob?.message && { errorMessage: errors.dob.message })}
                      maxDate={new Date()}
                      name='dob-input'
                    />
                  )}
                />
                {errors.dob && <Field.ErrorText>{errors.dob.message}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.cid}>
                <Field.Label color='#04113E'>CCCD / Hộ chiếu</Field.Label>
                <Input
                  placeholder='Nhập số CCCD / Hộ chiếu'
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={3}
                  fontSize='16px'
                  color='#04113E'
                  {...register('cid')}
                />
                {errors.cid && <Field.ErrorText>{errors.cid.message}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.doi}>
                <Field.Label color='#04113E'>Ngày cấp</Field.Label>
                <Controller
                  control={control}
                  name='doi'
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : null}
                      onChange={date => {
                        const dateStr = date ? date.toISOString().split('T')[0] : ''
                        field.onChange(dateStr)
                      }}
                      containerProps={{
                        display: 'flex',
                        flex: 1,
                        width: '100%'
                      }}
                      inputProps={{
                        width: '100%'
                      }}
                      placeholder='Chọn ngày cấp'
                      isInvalid={!!errors.doi}
                      {...(errors.doi?.message && { errorMessage: errors.doi.message })}
                      maxDate={new Date()}
                      name='doi-input'
                    />
                  )}
                />
                {errors.doi && <Field.ErrorText>{errors.doi.message}</Field.ErrorText>}
              </Field.Root>
            </Grid>

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
        </Grid>
      </form>
    </Card.Root>
  )
}
