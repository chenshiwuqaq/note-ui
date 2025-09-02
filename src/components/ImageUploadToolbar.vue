<template>
  <ModalToolbar
    title="图片上传"
    :visible="showImageModal"
    width="80%"
    height="80%"
    :showAdjust="true"
    :isFullscreen="isFullscreen"
    @onClick="handleImageButtonClick"
    @onClose="handleImageModalClose"
    @onAdjust="handleImageModalAdjust"
  >
    <template #modalTitle>
      <div class="modal-title">
        <span>图片上传</span>
        <el-radio-group v-model="uploadType" size="small">
          <el-radio-button label="local">本地上传</el-radio-button>
          <el-radio-button label="cloud">云服务器图库</el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <template #trigger>
      <el-icon><Picture /></el-icon>
    </template>
    <div class="image-upload-content">
      <div v-if="uploadType === 'local'" class="local-upload">
        <el-upload
          class="upload-demo"
          drag
          action="http://47.121.202.205:3000/upload"
          :data="{ account: Account }"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
        </el-upload>
      </div>
      <div v-else class="cloud-images">
        <div class="image-grid">
          <div
            v-for="(image, index) in cloudImages"
            :key="index"
            class="image-item"
            @click="selectCloudImage(image)"
          >
            <el-image
              :src="image.url"
              fit="cover"
              class="preview-image"
            />
            <div class="image-name">{{ image.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </ModalToolbar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ModalToolbar } from 'md-editor-v3';
import { Picture, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { useAuthStore } from "@/store/auth";

const showImageModal = ref(false);
const isFullscreen = ref(false);
const uploadType = ref('local');
const cloudImages = ref<Array<{ url: string; name: string }>>([]);
const selectedCloudImage = ref<string | null>(null);
const authStore = useAuthStore();
const token = ref(authStore.token);
const Account = ref("");
const AccountNumber = computed(() => Number(Account.value) || 0);
// 获取账户信息
const getAccount = async () => {
  if (!token.value) {
    console.error('Token为空');
    return null;
  }

  try {
    const res = await axios.post('http://localhost:8005/token/getAccount', {
      token: token.value
    });
    Account.value = res.data;
    console.log('获取到的账户:', Account.value);
    return Account.value; // 返回账户信息
  } catch (error) {
    console.error('获取账户信息失败:', error);
    ElMessage.error('获取账户信息失败');
    return null;
  }
};
onMounted(async () => {
  await getAccount();
})
// 处理图片按钮点击
const handleImageButtonClick = () => {
  showImageModal.value = true;
  if (uploadType.value === 'cloud') {
    loadCloudImages();
  }
};

// 处理模态框关闭
const handleImageModalClose = () => {
  showImageModal.value = false;
  uploadType.value = 'local';
  selectedCloudImage.value = null;
};

// 处理模态框全屏
const handleImageModalAdjust = (value: boolean) => {
  isFullscreen.value = value;
};

// 加载云服务器图片
const loadCloudImages = async () => {
  try {
    const response = await axios.get('http://localhost:8002/picture/getPictureNameList', {
      params: { account: AccountNumber }
    });
    
    if (response.data && response.data.data) {
      cloudImages.value = response.data.data.map((filename: string) => ({
        url: `http://47.121.202.205:3000/uploads/${filename}`,
        name: filename
      }));
    }
  } catch (error) {
    console.error('加载图片失败:', error);
    ElMessage.error('加载图片失败');
  }
};

// 选择云服务器图片
const selectCloudImage = (image: { url: string; name: string }) => {
  selectedCloudImage.value = image.url;
  const imageMarkdown = `![图片](${image.url})`;
  emit('insert', imageMarkdown);
  handleImageModalClose();
};

// 上传前检查
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }
  return true;
};

// 上传成功处理
const handleUploadSuccess = (response: any) => {
  if (response.file) {
    const imageUrl = `http://47.121.202.205:3000/uploads/${response.file.filename}`;
    const imageMarkdown = `![图片](${imageUrl})`;
    emit('insert', imageMarkdown);
    ElMessage.success('上传成功');
    handleImageModalClose();
  } else {
    ElMessage.error('上传失败');
  }
};

// 上传失败处理
const handleUploadError = () => {
  ElMessage.error('上传失败');
};

// 监听上传类型变化
watch(uploadType, (newValue) => {
  if (newValue === 'cloud') {
    loadCloudImages();
  }
});

const emit = defineEmits(['insert']);
</script>

<style scoped>
.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.image-upload-content {
  padding: 20px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.local-upload {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.cloud-images {
  height: 100%;
}

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
</style> 