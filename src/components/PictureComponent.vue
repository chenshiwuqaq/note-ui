<template>
  <div class="common-layout">
    <el-container style="height: 96vh">
      <DragBox class="drag-box" >
        <DragItem style="width: 15%;">
          <el-aside style="width: auto">
            <div class="file-icon-box">
              <el-icon class="file-icon" @click="newFile">
                <FolderAdd />
              </el-icon>
              <el-icon class="file-icon">
                <Search />
              </el-icon>
              <el-icon class="file-icon" @click="refreshFileNode">
                <Refresh />
              </el-icon>
              <el-icon class="file-icon">
                <Fold />
              </el-icon>
            </div>
            <NewNodeMenu
              v-if="showNewNodeMenu"
              @close="closeNewNodeMenu"
              @save="newNodeToTree"
            />
            <div class="file-folder">
              <el-tree
                :data="fileTreeData"
                :props="defaultProps"
                @node-click="handleNodeClick"
                @node-contextmenu="handleNodeContextMenu"
              >
                <!-- 使用 scoped slot 自定义节点内容 -->
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <el-icon style="margin-right: 5px"><Folder /></el-icon>
                    <span>{{ node.label }}</span>
                  </span>
                </template>
              </el-tree>
              <MenuCard
                v-if="showMenuCard"
                ref="menuCardRef"
                :style="{ left: menuCardPosition.left + 'px', top: menuCardPosition.top + 'px' }"
                :nodeName="clickRightNodeName"
                :showMenuUpload="clickRightNodeUpload"
                @close-menu="closeMenuCard"
                @new-folder="handleNewFolder"
                @upload="handleUpload"
                @rename="handleReName"
                @delete="handleDelete"
              />
            </div>
            <div>
              <el-upload
                ref="uploadRef"
                v-model:file-list="fileList"
                class="upload-demo"
                action="http://47.121.202.205:3000/upload"
                multiple
                :limit="10"
                :on-exceed="handleExceed"
                :before-upload="beforeAvatarUpload"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                :data="{ account: account }"
              >
              </el-upload>
            </div>
          </el-aside>
        </DragItem>
        <DragItem style="width: 85%" :resizeShow="false">
          <el-container>
            <el-main>
              <el-card shadow="always" class="img-card">
                <div class="btn-size">
                  <el-radio-group v-model="imageSize" size="small" style="margin-right: 10px">
                    <el-radio-button label="图片" value="图片" disabled />
                    <el-radio-button label="小" value="小" />
                    <el-radio-button label="大" value="大" />
                  </el-radio-group>
                  <el-button size="small" @click="refresh">刷新</el-button>
                  <el-button size="small" @click="toggleBatchDeal">批量处理</el-button>
                </div>
                <div class="btn-deal" v-if="showBatchDeal">
                  <el-checkbox v-model="selectAll" @change="handleSelectAll" label="全选" />
                  <el-button size="small" round>移动</el-button>
                  <el-button size="small" round @click="dialogPictureVisible=true">删除</el-button>
                </div>
              </el-card>
              <div class="show-pic">
                <div class="image-section">
                  <h3>横向图片</h3>
                  <div class="image-grid landscape-grid">
                    <div v-for="(url, index) in landscapeImages" :key="'landscape-'+index" class="image-container">
                      <el-checkbox
                        v-model="selectedImages[index]"
                        class="image-checkbox"
                      />
                      <el-image
                        ref="landscapeImageRefs"
                        :src="url"
                        :preview-src-list="[]"
                        :initial-index="index"
                        fit="contain"
                        :class="['uploaded-image', imageSize]"
                        @dblclick="handlePreview(index, 'landscape')"
                      />
                      <div class="image-name" @click="startEditImageName(index, 'landscape', $event)">
                        <template v-if="editingImageIndex === index && editingImageType === 'landscape'">
                          <el-input
                            v-model="editingImageName"
                            size="small"
                            @blur="saveImageName(index, 'landscape')"
                            @keyup.enter="saveImageName(index, 'landscape')"
                            @keyup.esc="cancelEdit"
                            ref="nameInput"
                          />
                        </template>
                        <template v-else>
                          {{ pictureNameList[index] }}
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="image-section">
                  <h3>纵向图片</h3>
                  <div class="image-grid portrait-grid">
                    <div v-for="(url, index) in portraitImages" :key="'portrait-'+index" class="image-container">
                      <el-checkbox
                        v-model="selectedImages[index]"
                        class="image-checkbox"
                      />
                      <el-image
                        ref="portraitImageRefs"
                        :src="url"
                        :preview-src-list="[]"
                        :initial-index="index"
                        fit="cover"
                        :class="['uploaded-image', imageSize]"
                        @dblclick="handlePreview(index, 'portrait')"
                      />
                      <div class="image-name" @click="startEditImageName(index, 'portrait', $event)">
                        <template v-if="editingImageIndex === index && editingImageType === 'portrait'">
                          <el-input
                            v-model="editingImageName"
                            size="small"
                            @blur="saveImageName(index, 'portrait')"
                            @keyup.enter="saveImageName(index, 'portrait')"
                            @keyup.esc="cancelEdit"
                            ref="nameInput"
                          />
                        </template>
                        <template v-else>
                          {{ pictureNameList[index] }}
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-main>
            <el-footer class="pic-path">文件路径：{{ filepath }}</el-footer>
          </el-container>
        </DragItem>
      </DragBox>
      <el-dialog
        v-model="dialogVisible"
        width="30%"
      >
        <span>确定要删除文件夹</span>
        <span class="word-color">{{ clickRightNodeName }}</span>
        <span>吗？删除之后不可撤销</span>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDelete">确定</el-button>
        </template>
      </el-dialog>
      <el-dialog
        v-model="dialogPictureVisible"
        width="30%"
      >
        <span>确定要删除已选择图片吗？删除之后不可撤销</span>
        <template #footer>
          <el-button @click="dialogPictureVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDeletePicture">确定</el-button>
        </template>
      </el-dialog>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import DragBox from "@/components/DragBox.vue";
