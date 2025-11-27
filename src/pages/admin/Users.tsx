import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  Dialog,
  Field,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  Table,
  Text,
  VStack,
  ScrollArea,
  Spinner,
  Badge
} from '@chakra-ui/react'
import { Tooltip } from '@/components/ui/tooltip'
import { FiSearch, FiEdit2, FiUserX, FiUserCheck, FiPlus } from 'react-icons/fi'
import {
  getUsers,
  createUser,
  updateUser,
  banUser,
  type AdminUser,
  type CreateUserData,
  type UpdateUserData
} from '@/api/users'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/utils/date'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDebouncedFilter } from '@/hooks/useDebouncedFilter'
import { PaginationControls } from '@/components/common/PaginationControls'
import { SelectField, SelectFieldController } from '@/components/common/SelectField'
import { useAuth } from '@/hooks/useAuth'
import { userSchema, userUpdateSchema } from '@/schemas/users'
import type {
  UserFilters,
  UserFormData,
  UserUpdateFormData,
  UserQueryOptions,
  UserRoleFilter
} from '@/types/users'
import { createMasterDataCollection } from '@/utils/collections'
import { USER_ROLE } from '@/configs/constants'
import { parsePhoneNumber } from 'awesome-phonenumber'

const ITEMS_PER_PAGE = 10

