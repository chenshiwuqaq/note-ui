<template>
  <div class="setting">
    <div class="setting-head">
      <div style="padding-bottom: 10px">
        <el-text class="mx-1" tag="b" style="font-size: 18px">用户信息设置</el-text>
      </div>
      <div style="padding-bottom: 5px">
        <el-text class="mx-1" style="font-size: 13px">修改用户的个人信息，若无内容请点击下方刷新</el-text>
      </div>
      <el-button type="info" plain :icon="Refresh" @click="refresh" style="width: 80px; height: 15px; font-size: 12px">
        刷新
      </el-button>
    </div>

    <div class="setting-main">
      <el-form
          ref="ruleFormRef"
          style="max-width: 600px"
          :model="ruleForm"
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm"
          :size="formSize"
          status-icon
      >
        <el-form-item label="账号" prop="account">
          <el-input v-model="ruleForm.account" disabled :prefix-icon="CreditCard"/>
          <span class="setting-tip">账号用于登录</span>
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="ruleForm.userName" :prefix-icon="User"/>
          <span class="setting-tip">填写你的用户名</span>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="ruleForm.password" :prefix-icon="Lock" :type="showPassword ? 'text' : 'password'">
            <template #suffix>
              <el-icon class="show-pwd" @click="showPassword = !showPassword">
                <component :is="showPassword ? 'View' : 'Hide'" />
              </el-icon>
            </template>
          </el-input>
          <el-button plain @click="open" style="background-color: #B8CAC1;color: white">修改密码</el-button>
        </el-form-item>
        <el-form-item label="账号备注" prop="remark">
          <el-input v-model="ruleForm.remark" :prefix-icon="Notebook"/>
          <span class="setting-tip">说明会在首页显示</span>
        </el-form-item>
        <el-form-item label="天气预报城市" prop="region">
          <el-select
              v-model="ruleForm.region"
              placeholder="搜索并选择城市"
              :prefix-icon="MostlyCloudy"
              filterable
              :remote-method="handleRemoteSearch"
              :loading="loadingCities"
          >
            <el-option
                v-for="item in filteredCities"
                :key="item.weatherCode"
                :label="item.name"
                :value="item.name"
            />
          </el-select>
          <span class="setting-tip">可直接输入进行搜索，城市天气会在首页显示</span>
        </el-form-item>
        <el-form-item class="submit-btn-item">
          <el-button type="primary" @click="submitForm(ruleFormRef)" style="background-color: #B8CAC1">保存</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog v-model="dialogVisible" title="修改密码" width="30%">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" style="background-color: #B8CAC1;color: white">取消</el-button>
          <el-button type="primary" @click="submitPasswordForm" style="background-color: #B8CAC1">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, onMounted, watch} from 'vue'
import {Refresh, User, CreditCard, Notebook, MostlyCloudy, Lock, View, Hide} from '@element-plus/icons-vue'
import type {ComponentSize, FormInstance} from 'element-plus'
import {ElMessage} from 'element-plus'
import axios from "axios";
import { useRoute } from 'vue-router'
import {useAuthStore} from "@/store/auth";
interface City {
  name: string;
  weatherCode: string;
}
const loadingCities = ref(false);
const filteredCities = ref<City[]>([]);

const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const passwordFormRef = ref()
const dialogVisible = ref(false)
const showPassword = ref(false)
const route = useRoute()

const authStore = useAuthStore();
const token = ref(authStore.token);
const Account = ref("");

const cityList = ref<City[]>([]);
const weatherCode = ref('101040100'); // 默认城市编码，例如重庆

// 远程搜索处理函数
const handleRemoteSearch = async (query: string) => {
  if (!query) {
    filteredCities.value = [];
    return;
  }

  loadingCities.value = true;
  try {
    // 假设后端提供城市搜索接口，这里使用模拟数据
    const response = await axios.get('http://localhost:8001/api/user/search', {
      params: { keyword: query }
    });
    filteredCities.value = response.data.data as City[];
  } catch (error) {
    console.error('城市搜索失败:', error);
    ElMessage.error('城市搜索失败');
  } finally {
    loadingCities.value = false;
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
    console.log('获取到的账户:', Account.value);
    return Account.value; // 返回账户信息
  } catch (error) {
    console.error('获取账户信息失败:', error);
    ElMessage.error('获取账户信息失败');
    return null;
  }
};

