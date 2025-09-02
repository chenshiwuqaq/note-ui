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
        <el-form-item label="用户名" prop="username">
          <el-input v-model.number="ruleForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="pass">
          <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input
            v-model="ruleForm.checkPass"
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
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import axios from "axios";

const ruleFormRef = ref<FormInstance>();

//验证密码格式
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("密码不能为空"));
  } else {
    if (ruleForm.checkPass !== "") {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField("checkPass");
    }
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

const ruleForm = reactive({
  username: "",
  pass: "",
  checkPass: "",
});
const rules = reactive<FormRules<typeof ruleForm>>({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  pass: [{ validator: validatePass, trigger: "blur" }],
  checkPass: [{ validator: validatePass2, trigger: "blur" }],
});

//提交注册信息
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      console.log("submit!");
      axios
        .post("http://localhost:8000/user/register", {
          usernameDTO: "username",
          passwordDTO: "password",
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("error submit!");
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
import router from "@/router";


function toLogin() {
  router.push({name:'login'})
}
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

