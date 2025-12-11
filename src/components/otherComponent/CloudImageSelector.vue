<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择图片"
    width="80%"
    :before-close="handleClose"
  >
    <div class="image-grid">
      <div v-for="(image, index) in images" :key="index" class="image-item" @click="selectImage(image)">
        <el-image
          :src="image.url"
          fit="cover"
          class="preview-image"
        />
        <div class="image-name">{{ image.name }}</div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', imageUrl: string): void;
}>();

const dialogVisible = ref(props.modelValue);
const images = ref<Array<{ url: string; name: string }>>([]);
const selectedImage = ref<string | null>(null);

// 监听 modelValue 的变化
watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue;
  if (newValue) {
    loadImages();
  }
});

// 监听 dialogVisible 的变化
watch(dialogVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const loadImages = async () => {
  try {
    const response = await axios.get('http://localhost:8002/picture/getPictureNameList', {
      params: { account: 111 }
    });
    
    if (response.data && response.data.data) {
      images.value = response.data.data.map((filename: string) => ({
        url: `http://47.121.202.205:3000/uploads/${filename}`,
        name: filename
      }));
    }
  } catch (error) {
    console.error('加载图片失败:', error);
    ElMessage.error('加载图片失败');
  }
};

const selectImage = (image: { url: string; name: string }) => {
  selectedImage.value = image.url;
};

const handleConfirm = () => {
  if (selectedImage.value) {
    emit('select', selectedImage.value);
    handleClose();
  } else {
    ElMessage.warning('请选择一张图片');
  }
};

const handleClose = () => {
  dialogVisible.value = false;
  selectedImage.value = null;
};

onMounted(() => {
  if (dialogVisible.value) {
    loadImages();
  }
});
</script>

<style scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  padding: 20px;
}

.image-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.image-item:hover {
  border-color: #409EFF;
  transform: scale(1.05);
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-name {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 