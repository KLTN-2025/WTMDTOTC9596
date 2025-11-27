import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  Flex,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  Table,
  Text,
  Container,
  VStack,
  ScrollArea,
  Spinner
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'
import { getConfirmedCustomerContacts } from '@/api/test-drive'
import { useToast } from '@/hooks/useToast'
import type { CustomerContact } from '@/types/test-drive'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/date'
import { useDebouncedFilter } from '@/hooks/useDebouncedFilter'
import { PaginationControls } from '@/components/common/PaginationControls'
import { SelectField } from '@/components/common/SelectField'
import { createMasterDataCollection } from '@/utils/collections'
import { BOOKING_STATUS } from '@/configs/constants'

const ITEMS_PER_PAGE = 10

export function CustomerContacts() {
  const [contacts, setContacts] = useState<CustomerContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<
    typeof BOOKING_STATUS.CONFIRMED | typeof BOOKING_STATUS.COMPLETED | 'all'
  >('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { store } = useAuth()
  const toast = useToast()

  const statusCollection = useMemo(
    () =>
      createMasterDataCollection([
        { label: 'Tất cả', value: 'all' },
        { label: 'Đã xác nhận', value: BOOKING_STATUS.CONFIRMED },
        { label: 'Hoàn thành', value: BOOKING_STATUS.COMPLETED }
      ]),
    []
  )

  const { debouncedFilter: debouncedSearch } = useDebouncedFilter(search, {
    onFilterChange: () => setCurrentPage(1)
  })

  const loadContacts = async () => {
    setIsLoading(true)
    try {
      const options: {
        page: number
        pageSize: number
        search?: string
        status?: typeof BOOKING_STATUS.CONFIRMED | typeof BOOKING_STATUS.COMPLETED | 'all'
      } = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        status
      }

      if (debouncedSearch) {
        options.search = debouncedSearch
      }

      const {
        data,
        error,
        totalCount: count
      } = await getConfirmedCustomerContacts(store?.id || null, options)

      if (error) {
        toast.error(error.message || 'Không thể tải danh sách khách hàng', {
          title: 'Lỗi tải danh sách'
        })
        return
      }

      setContacts(data || [])
      setTotalCount(count || 0)
    } catch {
      toast.error('Đã xảy ra lỗi khi tải danh sách khách hàng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (store?.id) {
      loadContacts()
    } else {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearch, status, store?.id])

  if (isLoading && contacts.length === 0) {
    return (
      <Container maxW='1200px' py={8} bg='#FFF'>
        <Card.Root bg='white' borderRadius='16px' p={8} >
          <Flex justify='center' align='center' minH='400px'>
            <Spinner size='lg' color='#204ED3' />
          </Flex>
        </Card.Root>
      </Container>
    )
  }

  return (
    <Container maxW='1200px' py={8} bg='#FFF'>
      <VStack align='stretch' gap={6}>
        <VStack align='stretch' gap={2}>
          <Heading fontSize='24px' fontWeight='700' color='#04113E'>
            Danh sách khách hàng liên hệ
          </Heading>
          <Text fontSize='14px' color='#6B7280'>
            Danh sách khách hàng đã xác nhận hoặc hoàn thành lịch hẹn lái thử
          </Text>
        </VStack>

        <Card.Root bg='white' borderRadius='16px' p={6}>
          <VStack align='stretch' gap={4}>
            <HStack gap={4}>
              <Box position='relative' flex={1}>
                <Icon
                  position='absolute'
                  left={3}
                  top='50%'
                  transform='translateY(-50%)'
                  color='#737373'
                  fontSize='18px'
                >
                  <FiSearch />
                </Icon>
                <Input
                  placeholder='Tìm kiếm theo tên, số điện thoại, email...'
                  pl={10}
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </Box>
              <Box flex='0 0 200px'>
                <SelectField
                  collection={statusCollection}
                  value={status}
                  onChange={value => {
                    setStatus(
                      value as
                        | typeof BOOKING_STATUS.CONFIRMED
                        | typeof BOOKING_STATUS.COMPLETED
                        | 'all'
                    )
                    setCurrentPage(1)
                  }}
                  placeholder='Chọn trạng thái'
                  size='md'
                />
              </Box>
            </HStack>

            <ScrollArea.Root>
              <ScrollArea.Viewport>
                <Table.Root>
                  <Table.Header>
                    <Table.Row bg='#FFF'>
                      <Table.ColumnHeader color='#04113E'>Khách hàng</Table.ColumnHeader>
                      <Table.ColumnHeader color='#04113E'>Thông tin liên hệ</Table.ColumnHeader>
                      <Table.ColumnHeader color='#04113E'>Thời gian hẹn</Table.ColumnHeader>
                      <Table.ColumnHeader color='#04113E'>Địa điểm</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body bg='#FFF'>
                    {contacts.length === 0 ? (
                      <Table.Row bg='#FFF'>
                        <Table.Cell colSpan={4}>
                          <Flex justify='center' align='center' py={8}>
                            <Text fontSize='14px' color='#6B7280'>
                              Không có khách hàng nào
                            </Text>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      contacts.map(contact => (
                        <Table.Row key={contact.id} bg='#FFF'>
                          <Table.Cell>
                            <HStack gap={3}>
                              {contact.profile?.avatarUrl ? (
                                <Image
                                  src={contact.profile.avatarUrl}
                                  alt={contact.profile?.fullName || contact.fullName}
                                  width='40px'
                                  height='40px'
                                  borderRadius='full'
                                  objectFit='cover'
                                />
                              ) : (
                                <Box
                                  width='40px'
                                  height='40px'
                                  borderRadius='full'
                                  bg='#E5E5E5'
                                  display='flex'
                                  alignItems='center'
                                  justifyContent='center'
                                >
                                  <Text fontSize='14px' fontWeight='600' color='#04113E'>
                                    {(contact.profile?.fullName || contact.fullName)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </Text>
                                </Box>
                              )}
                              <VStack align='start' gap={0}>
                                <Text fontSize='14px' fontWeight='600' color='#04113E'>
                                  {contact.profile?.fullName || contact.fullName}
                                </Text>
                                {contact.profile?.email && (
                                  <Text fontSize='12px' color='#04113E'>
                                    {contact.profile.email}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <VStack align='start' gap={1}>
                              <Text fontSize='14px' color='#04113E'>
                                {contact.profile?.phone || contact.phone}
                              </Text>
                              {contact.profile?.address && (
                                <Text fontSize='12px' color='#04113E' lineClamp={1}>
                                  {contact.profile.address}
                                </Text>
                              )}
                            </VStack>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color='#04113E' fontSize='14px'>
                              {formatDate(contact.scheduledAt, 'dd/MM/yyyy HH:mm')}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color='#04113E' fontSize='14px' lineClamp={2}>
                              {contact.location}
                            </Text>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table.Root>
              </ScrollArea.Viewport>
            </ScrollArea.Root>

            <PaginationControls
              totalCount={totalCount}
              pageSize={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </VStack>
        </Card.Root>
      </VStack>
    </Container>
  )
}
