import {
  Box,
  Button,
  Checkbox,
  Field,
  Flex,
  Image,
  Input,
  Link,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router'
import { PasswordInput } from '@/components/ui/password-input'
import { toaster } from '@/components/ui/toaster'
import { register } from '@/api/auth'
import logo from '@/assets/images/logo.png'
import banner from '@/assets/images/banner.png'
import { SellCarSection } from '@/components/common/SellCarSection.tsx'

interface RegisterFormData {
  fullName: string
  phone: string
  password: string
  agreeToTerms: boolean
}

export function Register() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    control
  } = useForm<RegisterFormData>({
    defaultValues: {
      agreeToTerms: false
    }
  })

  const onSubmit = async (formData: RegisterFormData) => {
    setIsLoading(true)
    try {
      const { data: authData, error } = await register(formData)

      if (error) {
        toaster.create({
          title: 'Đăng ký thất bại',
          description: error.message || 'Đã xảy ra lỗi khi đăng ký',
          type: 'error'
        })
        return
      }

      if (authData?.user) {
        toaster.create({
          title: 'Đăng ký thành công',
          description: 'Tài khoản của bạn đã được tạo thành công',
          type: 'success'
        })
        navigate('/login')
      }
    } catch (error) {
      toaster.create({
        title: 'Lỗi đăng ký',
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
          maxW='1200px'
          mx='auto'
          px={4}
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

          {/* Right side - Register Form */}
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
                Đăng ký tài khoản
              </Text>

              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack align='stretch' gap={4}>
                  <Field.Root invalid={!!errors.fullName}>
                    <Input
                      placeholder='Họ và tên...'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={2}
                      fontSize='md'
                      color='#737373'
                      {...registerField('fullName', {
                        required: 'Họ và tên là bắt buộc',
                        minLength: {
                          value: 2,
                          message: 'Họ và tên phải có ít nhất 2 ký tự'
                        }
                      })}
                    />
                    {errors.fullName && (
                      <Field.ErrorText>{errors.fullName.message}</Field.ErrorText>
                    )}
                  </Field.Root>

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
                      {...registerField('phone', {
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
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      px={4}
                      py={2}
                      fontSize='md'
                      color='#737373'
                      {...registerField('password', {
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

                  <Field.Root invalid={!!errors.agreeToTerms}>
                    <Stack direction='row' gap={2} align='flex-start'>
                      <Controller
                        control={control}
                        name='agreeToTerms'
                        rules={{
                          required: 'Bạn phải đồng ý với các điều khoản'
                        }}
                        render={({ field }) => (
                          <Checkbox.Root
                            checked={field.value}
                            onCheckedChange={e => field.onChange(!!e.checked)}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control
                              borderRadius='4px'
                              bg={field.value ? '#204ED3' : '#D9D9D9'}
                              borderColor={field.value ? '#204ED3' : '#D9D9D9'}
                            />
                          </Checkbox.Root>
                        )}
                      />
                      <Text fontSize='sm' color='#737373' flex={1}>
                        Bằng việc đăng ký tài khoản, bạn đồng ý với chúng tôi về{' '}
                        <Link asChild>
                          <RouterLink to='/terms' color='#204ED3'>
                            Quy chế hoạt động
                          </RouterLink>
                        </Link>{' '}
                        và{' '}
                        <Link asChild>
                          <RouterLink to='/policy' color='#204ED3'>
                            Quy định chính sách
                          </RouterLink>
                        </Link>
                        .
                      </Text>
                    </Stack>
                    {errors.agreeToTerms && (
                      <Field.ErrorText>{errors.agreeToTerms.message}</Field.ErrorText>
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
                    Đăng ký
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
                    Bạn đã có tài khoản? Đăng nhập ngay
                  </Text>
                </RouterLink>
              </Link>
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
