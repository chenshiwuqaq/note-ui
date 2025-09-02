<template>
  <el-card>
    <template #header>
      <div>
        <span>{{ props.nodeName }}</span>
      </div>
    </template>
    <p class="text item" @click="handleNewFolder">新建文件夹</p>
    <p class="text item" @click="handleUpload" v-if="showMenuUpload">上传图片</p>
    <p class="text item" @click="handleRename">重命名</p>
    <p class="text item" @click="handleDelete">删除</p>
  </el-card>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits} from 'vue';
import type { PropType } from 'vue';

// 定义 props
const props = defineProps({
  nodeName: {
    type: String as PropType<string>,
    required: true
  },
  showMenuUpload: {
    type: Boolean as PropType<boolean>,
    required: true
  },
});

// 定义 emits
const emit = defineEmits(['close-menu', 'upload', 'new-folder', 'rename', 'delete']);

// 处理新建文件夹事件
const handleNewFolder = () => {
  emit('new-folder', props.nodeName); // 发送选中的文件名和操作
  emit('close-menu'); // 关闭菜单
};

// 处理上传图片事件
const handleUpload = () => {
  emit('upload', props.nodeName); // 发送选中的文件名和操作
  emit('close-menu');
};

// 处理重命名事件
const handleRename = () => {
  emit('rename', props.nodeName); // 发送选中的文件名和操作
  emit('close-menu');
};

// 处理删除事件
const handleDelete = () => {
  emit('delete', props.nodeName); // 发送选中的文件名和操作
  emit('close-menu');
};
</script>

<style scoped>
.el-card {
    width: 180px;
    position: fixed;
    z-index: 5;
    font-size: 13px;
    color: #909399;
    text-align: left;
}

:deep(.el-card__header){
    padding: 8px 16px;
}

:deep(.el-card__body) {
     padding: 0;
}

.text.item {
    cursor: pointer;
    margin: 0;
    padding: 8px 16px;
}

.text.item:hover {
    color: #fdf8f8;
}
</style>

<style lang="scss" scoped>
@import '@/assets/scss/common.scss';
.el-card {
  @include background_color('background_color_menuCard');
}

.text.item:hover{
  @include background_color('background_color_shadow');
}
</style>