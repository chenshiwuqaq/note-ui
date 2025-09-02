<template>
  <div class="website-card" @click="openWebsite">
    <div class="icon-container">
      <!--      <img :src="getIconUrl(website.icon)" :alt="website.name" />-->
      <img src="../assets/imgs/website.png" style="width: 80%;height: auto">
    </div>
    <div class="website-name">{{ website.name }}</div>
    <div class="edit-btn" @click.stop="emitEdit">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 0-1.414l9-9zM1.5 13A1.5 1.5 0 0 0 0 14.5v1A1.5 1.5 0 0 0 1.5 17h1A1.5 1.5 0 0 0 4 15.5v-1A1.5 1.5 0 0 0 2.5 13h-1zm13-4A1.5 1.5 0 0 0 15.5 10v-1A1.5 1.5 0 0 0 14 7.5h-1A1.5 1.5 0 0 0 11.5 9v1A1.5 1.5 0 0 0 13 12.5h1z"/>
      </svg>
    </div>
    <div class="delete-btn" @click.stop="emitDelete">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
  props: {
    website: {
      type: Object as () => Website,
      required: true
    }
  },

  emits: ['edit', 'delete'],

  setup(props, { emit }) {
    // 获取图标URL
    const getIconUrl = (icon: string) => {
      // 这里应该根据图标名称生成对应的图标URL
      // 实际项目中可能需要使用CDN或本地存储的图标
      return `/icons/${icon}.png`;
    };

    // 打开网站
    const openWebsite = () => {
      window.open(props.website.url, '_blank');
    };

    // 发射编辑事件
    const emitEdit = () => {
      emit('edit', props.website);
    };

    // 发射删除事件
    const emitDelete = () => {
      if (confirm(`确定要删除收藏的网站: "${props.website.name}"`)) {
        emit('delete', props.website.id);
      }
    };

    return {
      getIconUrl,
      openWebsite,
      emitEdit,
      emitDelete
    };
  }
});
</script>

<style scoped>
.website-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.website-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icon-container {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.icon-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.website-name {
  font-size: 12px;
  color: #333;
  text-align: center;
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-btn, .delete-btn {
  position: absolute;
  bottom: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.edit-btn {
  left: 8px;
}

.delete-btn {
  right: 8px;
}

.edit-btn:hover, .delete-btn:hover {
  opacity: 1;
}

.edit-btn svg, .delete-btn svg {
  width: 16px;
  height: 16px;
}

.edit-btn svg {
  fill: #4a90e2;
}

.delete-btn svg {
  fill: #e74c3c;
}
</style>