import DragItem from "@/components/DragItem.vue";
import { Fold, Folder, FolderAdd, Refresh, Search } from "@element-plus/icons-vue";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import type { UploadProps, UploadUserFile, UploadFile, UploadFiles } from "element-plus";
import { ElMessage, ElImageViewer } from "element-plus";
import NewNodeMenu from "@/components/NewNodeMenu.vue";
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import MenuCard from "@/components/MenuCard.vue";
import { ElUpload } from 'element-plus';
import type { AxiosResponse } from 'axios';
import { createApp, h } from 'vue';
import { useAuthStore } from "@/store/auth";

// 创建端口为 8002 的 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8002'
});
const pictureNameList = ref<string[]>([]);
const pictureUrls = ref<string[]>([]);
const serverUrl = 'http://47.121.202.205:3000/uploads/';
const imageSize = ref("小");
const selectAll = ref(false);
const selectedImages = ref<boolean[]>([]);
const showBatchDeal = ref(false);
let showNewNodeMenu = ref(false);
const fileTreeData = ref<TreeNode[]>([]);
let clickLeftNode = ref<TreeNode | null>(null);
const menuCardRef = ref<InstanceType<typeof MenuCard> | null>(null);
const uploadRef = ref<InstanceType<typeof ElUpload> | null>(null);
const authStore = useAuthStore();
const token = ref(authStore.token);
const Account = ref("");
const account = computed(() => Number(Account.value) || 0);
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
  if (Account.value) {
    await fetchFileTreeData();
  }
})
interface ApiResponse {
  data: number;
}

// 添加图片方向信息存储
const imageOrientations = ref<{ [key: string]: 'landscape' | 'portrait' }>({});

// 获取文件树数据
const fetchFileTreeData = async () => {
  try {
    const response = await axiosInstance.get("/picture/getNodeTree", { params: { account: account.value } });
    fileTreeData.value = response.data.data[0].children;
  } catch (error) {
    ElMessage.error("文件加载失败");
  }
};

