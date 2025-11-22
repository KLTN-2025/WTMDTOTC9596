import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import {
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineInformationCircle,
  HiOutlineReceiptRefund
} from 'react-icons/hi2'
import { useBrandModelSelect } from '@/hooks/useBrandModelSelect'
import { SelectField } from './SelectField'

export function SellCarSection() {
  const {
    selectedBrandId,
    selectedModelId,
    setSelectedBrandId,
    setSelectedModelId,
    brandCollection,
    modelCollection,
    isModelDisabled
  } = useBrandModelSelect()

  return (
    <Box bg='white' borderRadius='12px' p={6} boxShadow='0px 4px 4px rgba(0, 0, 0, 0.25)'>
      <VStack align='stretch' gap={5}>
        <Text fontSize='xl' fontWeight='700' color='#04113E'>
          Tôi muốn bán xe
        </Text>

        <Box display='flex' gap={5} flexDirection={{ base: 'column', lg: 'row' }}>
          <VStack flex={1} align='stretch' gap={5}>
            <SelectField
              label='Hãng xe'
              collection={brandCollection}
              value={selectedBrandId}
              onChange={setSelectedBrandId}
              placeholder='Chọn hãng xe...'
            />

            <SelectField
              label='Dòng xe'
              collection={modelCollection}
              value={selectedModelId}
              onChange={setSelectedModelId}
              placeholder={isModelDisabled ? 'Chọn hãng xe trước' : 'Chọn dòng xe...'}
              disabled={isModelDisabled}
            />

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
