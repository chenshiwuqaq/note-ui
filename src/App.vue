<template>
  <div id="app">
<!--    <div class="live2d-wrapper">-->
<!--    </div>-->
    <router-view></router-view>
  </div>
</template>
<script setup>

import { onMounted, onUnmounted, ref } from "vue";

const live2dScript = ref(null)
const isLoaded = ref(false)
const originalMouseEvent = ref(null)

// onMounted(() => {
//   // 保存原始的鼠标事件处理函数
//   originalMouseEvent.value = window.addEventListener('mousemove', handleMouseMove)
//
//   // 加载live2d脚本
//   const existingScript = document.querySelector('script[src="https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0-rc.6/dist/autoload.js"]')
//
//   if (!existingScript) {
//     const script = document.createElement('script')
//     script.src = 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0-rc.6/dist/autoload.js'
//     script.async = true
//
//     // 监听脚本加载完成事件
//     script.onload = () => {
//       isLoaded.value = true
//       console.log('live2d脚本加载完成')
//     }
//
//     // 监听脚本加载错误
//     script.onerror = (err) => {
//       console.error('live2d脚本加载失败:', err)
//     }
//
//     document.body.appendChild(script)
//     live2dScript.value = script
//   }
//
//   // 添加样式
//   const style = document.createElement('style')
//   style.textContent = `
//     #live2d-widget {
//       z-index: 9999 !important;
//       right: 30px !important;
//       bottom: 30px !important;
//     }
//   `
//   document.head.appendChild(style)
// })

// 自定义鼠标移动处理函数，添加加载状态判断
// function handleMouseMove(e) {
//   // 只有当模型加载完成后才允许事件传递
//   if (isLoaded.value) {
//     // 如果需要可以在这里添加自定义交互逻辑
//   }
// }
//
// onUnmounted(() => {
//   // 移除脚本
//   if (live2dScript.value) {
//     document.body.removeChild(live2dScript.value)
//   }
//
//   // 移除live2d元素
//   const live2dElement = document.getElementById('live2d-widget')
//   if (live2dElement) {
//     live2dElement.remove()
//   }
//
//   // 移除事件监听
//   if (originalMouseEvent.value) {
//     window.removeEventListener('mousemove', handleMouseMove)
//   }
//
//   // 清除可能的全局变量
//   if (window.live2d) {
//     window.live2d = null
//   }
// })
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