// 刷新操作
const refreshFileNode = () => {
  ElMessage.success("刷新文件目录成功");
  fetchFileTreeData();
};

// 切换批量处理
const toggleBatchDeal = () => {
  showBatchDeal.value = !showBatchDeal.value;
};

interface TreeNode {
  fileName: string;
  level: string;
  children?: TreeNode[];
  key?: string | number;
  label?: string;
  data?: any;
}

// 处理树节点点击事件
const filepath = ref("/");

const handleNodeClick = (data: TreeNode) => {
  clickLeftNode = ref(data);
  axiosInstance.get("/picture/getFilepath", {
    params: { account: account.value, level: clickLeftNode.value?.level }
  }).then((response: { data: { data: any; } | null; }) => {
    if (response.data !== null) {
      filepath.value = response.data.data;
      getPictureList();
    } else {
      ElMessage.error("文件加载失败");
    }
  });
};

// 修改获取图片列表的函数
const getPictureList = async () => {
  try {
    const response = await axiosInstance.get("/picture/getPictureNameList", {
      params: { account: account.value, level: clickLeftNode.value?.level }
    });
    
    if (response.data !== null) {
      pictureNameList.value = response.data.data;
      pictureUrls.value = pictureNameList.value.map(filename => serverUrl + filename);
      selectedImages.value = pictureNameList.value.map(() => false);
      
      // 清空之前的图片方向信息
      imageOrientations.value = {};
      
      // 检查所有图片的方向
      await Promise.all(pictureUrls.value.map(url => checkImageOrientation(url)));
    } else {
      ElMessage.error("图片加载失败");
    }
  } catch (error) {
    console.error("获取图片列表失败:", error);
    ElMessage.error("图片加载失败");
  }
};

const defaultProps = {
  children: "children",
  label: "fileName",
  level: "level"
};

const fileList = ref<UploadUserFile[]>([
])

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
    `一次最多只能上传10张图片, 您已经选择了 ${files.length} 张图片`
  )
}

