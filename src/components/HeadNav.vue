<template>
  <div class="head-nav">
      <div class="head-nav-left">
      </div>
      <div class="head-nav-right">
        <div class="icon-nav-box"><el-icon class="icon-head-nav"><Bell /></el-icon></div>
        <div class="icon-nav-box" @click="toggleComponent"><el-icon class="icon-head-nav"><Grid /></el-icon></div>
        <div class="icon-nav-box"><el-icon class="icon-head-nav" ><StarFilled /></el-icon></div>
      </div>
  </div>
  <WebsiteStar v-if="showComponent" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Grid, StarFilled } from "@element-plus/icons-vue";
import WebsiteStar from '../views/WebsiteStar.vue'

// 控制显示的状态
const showComponent = ref(false)

// 点击切换显示状态
const toggleComponent = () => {
  showComponent.value = !showComponent.value
}
</script>

<style scoped>
.head-nav {
    margin: 5px auto;
}

.head-nav-right {
    display: flex;
    float: right;
}

.icon-head-nav {
    cursor: pointer;
    font-size: 16px;
    padding: 5px;
    border-radius: 10px;
}
</style>

<style lang="scss">
@import '@/assets/scss/common.scss';
.icon-nav-box :hover {
  @include font_color('text-color1');
  @include background_color('background_color_shadow');
}
</style>