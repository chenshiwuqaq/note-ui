<template>
  <div class="login-container">
    <div style="width: 200px;position: absolute;top: 0;" v-show="loginSuccess">
      <el-alert title="登录成功" type="success" show-icon />
    </div>
    <!-- 登录框 -->
    <div class="login-box">
      <div>
        <img src="@/assets/imgs/pic.jpg"  style="width: 150px; height: 150px" alt="">
      </div>
      <el-form
        :model="form"
        label-width="50px"
        ref="formRef"
        style="margin-top: 30px"
      >
        <el-form-item class="custom-label" prop="account">
          <el-input
              id="account_input"
              v-model="form.account"
              placeholder="请输入账号/手机号/邮箱"
          />
        </el-form-item>
        <el-form-item class="custom-label" prop="password">
          <el-input
              id="password_input"
              v-model="form.password"
              placeholder="请输入密码"
              type="password"
          />
        </el-form-item>
        <div class="submit">
          <el-form-item>
            <el-button type="primary" @click="onSubmit" class="function-log">登录</el-button>
            <el-button @click="toRegister" class="function-reg" style="margin-left: 70px">注册</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import {useAuthStore} from "@/store/auth";
import { nextTick, reactive, ref, toRefs } from "vue";
import axios from "axios";
import { FormInstance } from "element-plus";
import router from "@/router";
const loginSuccess = ref(false);

const form = reactive({
  account: "",
  password: "",
});

const formRef = ref<FormInstance>();
function toRegister(){
  router.push({name:'register'})
}
//提交账号和密码
const onSubmit = async () => {
  try {
    const response = await axios.post("http://localhost:8004/user/login", {
      accountDTO: form.account,
      passwordDTO: form.password,
    })

    if (response.data.code === 0) {
      const token = response.data.data
      const authStore = useAuthStore()

      // 设置 token
      authStore.setToken(token)

      // 确保状态更新后再跳转
      await nextTick()

      // 可以获取用户信息
      const userResponse = await axios.get('http://localhost:8004/user/current')
      if (userResponse.data.code === 200) {
        sessionStorage.setItem('userInfo', JSON.stringify(userResponse.data.data))
      }

      loginSuccess.value = true;
      // 跳转到首页
      router.push({ name: 'home' });
    }
  } catch (error) {
    console.log("登录失败", error);
  }
};
</script>

<style scoped>
.custom-label{
  font-weight: bold;
  font-size: 18px;
}
.login-box {
  justify-content: center;
  align-items: center;
  height: 50vh; /* 使登录框垂直居中 */
}

.login-container {
  background: linear-gradient(135deg, #fdf9db 0%, rgba(203, 243, 119, 0.76) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  position: relative;
}


/* 登录框 */
.login-box {
  height: 350px;
  width: 300px;
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
}


.submit {
}

.function-log{
  width: 90px;
  border-radius: 5px;
  transition: background-color 0.3s, transform 0.3s;
  background-color: #63a35c;
}
.function-reg{
  width: 90px;
  border-radius: 5px;
  transition: background-color 0.3s, transform 0.3s;
}
.function-log:hover {
  transform: scale(1.05); /* 悬停时的缩放效果 */
}
.function-reg:hover .function-reg:hover{
  transform: scale(1.05); /* 悬停时的缩放效果 */
}
.el-alert {
  margin: 20px 0 0;
}
.el-alert:first-child {
  margin: 0;
}
</style>