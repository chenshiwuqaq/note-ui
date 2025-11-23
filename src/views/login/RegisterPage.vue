<template>
  <div class="register-container">
    <div class="register-box">
      <div>
        <img src="@/assets/imgs/pic.jpg"  style="width: 150px; height: 150px;margin-bottom: 20px" alt="">
      </div>
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        status-icon
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
      >
        <el-form-item prop="account">
          <el-input
              v-model.number="ruleForm.account"
              placeholder="电子邮箱/手机号码"
              @blur="identifyAccountType"
          />
        </el-form-item>
        <el-form-item prop="username">
          <el-input
              v-model.number="ruleForm.username"
              placeholder="输入用户名"
          />
        </el-form-item>
        <el-form-item prop="pass">
          <el-input
              v-model="ruleForm.pass"
              placeholder="输入密码"
              type="password"
              autocomplete="off"
          />
        </el-form-item>
        <el-form-item prop="checkPass">
          <el-input
            v-model="ruleForm.checkPass"
            placeholder="确认密码"
            type="password"
            autocomplete="off"
          />
        </el-form-item>


        <div class="submit">
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">
              注册
            </el-button>
            <el-button @click="toLogin" style="margin-left: 90px">返回</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <!-- 注册成功弹窗 -->
    <el-dialog
        v-model="showSuccessDialog"
        title="注册成功"
        :width="400"
        center
        :close-on-click-modal="false"
        append-to-body
    >
      <div class="dialog-content">
        注册成功！你的登录账户为：
        <span class="account-text">{{ backAccount }}</span>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleGotoLogin">
          已记住 跳转至登录界面
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import axios from "axios";

const ruleFormRef = ref<FormInstance>();
//注册成功弹窗显示控件
const showSuccessDialog = ref(true);
//注册成功获得的账号
const backAccount = ref('');

//验证密码格式
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("密码不能为空"));
  } else {
    callback();
  }
};
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== ruleForm.pass) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};
//验证账号(手机号或邮箱)格式
const validateAccount =(rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入账号(手机号/邮箱)"));
  } else {
    const phoneReg = /^1[3-9]\d{9}$/;
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (phoneReg.test(value) || emailReg.test(value)) {
      callback();
    } else {
      callback(new Error("请输入正确的手机号或邮箱"));
    }
  }
};

const ruleForm = reactive({
  account: "",
  phoneNumber: "",
  email: "",
  username: "",
  pass: "",
  checkPass: "",
});
const rules = reactive<FormRules<typeof ruleForm>>({
  account: [{ required: true, message: "请输入账号(手机号/邮箱)", trigger: "blur" },
    { validator: validateAccount, trigger: "blur" }],
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  pass: [{ validator: validatePass, trigger: "blur" }],
  checkPass: [{ validator: validatePass2, trigger: "blur" }],
});

// 识别账号类型并赋值给对应字段（phone 或 email）
const identifyAccountType = () => {
  const value = ruleForm.account;
  if (!value) return;

  const phoneReg = /^1[3-9]\d{9}$/;
  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  ruleForm.phoneNumber = '';
  ruleForm.email = '';

  if (phoneReg.test(value)) {
    ruleForm.phoneNumber = value; // 是手机号，赋给 phone 字段
  } else if (emailReg.test(value)) {
    ruleForm.email = value; // 是邮箱，赋给 email 字段
  }
};

//提交注册信息
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      console.log("submit!", ruleForm);
      const userData = {
        userName: ruleForm.username,  // 对应UserDTO的username字段
        password: ruleForm.pass,      // 对应UserDTO的password字段
        phoneNumber: ruleForm.phoneNumber ? ruleForm.phoneNumber : null,
        email: ruleForm.email ? ruleForm.email : null
      };
      axios
          .post("http://localhost:8004/user/register", userData)
          .then((response) => {
            if(response.data.code===0){
              backAccount.value = response.data.data;
              showSuccessDialog.value = true;
              //ElMessage.success('注册成功！');
            }else if(response.data.code===1){
              ElMessage.error('账号已存在，请重新输入');
            }
          })
          .catch((error) => {
            console.log(error);
            ElMessage.error('注册失败，请稍后重试');
          });
    } else {
      console.log("error submit!");
      ElMessage.warning('请完善表单信息');
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//头像上传
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}

//跳转登录
import router from "@/router";

const toLogin = () => {
  router.push({ name: 'login' });
};
// 弹窗跳转登录（关闭弹窗+跳转）
const handleGotoLogin = () => {
  showSuccessDialog.value = false;
  toLogin();
};
</script>

<style scoped>
.register-container{
  background: linear-gradient(135deg, #FFEEAD 0%, #D4EE9F 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.register-box {
  width: 300px;
  background: rgba(255, 255, 255, 0.3);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
}
.submit {
  margin-left: 90px;
}
</style>

