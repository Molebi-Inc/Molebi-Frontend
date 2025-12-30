<template>
  <div class="w-full h-full relative">
    <!-- Empty state -->
    <div v-if="men === 0 && women === 0" class="w-full h-full flex items-center justify-center">
      <p class="text-xs text-gray-400">No data</p>
    </div>

    <!-- Chart container -->
    <canvas v-else ref="chartCanvas" :width="width" :height="height" class="w-full h-full"></canvas>
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
let chartInstance: Chart | null = null

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
  if (!chartCanvas.value) return

  await nextTick()

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: chartData(),
    options: chartOptions(),
  }

  chartInstance = new Chart(chartCanvas.value, config)
}

const updateChart = () => {
  if (!chartInstance) return

  chartInstance.data = chartData()
  chartInstance.options = chartOptions()
  chartInstance.update(props.animate ? 'active' : 'none')
}

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
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
  { deep: true },
)

watch(
  () => props.colors,
  () => {
    updateChart()
  },
  { deep: true },
)
</script>

<style scoped>
canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
