import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  Separator,
  Flex,
  HStack,
  Heading,
  Icon,
  Input,
  Table,
  Text,
  Badge,
  Container,
  VStack,
  ScrollArea
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { FiSearch, FiX, FiCheck, FiCheckCircle, FiExternalLink, FiRefreshCw } from 'react-icons/fi'
import {
  getTestDriveBookings,
  cancelTestDriveBooking,
  updateTestDriveBookingStatus
} from '@/api/test-drive'
import type { TestDriveBooking, BookingStatus } from '@/types/test-drive'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { RangeDatePicker } from '@/components/ui/range-date-picker'
import { useDebouncedFilter } from '@/hooks/useDebouncedFilter'
import { PaginationControls } from '@/components/common/PaginationControls'
import { SelectField } from '@/components/common/SelectField'
import { createMasterDataCollection } from '@/utils/collections'
import { BOOKING_STATUS } from '@/configs/constants'

type FilterState = {
  q: string
  status: 'all' | BookingStatus
  dateRange: Date[] | null
}

const ITEMS_PER_PAGE = 10

export function TestDrives() {
  const [bookings, setBookings] = useState<TestDriveBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    status: BOOKING_STATUS.PENDING,
    dateRange: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { user, store } = useAuth()
  const toast = useToast()

  const statusCollection = useMemo(
    () =>
      createMasterDataCollection([
        { label: 'Tất cả trạng thái', value: 'all' },
        { label: 'Chờ duyệt', value: BOOKING_STATUS.PENDING },
        { label: 'Đã xác nhận', value: BOOKING_STATUS.CONFIRMED },
        { label: 'Hoàn thành', value: BOOKING_STATUS.COMPLETED },
        { label: 'Đã hủy', value: BOOKING_STATUS.CANCELLED }
      ]),
    []
  )

  const { debouncedFilter: debouncedSearch } = useDebouncedFilter(filters.q, {
    onFilterChange: () => setCurrentPage(1)
  })

  const loadBookings = async () => {
    setIsLoading(true)
    try {
      const dateFrom =
        filters.dateRange && filters.dateRange.length > 0 ? filters.dateRange[0] : null
      const dateTo = filters.dateRange && filters.dateRange.length > 1 ? filters.dateRange[1] : null

      const options: {
        page: number
        pageSize: number
        search?: string
        status: string
        dateFrom?: string
        dateTo?: string
      } = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        status: filters.status
      }

      if (debouncedSearch) {
        options.search = debouncedSearch
      }

      if (dateFrom) {
        options.dateFrom = dateFrom.toISOString()
      }

      if (dateTo) {
        options.dateTo = dateTo.toISOString()
      }

      const {
        data,
        error,
        totalCount: count
      } = await getTestDriveBookings(store?.id || null, options)

      if (error) {
        toast.error(error.message || 'Không thể tải danh sách lịch hẹn')
        setBookings([])
        setTotalCount(0)
        return
      }

      if (data) {
        setBookings(data)
        setTotalCount(count || 0)
      } else {
        setBookings([])
        setTotalCount(0)
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi tải danh sách lịch hẹn')
      setBookings([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (store?.id) {
      loadBookings()
    } else {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearch, filters.status, filters.dateRange, store?.id])

  const handleCancel = async (bookingId: string) => {
    try {
      const { error } = await cancelTestDriveBooking(bookingId, user)

      if (error) {
        toast.error(error.message || 'Không thể hủy lịch hẹn')
        return
      }

      toast.success('Đã hủy lịch hẹn thành công')

      loadBookings()
    } catch (error) {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại')
    }
  }

  const handleUpdateStatus = async (
    bookingId: string,
    status: Exclude<
      Exclude<BookingStatus, typeof BOOKING_STATUS.PENDING>,
      typeof BOOKING_STATUS.CANCELLED
    >
  ) => {
    try {
      const { error } = await updateTestDriveBookingStatus(bookingId, status, user)

      if (error) {
        toast.error(error.message || 'Không thể cập nhật trạng thái')
        return
      }

      toast.success('Đã cập nhật trạng thái thành công')

      loadBookings()
    } catch (error) {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại')
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      q: '',
      status: BOOKING_STATUS.PENDING,
      dateRange: null
    })
    setCurrentPage(1)
  }

  if (isLoading && bookings.length === 0) {
    return (
      <Box bg='#F8FAFC' minH='100vh'>
        <Container maxW='1200px' px={4} py={6}>
          <Text>Đang tải...</Text>
        </Container>
      </Box>
    )
  }

  return (
    <Box bg='#F8FAFC' minH='100vh'>
      <Container maxW='1200px' px={4} py={6}>
        <Flex justify='space-between' align='center' mb={6} gap={4} wrap='wrap'>
          <Heading size='lg' color='#04113E'>
            Quản lý lịch hẹn lái thử
          </Heading>
        </Flex>

        <Card.Root borderRadius='8px' bg='white'>
          <Card.Body>
            <HStack gap={3} align='center' mb={4} flexWrap='nowrap'>
              <Box position='relative' flex='1' minW='200px'>
                <Input
                  placeholder='Tìm kiếm theo tên khách hàng, SĐT, tên xe...'
                  value={filters.q}
                  onChange={e => handleFilterChange('q', e.target.value)}
                  pl={9}
                />
                <Icon
                  position='absolute'
                  left={3}
                  top='50%'
                  transform='translateY(-50%)'
                  color='gray.400'
                >
                  <FiSearch />
                </Icon>
              </Box>
              <Box flex='0 0 250px'>
                <RangeDatePicker
                  placeholder='Chọn khoảng ngày'
                  value={filters.dateRange}
                  onChange={dates => handleFilterChange('dateRange', dates)}
                  size='md'
                />
              </Box>
              <Box flex='0 0 200px'>
                <SelectField
                  collection={statusCollection}
                  value={filters.status}
                  onChange={value => handleFilterChange('status', value as FilterState['status'])}
                  placeholder='Chọn trạng thái'
                  size='md'
                />
              </Box>
              <Button variant='outline' colorPalette='gray' onClick={handleResetFilters}>
                <Icon>
                  <FiRefreshCw />
                </Icon>
                Reset
              </Button>
            </HStack>

            <Separator mb={4} />

            {bookings.length === 0 ? (
              <VStack py={8} gap={4}>
                <Text color='gray.500' fontSize='lg'>
                  Chưa có lịch hẹn nào
                </Text>
                <RouterLink to='/products'>
                  <Button bg='#204ED3' color='white' _hover={{ bg: '#1a3fb0' }}>
                    Xem danh sách xe
                  </Button>
                </RouterLink>
              </VStack>
            ) : (
              <>
                <ScrollArea.Root>
                  <ScrollArea.Viewport>
                    <ScrollArea.Content>
                      <Table.Root>
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader minW='150px'>Khách hàng</Table.ColumnHeader>
                            <Table.ColumnHeader minW='120px'>Dòng xe</Table.ColumnHeader>
                            <Table.ColumnHeader minW='140px'>Thời gian</Table.ColumnHeader>
                            <Table.ColumnHeader minW='150px'>Địa điểm</Table.ColumnHeader>
                            <Table.ColumnHeader minW='100px'>Bài đăng</Table.ColumnHeader>
                            <Table.ColumnHeader minW='120px'>Trạng thái</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign='right' minW='180px'>
                              Thao tác
                            </Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {bookings.map(booking => {
                            const dateTime = formatDateTime(booking.scheduledAt)
                            return (
                              <Table.Row key={booking.id} _hover={{ bg: 'gray.50' }}>
                                <Table.Cell>
                                  <VStack align='flex-start' gap={1}>
                                    <Text fontWeight='600' lineClamp={1} title={booking.fullName}>
                                      {booking.fullName}
                                    </Text>
                                    <Text color='gray.500' fontSize='sm' lineClamp={1}>
                                      {booking.phone}
                                    </Text>
                                  </VStack>
                                </Table.Cell>
                                <Table.Cell>
                                  <Text
                                    fontSize='sm'
                                    lineClamp={1}
                                    title={booking.product?.model || 'N/A'}
                                  >
                                    {booking.product?.model || 'N/A'}
                                  </Text>
                                </Table.Cell>
                                <Table.Cell>
                                  <VStack align='flex-start' gap={1}>
                                    <Text lineClamp={1}>{dateTime.date}</Text>
                                    <Text color='gray.500' fontSize='sm' lineClamp={1}>
                                      {dateTime.time}
                                    </Text>
                                  </VStack>
                                </Table.Cell>
                                <Table.Cell>
                                  <Text
                                    fontSize='sm'
                                    lineClamp={2}
                                    title={booking.location || 'N/A'}
                                  >
                                    {booking.location || 'N/A'}
                                  </Text>
                                </Table.Cell>
                                <Table.Cell>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    colorPalette='blue'
                                    onClick={() =>
                                      window.open(`/products/${booking.productId}`, '_blank')
                                    }
                                  >
                                    <Icon>
                                      <FiExternalLink />
                                    </Icon>
                                    Xem
                                  </Button>
                                </Table.Cell>
                                <Table.Cell>
                                  {booking.status === BOOKING_STATUS.PENDING && (
                                    <Badge colorPalette='yellow'>Chờ duyệt</Badge>
                                  )}
                                  {booking.status === BOOKING_STATUS.CONFIRMED && (
                                    <Badge colorPalette='blue'>Đã xác nhận</Badge>
                                  )}
                                  {booking.status === BOOKING_STATUS.COMPLETED && (
                                    <Badge colorPalette='green'>Hoàn thành</Badge>
                                  )}
                                  {booking.status === BOOKING_STATUS.CANCELLED && (
                                    <Badge colorPalette='gray'>Đã hủy</Badge>
                                  )}
                                </Table.Cell>
                                <Table.Cell>
                                  <HStack justify='end' gap={2}>
                                    {booking.status === BOOKING_STATUS.PENDING && (
                                      <>
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          colorPalette='blue'
                                          onClick={() =>
                                            handleUpdateStatus(booking.id, BOOKING_STATUS.CONFIRMED)
                                          }
                                        >
                                          <Icon>
                                            <FiCheck />
                                          </Icon>
                                          Xác nhận
                                        </Button>
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          colorPalette='red'
                                          onClick={() => handleCancel(booking.id)}
                                        >
                                          <Icon>
                                            <FiX />
                                          </Icon>
                                          Hủy
                                        </Button>
                                      </>
                                    )}
                                    {booking.status === BOOKING_STATUS.CONFIRMED && (
                                      <Button
                                        size='sm'
                                        variant='outline'
                                        colorPalette='green'
                                        onClick={() =>
                                          handleUpdateStatus(booking.id, BOOKING_STATUS.COMPLETED)
                                        }
                                      >
                                        <Icon>
                                          <FiCheckCircle />
                                        </Icon>
                                        Hoàn thành
                                      </Button>
                                    )}
                                  </HStack>
                                </Table.Cell>
                              </Table.Row>
                            )
                          })}
                        </Table.Body>
                      </Table.Root>
                    </ScrollArea.Content>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation='horizontal'>
                    <ScrollArea.Thumb />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>

                <PaginationControls
                  totalCount={totalCount}
                  pageSize={ITEMS_PER_PAGE}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  )
}

export default TestDrives
