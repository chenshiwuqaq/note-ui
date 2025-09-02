<template>
  <div style="display: flex">
    <div class="left-tree">
      <el-input
        v-model="query"
        style="width: 240px"
        placeholder="请输入"
        @input="onQueryChanged"
        v-show="false"
      />
      <div class="file-icon-box">
        <el-icon class="file-icon">
          <FolderAdd @click="addRootNode"/>
        </el-icon>
        <el-icon class="file-icon">
          <Search />
        </el-icon>
        <el-icon class="file-icon">
          <Refresh @click="loadTree"/>
        </el-icon>
        <el-icon class="file-icon">
          <Fold />
        </el-icon>
      </div>
      <el-tree-v2
        node-key="id"
        ref="treeRef"
        style="max-width: 600px"
        :data="TreeData"
        :props="props"
        :height="660"
        :show-checkbox="true"
        :default-expanded-keys="expandedKeys"
        @node-click="switchNode"
      >
        <template #default="{ data }">
          <div style="display: flex; align-items: center; width: 100%">
            <div>
              <span v-if="!data.isEditing">{{ data.label }}</span>
              <input
                v-else
                v-model="data.label"
                class="edit-input"
                autofocus
                @blur="finishEdit(data)"
                @keyup.enter="finishEdit(data)"
              />
            </div>
            <div class="node-function">
              <span class="icons">
                <span class="iconfont icon-jiahao" @click.stop="addChildNode(data)"></span>
                <span class="iconfont icon-bianji" @click.stop="startEdit(data)"></span>
                <span class="iconfont icon-shanchu" @click.stop="deleteNode(data)"></span>
              </span>
            </div>
          </div>
        </template>
      </el-tree-v2>
    </div>
    <div class="right-editor">
      <div class="editor-header">
        <div class="word-count">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="今日已写字数"
            placement="top"
          >
            <span class="daily-count">今日字数：{{ dailyWordCount }}</span>
          </el-tooltip>
        </div>
      </div>
      <MdEditor
        ref="mdEditorRef"
        class="md-editor"
        style="width: 100%;height: 700px"
        v-model="text"
        @onSave="onSave"
        :toolbars="allTools"
        :showToolbarName="true"
        :style="{ textAlign: 'left' }"
        content-style="text-align: left"
        @on-upload-img="onUploadImg"
        @onChange="handleTextChange"
        :preview="true"
        @click="handleMdEditorClick"
      >
        <template #defToolbars>
          <NormalToolbar title="图片上传" @onClick="handleImageButtonClick">
            <template #trigger>
              <el-icon><Picture /></el-icon>
            </template>
          </NormalToolbar>
        </template>
      </MdEditor>

      <!-- 图片选择对话框 -->
      <el-dialog
        v-model="showImageSelector"
        title="选择图片"
        width="30%"
      >
        <div class="image-upload-options">
          <el-radio-group v-model="uploadType">
            <el-radio label="local">本地上传</el-radio>
            <el-radio label="cloud">云服务器图片</el-radio>
          </el-radio-group>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showImageSelector = false">取消</el-button>
            <el-button type="primary" @click="handleImageSelect">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 云服务器图片选择对话框 -->
      <el-dialog
        v-model="showCloudImageSelector"
        title="云服务器图片"
        width="80%"
      >
        <div class="image-grid">
          <div v-for="(image, index) in cloudImages" :key="index" class="image-item" @click="selectCloudImage(image)">
            <el-image
              :src="image.url"
              fit="cover"
              class="preview-image"
            />
            <div class="image-name">{{ image.name }}</div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onUnmounted } from "vue";
