import { memo, useEffect } from 'react'
import { Button, Dialog, Field, HStack, Input, VStack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { MasterDataItem } from '@/api/master-data'

const masterDataSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  logoUrl: z.string().url('URL không hợp lệ').optional().or(z.literal(''))
})

type MasterDataFormData = z.infer<typeof masterDataSchema>

interface MasterDataDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MasterDataFormData) => Promise<void>
  selectedItem: MasterDataItem | null
  label: string
  showLogo?: boolean
  isSubmitting?: boolean
}

export const MasterDataDialog = memo(
  ({
    isOpen,
    onClose,
    onSubmit,
    selectedItem,
    label,
    showLogo = false,
    isSubmitting = false
  }: MasterDataDialogProps) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
      setValue
    } = useForm<MasterDataFormData>({
      resolver: zodResolver(masterDataSchema),
      defaultValues: { name: '', logoUrl: '' },
      mode: 'onChange'
    })

    useEffect(() => {
      if (selectedItem) {
        setValue('name', selectedItem.name)
        setValue('logoUrl', selectedItem.logoUrl || '')
      } else {
        reset({ name: '', logoUrl: '' })
      }
    }, [selectedItem, setValue, reset])

    const handleClose = () => {
      reset({ name: '', logoUrl: '' })
      onClose()
    }

    return (
      <Dialog.Root open={isOpen} onOpenChange={e => (!e.open ? handleClose() : undefined)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {selectedItem ? 'Chỉnh sửa' : 'Thêm mới'} {label.toLowerCase()}
              </Dialog.Title>
            </Dialog.Header>
            <form
              onSubmit={handleSubmit(async data => {
                await onSubmit(data)
                reset({ name: '', logoUrl: '' })
              })}
            >
              <Dialog.Body>
                <VStack align='stretch' gap={4}>
                  <Field.Root invalid={!!errors.name}>
                    <Field.Label>Tên</Field.Label>
                    <Input
                      placeholder='Nhập tên'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      {...register('name')}
                    />
                    {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
                  </Field.Root>
                  {showLogo && (
                    <Field.Root invalid={!!errors.logoUrl}>
                      <Field.Label>Logo URL (tùy chọn)</Field.Label>
                      <Input
                        type='url'
                        placeholder='Nhập URL logo'
                        bg='white'
                        borderColor='#E5E5E5'
                        borderRadius='8px'
                        {...register('logoUrl')}
                      />
                      {errors.logoUrl && (
                        <Field.ErrorText>{errors.logoUrl.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                  )}
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={2}>
                  <Button variant='outline' onClick={handleClose}>
                    Hủy
                  </Button>
                  <Button type='submit' bg='#204ED3' color='white' loading={isSubmitting}>
                    {selectedItem ? 'Cập nhật' : 'Tạo'}
                  </Button>
                </HStack>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    )
  }
)

MasterDataDialog.displayName = 'MasterDataDialog'
