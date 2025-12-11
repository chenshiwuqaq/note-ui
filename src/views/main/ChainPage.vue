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
          <Chain></Chain>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import LeftNav from "@/components/LeftNav.vue";
import HeadNav from "@/components/HeadNav.vue";
import HomeComponent from "@/components/HomeComponent.vue";
import Chain from "@/components/ChainComponent.vue";
</script>

<style scoped>
.el-main {
  padding: 0;
}
</style>

<style scoped lang="scss">
@import '@/assets/scss/common.scss';

#darkMode {
  @include background_color('background_color');
  @include font_color('text-color');
  font-family: 'Jetbrains Mono', sans-serif;
}
</style>