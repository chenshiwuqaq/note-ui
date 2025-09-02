<template>
  <el-container>
    <el-drawer v-model="drawer" title="WebsiteStar" :with-header="false" class="drawer">
      <div class="website-collection">
        <div class="header">
          <div class="quick-access">网站收藏</div>
        </div>

        <div class="category-section">
          <h2>Daily</h2>
          <div class="website-grid">
            <WebsiteCard
              v-for="site in dailyWebsites"
              :key="site.id"
              :website="site"
              @edit="showEditModal(site)"
              @delete="deleteWebsite(site.id)"
            />
          </div>
        </div>

        <div class="category-section">
          <h2>Work</h2>
          <div class="website-grid">
            <WebsiteCard
              v-for="site in workWebsites"
              :key="site.id"
              :website="site"
              @edit="showEditModal(site)"
              @delete="deleteWebsite(site.id)"
            />
          </div>
        </div>

        <div class="category-section">
          <h2>Other</h2>
          <div class="website-grid">
            <WebsiteCard
              v-for="site in otherWebsites"
              :key="site.id"
              :website="site"
              @edit="showEditModal(site)"
              @delete="deleteWebsite(site.id)"
            />
          </div>
        </div>
      </div>

      <!-- 添加新网站按钮 -->
      <button class="add-website-btn" @click="showAddModal">+</button>

      <!-- 模态框 - 添加/编辑网站 -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ isEditMode ? '修改网站' : '新增网站' }}</h3>
            <div class="close-btn" @click="closeModal">×</div>
          </div>

          <div class="form-group">
            <label>网站名称</label>
            <input v-model="currentWebsite.name" type="text" placeholder="输入网站名称" style="width: 440px">
          </div>

          <div class="form-group">
            <label>网站地址</label>
            <input v-model="currentWebsite.url" type="text" placeholder="http://..." style="width: 440px">
          </div>

<!--          <div class="form-group">-->
<!--            <label>网站图标</label>-->
<!--            <input v-model="currentWebsite.icon" placeholder="wl-...">-->
<!--            <div class="icon-preview">-->
<!--              <img :src="getIconUrl(currentWebsite.icon)" alt="网站图标">-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="form-group">-->
<!--            <label>图标地址</label>-->
<!--            <input v-model="currentWebsite.iconUrl" type="text" placeholder="http://...">-->
<!--          </div>-->

          <div class="form-group">
            <label>网站类型</label>
            <div class="type-selector">
              <select v-model="currentWebsite.category">
                <option value="Daily">日常 - Daily</option>
                <option value="Work">工作 - Work</option>
                <option value="Other">其他 - Other</option>
              </select>
              <div class="counter">
                <button @click="decreaseCount">-</button>
                <span>{{ currentWebsite.count }}</span>
                <button @click="increaseCount">+</button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="delete-btn" @click="deleteCurrentWebsite">删除</button>
            <button class="save-btn" @click="saveWebsite">保存</button>
          </div>
        </div>
      </div>

    </el-drawer>
  </el-container>
</template>

<script lang="ts">
import { ref } from "vue";
import WebsiteCard from "./WebsiteCard.vue";
import { computed, defineComponent } from "vue";

// const drawer = ref(true);

interface Website {
  id: number;
  name: string;
  url: string;
  icon: string;
  iconUrl: string;
  category: string;
  count: number;
}

