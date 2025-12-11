<template>
  <div class="collected-articles-container">
    <div class="articles-header">
      <h3 class="title">
        <span class="icon">📚</span>
        <span>收藏文章</span>
        <span class="count-badge">{{ collectedArticles.length }}篇</span>
      </h3>
      <div class="subtitle">在这里找到你收藏的所有文章</div>
    </div>

    <div v-if="collectedArticles.length === 0" class="empty-state">
      <div class="empty-icon">📖</div>
      <p class="empty-text">暂时没有收藏文章</p>
      <p class="empty-hint">收藏喜欢的文章会显示在这里哦~</p>
    </div>

    <div v-else class="articles-list">
      <div
        v-for="(article, index) in collectedArticles"
        :key="article.nodeId"
        class="article-item"
        :class="{ 'fade-in': true }"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="handleArticleClick(article)"
      >
        <div class="article-main">
          <div class="article-order">
            <span class="order-number">{{ index + 1 }}</span>
          </div>
          <div class="article-content">
            <div class="article-title">
              {{ extractArticleName(article.nodePath) }}
            </div>
            <div class="article-path">{{ article.nodePath }}</div>
          </div>
          <div class="article-actions">
            <span class="favorite-icon">⭐</span>
          </div>
        </div>
        <div class="article-footer">
          <span class="article-id" v-show="false">ID: {{ article.nodeId }}</span>
          <span class="article-action-hint">点击查看详情 →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollectedArticles',
  props: {
    collectedArticles: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 从路径中提取文章名称（取最后一部分）
    extractArticleName(path) {
      if (!path) return '未知文章';
      const parts = path.split('/');
      return parts[parts.length - 1] || '未命名文章';
    },

    // 处理文章点击事件
    handleArticleClick(article) {
      this.$emit('article-click', article);
    }
  }
};
</script>

<style scoped>
.collected-articles-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  background: linear-gradient(135deg, #f7fff7 0%, #e8f5e8 100%);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(120, 180, 120, 0.1);
}

.articles-header {
  padding: 16px 20px;
  background: linear-gradient(90deg, #a8e6cf 0%, #dcedc1 100%);
  border-bottom: 1px solid rgba(120, 180, 120, 0.2);
  position: relative;
  overflow: hidden;
}

.articles-header::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 0;
}

.articles-header::after {
  content: "";
  position: absolute;
  bottom: -80px;
  left: -50px;
  width: 150px;
  height: 150px;
  background: rgba(168, 230, 207, 0.2);
  border-radius: 50%;
  z-index: 0;
}

.title {
  display: flex;
  align-items: center;
  margin: 0 0 4px 0;
  color: #2d5016;
  font-size: 18px;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.title .icon {
  margin-right: 10px;
  font-size: 22px;
}

.count-badge {
  margin-left: 10px;
  background-color: #4caf50;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.subtitle {
  color: #5a7d3e;
  font-size: 13px;
  position: relative;
  z-index: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  color: #8a9a8a;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #7a8a7a;
  font-weight: 500;
}

.empty-hint {
  font-size: 13px;
  margin: 0;
  color: #9aaba9;
}

.articles-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  scrollbar-width: thin;
  scrollbar-color: #c5e1c5 #f0f9f0;
}

.articles-list::-webkit-scrollbar {
  width: 6px;
}

.articles-list::-webkit-scrollbar-track {
  background: #f0f9f0;
  border-radius: 4px;
}

.articles-list::-webkit-scrollbar-thumb {
  background-color: #c5e1c5;
  border-radius: 4px;
}

.article-item {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  margin-bottom: 12px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #a8e6cf;
  box-shadow: 0 2px 8px rgba(120, 180, 120, 0.08);
  position: relative;
  overflow: hidden;
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(120, 180, 120, 0.15);
  background: rgba(255, 255, 255, 0.95);
  border-left-color: #4caf50;
}

.article-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(168, 230, 207, 0.05) 100%);
  z-index: 0;
}

.article-main {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.article-order {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #a8e6cf 0%, #8bc34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(139, 195, 74, 0.3);
}

.order-number {
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.article-content {
  flex: 1;
  overflow: hidden;
}

.article-title {
  font-weight: 600;
  color: #2d5016;
  font-size: 15px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-path {
  color: #7a9a6a;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-actions {
  margin-left: 10px;
}

.favorite-icon {
  font-size: 18px;
  color: #ffc107;
  filter: drop-shadow(0 1px 2px rgba(255, 193, 7, 0.3));
  display: inline-block;
  animation: gentle-pulse 3s infinite ease-in-out;
}

@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(120, 180, 120, 0.2);
  position: relative;
  z-index: 1;
}

.article-id {
  font-size: 11px;
  color: #9aaba9;
  font-family: monospace;
  background: rgba(200, 230, 200, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.article-action-hint {
  font-size: 11px;
  color: #5a8d5a;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.article-item:hover .article-action-hint {
  opacity: 1;
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .articles-header {
    padding: 14px 16px;
  }

  .title {
    font-size: 16px;
  }

  .article-item {
    padding: 12px;
  }
}
</style>