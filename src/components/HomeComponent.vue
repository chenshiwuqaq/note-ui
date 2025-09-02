<template>
  <el-container class="dashboard">
    <el-header class="header">
      <div class="header-content">
        <span class="title">欢迎回家</span>
      </div>
    </el-header>

    <el-main class="main-content">
      <el-row :gutter="10">
        <el-col :span="4">
          <span class="name">{{username}}</span>
          <DateTimeDisplay/>
          <img src="../assets/imgs/notebook.png" alt="notebook" style="width: 100%;height: 75%"/>
        </el-col>

        <el-col :span="10">
            <Weather></Weather>
        </el-col>

        <el-col :span="5">
          <el-card class="box-card" shadow="never">
            <img src="../assets/imgs/GULULU-魔法球.png" alt="Avatar" class="avatar"/>
          </el-card>
        </el-col>

<!--        <el-col :span="5">-->
<!--          <el-card class="box-card" shadow="never">-->
<!--            <div slot="header" class="clearfix">-->
<!--              <span>文章收藏</span>-->
<!--            </div>-->
<!--            <div class="article-star">-->
<!--              &lt;!&ndash;              <el-list>&ndash;&gt;-->
<!--              &lt;!&ndash;                <el-list-item v-for="item in articleStars" :key="item.name">&ndash;&gt;-->
<!--              &lt;!&ndash;                  {{ item.name }}&ndash;&gt;-->
<!--              &lt;!&ndash;                </el-list-item>&ndash;&gt;-->
<!--              &lt;!&ndash;              </el-list>&ndash;&gt;-->
<!--            </div>-->
<!--          </el-card>-->
<!--        </el-col>-->
      </el-row>

      <el-row :gutter="10" class="mt-20">
        <el-col :span="19">
          <el-card class="box-card" shadow="never">
            <WordCountView v-if="Account" :account="Account"></WordCountView>
          </el-card>
        </el-col>

        <el-col :span="5">
<!--          <el-card class="box-card" shadow="never">-->
<!--            <div slot="header" class="clearfix">-->
<!--              <span>专题收藏</span>-->
<!--            </div>-->
<!--          </el-card>-->
          <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>待办事项</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import DateTimeDisplay from '../views/main/DateTimeDisplay.vue';
import WebSiteStar from "@/views/WebsiteStar";
import WordCountView from "@/views/WordCountView";
import Weather from "@/views/weather/Weather";
import { useAuthStore } from "@/store/auth";
import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";
const authStore = useAuthStore();
const token = ref(authStore.token);
const Account = ref("");
const username = ref("");
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
    console.log('获取账户信息成功:', Account.value)
    return Account.value; // 返回账户信息
  } catch (error) {
    console.error('获取账户信息失败:', error);
    ElMessage.error('获取账户信息失败');
    authStore.clearToken();
    return null;
  }
};
onMounted(async () => {
  //先获取账户信息
  await getAccount();

  //确认Account有值后，再加载数据
  if (Account.value) {
    await axios.post('http://localhost:8004/user/getUserName', {},{
      params:{
        account: Number(Account.value)
      }
    }).then(res => {
      username.value = res.data.data;
    })
  }
  else {
    ElMessage.error('获取账户信息失败，请重新登录');
    await router.push({ name: 'login' });
  }
});
// 词数图表配置
const wordChartOptions = ref({
  // Word count chart options
});

// 请求流量图表配置
const requestChartOptions = ref({
  // Request flow chart options
});

// 文章收藏列表
const articleStars = ref([
  { name: 'Blossom目录' },
  { name: '关于Blossom笔记' },
  { name: 'Markdown 语法拓展' },
]);

// 主题收藏列表
const subjectStars = ref([
  { name: '三体【地球往事】' },
  { name: '三体【死神永生】' },
  { name: '三体【黑暗森林】' },
  { name: 'Blossom 介绍' },
]);

// 待办事项列表
const todoList = ref([
  '文章点赞功能',
  '图片水印',
  '长时间不使用的提醒',
]);
</script>

<style scoped>
.dashboard {
  height: 100%;
}

.header {
  background-color: #FDFBFB;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #B8CAC1;
}

.name {
  display: block;
  text-align: left;
  font-size: 20px;
  font-weight: bold;
  color: #888;
  padding-left: 10px;
}

.main-content {
  width: 100%;
  padding: 5px;
}

.box-card {
  padding: 0;
  background-color: #FDFBFB;
  /*border: none;*/
}

.avatar {
  width: 100%;
  height: auto;
  border-radius: 50%;
}

.mt-20 {
  margin-top: 20px;
}
</style>