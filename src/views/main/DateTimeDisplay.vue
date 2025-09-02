<template>
  <div class="date-time-display">
    <p>{{ formattedDateTime }}</p>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted, Ref } from 'vue';

export default {
  name: 'DateTimeDisplay',
  setup() {
    // 定义一个响应式变量来存储格式化后的日期和时间
    const formattedDateTime: Ref<string> = ref('');

    // 定义一个函数来获取当前日期和时间并格式化
    const updateDateTime = (): void => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      formattedDateTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 定义一个定时器变量
    let intervalId: number | undefined;

    // 在组件挂载时启动定时器
    onMounted(() => {
      updateDateTime(); // 立即更新一次
      intervalId = setInterval(updateDateTime, 1000); // 每秒更新一次
    });

    // 在组件卸载时清除定时器
    onUnmounted(() => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    });

    return {
      formattedDateTime,
    };
  },
};
</script>

<style scoped>
.date-time-display {
  display: block;
  text-align: left;
  color: #888;
  padding-left: 10px;
}
h1 {
  color: #333;
}
p {
  font-size: 12px;
  color: #666;
}
</style>