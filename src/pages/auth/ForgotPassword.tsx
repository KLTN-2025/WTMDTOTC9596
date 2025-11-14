import { Box, Button, Field, Flex, Image, Input, Link, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toaster } from '@/components/ui/toaster'
import { resetPassword } from '@/api/auth'
import { PasswordInput } from '@/components/ui/password-input'
import logo from '@/assets/images/logo.png'
import banner from '@/assets/images/banner.png'
import { SellCarSection } from '@/components/common/SellCarSection.tsx'

const forgotPasswordSchema = z
  .object({
    phone: z
      .string()
      .min(1, 'Số điện thoại là bắt buộc')
      .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPassword() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const { error } = await resetPassword(data.phone, data.password)

      if (error) {
        toaster.create({
          title: 'Đặt lại mật khẩu thất bại',
          description: error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu',
          type: 'error'
        })
        return
      }

      toaster.create({
        title: 'Đặt lại mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.',
        type: 'success'
      })

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      toaster.create({
        title: 'Lỗi đặt lại mật khẩu',
        description: 'Đã xảy ra lỗi, vui lòng thử lại',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box bg='#F8FAFC' minH='calc(100vh - 200px)' py={4}>
      <VStack maxW='1200px' mx='auto' px={4} gap={6} align='stretch'>
        <Flex
          justify='space-between'
          gap={8}
          align='flex-start'
          bg='#204ED3'
          borderRadius='16px'
          p={12}
          position='relative'
          minH='538px'
        >
          <VStack align='flex-start' gap={8} flex={1} position='relative' zIndex={2}>
            <Image src={logo} alt='Logo' height='64px' objectFit='contain' />
            <VStack align='flex-start' gap={6}>
              <Text fontSize='2xl' fontWeight='400' color='white' fontFamily='Dela Gothic One'>
                Nền tảng mua bán xe trực tuyến hàng đầu Việt Nam
              </Text>
              <Text
                fontSize='80px'
                fontWeight='400'
                color='white'
                fontFamily='Dela Gothic One'
                lineHeight='1.2'
              >
                Việt Nam
              </Text>
            </VStack>
          </VStack>

          <Box
            flex={1}
            maxW='407px'
            bg='white'
            borderRadius='12px'
            p={6}
            position='relative'
            zIndex={2}
          >
            <VStack align='stretch' gap={5}>
              <Text fontSize='xl' fontWeight='700' color='#04113E' mb={2}>
                Quên mật khẩu
              </Text>

              <Text fontSize='sm' color='#737373' mb={2}>
                Nhập số điện thoại và mật khẩu mới để đặt lại mật khẩu
              </Text>

              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack align='stretch' gap={4}>
                  <Field.Root invalid={!!errors.phone}>
                    <Input
                      placeholder='Số điện thoại...'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={2}
                      fontSize='md'
                      color='#737373'
                      {...register('phone')}
                    />
                    {errors.phone && <Field.ErrorText>{errors.phone.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.password}>
                    <PasswordInput
                      placeholder='Mật khẩu mới...'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={2}
                      fontSize='md'
                      color='#737373'
                      {...register('password')}
                    />
                    {errors.password && (
                      <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.confirmPassword}>
                    <PasswordInput
                      placeholder='Xác nhận mật khẩu...'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={2}
                      fontSize='md'
                      color='#737373'
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <Field.ErrorText>{errors.confirmPassword.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Button
                    type='submit'
                    w='full'
                    bg='#204ED3'
                    color='white'
                    borderRadius='6px'
                    py={3}
                    fontWeight='600'
                    fontSize='sm'
                    _hover={{ bg: '#1a3fb0' }}
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Đặt lại mật khẩu
                  </Button>
                </VStack>
              </form>

              <Link asChild>
                <RouterLink to='/login'>
                  <Text
                    fontSize='sm'
                    color='#204ED3'
                    textAlign='center'
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Quay lại đăng nhập
                  </Text>
                </RouterLink>
              </Link>
            </VStack>
          </Box>

          <Box
            position='absolute'
            right='47.87px'
            bottom='25px'
            width='346px'
            height='181px'
            bg='gray.200'
            borderRadius='8px'
            zIndex={1}
            opacity={0.1}
          />
        </Flex>

        <SellCarSection />
        <Box width='full' height='150px' bg='gray.200' borderRadius='6px' overflow='hidden'>
          <Image src={banner} alt='Banner' width='100%' height='100%' objectFit='cover' />
        </Box>
      </VStack>
    </Box>
  )
}
