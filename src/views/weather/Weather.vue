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
      <h2 class="title">实时天气</h2>

      <div class="forecast-container">
        <div class="current-weather">
          <div class="city">{{ weather.now.name }}</div>
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
          <div class="forecast-icon">{{ day.textDay }}</div>
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

export default {
  name:"Weather",
  data() {
    return {
      weather: null,
      forecast: {
        days: []
      },
      loading: true,
      error: null
    };
  },
  mounted() {
    this.fetchWeather();
  },
  methods: {
    async fetchWeather() {
      const apiKey = process.env.VITE_QWEATHER_KEY;
      try {
        // 获取当前天气
        const currentResponse = await axios.get(
            "https://devapi.qweather.com/v7/weather/now",
            {
              params: {
                location: "101040100",
                key: "6b6ae2eec2204b22b5313a7d4f381156"
              }
            }
        );

        if (currentResponse.data.code !== "200") {
          throw new Error(`请求失败：${currentResponse.data.message}`);
        }

        this.weather = currentResponse.data;

        // 获取未来三天天气预报
        const forecastResponse = await axios.get(
            "https://devapi.qweather.com/v7/weather/3d",
            {
              params: {
                location: "101040100",
                key: "6b6ae2eec2204b22b5313a7d4f381156"
              }
            }
        );

        if (forecastResponse.data.code !== "200") {
          throw new Error(`请求失败：${forecastResponse.data.message}`);
        }

        this.forecast.days = forecastResponse.data.daily;
      } catch (error) {
        this.error = error.message;
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
    }
  }
};
</script>

<style scoped>
.weather-container {
  width: 500px;
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