import { MdEditor, type ToolbarNames, NormalToolbar } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { ElMessage, ElMessageBox, ElTreeV2 } from "element-plus";
import type { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import axios, { AxiosError } from "axios";
import { Fold, FolderAdd, Refresh, Search, Picture, } from "@element-plus/icons-vue";
import { useAuthStore } from "@/store/auth";
import router from "@/router";
import { debounce } from 'lodash-es';
const authStore = useAuthStore();
const token = ref(authStore.token);
const Account = ref("");
//判断是否是用户操作，而非切换文章带来的文本变化
const isContentChangingByUser = ref(true)

const autoSaveIntervalId = ref<number | null>(null);
const isEditorActive = ref(false); // 标记编辑器是否处于活动状态

// 设置自动保存定时器
const startAutoSave = () => {
  // 先清除已有的定时器
  stopAutoSave();

  // 启动新的定时器
  autoSaveIntervalId.value = window.setInterval(() => {
    if (isEditorActive.value) {
      updateDailyWordCount.flush();
      onSave();
      console.log('自动保存完成');
    }
  }, 10 * 1000); // 每10秒执行一次
};

// 停止自动保存定时器
const stopAutoSave = () => {
  if (autoSaveIntervalId.value !== null) {
    clearInterval(autoSaveIntervalId.value);
    autoSaveIntervalId.value = null;
    console.log('自动保存已停止');
  }
};

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
    return Account.value; // 返回账户信息
  } catch (error) {
    console.error('获取账户信息失败:', error);
    ElMessage.error('获取账户信息失败');
    authStore.clearToken();
    return null;
  }
};

