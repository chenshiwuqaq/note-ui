<template>
  <div class="weather-container">
    <div v-if="loading" class="loading">
      <p>正在加载天气数据...</p>
      <div class="spinner"></div>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else>
      <h2 class="title">{{ cityName }}</h2>

      <div class="forecast-container">
        <div class="current-weather">
          <div class="city">{{}}</div>
          <div class="condition">当前 {{ weather.now.text }}</div>
          <div class="temperature">
            室外温度：{{ weather.now.temp }}°C
          </div>
        </div>
        <div
            class="forecast-item"
            v-for="(day, index) in forecast.days"
            :key="index"
        >
          <div class="forecast-date">{{ formatDate(day.fxDate) }}</div>
          <div class="forecast-icon">{{ getWeatherIcon(day.textDay)  }}</div>
          <div class="forecast-temperature">
            {{ day.tempMax }}°C / {{ day.tempMin }}°C
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from '@/store/auth'; // 引入 auth store

export default {
  name:"Weather",
  data() {
    return {
      weather: null,
      forecast: {
        days: []
      },
      loading: true,
      error: null,
      weatherCode: '',
      cityName: '',
      authStore: useAuthStore() // 将 store 实例挂载到 this 上
    };
  },
  // 在 created 钩子中初始化 weatherCode
  created() {
    this.weatherCode = this.authStore.weatherCode;
    this.cityName = this.authStore.cityName;
  },
  // 监听 store 中 weatherCode 的变化
  watch: {
    // 监听 authStore 实例上的 weatherCode 属性
    'authStore.weatherCode': {

      handler(newCode) {
        console.log('天气编码变化:', newCode); // 检查是否打印新编码
        if (newCode) {
          this.weatherCode = newCode;
          this.fetchWeather();
        }
      },
      immediate: true // 立即执行一次
    },
    // 新增监听城市名变化
    'authStore.cityName': {
      handler(newName) {
        console.log('城市名变化:', newName);
        this.cityName = newName;
      },
      immediate: true
    }
  },
  mounted() {
    this.fetchWeather();
  },
  methods: {
    async fetchWeather() {
      const apiKey = process.env.VITE_QWEATHER_KEY;
      // 如果没有 weatherCode，则不发起请求
      if (!this.weatherCode) {
        this.error = "未获取到城市ID";
        this.loading = false;
        return;
      }
      try {
        // 获取当前天气
        const currentResponse = await axios.get(
            "https://devapi.qweather.com/v7/weather/now",
            {
              params: {
                location: this.weatherCode,
                key: "6b6ae2eec2204b22b5313a7d4f381156"
              }
            }
        );
        console.log("Current weather:", currentResponse.data)
        // 处理和风天气API返回的错误码
        if (currentResponse.data.code !== "200") {
          const errorMessages = {
            "400": "请求参数错误，请检查城市设置",
            "401": "天气服务授权失败",
            "403": "天气服务权限不足",
            "404": "未找到该城市的天气信息",
            "500": "天气服务服务器错误",
            "502": "天气服务暂时不可用",
            "503": "天气服务过载，请稍后再试"
          };
          throw new Error(errorMessages[currentResponse.data.code] ||
              `天气查询失败：${currentResponse.data.message || '未知错误'}`);
        }

        this.weather = currentResponse.data;

        // 获取未来三天天气预报
        const forecastResponse = await axios.get(
            "https://devapi.qweather.com/v7/weather/3d",
            {
              params: {
                location: this.weatherCode,
                key: "6b6ae2eec2204b22b5313a7d4f381156"
              }
            }
        );

        if (forecastResponse.data.code !== "200") {
          // 复用上面定义的错误信息映射
          const errorMessages = {
            "400": "请求参数错误，请检查城市设置",
            "401": "天气服务授权失败",
            "403": "天气服务权限不足",
            "404": "未找到该城市的天气信息",
            "500": "天气服务服务器错误",
            "502": "天气服务暂时不可用",
            "503": "天气服务过载，请稍后再试"
          };
          throw new Error(errorMessages[forecastResponse.data.code] ||
              `天气预报查询失败：${forecastResponse.data.message || '未知错误'}`);
        }

        this.forecast.days = forecastResponse.data.daily;
      } catch (error)  {
        // 处理网络错误和其他异常
        if (error.response) {
          // 处理HTTP状态码错误
          this.error = `天气服务异常 (${error.response.status})，请稍后再试`;
        } else if (error.request) {
          // 处理无响应错误
          this.error = "无法连接到天气服务，请检查网络";
        } else {
          // 处理其他错误（包括我们主动抛出的错误）
          this.error = error.message;
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    refreshWeather() {
      this.fetchWeather();
    },
    // 获取天气图标
    getWeatherIcon(weatherText) {
      const iconMap = {
        '晴': '☀️',
        '多云': '⛅',
        '阴': '☁️',
        '小雨': '🌧️',
        '雪': '❄️',
        '雷阵雨': '⛈️',
        '雾': '🌫️'
      };
      return iconMap[weatherText] || '🌤️';
    },
  }
};
</script>

<style scoped>
.weather-container {
  width: 550px;
  height: 200px;
  margin: 0 auto;
  font-family: "Segoe UI", sans-serif;
}

.title {
  color: #888;;
  text-align: left;
  padding: 30px 0 10px 40px;
  margin: 0;
}

.loading {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

.error {
  color: #e74c3c;
  text-align: center;
  padding: 20px;
}

.current-weather {
  background-color: #B8CAC1;
  padding: 30px 20px 30px 20px;
  border-radius: 8px;
}

.city {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.condition {
  font-weight: bold;
  color: #888888;
  font-size: 20px;
  margin-bottom: 15px;
}

.temperature {
  color: #888888;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}


.forecast-container {
  display: flex;
  justify-content: space-between;
}

.forecast-item {
  flex: 1;
  background-color: #F1F1F1;
  padding: 15px;
  border-radius: 8px;
  min-width: 85px;
  margin: 0 5px;
  text-align: center;
}

.forecast-date {
  font-weight: bold;
  margin-bottom: 12px;
}

.forecast-icon {
  font-size: 20px;
  margin-bottom: 20px;
}

.forecast-temperature {
  font-size: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>