import country from 'country-list-js'
import type { SelectOption } from 'naive-ui'
import type { Country } from '@/types/general.types'

export const reoccurrenceOptions: SelectOption[] = [
  {
    label: 'Weekly',
    value: 'weekly',
  },
  {
    label: 'Bi-Weekly',
    value: 'bi-weekly',
  },
  {
    label: 'Monthly',
    value: 'monthly',
  },
  {
    label: 'Bi-Monthly',
    value: 'bi-monthly',
  },
  {
    label: 'Quarterly',
    value: 'quarterly',
  },
  {
    label: 'Yearly',
    value: 'yearly',
  },
]

export const dateModeOptions: SelectOption[] = [
  {
    label: 'Always on this date',
    value: 'always_on_this_date',
  },
  {
    label: 'Date changes annually',
    value: 'date_changes_annually',
  },
]

export const typeOptions: SelectOption[] = [
  {
    label: 'Information',
    value: 'information',
  },
  {
    label: 'Alert',
    value: 'alert',
  },
]

export const timeOptions: SelectOption[] = [
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1} am`,
    value: `${i + 1} am`,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1} pm`,
    value: `${i + 1} pm`,
  })),
]

export const countryOptions = Object.entries(country.all as Record<string, Country>).map(
  ([countryCode, country]) => {
    const dialingCode =
      country.dialing_code.indexOf('+') === 0 ? country.dialing_code : `+${country.dialing_code}`
    return {
      label: `${country.name} (${dialingCode})`,
      value: `${dialingCode}|${countryCode}`, // Use composite key to ensure uniqueness
    }
  },
)
