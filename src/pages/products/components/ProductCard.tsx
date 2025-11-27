import { Badge, Box, Button, Card, Flex, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router'
import { HiOutlineSearch } from 'react-icons/hi'
import { FaCar, FaGasPump, FaCog } from 'react-icons/fa'
import type { Product } from '@/types/products'
import { formatTimeAgo } from '@/utils/date'
import { PATHS } from '@/configs/paths'
import { DEFAULT_VALUES } from '@/configs/constants'
import { getFirstImage } from '@/utils/media'

type ProductCardProps = {
  product: Product
  showActions?: boolean
  showSoldBadge?: boolean
}

export function ProductCard({
  product,
  showActions = false,
  showSoldBadge = false
}: ProductCardProps) {
  const navigate = useNavigate()
  const firstImage = getFirstImage(product.mediaUrls)

  return (
    <Card.Root
      bg='white'
      borderRadius='16px'
      overflow='hidden'
      display='flex'
      flexDirection='row'
      cursor='pointer'
      _hover={{ boxShadow: 'lg' }}
      mb={4}
      minH='200px'
      onClick={() => navigate(PATHS.PRODUCT_DETAIL(product.id))}
    >
      <Box width='40%' flex='0 0 40%' position='relative' flexShrink={0} minH='200px' maxH='300px'>
        {firstImage && (
          <Image
            src={firstImage}
            alt={product.title}
            width='100%'
            height='100%'
            objectFit='cover'
            minH='200px'
          />
        )}
        <Badge
          position='absolute'
          top={3}
          left={3}
          bg='rgba(0,0,0,0.5)'
          color='white'
          borderRadius='100px'
          px={3}
          py={1}
          gap={1}
          display='flex'
          alignItems='center'
          fontSize='xs'
        >
          <Icon size='xs'>
            <HiOutlineSearch />
          </Icon>
          {product.imageCount}
        </Badge>
        {showSoldBadge && (
          <Badge
            position='absolute'
            top={3}
            right={3}
            bg='#EF4444'
            color='white'
            borderRadius='100px'
            px={3}
            py={1}
            fontSize='xs'
            fontWeight='700'
          >
            ĐÃ BÁN
          </Badge>
        )}
      </Box>

      <Card.Body
        p={4}
        width='60%'
        flex='0 0 60%'
        flexShrink={0}
        display='flex'
        flexDirection='column'
        justifyContent='space-between'
      >
        <VStack align='stretch' gap={2} flex={1}>
          <Text
            fontSize='16px'
            fontWeight='700'
            color='#04113E'
            textTransform='uppercase'
            lineHeight='1.4'
            css={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.title}
          </Text>

          <HStack gap={3} wrap='wrap' fontSize='12px'>
            <HStack gap={1}>
              <Icon size='xs' color='#A1A1A1'>
                <FaCar />
              </Icon>
              <Text fontSize='12px' color='#A1A1A1'>
                {product.bodyStyles?.name || DEFAULT_VALUES.NOT_AVAILABLE}
              </Text>
            </HStack>
            <HStack gap={1}>
              <Icon size='xs' color='#A1A1A1'>
                <FaGasPump />
              </Icon>
              <Text fontSize='12px' color='#A1A1A1'>
                {product.fuels?.name || DEFAULT_VALUES.NOT_AVAILABLE}
              </Text>
            </HStack>
            <HStack gap={1}>
              <Icon size='xs' color='#A1A1A1'>
                <FaCog />
              </Icon>
              <Text fontSize='12px' color='#A1A1A1'>
                {product.transmissions?.name || DEFAULT_VALUES.NOT_AVAILABLE}
              </Text>
            </HStack>
          </HStack>

          <HStack gap={2} mt='auto'>
            <Text fontSize='20px' fontWeight='700' color='#204ED3'>
              {new Intl.NumberFormat('vi-VN').format(product.price)}
            </Text>
            <Text fontSize='14px' fontWeight='700' color='#04113E'>
              VNĐ
            </Text>
          </HStack>

          <Flex justify='space-between' align='center' wrap='wrap' gap={2} fontSize='12px' mt={2}>
            <Text fontSize='12px' color='#A1A1A1'>
              {formatTimeAgo(product.createdAt)}
            </Text>
            <Badge bg='#9CA3AF' color='white' borderRadius='9999px' px={2} py={0.5} fontSize='xs'>
              {product.locations?.name || DEFAULT_VALUES.NOT_AVAILABLE}
            </Badge>
          </Flex>

          <Box borderTop='1px solid #E5E7EB' pt={2} mt={2}>
            <Flex justify='space-between' align='center' wrap='wrap' gap={2}>
              <HStack gap={2}>
                {product.store?.storeLogo && (
                  <Image
                    src={product.store.storeLogo}
                    alt={product.store.storeName}
                    width='24px'
                    height='24px'
                    borderRadius='full'
                  />
                )}
                <Text fontSize='12px' fontWeight='600' color='#1B2C5D'>
                  {product.store?.storeName || DEFAULT_VALUES.NOT_AVAILABLE}
                </Text>
              </HStack>
              <HStack gap={3}>
                <VStack gap={0} align='flex-start'>
                  <Text fontSize='10px' color='#4B5563'>
                    Đang bán
                  </Text>
                  <Text fontSize='14px' fontWeight='700' color='#4B5563'>
                    {product.statsSelling || 0}
                  </Text>
                </VStack>
                <VStack gap={0} align='flex-start'>
                  <Text fontSize='10px' color='#4B5563'>
                    Đã bán
                  </Text>
                  <Text fontSize='14px' fontWeight='700' color='#4B5563'>
                    {product.statsSold || 0}
                  </Text>
                </VStack>
              </HStack>
            </Flex>
            {showActions && (
              <HStack gap={2} mt={2}>
                <Button
                  variant='outline'
                  borderColor='#E5E5E5'
                  color='#1B2C5D'
                  borderRadius='6px'
                  px={3}
                  py={1.5}
                  fontSize='12px'
                  flex={1}
                  _hover={{ bg: '#E5E5E5' }}
                >
                  📞 0933.******
                </Button>
                <Button
                  variant='outline'
                  borderColor='#E5E5E5'
                  color='#171717'
                  borderRadius='6px'
                  px={3}
                  py={1.5}
                  fontSize='12px'
                  flex={1}
                  _hover={{ bg: '#E5E5E5' }}
                >
                  💬 Chat
                </Button>
                <Button
                  bg='#204ED3'
                  color='white'
                  borderRadius='6px'
                  px={3}
                  py={1.5}
                  fontSize='12px'
                  flex={1}
                  _hover={{ bg: '#1a3fb0' }}
                  onClick={e => {
                    e.stopPropagation()
                    navigate(PATHS.PRODUCT_BOOKING(product.id))
                  }}
                >
                  Đặt hẹn lái thử
                </Button>
              </HStack>
            )}
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
