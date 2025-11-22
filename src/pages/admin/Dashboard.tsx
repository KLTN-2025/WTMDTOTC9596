import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  VStack,
  HStack,
  Stat
} from '@chakra-ui/react'
import { Chart, useChart } from '@chakra-ui/charts'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { getDashboardStats } from '@/api/statistics'
import type { DashboardStats } from '@/types/statistics'
import { HiUsers, HiShoppingBag, HiBuildingOffice2, HiHeart, HiCalendar } from 'react-icons/hi2'

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)
      const { data, error: fetchError } = await getDashboardStats()
      if (fetchError) {
        setError(fetchError)
      } else {
        setStats(data)
      }
      setIsLoading(false)
    }

    fetchStats()
  }, [])

  const formatMonthLabel = (month: string) => {
    const parts = month.split('-')
    if (parts.length !== 2) return month
    const [year, monthNum] = parts
    if (!year || !monthNum) return month
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
    const monthIndex = parseInt(monthNum) - 1
    if (monthIndex < 0 || monthIndex >= 12) return month
    return `${monthNames[monthIndex]}/${year.slice(2)}`
  }

  const defaultStats: DashboardStats = {
    users: {
      total: 0,
      byRole: { buyer: 0, seller: 0, admin: 0 },
      newUsersByMonth: []
    },
    products: {
      total: 0,
      byStatus: { pending: 0, rejected: 0, available: 0, sold: 0 },
      byBrand: [],
      byCondition: { new: 0, used: 0 },
      newProductsByMonth: []
    },
    stores: {
      total: 0,
      byStatus: { pending: 0, active: 0, suspended: 0, banned: 0 },
      byType: { personal: 0, business: 0 },
      newStoresByMonth: []
    },
    engagement: {
      totalFavorites: 0,
      totalComments: 0,
      totalReactions: 0,
      favoritesByMonth: [],
      commentsByMonth: [],
      reactionsByType: []
    },
    testDrives: {
      total: 0,
      byStatus: { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
      bookingsByMonth: []
    }
  }

  const currentStats = stats || defaultStats

  const userRoleChart = useChart({
    data: [
      { name: 'Người mua', value: currentStats.users.byRole.buyer, color: 'blue.solid' },
      { name: 'Người bán', value: currentStats.users.byRole.seller, color: 'green.solid' },
      { name: 'Quản trị', value: currentStats.users.byRole.admin, color: 'purple.solid' }
    ]
  })

  const productStatusChart = useChart({
    data: [
      { name: 'Chờ duyệt', value: currentStats.products.byStatus.pending, color: 'yellow.solid' },
      { name: 'Từ chối', value: currentStats.products.byStatus.rejected, color: 'red.solid' },
      { name: 'Đang bán', value: currentStats.products.byStatus.available, color: 'green.solid' },
      { name: 'Đã bán', value: currentStats.products.byStatus.sold, color: 'gray.solid' }
    ]
  })

  const testDriveStatusChart = useChart({
    data: [
      {
        name: 'Chờ xác nhận',
        value: currentStats.testDrives.byStatus.pending,
        color: 'yellow.solid'
      },
      {
        name: 'Đã xác nhận',
        value: currentStats.testDrives.byStatus.confirmed,
        color: 'blue.solid'
      },
      {
        name: 'Hoàn thành',
        value: currentStats.testDrives.byStatus.completed,
        color: 'green.solid'
      },
      { name: 'Đã hủy', value: currentStats.testDrives.byStatus.cancelled, color: 'red.solid' }
    ]
  })

  const newUsersChart = useChart({
    data: currentStats.users.newUsersByMonth.map(item => ({
      month: formatMonthLabel(item.month),
      count: item.count
    })),
    series: [{ name: 'count', color: 'blue.solid' }]
  })

  const newProductsChart = useChart({
    data: currentStats.products.newProductsByMonth.map(item => ({
      month: formatMonthLabel(item.month),
      count: item.count
    })),
    series: [{ name: 'count', color: 'green.solid' }]
  })

  const engagementChart = useChart({
    data: currentStats.engagement.favoritesByMonth.map((item, index) => ({
      month: formatMonthLabel(item.month),
      favorites: item.count,
      comments: currentStats.engagement.commentsByMonth[index]?.count || 0
    })),
    series: [
      { name: 'favorites', color: 'red.solid' },
      { name: 'comments', color: 'blue.solid' }
    ]
  })

  if (isLoading) {
    return (
      <Box>
        <Heading size='lg' mb={6}>
          Dashboard
        </Heading>
        <Card.Root>
          <Card.Body>
            <VStack py={8}>
              <Spinner size='xl' />
              <Text>Đang tải dữ liệu...</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    )
  }

  if (error || !stats) {
    return (
      <Box>
        <Heading size='lg' mb={6}>
          Dashboard
        </Heading>
        <Card.Root>
          <Card.Body>
            <Text color='red.500'>Có lỗi xảy ra khi tải dữ liệu</Text>
          </Card.Body>
        </Card.Root>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size='lg' mb={6}>
        Dashboard
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap={4} mb={6}>
        <Card.Root>
          <Card.Body>
            <Stat.Root>
              <HStack mb={2}>
                <Box color='blue.500'>
                  <HiUsers size={24} />
                </Box>
                <Stat.Label>Tổng người dùng</Stat.Label>
              </HStack>
              <Stat.ValueText fontSize='2xl' fontWeight='bold'>
                {currentStats.users.total.toLocaleString('vi-VN')}
              </Stat.ValueText>
              <Stat.HelpText>
                {currentStats.users.byRole.buyer} người mua, {currentStats.users.byRole.seller}{' '}
                người bán
              </Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Stat.Root>
              <HStack mb={2}>
                <Box color='green.500'>
                  <HiShoppingBag size={24} />
                </Box>
                <Stat.Label>Tổng sản phẩm</Stat.Label>
              </HStack>
              <Stat.ValueText fontSize='2xl' fontWeight='bold'>
                {currentStats.products.total.toLocaleString('vi-VN')}
              </Stat.ValueText>
              <Stat.HelpText>
                {currentStats.products.byStatus.available} đang bán,{' '}
                {currentStats.products.byStatus.sold} đã bán
              </Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Stat.Root>
              <HStack mb={2}>
                <Box color='purple.500'>
                  <HiBuildingOffice2 size={24} />
                </Box>
                <Stat.Label>Tổng cửa hàng</Stat.Label>
              </HStack>
              <Stat.ValueText fontSize='2xl' fontWeight='bold'>
                {currentStats.stores.total.toLocaleString('vi-VN')}
              </Stat.ValueText>
              <Stat.HelpText>{currentStats.stores.byStatus.active} đang hoạt động</Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Stat.Root>
              <HStack mb={2}>
                <Box color='red.500'>
                  <HiHeart size={24} />
                </Box>
                <Stat.Label>Tương tác</Stat.Label>
              </HStack>
              <Stat.ValueText fontSize='2xl' fontWeight='bold'>
                {(
                  currentStats.engagement.totalFavorites + currentStats.engagement.totalComments
                ).toLocaleString('vi-VN')}
              </Stat.ValueText>
              <Stat.HelpText>
                {currentStats.engagement.totalFavorites} yêu thích,{' '}
                {currentStats.engagement.totalComments} bình luận
              </Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Stat.Root>
              <HStack mb={2}>
                <Box color='orange.500'>
                  <HiCalendar size={24} />
                </Box>
                <Stat.Label>Đặt lái thử</Stat.Label>
              </HStack>
              <Stat.ValueText fontSize='2xl' fontWeight='bold'>
                {currentStats.testDrives.total.toLocaleString('vi-VN')}
              </Stat.ValueText>
              <Stat.HelpText>{currentStats.testDrives.byStatus.pending} chờ xác nhận</Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
        <Card.Root>
          <Card.Header>
            <Card.Title>Người dùng mới theo tháng</Card.Title>
          </Card.Header>
          <Card.Body>
            <Chart.Root maxH='300px' chart={newUsersChart}>
              <AreaChart data={newUsersChart.data}>
                <CartesianGrid stroke={newUsersChart.color('border.muted')} vertical={false} />
                <XAxis axisLine={false} tickLine={false} dataKey={newUsersChart.key('month')} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={false} animationDuration={100} content={<Chart.Tooltip />} />
                {newUsersChart.series.map(item => (
                  <Area
                    key={item.name}
                    isAnimationActive={false}
                    dataKey={newUsersChart.key(item.name)}
                    fill={newUsersChart.color(item.color)}
                    fillOpacity={0.2}
                    stroke={newUsersChart.color(item.color)}
                  />
                ))}
              </AreaChart>
            </Chart.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title>Sản phẩm mới theo tháng</Card.Title>
          </Card.Header>
          <Card.Body>
            <Chart.Root maxH='300px' chart={newProductsChart}>
              <LineChart data={newProductsChart.data}>
                <CartesianGrid stroke={newProductsChart.color('border.muted')} vertical={false} />
                <XAxis axisLine={false} tickLine={false} dataKey={newProductsChart.key('month')} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={false} animationDuration={100} content={<Chart.Tooltip />} />
                {newProductsChart.series.map(item => (
                  <Line
                    key={item.name}
                    isAnimationActive={false}
                    type='monotone'
                    dataKey={newProductsChart.key(item.name)}
                    stroke={newProductsChart.color(item.color)}
                    strokeWidth={2}
                    dot={{ fill: newProductsChart.color(item.color) }}
                  />
                ))}
              </LineChart>
            </Chart.Root>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
        <Card.Root>
          <Card.Header>
            <Card.Title>Phân bố người dùng theo vai trò</Card.Title>
          </Card.Header>
          <Card.Body>
            <Chart.Root boxSize='300px' mx='auto' chart={userRoleChart}>
              <PieChart>
                <Legend content={<Chart.Legend />} />
                <Pie
                  isAnimationActive={false}
                  data={userRoleChart.data}
                  dataKey={userRoleChart.key('value')}
                  nameKey='name'
                >
                  {userRoleChart.data.map(item => (
                    <Cell key={item.name} fill={userRoleChart.color(item.color)} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  animationDuration={100}
                  content={<Chart.Tooltip hideLabel />}
                />
              </PieChart>
            </Chart.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title>Trạng thái sản phẩm</Card.Title>
          </Card.Header>
          <Card.Body>
            <Chart.Root boxSize='300px' mx='auto' chart={productStatusChart}>
              <PieChart>
                <Legend content={<Chart.Legend />} />
                <Pie
                  isAnimationActive={false}
                  data={productStatusChart.data}
                  dataKey={productStatusChart.key('value')}
                  nameKey='name'
                >
                  {productStatusChart.data.map(item => (
                    <Cell key={item.name} fill={productStatusChart.color(item.color)} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  animationDuration={100}
                  content={<Chart.Tooltip hideLabel />}
                />
              </PieChart>
            </Chart.Root>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Card.Root mb={6}>
        <Card.Header>
          <Card.Title>Trạng thái đặt lái thử</Card.Title>
        </Card.Header>
        <Card.Body>
          <Chart.Root boxSize='300px' mx='auto' chart={testDriveStatusChart}>
            <PieChart>
              <Legend content={<Chart.Legend />} />
              <Pie
                isAnimationActive={false}
                data={testDriveStatusChart.data}
                dataKey={testDriveStatusChart.key('value')}
                nameKey='name'
              >
                {testDriveStatusChart.data.map(item => (
                  <Cell key={item.name} fill={testDriveStatusChart.color(item.color)} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                animationDuration={100}
                content={<Chart.Tooltip hideLabel />}
              />
            </PieChart>
          </Chart.Root>
        </Card.Body>
      </Card.Root>

      <Card.Root mb={6}>
        <Card.Header>
          <Card.Title>Tương tác theo tháng</Card.Title>
        </Card.Header>
        <Card.Body>
          <Chart.Root maxH='300px' chart={engagementChart}>
            <BarChart data={engagementChart.data}>
              <CartesianGrid stroke={engagementChart.color('border.muted')} vertical={false} />
              <XAxis axisLine={false} tickLine={false} dataKey={engagementChart.key('month')} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: engagementChart.color('bg.muted') }}
                animationDuration={100}
                content={<Chart.Tooltip />}
              />
              <Legend content={<Chart.Legend />} />
              {engagementChart.series.map(item => (
                <Bar
                  key={item.name}
                  isAnimationActive={false}
                  dataKey={engagementChart.key(item.name)}
                  fill={engagementChart.color(item.color)}
                />
              ))}
            </BarChart>
          </Chart.Root>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
