<template>
  <div class="common-layout" id="darkMode">
    <el-container style="height: 100vh">
      <el-header height="4vh">
        <HeadNav></HeadNav>
      </el-header>
      <el-container>
        <el-aside width="68px">
          <LeftNav></LeftNav>
        </el-aside>
        <el-main>
          <EditorComponent></EditorComponent>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import LeftNav from "@/components/LeftNav.vue";
import HeadNav from "@/components/HeadNav.vue";
import EditorComponent from "@/components/EditorComponent.vue";
</script>

<style scoped>
.el-main {
    padding: 0;
}
</style>

<style scoped lang="scss">
@import '@/assets/scss/common.scss';

#darkMode {
  // 在此使用了背景颜色变量
  @include background_color('background_color');
  // 再次使用了文字颜色变量
  @include font_color('text-color');
  font-family: 'Jetbrains Mono', sans-serif;
}
</style>