// 文件上传前的验证
const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile: File) => {
  const validTypes = ["image/jpeg", "image/png"];
  if (!validTypes.includes(rawFile.type)) {
    ElMessage.error("文件格式必须是 JPG 或 PNG!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("文件大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 初始化 pictureList 为空数组
const pictureList = ref<Array<{
  eid: number | null;
  fileName: string;
  path: string;
  url: string;
  size: number;
  createDatetime: string;
  account: number;
  updateDatetime: string;
  level: string;
}>>([]);

let fileChildren :number = 0;

const handleUploadSuccess = async (response: any, file: UploadUserFile, fileList: UploadUserFile[]) => {
  const isExist = pictureList.value.some((item) => item.fileName === file.name);
  if (!isExist) {
    const newLevel = await generateNewPicLevel();
    pictureList.value = [];
    pictureList.value.push({
      eid: null,
      fileName: response?.file?.filename || '',
      path: '',
      url: response?.file?.path || '',
      size: response?.file?.size || 0,
      createDatetime: new Date().toISOString(),
      account: account.value,
      updateDatetime: new Date().toISOString(),
      level: newLevel,
    });
    console.log(pictureList.value);
    // 直接发送 pictureList 数组
    try {
      const uploadResponse = await axiosInstance.post("/picture/upload", pictureList.value);
      if (uploadResponse.data.data === -1) {
        ElMessage.error("上传失败，文件名重复");
      } else {
        // todo 只在所有文件上传完成后显示一次成功提示
        // if (fileList.length === pictureList.value.length) {
          ElMessage.success("上传成功");
        // }
      }
    } catch (error) {
      console.error("上传失败:", error);
      ElMessage.error("上传失败");
    }
  }

  await fetchFileTreeData();
};

const generateNewPicLevel = async () => {
  const currentLevel = clickLeftNode.value?.level || "01";
  if (clickLeftNode.value) {
    await getFileChildren();
    let length = fileChildren;
    if (length > 99) {
      ElMessage.error("节点层级已满");
      throw new Error("节点层级已满");
    }
    const lengthStr = length.toString().padStart(2, "0");
    return currentLevel + lengthStr;
  }
  return currentLevel + "00"; // 默认值
};

const getFileChildren = async () => {
  try {
    const response = await axiosInstance.get("/picture/getFileChildren", {
      params: {
        account: account.value,
        level: clickLeftNode.value?.level
      }
    });
    // 校验响应状态码
    if (response.data.data === -1) {
      ElMessage.error("获取文件树失败");
    } else {
      fileChildren = response.data.data + 1;
    }
  } catch (error) {
    console.error("获取文件树时出错:", error);
  }
};
// 文件上传失败处理
const handleUploadError = (error: Error, file: UploadFile, fileList: UploadFiles) => {
  ElMessage.error("文件上传失败");
};

// 添加新节点到树中
let renameNode = false;
const newNodeToTree = (nodeName: string) => {
  if (renameNode) {
    renameNodeToTree(nodeName);
  } else {
    addNewNodeToTree(nodeName);
  }
};

const closeNewNodeMenu = () => {
  showNewNodeMenu.value = false;
  renameNode = false;
};
// 添加新节点到树中
const addNewNodeToTree = (nodeName: string) => {
  const newNode: TreeNode = {
    fileName: nodeName,
    level: generateNewLevel(),
    children: []
  };
  fileTreeData.value.push(newNode);
  showNewNodeMenu.value = false;

  axiosInstance.post<ApiResponse>("/picture/addNewNode", newNode, {
    params: {
      account: account.value
    }
  })
    .then((response: AxiosResponse<ApiResponse>) => {
      if (response.data.data === -1) {
        ElMessage.error("新建文件夹失败，文件名重复");
      } else {
        ElMessage.success("新建文件夹成功");
      }
      fetchFileTreeData();
    })
    .catch((error: Error) => {
      ElMessage.error("新建文件夹失败: " + (error.message || "未知错误"));
      fetchFileTreeData();
    });
};

// 重命名节点到树中
const renameNodeToTree = (nodeName: string) => {
  if (clickLeftNode.value) {
    clickLeftNode.value.fileName = nodeName;
    showNewNodeMenu.value = false;
    axiosInstance.post<ApiResponse>("/picture/renameNode", clickLeftNode.value, {
      params: {
        account: account.value
      }
    })
      .then((response: AxiosResponse<ApiResponse>) => {
        if (response.data.data === -1) {
          ElMessage.error("重命名文件夹失败，文件名重复");
        } else if (response.data.data === 0) {
          ElMessage.error("重命名文件夹失败");
        } else if (response.data.data === 1) {
          ElMessage.success("重命名文件夹成功");
        }
        fetchFileTreeData();
      });
  }
};

// 生成新节点的层级
const generateNewLevel = () => {
  const currentLevel = clickLeftNode.value?.level || "01";
  if (clickLeftNode.value) {
    let length = (clickLeftNode.value?.children?.length || 0) + 1;
    if (length > 99) {
      ElMessage.error("节点层级已满");
      throw new Error("节点层级已满");
    }
    const lengthStr = length.toString().padStart(2, "0");
    return currentLevel + lengthStr;
  } else {
    const length = fileTreeData.value.length + 1;
    if (length > 99) {
      ElMessage.error("节点层级已满");
      throw new Error("节点层级已满");
    }
    const lengthStr = length.toString().padStart(2, "0");
    return lengthStr;
  }
};

// 控制 MenuCard 显示/隐藏
const showMenuCard = ref(false);

// MenuCard 的位置
const menuCardPosition = ref({
  left: 0,
  top: 0
});

// 选中的节点名称
let clickRightNode = ref<TreeNode | null>(null);
const clickRightNodeName = ref("");
const clickRightNodeUpload = ref(false);

// 节点右键点击事件
const handleNodeContextMenu = (event: MouseEvent, data: TreeNode, node: any, component: any) => {
  event.preventDefault();
  clickRightNode = ref(data);
  clickRightNodeName.value = node.label;
  clickRightNodeUpload.value = !data.children?.length;
  menuCardPosition.value = {
    left: event.clientX,
    top: event.clientY
  };
  showMenuCard.value = true;
};

// 关闭 MenuCard
const closeMenuCard = () => {
  showMenuCard.value = false;
};

// 监听全局点击事件
const handleClickOutside = (event: MouseEvent) => {
  if (showMenuCard.value && menuCardRef.value && !menuCardRef.value.$el.contains(event.target)) {
    closeMenuCard();
  }
};

// 组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// 处理新建文件夹事件
const handleNewFolder = (nodeName: string) => {
  if (clickLeftNode.value) {
    getFileChildren();
    if (fileChildren - 1 === 0) {
      showNewNodeMenu.value = true;
    } else {
      ElMessage.error("该文件下已经存在图片,不允许新建文件！");
      return;
    }
  } else {
    ElMessage.error("请选择一个节点");
  }
};

// 处理上传文件事件
const handleUpload = () => {
  if (uploadRef.value) {
    uploadRef.value.$el.querySelector('input[type="file"]').click();
  }
};

// 处理重命名事件
const handleReName = (nodeName: string) => {
  showNewNodeMenu.value = true;
  renameNode = true;
};

//新建文件夹在默认路径
const newFile = () => {
  showNewNodeMenu.value = true;
  clickLeftNode.value = null;
  clickRightNode.value = null;
};

// 控制对话框显示/隐藏
const dialogVisible = ref<boolean>(false);

//处理删除文件事件
const handleDelete = () => {
  dialogVisible.value = true;
};

// 确认删除
const confirmDelete = async (): Promise<void> => {
  try {
    // 在这里执行删除逻辑
    deleteData();
  } catch (error) {
  } finally {
    dialogVisible.value = false; // 关闭对话框
  }
};

const deleteData = () => {
  axiosInstance.post("/picture/deleteNode", clickLeftNode.value, {
    params: {
      account: account.value
    }
  })
    .then((response) => {
      if (response.data.data == -1) {
        ElMessage.error("删除文件夹失败");
      } else if (response.data.data == 1) {
        ElMessage.success("删除文件夹成功");
      }
      fetchFileTreeData();
    });
};

// 处理全选/全不选
const handleSelectAll = (checked: boolean) => {
  selectedImages.value = selectedImages.value?.map(() => checked);
};

// 监听 selectedImages 的变化，更新全选状态
watch(selectedImages, (newVal) => {
  selectAll.value = newVal.every((selected) => selected);
}, { deep: true });

const dialogPictureVisible = ref(false);
const confirmDeletePicture = async (): Promise<void> => {
  try {
    // 在这里执行删除逻辑
    deletePicture();
  } catch (error) {
  } finally {
    dialogPictureVisible.value = false; // 关闭对话框
  }
};
//删除图片
const deletePicture = () => {
  dialogPictureVisible.value = true;
  const selectedPictureNames = pictureNameList.value.filter((_, index) => selectedImages.value[index]);
  if (selectedPictureNames.length === 0) {
    ElMessage.error("请选择要删除的图片");
    return;
  }
  axiosInstance.post("/picture/deletePicture", selectedPictureNames, {
    params: {
      account: account.value
    }
  })
    .then((response) => {
      if (response.data.data == -1) {
        ElMessage.error("删除图片失败");
      } else if (response.data.data == 1) {
        ElMessage.success("删除图片成功");
        getPictureList();
      }
    });
};

// 组件挂载时执行
onMounted(() => {
  fetchFileTreeData();
});

// 添加 refresh 方法
const refresh = () => {
  getPictureList();
};

// 修改图片分类计算属性
const landscapeImages = computed(() => {
  return pictureUrls.value.filter((url, index) => {
    return imageOrientations.value[url] === 'landscape';
  });
});

const portraitImages = computed(() => {
  return pictureUrls.value.filter((url, index) => {
    return imageOrientations.value[url] === 'portrait';
  });
});

// 添加图片方向判断函数
const checkImageOrientation = (url: string) => {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageOrientations.value[url] = img.width > img.height ? 'landscape' : 'portrait';
      resolve();
    };
    img.onerror = () => {
      imageOrientations.value[url] = 'landscape'; // 默认设置为横向
      resolve();
    };
    img.src = url;
  });
};

