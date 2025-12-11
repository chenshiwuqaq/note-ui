<template>
  <div class="chart-wrapper" :style="wrapperStyle">
    <div ref="chartEl" class="chart-container"></div>
  </div>
  <div class="statistic-container">
    <p style="font-weight: bold;font-size: 20px;color:#888">今日统计</p>
    <!-- Words 统计项 -->
    <div class="stat-item">
      <div class="icon-section">
        <div class="icon-circle bg-yellow">Words</div>
      </div>
      <div class="text-section">
        <div class="stat-label">累计编辑字数</div>
        <div class="stat-value">{{totalWords}}</div>
      </div>
    </div>

    <!-- 分隔线 -->
    <el-divider class="custom-divider" />

    <!-- Size 统计项 -->
    <div class="stat-item">
      <div class="icon-section">
        <div class="icon-circle bg-green">Size</div>
      </div>
      <div class="text-section">
        <div class="stat-label">今日字数</div>
        <div class="stat-value">{{todayWords}}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import * as echarts from 'echarts/core'
import axios from "axios";

const totalWords = ref(0);
const todayWords = ref(0);
const dailyWordCounts = ref<number[]>([]);
const totalWordCounts = ref<number[]>([]);
// 按需注册组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

const props = withDefaults(defineProps<{
  // 基础尺寸（默认600x400）
  account: string;
  baseWidth?: number
  baseHeight?: number
  // 缩放比例
  scale?: number
  // 或直接指定尺寸
  width?: string | number
  height?: string | number
}>(), {
  baseWidth: 780,
  baseHeight: 350,
  scale: 1
})

const chartEl = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 计算容器尺寸
const wrapperStyle = computed(() => {
  if (props.width || props.height) {
    return {
      width: props.width,
      height: props.height
    }
  }
  return {
    width: `${props.baseWidth * props.scale}px`,
    height: `${props.baseHeight * props.scale}px`
  }
})

const initChart = (dailyData: number[] = [], totalData: number[] = []) => {
  if (!chartEl.value) return
  const recent5Days = generateRecent5Days();

  if (!chartInstance) {
    chartInstance = echarts.init(chartEl.value)
  }

  chartInstance.setOption({
    title: {
      text: '字数统计',
      left: 'left',
      textStyle: {
        fontSize: 22 * props.scale
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      textStyle: {
        fontSize: 10 * props.scale
      },
      top: 30,
      right: 80
    },
    xAxis: {
      type: 'category',
      data: recent5Days, // 使用 generateRecent5Days 确保日期匹配
      axisLabel: {
        fontSize: 14 * props.scale
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 14 * props.scale
      }
    },
    series: [
      {
        name: '每日',
        type: 'line',
        data: dailyData,
        itemStyle: { color: '#82A492' }
      },
      {
        name: '总计',
        type: 'line',
        data: totalData,
        itemStyle: { color: '#E5C461' }
      }
    ]
  }, true)
}
// 生成最近5天的日期（今天+前4天），格式为“月.日”
const generateRecent5Days = () => {
  const days = [];
  const today = new Date(); // 获取当前日期

  // 循环生成最近5天（今天为第0天，依次取前4天）
  for (let i = 4; i >= 0; i--) { // 从4天前开始，到今天结束，确保顺序是“前4天→今天”
    const date = new Date();
    date.setDate(today.getDate() - i); // 减去i天（i=4→4天前，i=0→今天）

    const month = date.getMonth() + 1; // 月份从0开始，需+1
    const day = date.getDate();

    // 格式化为“月.日”（如7.23、10.5）
    days.push(`${month}.${day}`);
  }
  return days;
};

const fetchAndRenderChartData = async () => {
  try {
    const response = await axios.get(`http://localhost:8003/WordCount/getRecentFiveDaysWords`, {
      params: { account: props.account }
    });

    // 后端返回的数据结构是 Result<Map<LocalDate, Integer>>
    const mapData = response.data.data;

    if (!mapData) {
      console.warn("未获取到近五日字数统计数据。");
      initChart([], []);
      return;
    }

    const dateEntries = Object.entries(mapData) as [string, number][];

    //按日期排序(确保从最旧的一天排到今天)
    dateEntries.sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

    //提取每日字数
    const dailyWords: number[] = dateEntries.map(([, wordCount]) => wordCount);

    //计算累计字数
    let cumulativeSum = 0;
    const totalWords: number[] = dailyWords.map(count => {
      cumulativeSum += count;
      return cumulativeSum;
    });

    // 5. **更新状态并渲染图表**
    dailyWordCounts.value = dailyWords;
    totalWordCounts.value = totalWords;
    initChart(dailyWords, totalWords);

  } catch (error) {
    console.error("获取近五日字数数据失败:", error);
    // 失败时，仍用空数据初始化图表
    initChart([], []);
  }
}

const resizeChart = () => {
  chartInstance?.resize()
}

onMounted(async () => {
  initChart()
  window.addEventListener('resize', resizeChart)
  try {
    console.log(props.account)
    const responseToday = await axios.get("http://localhost:8003/WordCount/get", {
      params: {
        account: props.account
      }
    });
    const responseTotal = await axios.get("http://localhost:8003/WordCount/getTotalWords", {
      params: {
        account: props.account
      }
    });
    todayWords.value = responseToday.data;
    totalWords.value = responseTotal.data;
  } catch (error) {
    console.error("获取每日字数失败:", error);
    return 0;
  }
})

onMounted(async () => {
  try {
    await fetchAndRenderChartData();

    window.addEventListener('resize', resizeChart);
  } catch (error) {
    console.error("初始化失败:", error);
  }
});

// 监听尺寸变化
watch(
    () => props.scale,
    () => {
      resizeChart()
    }
)
</script>

<style scoped>
.chart-wrapper {
  /*position: relative;*/
  display: inline-block;
  float: left
}
.chart-container {
  width: 100%;
  height: 100%;
}

.statistic-container{
  display: inline-block;
  float: left;
}

.content-wrapper {
  padding: 20px;
}

.title {
  color: #2c3e50;
  margin: 0 0 24px 0;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
}

.stat-item {
  display: flex;
  align-items: center;
  margin: 26px 0;
}

.icon-section {
  margin-right: 10px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
}

.bg-yellow {
  background: linear-gradient(135deg, #F0D795, #D5A61B);
}

.bg-green {
  background: linear-gradient(135deg, #B8CAC1, #779748);
}

.text-section {
  flex: 1;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-bottom: 6px;
}

.stat-value {
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.custom-divider {
  margin: 12px 0;
  background-color: #ecf0f1;
}
</style>