import { Field, Portal, Select } from '@chakra-ui/react'
import type { ComponentProps } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

type SelectFieldProps = {
  label?: string
  collection: any
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  invalid?: boolean
  errorMessage?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  disablePortal?: boolean
  contentProps?: ComponentProps<typeof Select.Content> | undefined
  positionerProps?: ComponentProps<typeof Select.Positioner> | undefined
}

type SelectFieldWithControllerProps<T extends FieldValues> = Omit<
  SelectFieldProps,
  'value' | 'onChange' | 'onBlur' | 'invalid' | 'errorMessage'
> & {
  control: Control<T>
  name: FieldPath<T>
}

export function SelectField({
  label,
  collection,
  value,
  onChange,
  onBlur,
  placeholder = 'Chọn...',
  invalid = false,
  errorMessage,
  disabled = false,
  size = 'md',
  disablePortal = false,
  contentProps,
  positionerProps
}: SelectFieldProps) {
  const options =
    collection?.items && Array.isArray(collection.items) ? collection.items : (collection ?? [])

  const content = (
    <Select.Positioner zIndex='dropdown' {...positionerProps}>
      <Select.Content bg='white' boxShadow='lg' borderRadius='8px' {...contentProps}>
        {options.map((item: any) => (
          <Select.Item item={item} key={item.value}>
            {item.label}
            <Select.ItemIndicator />
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Positioner>
  )

  return (
    <Field.Root invalid={invalid}>
      {label && <Field.Label>{label}</Field.Label>}
      <Select.Root
        collection={collection}
        value={value ? [value] : []}
        onValueChange={({ value: newValue }) => onChange?.(newValue[0] || '')}
        onInteractOutside={() => onBlur?.()}
        size={size}
        disabled={disabled}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder={placeholder} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        {disablePortal ? content : <Portal>{content}</Portal>}
      </Select.Root>
      {errorMessage && <Field.ErrorText>{errorMessage}</Field.ErrorText>}
    </Field.Root>
  )
}

export function SelectFieldController<T extends FieldValues>({
  label,
  collection,
  control,
  name,
  placeholder = 'Chọn...',
  disabled = false,
  size = 'md',
  disablePortal = false,
  contentProps,
  positionerProps
}: SelectFieldWithControllerProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <SelectField
          {...(label && { label })}
          collection={collection}
          {...(field.value && { value: field.value })}
          onChange={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
          invalid={!!fieldState.error}
          {...(fieldState.error?.message && { errorMessage: fieldState.error.message })}
          disabled={disabled}
          size={size}
          disablePortal={disablePortal}
          contentProps={contentProps}
          positionerProps={positionerProps}
        />
      )}
    />
  )
}
