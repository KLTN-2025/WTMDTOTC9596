import { Box, Button, Flex, HStack, Icon, Image, Link, Menu, Portal, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { FaUser } from 'react-icons/fa'
import { HiBars3, HiOutlineHeart } from 'react-icons/hi2'
import { IoCarSportOutline, IoStorefrontOutline } from 'react-icons/io5'
import { FiSettings, FiLogOut } from 'react-icons/fi'
import { supabase } from '@/configs/supabase'
import { logout } from '@/api/auth'
import { toaster } from '@/components/ui/toaster'
import logo from '@/assets/images/logo.png'

export function Header() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }

    checkSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await logout()
      if (error) {
        toaster.create({
          title: 'Đăng xuất thất bại',
          description: error.message || 'Đã xảy ra lỗi khi đăng xuất',
          type: 'error'
        })
        return
      }

      toaster.create({
        title: 'Đăng xuất thành công',
        description: 'Bạn đã đăng xuất khỏi tài khoản',
        type: 'success'
      })
      navigate('/')
    } catch (error) {
      toaster.create({
        title: 'Lỗi đăng xuất',
        description: 'Đã xảy ra lỗi, vui lòng thử lại',
        type: 'error'
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
            <RouterLink to='/'>
              <Image src={logo} alt='Logo' height='28px' objectFit='contain' />
            </RouterLink>
          </HStack>
          <HStack gap={6}>
            <Text fontSize='sm' fontWeight='700' textTransform='uppercase'>
              Mua bán xe chính hãng, nhanh chóng và tin cậy
            </Text>
          </HStack>

          <HStack gap={4}>
            {!isLoggedIn ? (
              <RouterLink to='/login'>
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
                <RouterLink to='/sell'>
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
                        <Menu.Item value='settings' onClick={() => navigate('/settings/profile')}>
                          <Icon>
                            <FiSettings />
                          </Icon>
                          Settings
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
              <RouterLink to='/used-cars'>
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
              <RouterLink to='/sold-cars'>
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
              <RouterLink to='/stores'>
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
              <RouterLink to='/favorites'>
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
