import country from 'country-list-js'
import type { SelectOption } from 'naive-ui'
import type { Country } from '@/types/general.types'
import { getCountryFlag } from 'country-phonecode-flag/dist'

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

export const countryOptions = Object.entries(country.all as Record<string, Country>)
  .map(([countryCode, country]) => {
    const dialingCode =
      country.dialing_code.indexOf('+') === 0 ? country.dialing_code : `+${country.dialing_code}`
    const fullLabel = `${country.name} (${dialingCode})`
    const flag = getCountryFlag(countryCode)
    return {
      // What is shown in the dropdown list
      label: `${flag ?? '🏁'} ${fullLabel}`,
      // Unique value (code + ISO) to avoid duplicate warnings
      // We still derive the pure dialing code from this in the form logic
      value: `${dialingCode}|${countryCode}`,
      countryCode,
      countryName: country.name,
      dialingCode,
      fullLabel,
      flag: flag ?? '🏁',
    } as SelectOption & {
      countryCode: string
      countryName: string
      dialingCode: string
      fullLabel: string
      flag: string
    }
  })
  // Sort options alphabetically by country name
  .sort(
    (a: SelectOption & { countryName?: string }, b: SelectOption & { countryName?: string }) => {
      const nameA = (a.countryName || '').toLowerCase()
      const nameB = (b.countryName || '').toLowerCase()
      return nameA.localeCompare(nameB)
    },
  )