export default defineComponent({
  components: {
    WebsiteCard
  },

  setup() {
    const drawer = true;
    // 网站数据
    const websites = ref<Website[]>([
      // Daily 网站
      {
        id: 1,
        name: "Bing",
        url: "https://cn.bing.com/?FORM=BEHPT",
        icon: "wl-microsoft-bing",
        iconUrl: "",
        category: "Daily",
        count: 2
      },
      {
        id: 2,
        name: "Google",
        url: "https://www.google.com",
        icon: "wl-google",
        iconUrl: "",
        category: "Daily",
        count: 1
      },
      {
        id: 3,
        name: "哔哩哔哩",
        url: "https://www.bilibili.com",
        icon: "wl-bilibili",
        iconUrl: "",
        category: "Daily",
        count: 1
      },
      {
        id: 4,
        name: "WallHaven",
        url: "https://wallhaven.cc",
        icon: "wl-wallhaven",
        iconUrl: "",
        category: "Daily",
        count: 1
      },
      {
        id: 5,
        name: "Steam",
        url: "https://store.steampowered.com",
        icon: "wl-steam",
        iconUrl: "",
        category: "Daily",
        count: 1
      },

      // Work 网站
      { id: 6, name: "Github", url: "https://github.com", icon: "wl-github", iconUrl: "", category: "Work", count: 1 },
      { id: 7, name: "Gitee", url: "https://gitee.com", icon: "wl-gitee", iconUrl: "", category: "Work", count: 1 },
      {
        id: 8,
        name: "codepen",
        url: "https://codepen.io",
        icon: "wl-codepen",
        iconUrl: "",
        category: "Work",
        count: 1
      },
      {
        id: 9,
        name: "Maven",
        url: "https://maven.apache.org",
        icon: "wl-maven",
        iconUrl: "",
        category: "Work",
        count: 1
      },
      {
        id: 10,
        name: "Code Mirror",
        url: "https://codemirror.net",
        icon: "wl-code-mirror",
        iconUrl: "",
        category: "Work",
        count: 1
      },
      {
        id: 11,
        name: "MarkedJS",
        url: "https://marked.js.org",
        icon: "wl-markedjs",
        iconUrl: "",
        category: "Work",
        count: 1
      },
      {
        id: 12,
        name: "LeetCode",
        url: "https://leetcode.com",
        icon: "wl-leetcode",
        iconUrl: "",
        category: "Work",
        count: 1
      },
      {
        id: 13,
        name: "Stack Overflow",
        url: "https://stackoverflow.com",
        icon: "wl-stackoverflow",
        iconUrl: "",
        category: "Work",
        count: 1
      },
      {
        id: 14,
        name: "Docker Hub",
        url: "https://hub.docker.com",
        icon: "wl-docker",
        iconUrl: "",
        category: "Work",
        count: 1
      },

      // Other 网站
      {
        id: 15,
        name: "Blossom",
        url: "https://blossom.com",
        icon: "wl-blossom",
        iconUrl: "",
        category: "Other",
        count: 1
      },
      {
        id: 16,
        name: "Guardat",
        url: "https://guardat.com",
        icon: "wl-guardat",
        iconUrl: "",
        category: "Other",
        count: 1
      },
      {
        id: 17,
        name: "Iconfont",
        url: "https://www.iconfont.cn",
        icon: "wl-iconfont",
        iconUrl: "",
        category: "Other",
        count: 1
      },
      {
        id: 18,
        name: "Dribbble",
        url: "https://dribbble.com",
        icon: "wl-dribbble",
        iconUrl: "",
        category: "Other",
        count: 1
      },
      {
        id: 19,
        name: "ProcessOn",
        url: "https://www.processon.com",
        icon: "wl-processon",
        iconUrl: "",
        category: "Other",
        count: 1
      },
      {
        id: 20,
        name: "Emoji",
        url: "https://emojipedia.org",
        icon: "wl-emoji",
        iconUrl: "",
        category: "Other",
        count: 1
      },
      {
        id: 21,
        name: "Convertio",
        url: "https://convertio.co",
        icon: "wl-convertio",
        iconUrl: "",
        category: "Other",
        count: 1
      }
    ]);

    // 当前编辑的网站
    const currentWebsite = ref<Website>({
      id: -1,
      name: "",
      url: "",
      icon: "",
      iconUrl: "",
      category: "Daily",
      count: 1
    });

    // 是否显示模态框
    const showModal = ref(false);

    // 是否是编辑模式
    const isEditMode = ref(false);

    // 获取对应类别的网站
    const dailyWebsites = computed(() =>
      websites.value.filter(site => site.category === "Daily")
    );

    const workWebsites = computed(() =>
      websites.value.filter(site => site.category === "Work")
    );

    const otherWebsites = computed(() =>
      websites.value.filter(site => site.category === "Other")
    );

    // 显示添加模态框
    const showAddModal = () => {
      currentWebsite.value = {
        id: -1,
        name: "",
        url: "",
        icon: "",
        iconUrl: "",
        category: "Daily",
        count: 1
      };
      isEditMode.value = false;
      showModal.value = true;
    };

    // 显示编辑模态框
    const showEditModal = (site: Website) => {
      currentWebsite.value = { ...site };
      isEditMode.value = true;
      showModal.value = true;
    };

    // 关闭模态框
    const closeModal = () => {
      showModal.value = false;
    };

    // 删除网站
    const deleteWebsite = (id: number) => {
      websites.value = websites.value.filter(site => site.id !== id);
    };

    // 删除当前编辑的网站
    const deleteCurrentWebsite = () => {
      if (currentWebsite.value.id !== -1) {
        deleteWebsite(currentWebsite.value.id);
        closeModal();
      }
    };

    // 保存网站
    const saveWebsite = () => {
      if (currentWebsite.value.id === -1) {
        // 新增
        currentWebsite.value.id = websites.value.length + 1;
        websites.value.push({ ...currentWebsite.value });
      } else {
        // 更新
        const index = websites.value.findIndex(site => site.id === currentWebsite.value.id);
        if (index !== -1) {
          websites.value[index] = { ...currentWebsite.value };
        }
      }
      closeModal();
    };

    // 增加计数
    const increaseCount = () => {
      currentWebsite.value.count++;
    };

    // 减少计数
    const decreaseCount = () => {
      if (currentWebsite.value.count > 1) {
        currentWebsite.value.count--;
      }
    };

    // 获取图标URL
    const getIconUrl = (icon: string) => {
      // 这里应该根据图标名称生成对应的图标URL
      // 实际项目中可能需要使用CDN或本地存储的图标
      return `/icons/${icon}.png`;
    };

    return {
      drawer,
      websites,
      currentWebsite,
      showModal,
      isEditMode,
      dailyWebsites,
      workWebsites,
      otherWebsites,
      showAddModal,
      showEditModal,
      closeModal,
      deleteWebsite,
      deleteCurrentWebsite,
      saveWebsite,
      increaseCount,
      decreaseCount,
      getIconUrl
    };
  }
});
</script>
<style scoped>
.drawer {
  width: 25%;
}

.website-collection {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  padding: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}


.quick-access {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.category-section {
  margin-bottom: 30px;
}

.category-section h2 {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.website-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
}

.add-website-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4a90e2;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: white;
  width: 500px;
  max-width: 90%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  font-size: 30px;
  cursor: pointer;
}

.form-group {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: bold;
  color: #888;
  text-align: left;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.type-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.counter {
  display: flex;
  align-items: center;
}

.counter button {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: none;
  cursor: pointer;
}

.counter span {
  margin: 0 10px;
}

.icon-preview {
  margin-left: 15px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-preview img {
  max-width: 100%;
  max-height: 100%;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.delete-btn, .save-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}


</style>