export function Users() {
  const toast = useToast()
  const { user: authUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    q: '',
    role: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBanSubmitting, setIsBanSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      role: USER_ROLE.BUYER,
      password: ''
    }
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    control: controlEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setValue: setValueEdit
  } = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      role: USER_ROLE.BUYER
    }
  })

  const roleFilterCollection = useMemo(
    () =>
      createMasterDataCollection([
        { label: 'Tất cả', value: 'all' },
        { label: 'Người mua', value: USER_ROLE.BUYER },
        { label: 'Người bán', value: USER_ROLE.SELLER },
        { label: 'Quản trị viên', value: USER_ROLE.ADMIN }
      ]),
    []
  )

  const roleFormCollection = useMemo(
    () =>
      createMasterDataCollection([
        { label: 'Người mua', value: USER_ROLE.BUYER },
        { label: 'Người bán', value: USER_ROLE.SELLER },
        { label: 'Quản trị viên', value: USER_ROLE.ADMIN }
      ]),
    []
  )
  const roleFormCollectionWithoutBuyer = useMemo(
    () =>
      createMasterDataCollection([
        { label: 'Người bán', value: USER_ROLE.SELLER },
        { label: 'Quản trị viên', value: USER_ROLE.ADMIN }
      ]),
    []
  )
  const editRoleCollection = useMemo(
    () =>
      selectedUser?.role && selectedUser.role !== USER_ROLE.BUYER
        ? roleFormCollectionWithoutBuyer
        : roleFormCollection,
    [selectedUser?.role, roleFormCollection, roleFormCollectionWithoutBuyer]
  )

  const { debouncedFilter: debouncedSearch } = useDebouncedFilter(filters.q, {
    onFilterChange: () => setCurrentPage(1)
  })

  const isManagingSelf = (targetUserId?: string) => {
    if (!authUser?.id || !targetUserId) {
      return false
    }
    return authUser.id === targetUserId
  }

  const blockSelfManagement = (targetUserId?: string, action?: 'edit' | 'ban') => {
    if (!isManagingSelf(targetUserId)) {
      return false
    }

    const messages =
      action === 'ban'
        ? {
            body: 'Bạn không thể khóa tài khoản của chính mình.',
            title: 'Không thể khóa'
          }
        : {
            body: 'Bạn không thể chỉnh sửa tài khoản của chính mình tại trang quản lý.',
            title: 'Không thể chỉnh sửa'
          }

    toast.info(messages.body, {
      title: messages.title
    })
    return true
  }

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const options: UserQueryOptions = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        role: filters.role
      }

      if (debouncedSearch.trim()) {
        options.search = debouncedSearch.trim()
      }

      const { data, error, totalCount: count } = await getUsers(options)

      if (error) {
        toast.error(error.message || 'Không thể tải danh sách người dùng', {
          title: 'Lỗi tải danh sách'
        })
        return
      }

      setUsers(data || [])
      setTotalCount(count || 0)
    } catch {
      toast.error('Đã xảy ra lỗi khi tải danh sách người dùng', {
        title: 'Lỗi'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [currentPage, debouncedSearch, filters.role])

  const handleCreateUser = async (formData: UserFormData) => {
    setIsSubmitting(true)
    try {
      const phone = parsePhoneNumber(formData.phone, { regionCode: 'VN' }).number?.e164 ?? ''
      const createData: CreateUserData = {
        phone: phone,
        password: formData.password || '123456',
        fullName: formData.fullName,
        role: formData.role,
        ...(formData.email && formData.email.trim() ? { email: formData.email } : {})
      }

      const { error } = await createUser(createData)

      if (error) {
        toast.error(error.message || 'Không thể tạo người dùng', {
          title: 'Tạo người dùng thất bại'
        })
        return
      }

      toast.success('Người dùng đã được tạo thành công', {
        title: 'Tạo người dùng thành công'
      })

      setIsCreateDialogOpen(false)
      reset()
      loadUsers()
    } catch {
      toast.error('Đã xảy ra lỗi khi tạo người dùng', {
        title: 'Lỗi'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async (formData: UserUpdateFormData) => {
    if (!selectedUser) return
    if (blockSelfManagement(selectedUser.id, 'edit')) return

    setIsSubmitting(true)
    try {
      const updateData: UpdateUserData = {
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
        ...(formData.email && formData.email.trim() ? { email: formData.email } : {})
      }

      const { error } = await updateUser(selectedUser.id, updateData)

      if (error) {
        toast.error(error.message || 'Không thể cập nhật người dùng', {
          title: 'Cập nhật thất bại'
        })
        return
      }

      toast.success('Thông tin người dùng đã được cập nhật', {
        title: 'Cập nhật thành công'
      })

      setIsEditDialogOpen(false)
      setSelectedUser(null)
      resetEdit()
      loadUsers()
    } catch {
      toast.error('Đã xảy ra lỗi khi cập nhật người dùng', {
        title: 'Lỗi'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openBanDialog = (user: AdminUser) => {
    if (blockSelfManagement(user.id, 'ban')) return
    setSelectedUser(user)
    setIsBanDialogOpen(true)
  }

  const handleBanUser = async () => {
    if (!selectedUser) return
    if (blockSelfManagement(selectedUser.id, 'ban')) return

    setIsBanSubmitting(true)
    try {
      const isUserBanned = selectedUser.status === 'banned'
      const { error } = await banUser(selectedUser.id, !isUserBanned)

      if (error) {
        toast.error(error.message || 'Không thể thực hiện thao tác', {
          title: 'Thao tác thất bại'
        })
        return
      }

      toast.success(isUserBanned ? 'Đã mở khóa người dùng' : 'Đã khóa người dùng', {
        title: 'Thành công'
      })

      setIsBanDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch {
      toast.error('Đã xảy ra lỗi', {
        title: 'Lỗi'
      })
    } finally {
      setIsBanSubmitting(false)
    }
  }

  const openEditDialog = (user: AdminUser) => {
    if (blockSelfManagement(user.id, 'edit')) return
    setSelectedUser(user)
    setValueEdit('fullName', user.fullName || '')
    setValueEdit('phone', user.phone || '')
    setValueEdit('email', user.email || '')
    setValueEdit('role', user.role)
    setIsEditDialogOpen(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return 'red'
      case USER_ROLE.SELLER:
        return 'blue'
      default:
        return 'gray'
    }
  }

  if (isLoading && users.length === 0) {
    return (
      <Box p={6}>
        <Card.Root bg='white' borderRadius='16px' p={8}>
          <Flex justify='center' align='center' minH='400px'>
            <Spinner size='lg' color='#204ED3' />
          </Flex>
        </Card.Root>
      </Box>
    )
  }

  return (
    <Box p={2}>
      <VStack align='stretch' gap={6}>
        <Flex justify='space-between' align='center'>
          <VStack align='start' gap={2}>
            <Heading fontSize='24px' fontWeight='700' color='#04113E'>
              Quản lý người dùng
            </Heading>
            <Text fontSize='14px' color='#6B7280'>
              Quản lý tất cả người dùng trong hệ thống
            </Text>
          </VStack>
          <Button
            bg='#204ED3'
            color='white'
            borderRadius='6px'
            px={6}
            py={3}
            fontWeight='600'
            fontSize='14px'
            _hover={{ bg: '#1a3fb0' }}
            onClick={() => {
              reset()
              setIsCreateDialogOpen(true)
            }}
          >
            <Icon mr={2}>
              <FiPlus />
            </Icon>
            Tạo người dùng
          </Button>
        </Flex>

        <Card.Root bg='white' borderRadius='16px' p={6}>
          <VStack align='stretch' gap={4}>
            <HStack gap={3}>
              <Box position='relative' flex={1}>
                <Icon
                  position='absolute'
                  left={3}
                  top='50%'
                  transform='translateY(-50%)'
                  color='#737373'
                  fontSize='16px'
                  zIndex={1}
                >
                  <FiSearch />
                </Icon>
                <Input
                  placeholder='Tìm kiếm theo tên, số điện thoại, email...'
                  color='#04113E'
                  pl={9}
                  pr={4}
                  py={2}
                  bg='white'
                  borderColor='#E5E5E5'
                  borderRadius='8px'
                  fontSize='14px'
                  value={filters.q}
                  onChange={e => setFilters({ ...filters, q: e.target.value })}
                />
              </Box>
              <Box minW='150px' maxW='180px'>
                <SelectField
                  collection={roleFilterCollection}
                  value={filters.role}
                  onChange={value =>
                    setFilters(prev => {
                      setCurrentPage(1)
                      return {
                        ...prev,
                        role: (value as UserRoleFilter) || 'all'
                      }
                    })
                  }
                  placeholder='Chọn vai trò'
                  size='md'
                />
              </Box>
            </HStack>

            <ScrollArea.Root>
              <ScrollArea.Viewport>
                <Table.Root>
                  <Table.Header>
                    <Table.Row bg='#FFF'>
                      <Table.ColumnHeader color='#04113E'>Người dùng</Table.ColumnHeader>
                      <Table.ColumnHeader color='#04113E'>Thông tin liên hệ</Table.ColumnHeader>
                      <Table.ColumnHeader color='#04113E'>Vai trò</Table.ColumnHeader>
                      <Table.ColumnHeader color='#04113E'>Trạng thái</Table.ColumnHeader>
                      <Table.ColumnHeader color='#04113E'>Ngày tạo</Table.ColumnHeader>
                      <Table.ColumnHeader color='#04113E'>Thao tác</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body bg='#FFF'>
                    {users.length === 0 ? (
                      <Table.Row bg='#FFF'>
                        <Table.Cell colSpan={6}>
                          <Flex justify='center' align='center' py={8}>
                            <Text fontSize='14px' color='#6B7280'>
                              Không có người dùng nào
                            </Text>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      users.map(user => (
                        <Table.Row key={user.id} bg='#FFF'>
                          <Table.Cell>
                            <HStack gap={3}>
                              {user.avatarUrl ? (
                                <Image
                                  src={user.avatarUrl}
                                  alt={user.fullName || user.phone || 'User'}
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
                                  <Text fontSize='14px' fontWeight='600' color='#737373'>
                                    {(user.fullName || user.phone || 'U').charAt(0).toUpperCase()}
                                  </Text>
                                </Box>
                              )}
                              <VStack align='start' gap={0}>
                                <Text fontSize='14px' fontWeight='600' color='#04113E'>
                                  {user.fullName || 'Chưa có tên'}
                                </Text>
                                {user.email && (
                                  <Text fontSize='12px' color='#6B7280'>
                                    {user.email}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontSize='14px' color='#04113E'>
                              {user.phone || 'Chưa có'}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={getRoleBadgeColor(user.role)}>
                              {user.role === USER_ROLE.ADMIN
                                ? 'Quản trị viên'
                                : user.role === USER_ROLE.SELLER
                                  ? 'Người bán'
                                  : 'Người mua'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={user.status === 'banned' ? 'red' : 'green'}>
                              {user.status === 'banned' ? 'Đã khóa' : 'Hoạt động'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontSize='14px' color='#04113E'>
                              {formatDate(user.createdAt, 'dd/MM/yyyy')}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <HStack gap={2}>
                              <IconButton
                                size='sm'
                                variant='ghost'
                                onClick={() => openEditDialog(user)}
                                disabled={isManagingSelf(user.id)}
                              >
                                <FiEdit2 />
                              </IconButton>
                              <Tooltip
                                content={
                                  user.status === 'banned'
                                    ? 'Mở khóa người dùng'
                                    : 'Khóa người dùng'
                                }
                                showArrow
                              >
                                <IconButton
                                  size='sm'
                                  variant='ghost'
                                  colorPalette={user.status === 'banned' ? 'green' : 'red'}
                                  onClick={() => openBanDialog(user)}
                                  disabled={isManagingSelf(user.id)}
                                >
                                  {user.status === 'banned' ? <FiUserCheck /> : <FiUserX />}
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

      <Dialog.Root open={isCreateDialogOpen} onOpenChange={e => setIsCreateDialogOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bgColor='#FFF'>
            <Dialog.Header>
              <Dialog.Title color='#04113E'>Tạo người dùng mới</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit(handleCreateUser)}>
              <Dialog.Body>
                <VStack align='stretch' gap={4}>
                  <Field.Root invalid={!!errors.fullName}>
                    <Field.Label color='#04113E'>Họ và tên</Field.Label>
                    <Input
                      placeholder='Nhập họ và tên'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      color='#04113E'
                      {...register('fullName')}
                    />
                    {errors.fullName && (
                      <Field.ErrorText>{errors.fullName.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.phone}>
                    <Field.Label color='#04113E'>Số điện thoại</Field.Label>
                    <Input
                      placeholder='Nhập số điện thoại'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      color='#04113E'
                      {...register('phone')}
                    />
                    {errors.phone && <Field.ErrorText>{errors.phone.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root invalid={!!errors.email}>
                    <Field.Label color='#04113E'>Email (tùy chọn)</Field.Label>
                    <Input
                      type='email'
                      placeholder='Nhập email'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      color='#04113E'
                      {...register('email')}
                    />
                    {errors.email && <Field.ErrorText>{errors.email.message}</Field.ErrorText>}
                  </Field.Root>

                  <SelectFieldController
                    label='Vai trò'
                    color='#04113E'
                    control={control}
                    name='role'
                    collection={roleFormCollection}
                    placeholder='Chọn vai trò'
                    size='md'
                    disablePortal
                  />

                  <Field.Root invalid={!!errors.password}>
                    <Field.Label color='#04113E'>Mật khẩu (mặc định: 123456)</Field.Label>
                    <Input
                      type='password'
                      placeholder='Nhập mật khẩu'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      color='#04113E'
                      {...register('password')}
                    />
                    {errors.password && (
                      <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={2}>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      reset()
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type='submit' bg='#204ED3' color='white' loading={isSubmitting}>
                    Tạo
                  </Button>
                </HStack>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Dialog.Root open={isEditDialogOpen} onOpenChange={e => setIsEditDialogOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title color='#04113E'>Cập nhật người dùng</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmitEdit(handleEditUser)}>
              <Dialog.Body>
                <VStack align='stretch' gap={4}>
                  <Field.Root invalid={!!errorsEdit.fullName}>
                    <Field.Label>Họ và tên</Field.Label>
                    <Input
                      placeholder='Nhập họ và tên'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      color='#04113E'
                      {...registerEdit('fullName')}
                    />
                    {errorsEdit.fullName && (
                      <Field.ErrorText>{errorsEdit.fullName.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errorsEdit.phone}>
                    <Field.Label>Số điện thoại</Field.Label>
                    <Input
                      placeholder='Nhập số điện thoại'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      color='#04113E'
                      {...registerEdit('phone')}
                    />
                    {errorsEdit.phone && (
                      <Field.ErrorText>{errorsEdit.phone.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errorsEdit.email}>
                    <Field.Label>Email (tùy chọn)</Field.Label>
                    <Input
                      type='email'
                      placeholder='Nhập email'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      {...registerEdit('email')}
                    />
                    {errorsEdit.email && (
                      <Field.ErrorText>{errorsEdit.email.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <SelectFieldController
                    label='Vai trò'
                    control={controlEdit}
                    name='role'
                    collection={editRoleCollection}
                    placeholder='Chọn vai trò'
                    size='md'
                    disablePortal
                  />
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={2}>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setSelectedUser(null)
                      resetEdit()
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type='submit' bg='#204ED3' color='white' loading={isSubmitting}>
                    Cập nhật
                  </Button>
                </HStack>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Dialog.Root open={isBanDialogOpen} onOpenChange={e => setIsBanDialogOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {selectedUser?.status === 'banned' ? 'Mở khóa người dùng' : 'Khóa người dùng'}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align='stretch' gap={3}>
                <Text fontSize='14px' color='#6B7280'>
                  {selectedUser?.status === 'banned'
                    ? `Bạn có chắc chắn muốn mở khóa người dùng "${selectedUser.fullName || selectedUser.phone}"?`
                    : `Bạn có chắc chắn muốn khóa người dùng "${selectedUser?.fullName || selectedUser?.phone}"?`}
                </Text>
                {selectedUser?.status === 'banned' && (
                  <Box
                    p={3}
                    bg='#f0fdf4'
                    border='1px solid'
                    borderColor='#86efac'
                    borderRadius='8px'
                  >
                    <Text fontSize='13px' color='#166534' fontWeight='500'>
                      Người dùng sẽ có thể đăng nhập và sử dụng hệ thống sau khi được mở khóa.
                    </Text>
                  </Box>
                )}
                {selectedUser?.status !== 'banned' && (
                  <Box
                    p={3}
                    bg='#fef2f2'
                    border='1px solid'
                    borderColor='#fca5a5'
                    borderRadius='8px'
                  >
                    <Text fontSize='13px' color='#991b1b' fontWeight='500'>
                      Người dùng sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.
                    </Text>
                  </Box>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={2}>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsBanDialogOpen(false)
                    setSelectedUser(null)
                  }}
                >
                  Hủy
                </Button>
                <Button
                  bg={selectedUser?.status === 'banned' ? '#16a34a' : '#dc2626'}
                  color='white'
                  onClick={handleBanUser}
                  loading={isBanSubmitting}
                  disabled={isBanSubmitting}
                >
                  {selectedUser?.status === 'banned' ? 'Mở khóa' : 'Khóa'}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}
