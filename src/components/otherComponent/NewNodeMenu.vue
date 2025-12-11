<template>
  <!-- 遮罩层 -->
  <div class="overlay" @click="closeMenu"></div>
  <div class="add-node-menu">
    <div class="menu-content">
      <el-input v-model="nodeName" placeholder="请输入文件夹名称" />
      <div class="button-group">
        <el-button size="small" @click="closeMenu">取消</el-button>
        <el-button size="small" @click="saveNode">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { defineEmits } from 'vue';

const nodeName = ref('');
const emit = defineEmits(['save', 'close']);

const saveNode = () => {
  const name = nodeName.value.trim();
  if (name === '') {
    ElMessage({
      message: '请输入文件名称',
      type: 'warning',
    });
    return;
  }

  // 校验文件名长度
  const maxLength = 50; // 假设最大长度为 50
  if (name.length > maxLength) {
    ElMessage({
      message: `文件名称长度不能超过 ${maxLength} 个字符`,
      type: 'warning',
    });
    return;
  }

  // 校验文件名是否包含非法字符
  const invalidChars = /[\\/*?:"<>|]/;
  if (invalidChars.test(name)) {
    ElMessage({
      message: '文件名称不能包含以下字符：\\ / *? " < > |',
      type: 'warning',
    });
    return;
  }
  // 所有校验通过，触发 save 事件并传递节点名称
  emit('save', name);
};

const closeMenu = () => {
  // 触发 close 事件
  emit('close');
};
</script>

<style scoped>
/* 遮罩层样式 */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
    z-index: 3; /* 确保遮罩层在菜单下面一层 */
}

.add-node-menu {
    top: 40%;
    left: 50%;
    position: fixed;
    transform: translate(-50%, -50%);
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    z-index: 4;
    border-radius: 10px;
}

.menu-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.button-group {
    margin-top: 10px;
    display: flex;
    gap: 10px;
}

:deep(.el-button) {
    background-color: transparent;
    font-family: 'Jetbrains Mono', sans-serif;
}

:deep(.el-button:hover) {
    background-color: #303b2c;
}

:deep(.el-input__wrapper) {
    background-color: transparent;
    box-shadow: initial;
}

:deep(.el-input__inner) {
    color: #909399;
}
</style>

<style lang="scss" scoped>
@import "@/assets/scss/common";
.add-node-menu {
  @include background_color('background_color');
  @include inset_border_all('border_style_all');
}

.el-button {
  @include btn_color('text-color');
}
</style>