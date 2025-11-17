import { Button, Card, Field, Flex, Grid, Input, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/useToast'
import { updateProfile, type UpdateProfileData } from '@/api/profile'
import { useAuth } from '@/hooks/useAuth'
import { DatePicker } from '@/components/ui/date-picker'
import { useAppDispatch } from '@/stores/hooks'
import { fetchUserData } from '@/stores/auth/authSlice'

const personalSchema = z.object({
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
  const [joinDate, setJoinDate] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema)
  })

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        email: profile.email || user?.email || '',
        dob: profile.dob || '',
        cid: profile.cid || '',
        doi: profile.doi || ''
      })
      setJoinDate(profile.joinDate)
    }
  }, [profile, reset, user])

  const onSubmit = async (formData: PersonalFormData) => {
    setIsSaving(true)
    try {
      const updateData = {
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
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
          email: data.email || user?.email || '',
          dob: data.dob || '',
          cid: data.cid || '',
          doi: data.doi || ''
        })
        setJoinDate(data.joinDate)
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

  const formattedJoinDate = useMemo(() => {
    if (!joinDate) return ''
    const date = new Date(joinDate)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('vi-VN')
  }, [joinDate])

  if (authLoading) {
    return (
      <Card.Root bg='white' borderRadius='16px' p={{ base: 5, md: 8 }} className='rounded-2xl'>
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
              <Field.Label>Họ và tên</Field.Label>
              <Input
                placeholder='Nhập họ và tên'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('fullName')}
              />
              {errors.fullName && <Field.ErrorText>{errors.fullName.message}</Field.ErrorText>}
            </Field.Root>

            <Field.Root>
              <Field.Label>Số điện thoại</Field.Label>
              <Input
                placeholder='Chưa cập nhật'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                disabled
                {...register('phone')}
              />
              <Field.HelperText>Số điện thoại được quản lý bởi hệ thống</Field.HelperText>
            </Field.Root>

            <Field.Root invalid={!!errors.address}>
              <Field.Label>Địa chỉ</Field.Label>
              <Input
                placeholder='Nhập địa chỉ'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('address')}
              />
              {errors.address && <Field.ErrorText>{errors.address.message}</Field.ErrorText>}
            </Field.Root>

            <Field.Root>
              <Field.Label>Ngày tham gia</Field.Label>
              <Input
                value={formattedJoinDate}
                readOnly
                bg='gray.50'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
              />
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
              Những thông tin dưới đây mang tính bảo mật. Chỉ bạn mới có thể thấy và chỉnh sửa những
              thông tin này.
            </Text>
          </VStack>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <Field.Root invalid={!!errors.email}>
              <Field.Label>Email</Field.Label>
              <Input
                placeholder='Nhập email'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('email')}
              />
              {errors.email && <Field.ErrorText>{errors.email.message}</Field.ErrorText>}
            </Field.Root>

            <Field.Root invalid={!!errors.dob} w='100%'>
              <Field.Label>Ngày sinh</Field.Label>
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
              <Field.Label>CCCD / Hộ chiếu</Field.Label>
              <Input
                placeholder='Nhập số CCCD / Hộ chiếu'
                bg='white'
                borderColor='#E5E5E5'
                borderRadius='8px'
                px={4}
                py={3}
                fontSize='16px'
                color='#737373'
                {...register('cid')}
              />
              {errors.cid && <Field.ErrorText>{errors.cid.message}</Field.ErrorText>}
            </Field.Root>

            <Field.Root invalid={!!errors.doi}>
              <Field.Label>Ngày cấp</Field.Label>
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
      </form>
    </Card.Root>
  )
}
