import type { SelectOption } from 'naive-ui'

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
