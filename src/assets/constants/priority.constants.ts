export const priorityOptions = [
  {
    label: 'High Priority',
    value: 'high',
    color: '#ef4444', // red
    dot: true,
  },
  {
    label: 'Medium Priority',
    value: 'medium',
    color: '#f59e0b', // orange/amber
    dot: true,
  },
  {
    label: 'Low Priority',
    value: 'low',
    color: '#10b981', // green
    dot: true,
  },
]

// Helper to get priority option by value
export const getPriorityOption = (value: string) => {
  return priorityOptions.find((option) => option.value === value)
}
