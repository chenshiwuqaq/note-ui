<template>
  <div class="common-layout">
    <el-container style="height: 96vh">
      <el-header style="height: 80px">
        <img :src="logoUrl" alt="logo" class="logo" />
        <div class="project-name">note</div>
      </el-header>
      <el-main>
        <el-menu
          :default-active="activeIndex"
          class="el-menu-vertical-demo"
          @select="handleSelect"
        >
          <el-menu-item index="1">
            <div class="nav-display">
              <el-icon><HomeFilled /></el-icon><span>主页</span>
            </div>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><EditPen /></el-icon>
            <span>笔记</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><Picture /></el-icon>
            <span>图片</span>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon><Operation /></el-icon>
            <span>待办</span>
          </el-menu-item>
          <el-menu-item index="5">
            <el-icon><Setting /></el-icon>
            <span>个人设置</span>
          </el-menu-item>
          <el-menu-item index="6">
            <el-icon><Connection /></el-icon>
            <span>引用链</span>
          </el-menu-item>
          <div class="left-nav">
            <a class="btn" @click="modelChange">切换</a>
          </div>
        </el-menu>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from 'vue-router';
import {
  Setting,
  Operation,
  HomeFilled,
  EditPen,
  Picture,
  Menu, Connection
} from "@element-plus/icons-vue";

const router = useRouter();

// 从 localStorage 中获取之前选中的 index，如果没有则默认选中第一个菜单项
const activeIndex = ref(localStorage.getItem('activeIndex') || '1');

const emit = defineEmits(["select"]); // 定义事件，用于向父组件传递选中的索引

// 菜单项点击事件
const handleSelect = (index: string) => {
  activeIndex.value = index;
  localStorage.setItem('activeIndex', index); // 存储选中的 index
  emit("select", index);

  // 根据 index 跳转到对应的路由
  switch (index) {
    case '1':
      router.push({ path: '/home' });
      break;
    case '2':
      router.push({ path: '/editor' });
      break;
    case '3':
      router.push({ path: '/picture' });
      break;
    case '4':
      router.push({ path: '/todo' });
      break;
    case '5':
      router.push({ path: '/setting' });
      break;
    case '6':
      router.push({path: '/chain'})
      break;
    default:
      router.push({ path: '/home' });
      break;
  }
};

const dark = ref(false);
const logoUrl = require("@/assets/imgs/GULULU-魔法球.png");

// 模式切换方法
const modelChange = () => {
  dark.value = !dark.value;
  if (dark.value) {
    window.document.documentElement.setAttribute("data-theme", "dark");
  } else {
    window.document.documentElement.setAttribute("data-theme", "light");
  }
};

// 初始化主题和路由
onMounted(() => {
  window.document.documentElement.setAttribute("data-theme", "light");

  // 初始化时跳转到对应路由
  const savedIndex = localStorage.getItem('activeIndex') || '1';
  handleSelect(savedIndex);
});
</script>

<style scoped>
.logo {
    width: 50px;
    height: 50px;
}

.project-name {
    font-weight: 600;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.el-header {
    --el-header-padding: 0;
}

.btn {
    /*font-size: 10px;*/
}

.el-main {
    width: 62px;
    padding: 0;
    box-shadow: 2px 0 6px rgba(49, 49, 49, 0.3);
    border-top-right-radius: 10px;
}

.el-menu {
    border: none;
}

.el-menu-item {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    line-height: 25px;
    color: #909399;
    height: 65px;
    transition: none !important;
    font-size: 12px;
}

.nav-display {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

}
</style>

<style scoped lang="scss">
@import '@/assets/scss/common.scss';

.el-main {
  @include background_color('background_color_leftNav');
}

.el-menu-item.is-active {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @include background_color('background_color_shadow');
  color: #fdfbfb;

}

.el-menu-item {
  @include background_color('background_color_leftNav');
}

.el-menu {
  @include background_color('background_color_leftNav');
}
</style>