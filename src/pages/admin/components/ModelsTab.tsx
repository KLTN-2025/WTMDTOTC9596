import { memo } from 'react'
import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  ScrollArea,
  Table,
  Text,
  VStack
} from '@chakra-ui/react'
import { Tooltip } from '@/components/ui/tooltip'
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'
import { formatDate } from '@/utils/date'
import type { ModelItem } from '@/api/master-data'

interface ModelsTabProps {
  data: ModelItem[]
  brandsMap: Map<string, string>
  onCreate: () => void
  onEdit: (item: ModelItem) => void
  onDelete: (item: ModelItem) => void
}

export const ModelsTab = memo(({ data, brandsMap, onCreate, onEdit, onDelete }: ModelsTabProps) => {
  return (
    <VStack align='stretch' gap={4}>
      <Flex justify='space-between' align='center'>
        <Text fontSize='16px' fontWeight='600' color='#04113E'>
          Danh sách dòng xe
        </Text>
        <Button
          bg='#204ED3'
          color='white'
          borderRadius='6px'
          px={4}
          py={2}
          fontWeight='600'
          fontSize='14px'
          _hover={{ bg: '#1a3fb0' }}
          onClick={onCreate}
        >
          <Icon mr={2}>
            <FiPlus />
          </Icon>
          Thêm mới
        </Button>
      </Flex>

      <ScrollArea.Root maxH={{ base: '320px', md: '480px' }}>
        <ScrollArea.Viewport>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Tên</Table.ColumnHeader>
                <Table.ColumnHeader>Hãng xe</Table.ColumnHeader>
                <Table.ColumnHeader>Ngày tạo</Table.ColumnHeader>
                <Table.ColumnHeader>Thao tác</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4}>
                    <Flex justify='center' align='center' py={8}>
                      <Text fontSize='14px' color='#6B7280'>
                        Không có dữ liệu
                      </Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ) : (
                data.map(item => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <Text fontSize='14px' fontWeight='600' color='#04113E'>
                        {item.name}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize='14px' color='#04113E'>
                        {brandsMap.get(item.brandId) || 'N/A'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize='14px' color='#04113E'>
                        {formatDate(item.createdAt, 'dd/MM/yyyy')}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack gap={2}>
                        <Tooltip content='Chỉnh sửa' showArrow>
                          <IconButton size='sm' variant='ghost' onClick={() => onEdit(item)}>
                            <FiEdit2 />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content='Xóa' showArrow>
                          <IconButton
                            size='sm'
                            variant='ghost'
                            colorPalette='red'
                            onClick={() => onDelete(item)}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </Tooltip>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation='vertical'>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </VStack>
  )
})

ModelsTab.displayName = 'ModelsTab'
