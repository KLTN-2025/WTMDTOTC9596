import {
  Box,
  Button,
  Field,
  Flex,
  HStack,
  Image,
  Input,
  Link,
  Separator,
  Text,
  VStack
} from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router'
import { FaFacebook, FaGoogle } from 'react-icons/fa'
import { PasswordInput } from '@/components/ui/password-input'
import { toaster } from '@/components/ui/toaster'
import { login } from '@/api/auth'
import logo from '@/assets/images/logo.png'
import banner from '@/assets/images/banner.png'
import { SellCarSection } from '@/components/common/SellCarSection.tsx'

interface LoginFormData {
  phone: string
  password: string
}

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { data: authData, error } = await login(data)

      if (error) {
        toaster.create({
          title: 'Đăng nhập thất bại',
          description: error.message || 'Số điện thoại hoặc mật khẩu không đúng',
          type: 'error'
        })
        return
      }

      if (authData?.user) {
        toaster.create({
          title: 'Đăng nhập thành công',
          description: 'Chào mừng bạn quay trở lại',
          type: 'success'
        })
        const from = (location.state as { from?: Location })?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (error) {
      toaster.create({
        title: 'Lỗi đăng nhập',
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
        {/* Login Section */}
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
          {/* Left side - Branding */}
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

          {/* Right side - Login Form */}
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
                Đăng nhập
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
                      {...register('phone', {
                        required: 'Số điện thoại là bắt buộc',
                        pattern: {
                          value: /^[0-9]{10,11}$/,
                          message: 'Số điện thoại không hợp lệ'
                        }
                      })}
                    />
                    {errors.phone && <Field.ErrorText>{errors.phone.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.password}>
                    <PasswordInput
                      placeholder='Mật khẩu...'
                      bg='#F5F5F5'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={2}
                      fontSize='md'
                      color='#737373'
                      {...register('password', {
                        required: 'Mật khẩu là bắt buộc',
                        minLength: {
                          value: 6,
                          message: 'Mật khẩu phải có ít nhất 6 ký tự'
                        }
                      })}
                    />
                    {errors.password && (
                      <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Link asChild>
                    <RouterLink to='/forgot-password'>
                      <Text
                        fontSize='sm'
                        color='#A1A1A1'
                        textAlign='right'
                        _hover={{ textDecoration: 'underline' }}
                      >
                        Quên mật khẩu
                      </Text>
                    </RouterLink>
                  </Link>

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
                    Đăng nhập
                  </Button>
                </VStack>
              </form>

              <VStack gap={3} mt={2}>
                <HStack w='full' gap={6} align='center' justify='space-between'>
                  <Separator variant='dashed' w='full' />
                  <Text fontSize='xs' color='#A1A1A1' flex={1} textWrap='nowrap'>
                    Hoặc đăng nhập bằng
                  </Text>
                  <Separator variant='dashed' w='full' />
                </HStack>

                <HStack w='full' justify='center' gap={16} py={3}>
                  <Box
                    as='button'
                    cursor='pointer'
                    _hover={{ opacity: 0.8 }}
                    aria-label='Login with Facebook'
                  >
                    <FaFacebook size={28} color='#1778F2' />
                  </Box>
                  <Box
                    as='button'
                    cursor='pointer'
                    _hover={{ opacity: 0.8 }}
                    aria-label='Login with Google'
                  >
                    <FaGoogle size={28} />
                  </Box>
                </HStack>

                <Link asChild>
                  <RouterLink to='/register'>
                    <Text
                      fontSize='sm'
                      color='#204ED3'
                      textAlign='center'
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Bạn chưa có tài khoản? Đăng ký tài khoản
                    </Text>
                  </RouterLink>
                </Link>
              </VStack>
            </VStack>
          </Box>

          {/* Background Image */}
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
        {/* Banner Section */}
        <Box width='full' height='150px' bg='gray.200' borderRadius='6px' overflow='hidden'>
          <Image src={banner} alt='Banner' width='100%' height='100%' objectFit='cover' />
        </Box>
      </VStack>
    </Box>
  )
}
