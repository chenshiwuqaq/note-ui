<template>
  <div class="head-nav">
      <div class="head-nav-left">
      </div>
      <div class="head-nav-right">
        <div class="icon-nav-box"><el-icon class="icon-head-nav"><Bell /></el-icon></div>
        <div class="icon-nav-box" @click="toggleComponent"><el-icon class="icon-head-nav"><Grid /></el-icon></div>
        <div class="icon-nav-box"><el-icon class="icon-head-nav" ><StarFilled /></el-icon></div>
        <el-dropdown trigger="click" class="icon-nav-box">
          <el-icon class="icon-head-nav"><UserFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="toSetting" class="dropdown-item-box">
                <el-icon><Setting /></el-icon>
                <span>个人设置</span>
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item-box">
                <el-icon><BrushFilled /></el-icon>
                <span>主题设置</span>
              </el-dropdown-item>
              <el-dropdown-item @click="logout" class="dropdown-item-box">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
  </div>
  <WebsiteStar v-if="showComponent" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {Bell, Grid, StarFilled, Setting, BrushFilled, SwitchButton, UserFilled} from "@element-plus/icons-vue";
import WebsiteStar from '../views/WebsiteStar.vue'
import { useRouter } from 'vue-router';
import {useAuthStore} from "@/store/auth";

const router = useRouter();

//个人设置跳转
const toSetting = () =>{
  localStorage.setItem('activeIndex', '5');
  router.push('/setting');
}

//退出登录
const logout = () =>{
  const authStore = useAuthStore();
  localStorage.setItem('activeIndex', '1');
  authStore.clearToken();
}

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
    font-size: 20px;
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
.icon-head-nav{
  @include font_color('text-color');
}

.dropdown-item-box:hover {
  @include font_color('text-color');
  @include background_color('background_color_file');
}
.el-dropdown-menu {
  // 确保下拉菜单背景色使用主题
  @include background_color('background_color');

  .el-dropdown-menu__item {
    @include font_color('text-color3'); // 默认文字颜色

    // 移除默认的激活/选中状态背景色
    &:hover, &:focus {
      @include background_color('background_color_file');
      @include font_color('text-color');
    }

    // 移除激活状态的特殊样式
    &.is-active {
      @include background_color('background_color');
      @include font_color('text-color3');

      &:hover {
        @include background_color('background_color_file');
        @include font_color('text-color');
      }
    }

    // 移除点击后的焦点样式
    &:focus-visible {
      outline: none;
      @include background_color('background_color');
    }
  }
}
</style>