const landscapeImageRefs = ref<any[]>([]);
const portraitImageRefs = ref<any[]>([]);

// 预览处理函数
const handlePreview = (index: number, type: 'landscape' | 'portrait') => {
  const images = type === 'landscape' ? landscapeImages.value : portraitImages.value;
  
  const app = createApp({
    render() {
      return h(ElImageViewer, {
        urlList: images,
        initialIndex: index,
        onClose: () => {
          app.unmount();
        }
      });
    }
  });
  
  const container = document.createElement('div');
  document.body.appendChild(container);
  app.mount(container);
};

// 添加图片名称编辑相关的状态
const editingImageIndex = ref<number | null>(null);
const editingImageType = ref<'landscape' | 'portrait' | null>(null);
const editingImageName = ref('');

// 开始编辑图片名称
const startEditImageName = (index: number, type: 'landscape' | 'portrait', event: MouseEvent) => {
  event.stopPropagation();
  editingImageIndex.value = index;
  editingImageType.value = type;
  editingImageName.value = pictureNameList.value[index];
};

// 保存图片名称
const saveImageName = async (index: number, type: 'landscape' | 'portrait') => {
  try {
    const response = await axiosInstance.post("/picture/renamePicture", {
      oldName: pictureNameList.value[index],
      newName: editingImageName.value,
      account: account
    });
    
    if (response.data.code === 0) {
      // 如果数据库更新成功，再调用服务器接口重命名实际文件
      const oldFileName = pictureNameList.value[index];
      const newFileName = editingImageName.value;
      
      console.log('发送重命名请求:', { oldFileName, newFileName });
      
      const serverResponse = await axios.post('http://47.121.202.205:3000/rename', {
        oldName: oldFileName,
        newName: newFileName
      });

      if (serverResponse.data.success) {
        ElMessage.success("重命名成功");
        // 更新本地图片URL列表
        const oldUrl = pictureUrls.value[index];
        const newUrl = oldUrl.replace(oldFileName, newFileName);
        pictureUrls.value[index] = newUrl;
        pictureNameList.value[index] = newFileName;
        
        // 重新检查图片方向
        await checkImageOrientation(newUrl);
      } else {
        ElMessage.error(serverResponse.data.message || "文件重命名失败");
      }
    } else {
      ElMessage.error("数据库更新失败");
    }
  } catch (error: any) {
    console.error("重命名失败:", error);
    if (error.response) {
      ElMessage.error(error.response.data.message || "重命名失败");
    } else {
      ElMessage.error("重命名失败");
    }
  } finally {
    editingImageIndex.value = null;
    editingImageType.value = null;
  }
};