// 刷新用户信息
const refresh = async (account: string) => {
  if (!account) {
    ElMessage.warning('账户信息缺失');
    return;
  }

  try {
    const response = await axios.get('http://localhost:8001/api/user/info', {
      params: { account: Account.value }
    });
    const data = response.data.data;
    if (data&&data.user) {
      ruleForm.account = data.user.account;
      ruleForm.userName = data.user.userName || '';
      ruleForm.remark = data.user.remark || '';
      ruleForm.region = data.user.region || '';
      ruleForm.password = data.user.password || '';
      console.log('更新后的表单数据:', ruleForm);
      cityList.value = data.cities as City[]; // 类型断言（确保 TypeScript 认可）
      filteredCities.value = [...cityList.value]; // 初始化过滤列表
      //在cityList中遍历找到region，并将weatherId取出用于首页实时天气的显示
      const selectCity = cityList.value.find(city => city.name === data.user.region);
      if(selectCity){
        authStore.setCityInfo(selectCity.name, selectCity.weatherCode);
      }else{
        console.warn(`在城市列表中未找到城市: ${data.user.region}，将使用默认编码(重庆 重庆)`);
      }
    } else {
      console.error('返回的用户数据为空');
      ElMessage.warning('未获取到用户数据');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
  }
};

// 组合操作：先获取账户，然后刷新信息
const loadUserData = async () => {
  const account = await getAccount();
  if (account) {
    await refresh(account);
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadUserData();
});

// 监听路由变化
watch(() => route.path, (newPath) => {
  if (newPath === '/setting') {
    loadUserData();
  }
});
interface RuleForm {
  account: string
  userName: string
  password: string
  region: string
  remark: string
}

interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const ruleForm = reactive<RuleForm>({
  account: '',
  userName: '',
  password: '',
  remark: '',
  region: '',
})

const passwordForm = reactive<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = reactive({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  remark: [
    { max: 50, message: '长度最多 50 个字符', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ]
})

const passwordRules = reactive({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

//提交表单(用户名、说明、城市）
const submitForm = async (formEl: any) => {
  if (!formEl) return
  await formEl.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 构造符合后端DTO格式的数据
        const userInfoDTO = {
          account: ruleForm.account,
          userName: ruleForm.userName,
          remark: ruleForm.remark,
          region: ruleForm.region
        };
        
        await axios.put('http://localhost:8001/api/user/update', userInfoDTO);
        ElMessage.success('用户信息修改成功！');
        // 主动更新天气编码
        const selectCity = cityList.value.find(city => city.name === ruleForm.region);
        if (selectCity) {
          authStore.setCityInfo(selectCity.name, selectCity.weatherCode);
        }
      } catch (error) {
        console.error('修改失败:', error);
        ElMessage.error('修改失败，请稍后再试');
      }
    }
  })
}

//修改密码弹出框
const open = () => {
  dialogVisible.value = true
}

const submitPasswordForm = async () => {
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 构造符合后端DTO格式的数据
        const passwordUpdateDTO = {
          account: ruleForm.account,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        };
        
        await axios.post('http://localhost:8001/api/user/password', passwordUpdateDTO);
        ElMessage.success('密码修改成功！');
        passwordForm.oldPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        dialogVisible.value = false;
      } catch (error) {
        console.error('修改密码失败:', error);
        ElMessage.error('修改密码失败，请稍后再试');
      }
    }
  })
}
</script>

<style scoped>
.setting {
  padding: 5% 0 0 18%;
}

.setting-head {
  text-align: left;
  padding-left: 4%;
}

.setting-main {
  padding: 3% 0 0 8%;
}

.setting-tip {
  font-size: 12px;
  color: #B7B7B7;
}

.demo-ruleForm {
  display: flex;
  flex-direction: column;
}

.show-pwd {
  cursor: pointer;
}
</style>