// 添加axios响应拦截器
axios.interceptors.response.use(
  (response) => {
    // 将响应数据转换为字符串
    const jsonString = JSON.stringify(response.data);

    // 使用reviver函数处理大整数
    response.data = JSON.parse(jsonString, (key, value) => {
      // 如果是id字段且是数字，检查是否需要转换为字符串
      if (key === 'id' && typeof value === 'number') {
        // 如果数字超过安全整数范围，转换为字符串
        if (value > Number.MAX_SAFE_INTEGER) {
          return value.toString();
        }
      }
      return value;
    });

    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 定义树节点接口
interface TreeNode {
  parent: any;
  id: string;
  label: string;
  children?: TreeNode[];
  isEditing?: boolean;
}

const text = ref("");
const treeRef = ref<InstanceType<typeof ElTreeV2>>();
const TreeData = ref<TreeNode[]>([]);

const props = {
  value: "id",
  label: "label",
  children: "children"
};

// 添加展开节点的状态管理
const expandedKeys = ref<string[]>([]);

const expand = (node: TreeNode) => {
  if (treeRef.value) {
    // 使用expandNode方法展开节点，需要传入正确的节点类型
    const treeNode = {
      key: (node.id),
      level: 0,
      data: node
    };
    treeRef.value.expandNode(treeNode);
  }
};

onMounted(async () => {
  //先获取账户信息
  await getAccount();

  //确认Account有值后，再加载数据
  if (Account.value) {
    await loadTree();
    await initEveryDayWordCount(); // 先初始化字数
    // 设置初始字数状态（基于当前编辑器内容）
    prevWordCount.value = calculateWordCount(text.value);
  } else {
    ElMessage.error('获取账户信息失败，请重新登录');
    await router.push({ name: 'login' });
  }
  document.addEventListener('click', handleGlobalClick);
});
// 组件卸载时清理
onUnmounted(() => {
  // 移除全局点击监听
  document.removeEventListener('click', handleGlobalClick);

  // 停止自动保存
  stopAutoSave();

  // 执行最后一次保存
  if(selectedNode.value){
    onSave();
  }
});
//加载树
const loadTree = async () => {
  try {
    const response = await axios.get("http://localhost:8003/editor/onLoad", {
      params: { account: Account.value },
      transformResponse: [(data) => {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error("JSON 解析失败:", e);
          return data;
        }
      }]
    });

    // 递归处理，确保id始终为string类型
    type NormalizedTreeNode = Omit<TreeNode, 'id'> & { id: string };

    const normalizeIds = (nodes: TreeNode[]): NormalizedTreeNode[] => {
      return nodes.map(node => ({
        ...node,
        id: node.id.toString(),
        children: node.children ? normalizeIds(node.children) : []
      }));
    };
    TreeData.value = normalizeIds(response.data.data);
    console.log("加载的树数据:", TreeData.value);
  } catch (error) {
    console.error("加载树数据失败:", error);
  }
};

// 计算节点到根节点的深度
const calculateDepth = (node: TreeNode): number => {
  let depth = 0;
  let currentNode = node;
  while (currentNode.parent) {
    depth++;
    currentNode = currentNode.parent;
  }
  return depth;
};
const addRootNode = async () => {
  const newNode: TreeNode = {
    parent: null,
    id: Date.now().toString(),  // 转换为字符串
    label: "新节点",
    isEditing: true,
    children: []
  };

  // 直接添加到树中并进入编辑状态
  TreeData.value.push(newNode);
  TreeData.value = [...TreeData.value];
  // 自动选中新添加的节点
  selectedNode.value = newNode;
  // 展开新节点
  expand(newNode);
};

// 添加子节点
const addChildNode = async (parentNode: TreeNode) => {
  if (selectedNode.value && selectedNode.value.id === parentNode.id && text.value.trim() !== "") {
    ElMessage.warning("有内容的节点不能再新增子节点！");
    return;
  }
  // 先展开父节点
  expand(parentNode);

  // 创建新节点
  const newNode: TreeNode = {
    parent: parentNode,
    id: Date.now().toString(),
    label: "新节点",
    isEditing: true,
    children: []
  };

  // 确保父节点有children数组
  if (!parentNode.children) {
    parentNode.children = [];
  }

  // 直接添加到树中并进入编辑状态
  parentNode.children.push(newNode);
  // 强制更新视图
  TreeData.value = [...TreeData.value];
  // 自动选中新添加的节点
  selectedNode.value = newNode;
  // 展开新节点
  expand(newNode);
};

// 开始编辑节点
const startEdit = (node: TreeNode) => {
  console.log("开始编辑节点:", node);
  node.isEditing = true;
  // 强制更新视图
  TreeData.value = [...TreeData.value];
};

// 完成编辑
const finishEdit = async (node: TreeNode) => {
  node.isEditing = false;
  // 判断是否为新节点（通过检查id是否为时间戳）
  const isNewNode = node.id.length === 13 && !isNaN(Number(node.id));

  try {
    if (isNewNode) {
      // 新增节点
      const depth = calculateDepth(node);
      const response = await axios.post("http://localhost:8003/editor/NodeAdd", {
        parentId: node.parent ? String(node.parent.id) : "0",
        nodeId: String(node.id),
        depth: depth,
        nodeLabel: node.label,
        userAccount: Account.value
      });

      console.log("添加节点成功:", response.data);
      if (response.status === 200) {
        // 强制更新视图
        TreeData.value = [...TreeData.value];
        // 重新加载树以获取正确的ID
        await loadTree();
      } else {
        throw new Error(response.data.message || "添加节点失败");
      }
    } else {
      // 编辑现有节点
      const response = await axios.post("http://localhost:8003/editor/NodeUpdate", {
        nodeId: String(node.id),
        nodeLabel: node.label,
      });

      if (response.status === 200) {
        // 强制更新视图
        TreeData.value = [...TreeData.value];
      } else {
        throw new Error(response.data.message || "更新节点失败");
      }
    }
  } catch (error) {
    console.error(isNewNode ? "添加节点失败:" : "更新节点失败:", error);
    alert((isNewNode ? "添加节点失败: " : "更新节点失败: ") + (error instanceof Error ? error.message : "未知错误"));

    // 如果是新增节点失败，从树中移除该节点
    if (isNewNode) {
      if (node.parent) {
        const index = node.parent.children?.findIndex((child: TreeNode) => child.id === node.id);
        if (index !== undefined && index !== -1) {
          node.parent.children?.splice(index, 1);
        }
      } else {
        const index = TreeData.value.findIndex(item => item.id === node.id);
        if (index !== -1) {
          TreeData.value.splice(index, 1);
        }
      }
      TreeData.value = [...TreeData.value];
    }
  }
};

// 删除节点
const $confirm = ElMessageBox.confirm;
const deleteNode = async (node: TreeNode) => {
  const isConfirmed = await $confirm(
    `确定要删除节点「${node.label || '无标题节点'}」吗？`,
    '删除节点',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false);

  if (!isConfirmed) return;

  try {
    // 直接以字符串传递 nodeId
    const nodeId = String(node.id);
    if (!nodeId) {
      throw new Error('节点ID无效');
    }
    console.log(nodeId)
    // 通过 params 传递查询参数
    const response = await axios.post(
      'http://localhost:8003/editor/NodeDelete',
      {},
      {
        params: { nodeId },
        headers: { // 可选：强制设置 Content-Type 避免误传请求体
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // 从树结构中删除节点
    if (node.parent && node.parent.children) {
      const index = node.parent.children.findIndex((child: { id: string | number; }) => child.id === node.id);
      if (index !== -1) {
        node.parent.children.splice(index, 1);
        // 使用响应式更新触发视图渲染（更高效）
        TreeData.value = [...TreeData.value];
      }
    }

    // 成功提示（使用Element Plus的Message）
    ElMessage.success(`节点「${node.label || '无标题节点'}」删除成功`);

    // 重新加载树数据
    await loadTree();

    // 清空编辑器内容
    text.value = "";
    selectedNode.value = null;

  } catch (error) {
    console.error('删除节点失败:', error);
    // 友好的错误提示
    const errorMessage = isAxiosError(error)
      ? (error.response && 'data' in error.response
        ? (error.response.data as { msg?: string }).msg
        : undefined)
      || error.message
      : '删除节点失败，请检查网络或重试';
    ElMessage.error(errorMessage);
  }
}
function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}
// 节点点击事件
const selectedNode = ref<TreeNode | null>(null);
const switchNode = async (data: TreeNodeData) => {
  isContentChangingByUser.value = false
  const node = data as unknown as TreeNode;
  selectedNode.value = node;
  try {
    const response = await axios.post(`http://localhost:8003/editor/getFile?nodeId=${String(node.id)}`);
    text.value = typeof response.data.data === "string" ? response.data.data : "";
  } catch (error) {
    console.error("加载文件失败:", error);
    text.value = "";
  }
};

// 添加状态记录上一次的字数
const prevWordCount = ref(0);
const dailyWordCount = ref(0);

// 计算字数（去除空格和换行）
const calculateWordCount = (text: string) => {
  return text.replace(/\s/g, '').length;
};
const handleMdEditorClick = () =>{
  isContentChangingByUser.value = true
  // 标记编辑器为活动状态
  isEditorActive.value = true;
  // 启动自动保存
  startAutoSave();
}
// 全局点击事件处理
const handleGlobalClick = (event: MouseEvent) => {
  // 获取编辑器元素
  const editor = document.querySelector('.md-editor');

  // 检查点击是否在编辑器外部
  if (editor && !editor.contains(event.target as Node)) {
    // 标记编辑器为非活动状态
    isEditorActive.value = false;

    // 停止自动保存
    stopAutoSave();

    // 执行一次保存操作
    updateDailyWordCount.flush();
    onSave();
    console.log('编辑器失活，已执行最后一次保存');
  }
};
// 获取每日字数
const getDailyWordCount = async () => {
  try {
    const response = await axios.get("http://localhost:8003/WordCount/get", {
      params:{
      account: Number(Account.value)
    }});
    dailyWordCount.value = response.data;
    return response.data;
  } catch (error) {
    console.error("获取每日字数失败:", error);
    return 0;
  }
};

// 更新每日字数（使用3s防抖）
const updateDailyWordCount = debounce(async () => {
  try {
    await axios.post("http://localhost:8003/WordCount/update", {
      account: Account.value,
      wordCount: dailyWordCount.value
    });
    console.log("每日字数已更新到后端:", dailyWordCount.value);
  } catch (error) {
    console.error("更新每日字数失败:", error);
  }
}, 3000);
// 自动保存
// let intervalId:number = setInterval(() => {
//   updateDailyWordCount.flush();
//   onSave();
// }, 10 * 1000);
// 初始化每日字数
const initEveryDayWordCount = async () => {
  try {
    // 获取当前编辑器内容的字数
    const currentCount = calculateWordCount(text.value);

    await axios.post("http://localhost:8003/WordCount/init", {
      account: Account.value,
      wordCount: currentCount
    });

    // 初始化后立即获取最新字数
    await getDailyWordCount();

    // 设置初始字数状态
    prevWordCount.value = currentCount;
  } catch (error) {
    console.error("初始化每日字数失败:", error);
  }
};

// 处理文本变化
const handleTextChange = (value: string) => {
  console.log(isContentChangingByUser.value)
  if(!isContentChangingByUser.value){
    prevWordCount.value = calculateWordCount(value);
    return
  }
  // 获取变化前的字数
  const beforeChangeCount = prevWordCount.value;

  // 计算变化后的字数
  const afterChangeCount = calculateWordCount(value);

  // 计算新增字数（忽略删除）
  const addedWords = Math.max(0, afterChangeCount - beforeChangeCount)

  if (addedWords > 0) {
    // 只在前端累加新增字数
    dailyWordCount.value += addedWords;

    // 触发防抖保存
    updateDailyWordCount();

    console.log(`输入前字数: ${beforeChangeCount}, 输入后字数: ${afterChangeCount}, 新增字数: ${addedWords}`);
  }

  // 更新为新的字数状态
  prevWordCount.value = afterChangeCount;
};

// 保存
const onSave = async () => {
  if (!selectedNode.value) {
    ElMessage.warning("请先选择要保存的节点");
    return;
  }
  // 检查是否为目录（有子节点）
  if (selectedNode.value.children && selectedNode.value.children.length > 0) {
    ElMessage.warning("目录节点不能保存内容！");
    return;
  }
  try {
    // 处理 nodeId 为字符串
    const nodeIdStr = String(selectedNode.value.id);

    // 检查内容是否为空
    if (!text.value.trim()) {
      ElMessage.warning("内容不能为空");
      return;
    }

    const fileName = `${nodeIdStr}.md`;
    const blob = new Blob([text.value], { type: "text/markdown" });
    const file = new File([blob], fileName, { type: "text/markdown" });

    // 创建新的 FormData 对象
    const formData = new FormData();
    formData.append("file", file);
    formData.append("nodeId", nodeIdStr);

    // 发送保存请求
    const response = await axios({
      method: 'post',
      url: 'http://localhost:8003/editor/onSave',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      },
    });

    // 解析响应数据
    let responseData = response.data;
    if (typeof response.data === 'string') {
      responseData = JSON.parse(response.data);
    }

    // 显示保存成功
    ElMessage.success("保存成功");

    // 如果有文件URL，获取文件内容
    if (responseData.data) {
      const GetResponse = await axios.get(responseData.data, { responseType: "text" });
      text.value = GetResponse.data;
    }

  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败，请重试");
  }
};

const showImageSelector = ref(false);
const showCloudImageSelector = ref(false);
const uploadType = ref('local');
const cloudImages = ref<Array<{ url: string; name: string }>>([]);
const selectedCloudImage = ref<string | null>(null);
const mdEditorRef = ref();

// 处理图片按钮点击
const handleImageButtonClick = () => {
  showImageSelector.value = true;
};

// 处理图片选择
const handleImageSelect = () => {
  if (uploadType.value === 'local') {
    // 触发本地文件选择
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        onUploadImg(Array.from(files), (urls) => {
          // 处理上传后的URL
          console.log('上传成功:', urls);
        });
      }
    };
    input.click();
  } else {
    // 显示云服务器图片选择器
    showCloudImageSelector.value = true;
    loadCloudImages();
  }
  showImageSelector.value = false;
};
// 组件卸载前保存数据
onBeforeUnmount(() => {
  updateDailyWordCount.flush(); // 立即执行防抖保存
});
// 加载云服务器图片
const loadCloudImages = async () => {
  try {
    const response = await axios.post('http://localhost:8002/picture/getPictureNames', null, {
      params: {
        account: Account.value
      }
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
  showCloudImageSelector.value = false;

  // 直接修改文本内容
  const imageMarkdown = `![${image.name}](${image.url})`;
  text.value += imageMarkdown;
};

// 图片上传处理
const onUploadImg = async (files: File[], callback: (urls: { alt: string; title: string; url: string }[]) => void) => {
  try {
    const res = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const form = new FormData();
          form.append('file', file);
          form.append('account', Account.value);

          // 添加文件类型检查
          if (!file.type.startsWith('image/')) {
            reject(new Error('只支持上传图片文件'));
            return;
          }

          // 创建新的 FormData 对象
          const uploadForm = new FormData();
          uploadForm.append('file', file);
          uploadForm.append('account', Account.value);

          // 打印请求信息以便调试
          console.log('上传文件信息:', {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          });

          axios
            .post('http://localhost:8002/picture/upload', uploadForm, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': '*/*'
              },
              // 添加上传进度处理
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                console.log('上传进度:', percentCompleted);
              }
            })
            .then((res) => {
              console.log('上传成功响应:', res.data);
              resolve(res);
            })
            .catch((error) => {
              console.error('上传失败:', error.response?.data || error);
              reject(error);
            });
        });
      })
    );

    const urls = res.map((item: any) => ({
      url: `http://47.121.202.205:3000/uploads/${item.data.data}`,
      alt: item.data.data,
      title: item.data.data
    }));

    // 直接修改文本内容
    const imagesMarkdown = urls.map(img => `![${img.alt}](${img.url})`).join('\n');
    text.value += imagesMarkdown;

    callback(urls);
  } catch (error) {
    console.error('上传图片失败:', error);
    if (axios.isAxiosError(error)) {
      console.error('错误详情:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    ElMessage.error('上传图片失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
};

// 工具栏配置
const allTools: ToolbarNames[] = [
  "bold",
  "underline",
  "italic",
  "title",
  "strikeThrough",
  "sub",
  "sup",
  "quote",
  "unorderedList",
  "orderedList",
  "task",
  "codeRow",
  "code",
  "link",
  "image",
  "table",
  "mermaid",
  "katex",
  "revoke",
  "next",
  "save",
  "pageFullscreen",
  "fullscreen",
  "preview",
  0  // 添加自定义工具栏位置
];

const query = ref("");
const onQueryChanged = (query: string) => {
  treeRef.value!.filter(query);
};
const filterMethod = (query: string, node: TreeNodeData) =>
  node.label!.includes(query);
</script>

<style scoped>
.left-tree {
  width: 20%;
  height: auto;
  position: relative;
}

.right-editor {
  width: 78%;
  height: auto;
}

.node-function {
  position: absolute;
  right: 0;
}

.icons {
  letter-spacing: 5px;
  font-size: 18px;
}

.edit-input {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
  outline: none;
}

.edit-input:focus {
  border-color: #409eff;
}

.file-icon-box {
  @include inset_border('border_style', 'top');
}

.file-icon:hover {
  @include background_color('background_color_file');
  border-radius: 10px;
}

.upload-source-selector {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-upload-options {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px;
}

.image-item {
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.image-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-name {
  padding: 8px;
  text-align: center;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-header {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.word-count {
  font-size: 14px;
  color: #606266;
}

.daily-count {
  margin-left: 20px;
  color: #409EFF;
  cursor: pointer;
}
</style>