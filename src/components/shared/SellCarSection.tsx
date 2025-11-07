import { Box, Button, Field, HStack, Icon, NativeSelect, Text, VStack } from '@chakra-ui/react'
import {
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineInformationCircle,
  HiOutlineReceiptRefund
} from 'react-icons/hi2'

export function SellCarSection() {
  return (
    <Box bg='white' borderRadius='12px' p={6} boxShadow='0px 4px 4px rgba(0, 0, 0, 0.25)'>
      <VStack align='stretch' gap={5}>
        <Text fontSize='xl' fontWeight='700' color='#04113E'>
          Tôi muốn bán xe
        </Text>

        <Box display='flex' gap={5} flexDirection={{ base: 'column', lg: 'row' }}>
          <VStack flex={1} align='stretch' gap={5}>
            <Field.Root>
              <NativeSelect.Root>
                <NativeSelect.Field
                  placeholder='Chọn hãng xe...'
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={2}
                  fontSize='md'
                  color='#737373'
                >
                  <option value=''>Chọn hãng xe...</option>
                  <option value='toyota'>Toyota</option>
                  <option value='honda'>Honda</option>
                  <option value='ford'>Ford</option>
                  <option value='mazda'>Mazda</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <NativeSelect.Root>
                <NativeSelect.Field
                  placeholder='Chọn dòng xe...'
                  bg='#F5F5F5'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  px={4}
                  py={2}
                  fontSize='md'
                  color='#737373'
                >
                  <option value=''>Chọn dòng xe...</option>
                  <option value='sedan'>Sedan</option>
                  <option value='suv'>SUV</option>
                  <option value='hatchback'>Hatchback</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Button
              w='full'
              bg='#204ED3'
              color='white'
              borderRadius='6px'
              py={3}
              fontWeight='600'
              fontSize='sm'
              _hover={{ bg: '#1a3fb0' }}
            >
              Gửi thông tin
            </Button>

            <Text fontSize='sm' color='#204ED3' textAlign='center'>
              Để tiếp tục, tôi đồng ý với Quy định & chính sách và Quy chế hoạt động
            </Text>
          </VStack>

          <Box flex={1} bg='#F5F5F5' borderRadius='12px' p={10}>
            <VStack align='stretch' gap={5}>
              <Text fontSize='md' fontWeight='600' color='#04113E' textAlign='center'>
                Quy trình 4 bước
              </Text>

              <VStack align='stretch' gap={4}>
                {[
                  { icon: HiOutlineDocumentText, text: 'Gửi thông tin' },
                  { icon: HiOutlineInformationCircle, text: 'Nhận báo giá' },
                  { icon: HiOutlineReceiptRefund, text: 'Nhận cọc' },
                  { icon: HiOutlineCreditCard, text: 'Thanh toán' }
                ].map((step, index) => (
                  <HStack key={index} bg='white' borderRadius='12px' p={2} gap={2} align='center'>
                    <Icon size='md' color='#04113E'>
                      <step.icon />
                    </Icon>
                    <Text fontSize='sm' color='#04113E'>
                      {step.text}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}