// 取消编辑
const cancelEdit = () => {
  editingImageIndex.value = null;
  editingImageType.value = null;
};
</script>

<style scoped>
.el-main {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.file-icon-box {
    margin-top: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.file-icon {
    margin: 5px;
    padding: 5px;
    color: #909399;
}

.el-tree {
    background-color: transparent;
    color: #909399;
    font-size: 13px;
}

:deep(.el-upload-dragger) {
    width: 80%;
    background-color: transparent;
    margin: 0 auto;
    padding: 10px;
}

.upload-file {
    display: flex;
    position: absolute;
    bottom: 0;
    width: 100%;
    font-size: 13px;
    font-weight: 150;
    padding: 10px;
    box-sizing: border-box;
}

.img-card {
    display: flex;
    background-color: transparent;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 0;
}

:deep(.el-upload-dragger:hover) {
    color: #4E6048 !important;
    border-color: #4E6048 !important;
}

.btn-size {
    color: #fdfbfb !important;
    display: flex;
    align-items: center;
}

:deep(.el-radio-button.is-active .el-radio-button__original-radio:not(:disabled)+.el-radio-button__inner) {
    background-color: transparent;
    border-color: transparent;
    box-shadow: -1px 0 0 0 transparent;;
    color: #fdfbfb;
}

:deep(.el-radio-button__inner) {
    border-radius: 0;
    font-size: 12px;
    background-color: transparent;
    box-shadow: -1px 0 0 0 transparent;;
    padding: 5px 11px;
}

:deep(.el-radio-button__original-radio:disabled+.el-radio-button__inner) {
    background-color: transparent;
}

:deep(.el-button) {
    background-color: transparent;
    font-family: 'Jetbrains Mono', sans-serif;
}

:deep(.el-button:hover) {
    background-color: #303b2c;
}

.btn-deal {
    display: flex;
    align-items: center;
    margin-top: 15px;
}

.el-checkbox {
    color: #909399;
    margin-right: 15px;
}

:deep(.el-checkbox__inner) {
    background-color: transparent;
}

.pic-path {
    width: 100%;
    display: flex;
    font-size: 12px;
    position: absolute;
    bottom: 0;
    font-weight: 200;
    align-items: center;
    color: #909399;
}

.el-footer {
    height: 30px;
}

.file-folder {
    height: 500px;
    overflow-y: auto;
}

:deep(.el-dialog__body) {
    color: #909399;
}

.show-pic {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
    height: calc(100vh - 200px);
    overflow-y: auto;
    padding: 0 20px;
}

.image-section {
    margin-bottom: 20px;
}

.image-section h3 {
    color: #909399;
    margin-bottom: 15px;
    font-size: 16px;
}

.image-grid {
    display: grid;
    gap: 20px;
    margin-bottom: 20px;
}

.landscape-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.portrait-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.image-container {
    position: relative;
    display: inline-block;
    transition: transform 0.3s;
    margin-bottom: 30px; /* 为图片名称留出空间 */
}

.image-container:hover {
    transform: scale(1.05);
}

.image-checkbox {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
}

.uploaded-image {
    border: 1px solid #ddd;
    border-radius: 10px;
    transition: all 0.3s;
    cursor: pointer;
    width: 100%;
    height: auto;
}

.uploaded-image.小 {
    max-width: 200px;
    max-height: 150px;
}

.uploaded-image.大 {
    max-width: 300px;
    max-height: 200px;
}

/* 横向图片特殊处理 */
.landscape-grid .uploaded-image {
    aspect-ratio: 16/9;
    object-fit: contain;
}

/* 纵向图片特殊处理 */
.portrait-grid .uploaded-image {
    aspect-ratio: 3/4;
    object-fit: cover;
}

/* 自定义滚动条样式 */
.show-pic::-webkit-scrollbar {
    width: 6px;
}

.show-pic::-webkit-scrollbar-track {
    background: transparent;
}

.show-pic::-webkit-scrollbar-thumb {
    background-color: #909399;
    border-radius: 3px;
}

.show-pic::-webkit-scrollbar-thumb:hover {
    background-color: #606266;
}

.image-name {
    position: absolute;
    bottom: -25px;
    left: 0;
    right: 0;
    text-align: center;
    color: #909399;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 5px;
}

.image-name:hover {
    color: #409EFF;
}

:deep(.el-input__wrapper) {
    padding: 0 5px;
}

:deep(.el-input__inner) {
    height: 24px;
    line-height: 24px;
    font-size: 12px;
}
</style>

<style lang="scss" scoped>
@import "@/assets/scss/common.scss";

.file-icon-box {
  @include inset_border('border_style', 'top');
}

.file-icon:hover {
  @include background_color('background_color_file');
  border-radius: 10px;
  cursor: pointer;
}

.el-card {
  @include inset_border_all('border_style_all');
}

.el-button {
  @include btn_color('text-color');
}

.pic-path {
  @include inset_border('border_style', 'top');
  @include background_color('background_color_file');
}

.word-color {
  @include font_color('text-color');
  font-size: 16px;
  font-weight: 600;
}
</style>