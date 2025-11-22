import { Box, Button, Flex, HStack, Icon, Image, Menu, Portal, Text } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { FiLogOut, FiUser } from 'react-icons/fi'
import { logout } from '@/api/auth'
import { useToast } from '@/hooks/useToast'
import logo from '@/assets/images/logo.png'

export function AdminHeader() {
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = async () => {
    try {
      const { error } = await logout()
      if (error) {
        toast.error(error.message || 'Đã xảy ra lỗi khi đăng xuất', {
          title: 'Đăng xuất thất bại'
        })
        return
      }

      toast.success('Bạn đã đăng xuất khỏi tài khoản', {
        title: 'Đăng xuất thành công'
      })
      navigate('/')
    } catch (error) {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại', {
        title: 'Lỗi đăng xuất'
      })
    }
  }

  return (
    <Box bg='#204ED3' color='white' py={4} boxShadow='0px 2px 4px rgba(0, 0, 0, 0.1)'>
      <Flex maxW='100%' mx='auto' px={6} align='center' justify='space-between' gap={6}>
        <HStack gap={6}>
          <RouterLink to='/'>
            <Image src={logo} alt='Logo' height='28px' objectFit='contain' />
          </RouterLink>
          <Text fontSize='sm' fontWeight='700' textTransform='uppercase'>
            Trang quản trị
          </Text>
        </HStack>

        <HStack gap={4}>
          <Menu.Root positioning={{ placement: 'bottom-end' }}>
            <Menu.Trigger asChild>
              <Button
                variant='outline'
                colorPalette='blue'
                borderColor='white'
                color='white'
                size='sm'
                borderRadius='6px'
                px={5}
                py={3}
                display='flex'
                alignItems='center'
                gap={2}
              >
                <FiUser />
                Tài khoản
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW='200px'>
                  <Menu.Item value='home' onClick={() => navigate('/')}>
                    <Icon>
                      <FiUser />
                    </Icon>
                    Về trang chủ
                  </Menu.Item>
                  <Menu.Item value='logout' onClick={handleLogout}>
                    <Icon>
                      <FiLogOut />
                    </Icon>
                    Đăng xuất
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      </Flex>
    </Box>
  )
}
