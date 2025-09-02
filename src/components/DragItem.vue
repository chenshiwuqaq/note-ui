<template>
  <!-- 绑定 ref="dragBox" 到最外层的 div -->
  <div ref="dragBox" class="d-flex" style="min-width: 250px; position: relative;">
    <div style="width: 100%; height: 100%;">
      <slot>默认信息</slot>
    </div>
    <!-- 拖拽条 -->
    <div v-if="resizeShow" class="resize" />
  </div>
</template>

<script setup lang="ts">
// 定义 props
const props = defineProps({
  // 控制拖拽条的是否显示，默认显示
  resizeShow: {
    type: Boolean,
    default: true
  }
});

</script>

<style scoped>
.resize {
    position: absolute;
    top: 0;
    right: 0;
    width: 2px;
    height: 100%;
    cursor: col-resize;
    z-index: 2;
}

.resize:hover {
    width: 3px;
    background-color: #80A492 !important;
}
</style>

<style lang="scss">
@import "@/assets/scss/theme.scss";
.resize {
  @include background_color('background_color_border');
}
</style>