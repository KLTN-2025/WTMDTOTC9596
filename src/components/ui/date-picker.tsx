'use client'

import { Box, Input, InputGroup } from '@chakra-ui/react'
import { SingleDatepicker } from 'chakra-dayzed-datepicker'
import type { SingleDatepickerProps } from 'chakra-dayzed-datepicker'
import * as React from 'react'

export interface DatePickerProps extends Omit<SingleDatepickerProps, 'onDateChange' | 'date'> {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  isInvalid?: boolean
  errorMessage?: string | undefined
  inputProps?: React.ComponentProps<typeof Input>
  containerProps?: React.ComponentProps<typeof Box>
  dateFormat?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled'
  colorScheme?: string
  name?: string
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(props) {
    const {
      value,
      onChange,
      placeholder = 'Chọn ngày',
      isInvalid = false,
      errorMessage,
      inputProps,
      containerProps,
      dateFormat = 'dd/MM/yyyy',
      minDate,
      maxDate,
      disabled = false,
      size = 'md',
      variant = 'outline',
      colorScheme = 'blue',
      propsConfigs,
      configs,
      name,
      ...rest
    } = props

    const [selectedDate, setSelectedDate] = React.useState<Date | null>(value || null)

    React.useEffect(() => {
      setSelectedDate(value || null)
    }, [value])

    const handleDateChange = (date: Date | null) => {
      setSelectedDate(date)
      onChange?.(date)
    }

    const defaultInputProps: React.ComponentProps<typeof Input> = {
      placeholder,
      borderColor: isInvalid ? 'red.500' : '#E5E5E5',
      borderRadius: '8px',
      bg: 'white',
      px: 4,
      py: 2,
      fontSize: size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md',
      color: selectedDate ? '#04113E' : '#737373',
      _placeholder: {
        color: '#737373',
        opacity: 1
      },
      _hover: {
        borderColor: isInvalid ? 'red.500' : '#204ED3'
      },
      _focus: {
        borderColor: isInvalid ? 'red.500' : '#204ED3',
        boxShadow: isInvalid ? '0 0 0 1px red.500' : '0 0 0 1px #204ED3'
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
      },
      cursor: 'pointer',
      readOnly: true,
      disabled,
      ...inputProps
    }

    const mergedInputProps = React.useMemo(() => {
      const baseProps = {
        ...defaultInputProps,
        placeholder: propsConfigs?.inputProps?.placeholder || placeholder
      }

      if (!propsConfigs?.inputProps) {
        return baseProps
      }

      return {
        ...baseProps,
        ...propsConfigs.inputProps,
        placeholder: propsConfigs.inputProps.placeholder || placeholder,
        _placeholder: {
          ...defaultInputProps._placeholder,
          ...(propsConfigs.inputProps._placeholder || {})
        },
        _hover: {
          ...defaultInputProps._hover,
          ...(propsConfigs.inputProps._hover || {})
        },
        _focus: {
          ...defaultInputProps._focus,
          ...(propsConfigs.inputProps._focus || {})
        }
      }
    }, [propsConfigs?.inputProps, defaultInputProps, placeholder])

    const defaultPropsConfigs = {
      dateNavBtnProps: {
        colorScheme,
        ...propsConfigs?.dateNavBtnProps
      },
      dayOfMonthBtnProps: {
        defaultBtnProps: {
          _hover: {
            bg: '#204ED3',
            color: 'white'
          },
          ...propsConfigs?.dayOfMonthBtnProps?.defaultBtnProps
        },
        selectedBtnProps: {
          bg: '#204ED3',
          color: 'white',
          ...propsConfigs?.dayOfMonthBtnProps?.selectedBtnProps
        },
        todayBtnProps: {
          borderColor: '#204ED3',
          borderWidth: '2px',
          ...propsConfigs?.dayOfMonthBtnProps?.todayBtnProps
        },
        ...propsConfigs?.dayOfMonthBtnProps
      },
      inputProps: mergedInputProps,
      popoverCompProps: {
        ...propsConfigs?.popoverCompProps
      }
    }

    const defaultConfigs = {
      dateFormat,
      monthNames: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12'
      ],
      dayNames: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      firstDayOfWeek: 1 as const,
      ...configs
    }

    const singleDatepickerProps: SingleDatepickerProps = {
      name: name || 'date-picker-input',
      onDateChange: handleDateChange,
      propsConfigs: defaultPropsConfigs,
      configs: defaultConfigs,
      disabled,
      triggerVariant: 'input',
      ...(selectedDate ? { date: selectedDate } : {}),
      ...(minDate && { minDate }),
      ...(maxDate && { maxDate }),
      ...rest
    }

    return (
      <Box {...containerProps}>
        <InputGroup>
          <SingleDatepicker {...singleDatepickerProps} />
        </InputGroup>
        {isInvalid && errorMessage && (
          <Box mt={1} fontSize='sm' color='red.500'>
            {errorMessage}
          </Box>
        )}
      </Box>
    )
  }
)
