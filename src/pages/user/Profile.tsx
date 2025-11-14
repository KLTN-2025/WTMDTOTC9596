import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Text,
  VStack
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toaster } from '@/components/ui/toaster'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { DatePicker } from '@/components/ui/date-picker'
import { HiOutlineCamera } from 'react-icons/hi2'
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  extractAvatarPath
} from '@/api/profile'
import { useAuth } from '@/hooks/useAuth'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  address: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  cid: z.string().optional().or(z.literal('')),
  doi: z.string().optional().or(z.literal(''))
})

type ProfileFormData = z.infer<typeof profileSchema>

export function Profile() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [joinDate, setJoinDate] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })
  const fullName = watch('fullName')

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getProfile(user)

        if (error) {
          toaster.create({
            title: 'Lỗi tải thông tin',
            description: error.message || 'Không thể tải thông tin người dùng',
            type: 'error'
          })
          return
        }

        if (data) {
          reset({
            fullName: data.fullName || '',
            phone: data.phone || '',
            address: data.address || '',
            dob: data.dob || '',
            cid: data.cid || '',
            doi: data.doi || ''
          })
          setJoinDate(data.joinDate)
          setAvatarUrl(data.avatarUrl)
        }
      } catch (error) {
        toaster.create({
          title: 'Lỗi tải thông tin',
          description: 'Đã xảy ra lỗi khi tải thông tin người dùng',
          type: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const updateData: {
        fullName: string
        address?: string
        dob?: string
        cid?: string
        doi?: string
      } = {
        fullName: data.fullName
      }
      if (data.address) {
        updateData.address = data.address
      }
      if (data.dob) {
        updateData.dob = data.dob
      }
      if (data.cid) {
        updateData.cid = data.cid
      }
      if (data.doi) {
        updateData.doi = data.doi
      }

      const { data: updatedProfile, error } = await updateProfile(updateData, user)

      if (error) {
        toaster.create({
          title: 'Cập nhật thất bại',
          description: error.message || 'Đã xảy ra lỗi khi cập nhật',
          type: 'error'
        })
        return
      }

      if (updatedProfile) {
        reset({
          fullName: updatedProfile.fullName || '',
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || '',
          dob: updatedProfile.dob || '',
          cid: updatedProfile.cid || '',
          doi: updatedProfile.doi || ''
        })
        setAvatarUrl(updatedProfile.avatarUrl)
      }

      toaster.create({
        title: 'Cập nhật thành công',
        description: 'Thông tin của bạn đã được cập nhật',
        type: 'success'
      })
    } catch (error) {
      toaster.create({
        title: 'Lỗi cập nhật',
        description: 'Đã xảy ra lỗi, vui lòng thử lại',
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Box bg='#F8FAFC' minH='calc(100vh - 200px)' py={8}>
        <Flex maxW='1200px' mx='auto' px={4} justify='center'>
          <Text>Đang tải...</Text>
        </Flex>
      </Box>
    )
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toaster.create({
        title: 'Lỗi',
        description: 'Vui lòng chọn file ảnh',
        type: 'error'
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toaster.create({
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 5MB',
        type: 'error'
      })
      return
    }

    setIsUploadingAvatar(true)
    try {
      if (avatarUrl) {
        const oldAvatarPath = extractAvatarPath(avatarUrl)
        if (oldAvatarPath) {
          await deleteAvatar(avatarUrl, user)
        }
      }

      const { data, error } = await uploadAvatar(file, user)

      if (error) {
        toaster.create({
          title: 'Lỗi upload',
          description: error.message || 'Không thể upload ảnh đại diện',
          type: 'error'
        })
        return
      }

      if (data) {
        const { error: updateError } = await updateProfile(
          {
            avatarUrl: data.url
          },
          user
        )

        if (updateError) {
          toaster.create({
            title: 'Lỗi',
            description: updateError.message || 'Không thể cập nhật ảnh đại diện',
            type: 'error'
          })
        } else {
          setAvatarUrl(data.url)
          toaster.create({
            title: 'Thành công',
            description: 'Ảnh đại diện đã được cập nhật',
            type: 'success'
          })
        }
      }
    } catch (error) {
      toaster.create({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi khi upload ảnh',
        type: 'error'
      })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize='xl' fontWeight='700' color='#04113E'>
          Hồ sơ
        </Text>
        <Text fontSize='sm' color='#737373' mt={1}>
          Quản lý thông tin cá nhân của bạn
        </Text>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack align='stretch' gap={6}>
            <Box>
              <Text fontSize='md' fontWeight='600' color='#04113E' mb={4}>
                Ảnh đại diện
              </Text>
              <Flex align='center' gap={4}>
                <Box position='relative'>
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt='Avatar'
                      width='120px'
                      height='120px'
                      borderRadius='full'
                      objectFit='cover'
                      bg='gray.100'
                    />
                  ) : (
                    <Box
                      width='120px'
                      height='120px'
                      borderRadius='full'
                      bg='gray.100'
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      color='gray.400'
                      fontSize='2xl'
                      fontWeight='bold'
                    >
                      {fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </Box>
                  )}
                  <IconButton
                    position='absolute'
                    bottom={0}
                    right={0}
                    aria-label='Upload avatar'
                    bg='#204ED3'
                    color='white'
                    borderRadius='full'
                    size='sm'
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    _hover={{ bg: '#1a3fb0' }}
                  >
                    <Icon size='md'>
                      <HiOutlineCamera />
                    </Icon>
                  </IconButton>
                </Box>
                <VStack align='flex-start' gap={1} flex={1}>
                  <Text fontSize='sm' fontWeight='500' color='#04113E'>
                    Ảnh đại diện
                  </Text>
                  <Text fontSize='xs' color='#737373'>
                    JPG, PNG hoặc WEBP. Tối đa 5MB
                  </Text>
                  {isUploadingAvatar && (
                    <Text fontSize='xs' color='#204ED3'>
                      Đang tải lên...
                    </Text>
                  )}
                </VStack>
                <Input
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/jpg,image/png,image/webp'
                  display='none'
                  onChange={handleAvatarChange}
                />
              </Flex>
            </Box>
            <Box>
              <Text fontSize='md' fontWeight='600' color='#04113E' mb={4}>
                Thông tin cơ bản
              </Text>
              <VStack align='stretch' gap={4}>
                <Field.Root invalid={!!errors.fullName}>
                  <Field.Label>Họ và tên</Field.Label>
                  <Input
                    placeholder='Nhập họ và tên...'
                    bg='white'
                    borderColor='#E5E5E5'
                    borderRadius='8px'
                    px={4}
                    py={2}
                    fontSize='md'
                    color='#737373'
                    {...register('fullName')}
                  />
                  {errors.fullName && <Field.ErrorText>{errors.fullName.message}</Field.ErrorText>}
                </Field.Root>

                <Field.Root invalid={!!errors.phone}>
                  <Field.Label>Số điện thoại</Field.Label>
                  <Input
                    placeholder='Nhập số điện thoại...'
                    bg='white'
                    borderColor='#E5E5E5'
                    borderRadius='8px'
                    px={4}
                    py={2}
                    fontSize='md'
                    color='#737373'
                    disabled
                    {...register('phone')}
                  />
                  {errors.phone && <Field.ErrorText>{errors.phone.message}</Field.ErrorText>}
                  <Field.HelperText>Số điện thoại không thể thay đổi</Field.HelperText>
                </Field.Root>

                <Field.Root invalid={!!errors.address}>
                  <Field.Label>Địa chỉ</Field.Label>
                  <Input
                    placeholder='Nhập địa chỉ...'
                    bg='white'
                    borderColor='#E5E5E5'
                    borderRadius='8px'
                    px={4}
                    py={2}
                    fontSize='md'
                    color='#737373'
                    {...register('address')}
                  />
                  {errors.address && <Field.ErrorText>{errors.address.message}</Field.ErrorText>}
                </Field.Root>
              </VStack>
            </Box>

            <Box>
              <Text fontSize='md' fontWeight='600' color='#04113E' mb={4}>
                Thông tin căn cước công dân
              </Text>
              <VStack align='stretch' gap={4}>
                <Field.Root invalid={!!errors.dob}>
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
                  <Field.Label>Số CCCD/CMND</Field.Label>
                  <Input
                    placeholder='Nhập số CCCD/CMND...'
                    bg='white'
                    borderColor='#E5E5E5'
                    borderRadius='8px'
                    px={4}
                    py={2}
                    fontSize='md'
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
              </VStack>
            </Box>

            {joinDate && (
              <Box>
                <Text fontSize='md' fontWeight='600' color='#04113E' mb={4}>
                  Thông tin hệ thống
                </Text>
                <VStack align='stretch' gap={4}>
                  <Field.Root>
                    <Field.Label>Ngày tham gia</Field.Label>
                    <Input
                      value={new Date(joinDate).toLocaleDateString('vi-VN')}
                      bg='gray.50'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={2}
                      fontSize='md'
                      color='#737373'
                      disabled
                    />
                    <Field.HelperText>Ngày bạn đăng ký tài khoản</Field.HelperText>
                  </Field.Root>
                </VStack>
              </Box>
            )}

            <HStack justify='flex-end' gap={3} pt={4}>
              <Button
                type='submit'
                bg='#204ED3'
                color='white'
                borderRadius='6px'
                px={6}
                py={2}
                fontWeight='600'
                fontSize='sm'
                _hover={{ bg: '#1a3fb0' }}
                disabled={isSaving}
                loading={isSaving}
              >
                Lưu thay đổi
              </Button>
            </HStack>
          </VStack>
        </form>
      </Card.Body>
    </Card.Root>
  )
}
