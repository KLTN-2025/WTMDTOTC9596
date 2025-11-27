import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Input,
  InputGroup,
  Link,
  Separator,
  Text,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import logo from '@/assets/images/logo.png'
export function Footer() {
  return (
    <Box bg='#204ED3' color='white' pt={12} pb={6}>
      <Container maxW='1200px' px={{ base: 4, lg: 6 }}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={16} mb={8} justify='space-between'>
          <VStack align='flex-start' gap={4} flex={1}>
            <Image src={logo} alt='Logo' height='28px' objectFit='contain' />
            <Text fontSize='md' maxW='300px'>
              Nền tảng xe toàn diện cho mọi người lớn nhất Việt Nam.
            </Text>
          </VStack>

          <VStack align='flex-start' gap={4} flex={1}>
            <Text fontWeight='700' fontSize='md'>
              Tổng đài hỗ trợ
            </Text>
            <VStack align='flex-start' gap={2}>
              <Link href='tel:0877999888' color='white'>
                <Text fontWeight='500'>0877 999 888</Text>
                <Text fontWeight='300' fontSize='sm'>
                  (Kinh doanh)
                </Text>
              </Link>
              <Link href='mailto:hotro@carpla.vn' color='white'>
                <Text fontWeight='500'>hotro@carpla.vn</Text>
              </Link>
            </VStack>
          </VStack>

          <VStack align='flex-start' gap={4} flex={1}>
            <Text fontWeight='700' fontSize='md'>
              Dịch vụ khách hàng
            </Text>
            <VStack align='flex-start' gap={2}>
              <Link color='white' asChild>
                <RouterLink to='/buy'>Mua xe</RouterLink>
              </Link>
              <Link color='white' asChild>
                <RouterLink to='/used-cars'>Xe cũ</RouterLink>
              </Link>
              <Link color='white' asChild>
                <RouterLink to='/new-cars'>Xe mới</RouterLink>
              </Link>
              <Link color='white' asChild>
                <RouterLink to='/stores'>Cửa hàng xe cũ</RouterLink>
              </Link>
            </VStack>
          </VStack>

          <VStack align='flex-start' gap={4} flex={1}>
            <Text fontWeight='700' fontSize='md'>
              Giới thiệu
            </Text>
            <VStack align='flex-start' gap={2}>
              <Link color='white' asChild>
                <RouterLink to='/terms'>Quy chế hoạt động</RouterLink>
              </Link>
              <Link color='white' asChild>
                <RouterLink to='/policy'>Quy định chính sách</RouterLink>
              </Link>
              <Link color='white' asChild>
                <RouterLink to='/legal'>Điều khoản hoạt động</RouterLink>
              </Link>
            </VStack>
          </VStack>
        </Flex>

        <Separator mb={8} />

        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={5}
          align='center'
          justify='space-between'
        >
          <Text fontWeight='700' fontSize='md' textAlign={{ base: 'center', lg: 'left' }}>
            Đăng ký nhận tin tức từ chúng tôi
          </Text>
          <HStack flex={1} maxW='560px'>
            <InputGroup flex={1}>
              <Input
                placeholder='Nhập email của bạn'
                bg='white'
                color='#04113E'
                borderColor='white'
                borderRadius='6px 0 0 6px'
                _focus={{ borderColor: 'white' }}
              />
            </InputGroup>
            <Button
              bg='#04113E'
              color='white'
              borderColor='#04113E'
              borderRadius='0 6px 6px 0'
              px={5}
              py={3}
              fontWeight='700'
            >
              Gửi ngay
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
