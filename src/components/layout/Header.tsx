import { Box, Button, Flex, HStack, Icon, Image, Link, Menu, Portal, Text } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { FaUser } from 'react-icons/fa'
import { HiBars3, HiOutlineHeart, HiOutlineClipboardDocumentList } from 'react-icons/hi2'
import { IoCarSportOutline, IoStorefrontOutline } from 'react-icons/io5'
import { FiLogOut, FiShield, FiCalendar, FiUsers } from 'react-icons/fi'
import { logout } from '@/api/auth'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import logo from '@/assets/images/logo.png'
import { PATHS } from '@/configs/paths'
import { ProtectedComponent } from '../guards'
import { USER_ROLE } from '@/configs/constants'

export function Header() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated } = useAuth()

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
      navigate(PATHS.HOME)
    } catch (error) {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại', {
        title: 'Lỗi đăng xuất'
      })
    }
  }
  return (
    <>
      {/* Top Header */}
      <Box bg='#204ED3' color='white' py={4}>
        <Flex
          maxW='1200px'
          mx='auto'
          px={{ base: 4, lg: 6 }}
          align='center'
          justify='space-between'
          gap={6}
        >
          <HStack gap={6}>
            <RouterLink to={PATHS.HOME}>
              <Image src={logo} alt='Logo' height='28px' objectFit='contain' />
            </RouterLink>
          </HStack>
          <HStack gap={6}>
            <Text fontSize='sm' fontWeight='700' textTransform='uppercase'>
              Mua bán xe chính hãng, nhanh chóng và tin cậy
            </Text>
          </HStack>

          <HStack gap={4}>
            {!isAuthenticated ? (
              <RouterLink to={PATHS.LOGIN}>
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
                  <FaUser />
                  Đăng nhập
                </Button>
              </RouterLink>
            ) : (
              <>
                <RouterLink to={PATHS.SELL}>
                  <Button
                    colorPalette='blue'
                    variant='solid'
                    size='sm'
                    borderRadius='6px'
                    px={5}
                    py={3}
                    display='flex'
                    alignItems='center'
                    gap={2}
                  >
                    <Icon>
                      <IoCarSportOutline />
                    </Icon>
                    Bán xe
                  </Button>
                </RouterLink>
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
                      <FaUser />
                      Tài khoản
                    </Button>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content minW='200px'>
                        <ProtectedComponent roles={[USER_ROLE.SELLER, USER_ROLE.ADMIN]}>
                          <Menu.Item
                            value='manage-listings'
                            onClick={() => navigate(PATHS.USER.MANAGE_LISTINGS)}
                          >
                            <Icon>
                              <HiOutlineClipboardDocumentList />
                            </Icon>
                            Quản lý tin
                          </Menu.Item>
                        </ProtectedComponent>
                        <ProtectedComponent roles={[USER_ROLE.SELLER, USER_ROLE.ADMIN]}>
                          <Menu.Item
                            value='test-drives'
                            onClick={() => navigate(PATHS.TEST_DRIVES)}
                          >
                            <Icon>
                              <FiCalendar />
                            </Icon>
                            Quản lý lịch hẹn
                          </Menu.Item>
                        </ProtectedComponent>
                        <ProtectedComponent roles={[USER_ROLE.SELLER, USER_ROLE.ADMIN]}>
                          <Menu.Item
                            value='customer-contacts'
                            onClick={() => navigate(PATHS.CUSTOMER_CONTACTS)}
                          >
                            <Icon>
                              <FiUsers />
                            </Icon>
                            Danh sách khách hàng
                          </Menu.Item>
                        </ProtectedComponent>
                        <ProtectedComponent roles={[USER_ROLE.ADMIN]}>
                          <Menu.Item value='admin' onClick={() => navigate(PATHS.ADMIN.ROOT)}>
                            <Icon>
                              <FiShield />
                            </Icon>
                            Admin
                          </Menu.Item>
                        </ProtectedComponent>
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
              </>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Navigation Bar */}
      <Box bg='white' boxShadow='0px 4px 4px rgba(0, 0, 0, 0.25)' py={4}>
        <Flex
          maxW='1200px'
          mx='auto'
          px={{ base: 4, lg: 6 }}
          align='center'
          justify='space-between'
          gap={8}
        >
          {/* Danh mục Button */}
          <Menu.Root positioning={{ placement: 'bottom-start' }}>
            <Menu.Trigger asChild>
              <Button
                bg='#204ED3'
                color='white'
                borderRadius='6px'
                px={4}
                py={2}
                height='38px'
                gap={2}
                fontWeight='700'
                fontSize='sm'
                _hover={{ bg: '#1a3fb0' }}
              >
                <Icon size='md'>
                  <HiBars3 />
                </Icon>
                DANH MỤC
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW='260px' py={2} borderRadius='8px' boxShadow='lg'>
                  <Menu.Item
                    value='all-cars'
                    onClick={() => navigate(PATHS.PRODUCTS)}
                    py={3}
                    px={4}
                  >
                    <Icon size='lg' color='#204ED3'>
                      <IoCarSportOutline />
                    </Icon>
                    <Text fontSize='md' fontWeight='500'>
                      Tất cả các xe
                    </Text>
                  </Menu.Item>
                  <Menu.Item
                    value='used-cars'
                    onClick={() => navigate(PATHS.USED_CARS)}
                    py={3}
                    px={4}
                  >
                    <Icon size='lg' color='#204ED3'>
                      <IoCarSportOutline />
                    </Icon>
                    <Text fontSize='md' fontWeight='500'>
                      Xe cũ
                    </Text>
                  </Menu.Item>
                  <Menu.Item
                    value='new-cars'
                    onClick={() => navigate(`${PATHS.PRODUCTS}?status=new`)}
                    py={3}
                    px={4}
                  >
                    <Icon size='lg' color='#204ED3'>
                      <IoCarSportOutline />
                    </Icon>
                    <Text fontSize='md' fontWeight='500'>
                      Xe mới
                    </Text>
                  </Menu.Item>
                  <Menu.Item
                    value='sold-cars'
                    onClick={() => navigate(PATHS.SOLD_CARS)}
                    py={3}
                    px={4}
                  >
                    <Icon size='lg' color='#204ED3'>
                      <IoCarSportOutline />
                    </Icon>
                    <Text fontSize='md' fontWeight='500'>
                      Xe đã bán
                    </Text>
                  </Menu.Item>
                  <Menu.Item value='stores' onClick={() => navigate(PATHS.STORES)} py={3} px={4}>
                    <Icon size='lg' color='#204ED3'>
                      <IoStorefrontOutline />
                    </Icon>
                    <Text fontSize='md' fontWeight='500'>
                      Cửa hàng
                    </Text>
                  </Menu.Item>
                  <Menu.Item
                    value='favorites'
                    onClick={() => navigate(PATHS.FAVORITES)}
                    py={3}
                    px={4}
                  >
                    <Icon size='lg' color='#204ED3'>
                      <HiOutlineHeart />
                    </Icon>
                    <Text fontSize='md' fontWeight='500'>
                      Yêu thích
                    </Text>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          {/* Navigation Links */}
          <HStack gap={2}>
            <Link
              borderRadius='6px'
              px={2}
              py={2}
              display='flex'
              alignItems='center'
              gap={2}
              _hover={{ bg: 'gray.50' }}
              color='#04113E'
              fontWeight='700'
              fontSize='sm'
              asChild
            >
              <RouterLink to={PATHS.USED_CARS}>
                <Icon size='md'>
                  <IoCarSportOutline />
                </Icon>
                Xe cũ
              </RouterLink>
            </Link>

            <Link
              borderRadius='6px'
              px={2}
              py={2}
              display='flex'
              alignItems='center'
              gap={2}
              _hover={{ bg: 'gray.50' }}
              color='#04113E'
              fontWeight='700'
              fontSize='sm'
              asChild
            >
              <RouterLink to={PATHS.SOLD_CARS}>
                <Icon size='md'>
                  <IoCarSportOutline />
                </Icon>
                Xe đã bán
              </RouterLink>
            </Link>

            <Link
              borderRadius='6px'
              px={2}
              py={2}
              display='flex'
              alignItems='center'
              gap={2}
              _hover={{ bg: 'gray.50' }}
              color='#04113E'
              fontWeight='700'
              fontSize='sm'
              border='1px solid'
              borderColor='transparent'
              asChild
            >
              <RouterLink to={PATHS.STORES}>
                <Icon size='md'>
                  <IoStorefrontOutline />
                </Icon>
                Cửa hàng
              </RouterLink>
            </Link>

            <Link
              borderRadius='6px'
              px={2}
              py={2}
              display='flex'
              alignItems='center'
              gap={2}
              _hover={{ bg: 'gray.50' }}
              color='#04113E'
              fontWeight='700'
              fontSize='sm'
              asChild
            >
              <RouterLink to={PATHS.FAVORITES}>
                <Icon size='md'>
                  <HiOutlineHeart />
                </Icon>
                Yêu thích
              </RouterLink>
            </Link>
          </HStack>
        </Flex>
      </Box>
    </>
  )
}
