import { FormatNumber, type FormatNumberProps } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'

type CurrencyFormatProps = Omit<
  FormatNumberProps,
  'style' | 'currency' | 'maximumFractionDigits' | 'minimumFractionDigits'
> & {
  currency?: string
  currencyDisplay?: Intl.NumberFormatOptions['currencyDisplay']
  maximumFractionDigits?: number
  minimumFractionDigits?: number
}

export const CurrencyFormat = ({
  currency = 'VND',
  currencyDisplay = 'symbol',
  maximumFractionDigits = 0,
  minimumFractionDigits = 0,
  ...props
}: PropsWithChildren<CurrencyFormatProps>) => {
  return (
    <FormatNumber
      style='currency'
      currency={currency}
      currencyDisplay={currencyDisplay}
      maximumFractionDigits={maximumFractionDigits}
      minimumFractionDigits={minimumFractionDigits}
      {...props}
    />
  )
}
