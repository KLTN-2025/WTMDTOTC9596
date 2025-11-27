import { memo, useEffect, useMemo } from 'react'
import { Button, Dialog, Field, HStack, Input, VStack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ModelItem, MasterDataItem } from '@/api/master-data'
import { SelectFieldController } from '@/components/common/SelectField'
import { createMasterDataCollection } from '@/utils/collections'

const modelSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  brandId: z.string().min(1, 'Vui lòng chọn hãng xe')
})

type ModelFormData = z.infer<typeof modelSchema>

interface ModelDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ModelFormData) => Promise<void>
  selectedItem: ModelItem | null
  brands: MasterDataItem[]
  isSubmitting?: boolean
}

export const ModelDialog = memo(
  ({ isOpen, onClose, onSubmit, selectedItem, brands, isSubmitting = false }: ModelDialogProps) => {
    const {
      register,
      handleSubmit,
      control,
      formState: { errors },
      reset,
      setValue
    } = useForm<ModelFormData>({
      resolver: zodResolver(modelSchema),
      defaultValues: { name: '', brandId: '' },
      mode: 'onChange'
    })

    useEffect(() => {
      if (selectedItem) {
        setValue('name', selectedItem.name)
        setValue('brandId', selectedItem.brandId)
      } else {
        reset({ name: '', brandId: '' })
      }
    }, [selectedItem, setValue, reset])

    const handleClose = () => {
      reset({ name: '', brandId: '' })
      onClose()
    }

    const brandCollection = useMemo(() => createMasterDataCollection(brands), [brands])

    return (
      <Dialog.Root open={isOpen} onOpenChange={e => (!e.open ? handleClose() : undefined)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{selectedItem ? 'Chỉnh sửa' : 'Thêm mới'} dòng xe</Dialog.Title>
            </Dialog.Header>
            <form
              onSubmit={handleSubmit(async data => {
                await onSubmit(data)
                reset({ name: '', brandId: '' })
              })}
            >
              <Dialog.Body>
                <VStack align='stretch' gap={4}>
                  <Field.Root invalid={!!errors.name}>
                    <Field.Label color='#04113E'>Tên dòng xe</Field.Label>
                    <Input
                      placeholder='Nhập tên dòng xe'
                      bg='white'
                      borderColor='#E5E5E5'
                      borderRadius='8px'
                      color='#04113E'
                      {...register('name')}
                    />
                    {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
                  </Field.Root>
                  <SelectFieldController
                    labelColor='#04113E'
                    label='Hãng xe'
                    control={control}
                    name='brandId'
                    collection={brandCollection}
                    placeholder='Chọn hãng xe'
                    size='md'
                    disablePortal
                  />
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

ModelDialog.displayName = 'ModelDialog'
