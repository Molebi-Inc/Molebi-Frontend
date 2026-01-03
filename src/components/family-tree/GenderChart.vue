<template>
  <div ref="chartContainer" class="w-full h-full relative min-h-[60px]">
    <!-- Empty state -->
    <div v-if="men === 0 && women === 0" class="w-full h-full flex items-center justify-center">
      <p class="text-xs text-gray-400">No data</p>
    </div>

    <!-- Chart container -->
    <div v-else class="w-full h-full" :key="`chart-${men}-${women}`">
      <canvas ref="chartCanvas" class="w-full h-full block"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
  Legend,
  Title,
  type ChartConfiguration,
  type TooltipItem,
} from 'chart.js'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend, Title)

interface Props {
  men: number
  women: number
  width?: number
  height?: number
  direction?: 'horizontal' | 'vertical'
  showLegend?: boolean
  showTooltip?: boolean
  animate?: boolean
  colors?: {
    men?: string
    women?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  width: 200,
  height: 60,
  direction: 'horizontal',
  showLegend: false,
  showTooltip: true,
  animate: true,
  colors: () => ({
    men: '#3b82f6',
    women: '#ec4899',
  }),
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: Chart | null = null
let resizeObserver: ResizeObserver | null = null
let isCreatingChart = false

const chartData = () => {
  const labels = ['Men', 'Women']
  const data = [props.men, props.women]

  return {
    labels,
    datasets: [
      {
        label: 'Gender Distribution',
        data,
        backgroundColor: [props.colors.men, props.colors.women],
        borderColor: [props.colors.men, props.colors.women],
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }
}

const chartOptions = (): ChartConfiguration<'bar'>['options'] => {
  const isHorizontal = props.direction === 'horizontal'

  return {
    indexAxis: isHorizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: props.showLegend,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: props.showTooltip,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
        titleFont: {
          size: 12,
          weight: 'bold',
        },
        bodyFont: {
          size: 11,
        },
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const label = context.dataset.label || ''
            const parsed = context.parsed as { x: number; y: number }
            const value = parsed[isHorizontal ? 'x' : 'y']
            const total = props.men + props.women
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280',
          precision: 0,
        },
        ...(isHorizontal
          ? {
              display: false,
            }
          : {
              display: true,
            }),
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280',
          precision: 0,
        },
        ...(isHorizontal
          ? {
              display: true,
            }
          : {
              display: false,
            }),
      },
    },
    animation: props.animate
      ? {
          duration: 800,
          easing: 'easeOutQuart',
        }
      : false,
  }
}

const createChart = async () => {
  if (!chartCanvas.value || !chartContainer.value || isCreatingChart) return

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  await nextTick()
  await new Promise((resolve) => requestAnimationFrame(resolve))

  // Wait for container to have dimensions
  const containerWidth = chartContainer.value.clientWidth
  const containerHeight = chartContainer.value.clientHeight

  // If container has no dimensions, set up observer and retry, but also proceed with fallback
  if (containerWidth === 0 || containerHeight === 0) {
    // Set up ResizeObserver to watch for container size changes
    if (!resizeObserver && chartContainer.value) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          if (width > 0 && height > 0 && chartInstance) {
            // Container now has dimensions, resize the chart
            chartInstance.resize()
            break
          } else if (width > 0 && height > 0 && !chartInstance && !isCreatingChart) {
            // Container now has dimensions and chart doesn't exist, create it
            createChart()
            break
          }
        }
      })
      resizeObserver.observe(chartContainer.value)
    }

    // Retry with exponential backoff (up to 3 attempts)
    let retryCount = 0
    const maxRetries = 3
    const retry = () => {
      if (retryCount < maxRetries && !chartInstance && !isCreatingChart) {
        retryCount++
        setTimeout(() => {
          if (chartContainer.value) {
            const w = chartContainer.value.clientWidth
            const h = chartContainer.value.clientHeight
            if (w > 0 && h > 0) {
              createChart()
            } else if (retryCount < maxRetries) {
              retry()
            }
          }
        }, 100 * retryCount)
      }
    }
    retry()

    // Don't return - proceed with chart creation using responsive mode
    // Chart.js will handle sizing when container gets dimensions
  }

  // Clean up ResizeObserver if chart is being created
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  isCreatingChart = true

  try {
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: chartData(),
      options: chartOptions(),
    }

    chartInstance = new Chart(chartCanvas.value, config)

    // Force resize after creation to ensure proper rendering
    await nextTick()
    if (chartInstance) {
      chartInstance.resize()
    }
  } catch (error) {
    console.error('Error creating chart:', error)
  } finally {
    isCreatingChart = false
  }
}

const updateChart = () => {
  if (!chartInstance) {
    // If chart doesn't exist yet, create it
    createChart()
    return
  }

  const options = chartOptions()
  if (options) {
    chartInstance.data = chartData()
    chartInstance.options = options
    chartInstance.update(props.animate ? 'active' : 'none')
  }
}

onMounted(() => {
  // Use multiple requestAnimationFrame calls to ensure DOM is fully rendered
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      createChart()
    })
  })
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

// Watch for prop changes and update chart
watch(
  () => [props.men, props.women, props.direction, props.showLegend, props.showTooltip],
  () => {
    updateChart()
  },
  { deep: true, immediate: false },
)

// Watch for when data becomes available and chart doesn't exist
watch(
  () => [props.men, props.women],
  () => {
    if ((props.men > 0 || props.women > 0) && !chartInstance && chartCanvas.value) {
      // Data is available but chart doesn't exist, create it
      requestAnimationFrame(() => {
        createChart()
      })
    }
  },
  { immediate: true },
)

watch(
  () => props.colors,
  () => {
    updateChart()
  },
  { deep: true },
)

watch(
  () => [props.width, props.height],
  () => {
    // Recreate chart when dimensions change significantly
    if (chartInstance) {
      createChart()
    }
  },
)
</script>

<style scoped>
canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  min-height: 60px;
  min-width: 200px;
}
</style>
