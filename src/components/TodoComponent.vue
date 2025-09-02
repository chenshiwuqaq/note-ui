<template>
  <div style="display: flex;position: relative">
    <div class="overlay" id="overlay"></div>
    <div class="alert">
      <transition name="fade-slide">
        <el-alert
          v-if="showSuccessAlert"
          :title="successAlertTitle"
          type="success"
          show-icon
          class="alert-item"
        />
      </transition>

      <transition name="fade-slide">
        <el-alert
          v-if="showErrorAlert"
          :title="errorAlertTitle"
          type="error"
          show-icon
          class="alert-item"
        />
      </transition>
    </div>
    <div class="add-task" id="add-task">
      <div class="add-title">
        <div style="text-align: left"><span class="title">新增任务</span></div>
      </div>
      <form class="inputs">
        <div>
          <label for="task-title">标题：</label>
          <input id="task-title" v-model="addTaskValue.taskTitle">
        </div>
        <div style="display: flex">
          <div style="margin-top: 20px;margin-left: 50px"><label for="task-content">内容：</label></div>
          <textarea id="task-content" style="resize:none;" v-model="addTaskValue.taskContent"></textarea>
        </div>
        <div style="display: flex;margin-top: 20px">
          <div style="margin-left: 55px"><span>标签: </span></div>
          <div class="flex gap-2">
            <el-tag
              v-for="tag in addTaskValue.taskTags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="InputRef"
              v-model="inputValue"
              class="w-20"
              size="small"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
              style="width: 100px;outline-color:rgb(192, 214, 149)"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInput">
              + 标签
            </el-button>
          </div>
        </div>
        <div style="display: flex;margin-top: 20px">
          <div style="margin-left: 32px;margin-top: 4px"><span>截止至：</span></div>
          <div class="block">
            <el-date-picker
              :disabled-date="disabledDateFn"
              v-model="value2"
              type="datetime"
              placeholder="请输入截止日期"
              format="YYYY-MM-DD hh:mm:ss"
              value-format="YYYY-MM-DD hh:mm:ss"
              style="outline-color: rgb(192, 214, 149);"
            />
          </div>
        </div>
        <div style="display: flex;margin-top: 20px">
          <div style="margin-left: 32px;margin-top: 4px"><span>优先级：</span></div>
          <div class="block">
            <el-select v-model="addTaskValue.priority" placeholder="请选择优先级" style="width: 200px">
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </div>
        </div>
      </form>
      <div class="addTask-function">
        <div style="margin-left: 20px">
          <button class="add-return" @click="addReturn"><span>返回</span></button>
        </div>
        <div style="margin-left: 200px">
          <button class="add-confirm" @click="addTodoConfirm"><span>确认</span></button>
        </div>
      </div>
    </div>
    <div class="check-task" id="check-task">
      <div class="check-title">
        <div style="text-align: left"><span class="title">任务详情</span></div>
      </div>
      <form class="inputs">
        <div>
          <label for="check-task-title">标题：</label>
          <input id="check-task-title" v-model="checkTaskValue.taskTitle" :readonly="titleIsReadOnly" />
        </div>
        <div style="display: flex">
          <div style="margin-top: 20px;margin-left: 50px"><label for="check-task-content">内容：</label></div>
          <textarea style="resize:none;" id="check-task-content" v-model="checkTaskValue.taskContent"
                    :readonly="contentIsReadOnly"></textarea>
        </div>
        <div style="display: flex;margin-top: 20px">
          <div style="margin-left: 55px"><span>标签: </span></div>
          <div class="flex gap-2">
            <el-tag
              v-for="tag in checkTaskValue.taskTags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="InputRef"
              v-model="inputValue"
              class="w-20"
              size="small"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
              style="width: 100px;outline-color:rgb(192, 214, 149)"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInput" v-if="isCheck">
              + 标签
            </el-button>
          </div>
        </div>
        <div style="display: flex;margin-top: 20px">
          <div style="margin-left: 32px;margin-top: 4px"><span>开始时间：</span></div>
          <div class="block">
            <el-date-picker
              :disabled="PickerIsRead"
              :disabled-date="disabledDateFn"
              v-model="checkTaskValue.startTime"
              type="datetime"
              placeholder="空"
              format="YYYY-MM-DD hh:mm:ss"
              value-format="YYYY-MM-DD hh:mm:ss"
              style="outline-color: rgb(192, 214, 149);"
            />
          </div>
        </div>
        <div style="display: flex;margin-top: 20px">
          <div style="margin-left: 32px;margin-top: 4px"><span>截止时间：</span></div>
          <div class="block">
            <el-date-picker
              :disabled="PickerIsRead"
              :disabled-date="disabledDateFn"
              v-model="checkTaskValue.endTime"
              type="datetime"
              placeholder="空"
              format="YYYY-MM-DD hh:mm:ss"
              value-format="YYYY-MM-DD hh:mm:ss"
              style="outline-color: rgb(192, 214, 149);"
            />
          </div>
        </div>
      </form>
      <div class="checkTask-function">
        <div v-if="!isCheck" style="margin-left: 20px">
          <button class="check-return" @click="checkReturn"><span>返回</span></button>
        </div>
        <div v-if="!isCheck" style="margin-left: 200px">
          <button class="check-to-edit" @click="checkToEdit"><span>编辑</span></button>
        </div>
        <div v-if="isCheck" style="margin-left: 20px;">
          <button class="edit-return" @click="editReturn"><span>返回</span></button>
        </div>
        <div v-if="isCheck" style="margin-left: 200px;">
          <button class="editConfirm" @click=""><span>保存</span></button>
        </div>
      </div>
    </div>
    <div class="left" :class="{ 'left-expanded': !showRightPanel }">
      <div style="height: 92px;background-color: white">
        <img style="height: 100px;width: 150px" src="@/assets/imgs/pig.jpg" alt="">
      </div>
      <div class="demo-collapse">
        <el-collapse v-model="activeName" accordion>
          <el-collapse-item title="每日待办事项" name="1">
            <el-calendar v-model="calendarValue" class="calender">
              <template #date-cell="{ data,isSelected,day }">
                <div
                  :class="['calendar-day', { 'selected-day':isSelected }]"
                  @click="handleDateClick(data)">
                  <!-- 显示格式化的日期（如 yyyy-MM-dd） -->
                  {{ data.day.split("-").slice(2).join("-") }}
                </div>
              </template>
            </el-calendar>
          </el-collapse-item>
          <el-collapse-item title="阶段性事项" name="2">
            <div style="">
              <thing class="milestones" v-for="milestone in UncompletedMilestones" :key="milestone.todoId"
                     :todo="milestone"
                     ref="thingRefs" @dblclick="check(milestone)" />
            </div>
          </el-collapse-item>
          <el-collapse-item title="阶段性事项 已完成" name="3">
            <div>
              <thing class="milestones"
                     v-for="milestone in completedMilestones"
                     :key="milestone.todoId"
                     :todo="milestone"
                     ref="thingRefs"
                     @dblclick="check(milestone)" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <div class="center" :class="{ 'center-expanded': !showRightPanel }">
      <div class="center-top">
        <div
          style="background-color: rgb(192, 214, 149);width:100%;height: 10px;border-radius: 10px;border: solid 1px rgb(220, 223, 230)"></div>
        <div class="status">
          <div style="display: flex;margin-left: 550px;width: 60px">
            <div class="circle" style="background-color: rgb(199, 208, 214)"></div>
            <span style="width: 60px">待办</span>
          </div>
          <div style="display: flex;margin-left: 25px">
            <div class="circle" style="background-color: rgb(236, 212, 82)"></div>
            <span style="width: 60px">进行中</span>
          </div>
          <div style="display: flex;margin-left: 25px">
            <div class="circle" style="background-color: rgb(192, 214, 149)"></div>
            <span style="width: 60px">完成</span>
          </div>
        </div>
        <div class="function">
          <div style="margin-left: 20px;display: flex;">
            <button class="change" style="width: 60px;margin-right: 10px" @click="accessCheckbox"><span>选择</span></button>
            <button class="change" style="margin-right: 10px" @click="waitingToProcessing"><span>添加到进行中</span></button>
            <button class="change" @click="processToCompleted"><span>添加到完成</span></button>
            <button class="change" @click="deleteTodo" style="width: 60px;margin-left: 10px"><span>删除</span></button>
          </div>
          <el-select
            v-model="selectValue"
            placeholder="根据标签筛选"
            size="small"
            style="width: 150px;margin-left: 5%;margin-top: 4px;height: 30px"
          >
            <el-option
              v-for="item in options"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <div class="buttons">
            <div>
              <button class="other" @click="searchByTagsConfirm"><span style="padding: 2px 2px 2px 2px;">确认</span></button>
            </div>
            <div>
              <button class="other"><span style="padding: 2px 2px 2px 2px;">导出任务</span></button>
            </div>
            <div>
              <button class="other"><span style="padding: 2px 2px 2px 2px;">显示统计</span></button>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="todo">
          <div class="content-title">
            <div>
              <span class="title">待办</span>
              <i style="margin-left: 140px;font-size: 20px" id="addTaskButton" class="iconfont icon-jiahao"
                 @click="addTaskButton"></i>
            </div>
            <div class="calculator"><span>waiting</span><span
              style="margin-left: 130px">{{ waitingTodos.length }}</span></div>
            <div style="width: 240px;height: 1px;background-color: rgb(220, 223, 230);margin-left: 40px"></div>
          </div>
          <div style="position: relative">
            <thing class="waiting" v-for="waitingTodo in waitingTodos" :key="waitingTodo.todoId" :todo="waitingTodo"
                   ref="thingRefs" @dblclick="check(waitingTodo)" />
          </div>
        </div>
        <div class="In-progress">
          <div class="content-title">
            <div><span class="title">进行中</span></div>
            <div class="calculator"><span>processing</span><span
              style="margin-left: 130px">{{ processTodos.length }}</span></div>
            <div style="width: 240px;height: 1px;background-color: rgb(220, 223, 230);margin-left: 40px"></div>
          </div>
          <div>
            <thing class="process" v-for="processTodo in processTodos" :key="processTodo.todoId" :todo="processTodo"
                   ref="thingRefs" @dblclick="check(processTodo)" />
          </div>
        </div>
        <div class="finish">
          <div class="content-title">
            <div><span class="title">完成</span></div>
            <div class="calculator"><span>completed</span><span
              style="margin-left: 130px">{{ completedTodos.length }}</span></div>
            <div style="width: 240px;height: 1px;background-color: rgb(220, 223, 230);margin-left: 40px"></div>
          </div>
          <div>
            <thing class="completed" v-for="completedTodo in completedTodos" :key="completedTodo.todoId"
                   :todo="completedTodo" ref="thingRefs" @dblclick="check(completedTodo)" />
          </div>
        </div>
      </div>
    </div>
    <transition name="slide-fade">
      <div class="right" v-show="showRightPanel">
        <div class="tasks">
          <div style="text-align: left;margin-left: 20px;padding-top: 40px"><span style="font-size: 20px">所有任务</span>
          </div>
          <div style="display: flex">
            <div class="task" style="background-color: rgb(199, 208, 214);">
              <span>未开始</span>
              <span style="margin-left: 20px;font-size: 18px">{{ waitingTodos.length }}</span>
            </div>
            <div class="task" style="background-color: rgb(236, 212, 82)">
              <span>进行中</span>
              <span style="margin-left: 20px">{{ processTodos.length }}</span>
            </div>
          </div>
          <div style="display: flex">
            <div class="task" style="background-color: rgb(192, 214, 149)">
              <span>完成数</span>
              <span style="margin-left: 20px">{{ completedTodos.length }}</span>
            </div>
            <div class="task" style="background-color: rgb(211, 220, 197)">
              <span>任务总数</span>
              <span style="margin-left: 20px">{{ waitingTodos.length + completedTodos.length + processTodos.length
                }}</span>
            </div>
          </div>
        </div>
        <div v-if="urgentTodos.length > 0" class="urgent-todos">
          <div style="text-align: left;margin-left: 20px;margin-top: 20px">
            <span style="font-size: 18px;color: #E6A23C">即将到期待办</span>
          </div>
          <div class="urgent-list">
            <div v-for="todo in urgentTodos" :key="todo.todoId" class="urgent-item" @dblclick="check(todo)">
              <div class="urgent-title">{{ todo.taskTitle }}</div>
              <div class="urgent-time">
                剩余时间：{{ getRemainingTime(todo.endTime) }}
              </div>
            </div>
          </div>
        </div>
        <div style="height: 2px;
  width: 90%;
  margin: 0 5%;
background: linear-gradient(90deg,
  rgba(170,175,185,0) 10%,
  rgba(150,160,170,0.95) 50%,
  rgba(170,175,185,0) 100%
);
  box-shadow: 0 2px 4px rgba(200,205,210,0.15);
  position: relative;"></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
// 防抖和加载锁
import { useAuthStore } from "@/store/auth";

const isLoading = ref(false);
let debounceTimer: number | null = null;
function handleDateClick(date: any) {
  if (isLoading.value) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(async () => {
    isLoading.value = true;
    try {
      await getDate(date);
    } catch (e) {
      showAlert('error', '加载数据失败，请稍后重试', 3000);
    } finally {
      isLoading.value = false;
    }
  }, 300);
}

import { onBeforeMount, ref, reactive, computed,} from "vue";
import Thing from "@/components/thing.vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
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
const completedMilestones = computed(() => {
  return milestones.filter(m => m.todoStatus === "完成");
});
const UncompletedMilestones = computed(() => {
  return milestones.filter(m => m.todoStatus === "待办" || m.todoStatus === "进行中");
});

// 新增转换方法
const convertTags = {
  // 字符串转数组（用于加载数据）
  toArray(tags: string | string[]): string[] {
    return typeof tags === "string"
      ? tags.split(",").map(t => t.trim())
      : tags;
  },
  // 数组转字符串（用于保存数据）
  toString(tags: string[]): string {
    return tags.join(",");
  }
};
const value = ref(new Date());
const calendarValue = ref<Date>(new Date());  // 日历专用
const selectValue = ref("");            // 下拉框专用
const activeName = ref("1");
const options :string[]= reactive([]);
const value2 = ref("");
const isCheck = ref(false);
const PickerIsRead = ref(true);
const titleIsReadOnly = ref(true);
const contentIsReadOnly = ref(true);
const checkTaskValue = reactive({
  taskTitle: "",
  taskContent: "",
  taskTags: [] as string[] | string,
  startTime: "" as Date | string,
  endTime: "" as Date | string,
  userAccount: 0n as bigint
});
const addTaskValue = reactive({
  todoId: 0,
  todoStatus: "待办",
  taskTitle: "",
  taskContent: "",
  taskTags: [] as string[] | string,
  startTime: "" as Date | string,
  endTime: "" as Date | string,
  userAccount: 0 as number,
  createTime: "" as Date | string,
  priority: "高"
});
//通知框的内容与出现控制
const successAlertTitle=ref("");
const errorAlertTitle = ref("");
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
//通知出现和改变内容函数
function showAlert(alertType: 'success' | 'error', message: string, duration: number = 3000) {
  if (alertType === 'success') {
    successAlertTitle.value = message;
    showSuccessAlert.value = true;
    setTimeout(() => (showSuccessAlert.value = false), duration);
  } else if (alertType === 'error') {
    errorAlertTitle.value = message;
    showErrorAlert.value = true;
    setTimeout(() => (showErrorAlert.value = false), duration);
  }
}
//添加待办

async function addTodoConfirm() {
  addTaskValue.endTime = convertToISOTime(value2.value);
  const now = dayjs();
  const isoFormat = now.format("YYYY-MM-DDTHH:mm:ss");
  addTaskValue.startTime = isoFormat;
  addTaskValue.createTime = isoFormat;
  
  if (addTaskValue.taskTitle === "") {
    showAlert('error', '标题不能为空', 3000)
    return;
  }

  if (addTaskValue.endTime === "") {
    showAlert('error', '请选择截止时间', 3000)
    return;
  }

  if (!addTaskValue.priority) {
    showAlert('error', '请选择优先级', 3000)
    return;
  }

  if (Array.isArray(addTaskValue.taskTags)) {
    addTaskValue.taskTags = convertTags.toString(addTaskValue.taskTags);
  }

  addTaskValue.userAccount = account.value;

  try {
    const response = await axios.post("http://localhost:8000/todo/addTodo", {
      todoId: addTaskValue.todoId,
      todoStatus: addTaskValue.todoStatus,
      taskTitle: addTaskValue.taskTitle,
      taskContent: addTaskValue.taskContent,
      taskTags: addTaskValue.taskTags,
      startTime: addTaskValue.startTime,
      endTime: addTaskValue.endTime,
      userAccount: addTaskValue.userAccount,
      createTime: addTaskValue.createTime,
      priority: addTaskValue.priority,
    });

    if (response.data.data === true) {
      showAlert('success', 'todo添加成功', 3000)
      const addTask = document.getElementById("add-task");
      const overlay = document.getElementById("overlay");
      (addTask as HTMLElement | null)?.style.setProperty("display", "none");
      (overlay as HTMLElement | null)?.style.setProperty("display", "none");
    }
    getDate({
      day: dayjs().format("YYYY-MM-DDT00:00:00"),
      type: "current-month",
      isSelected: false,
      date: new Date()
    });
  } catch (error) {
    showAlert('error', '添加失败,请稍后重试', 3000)
  }
}
//删除待办
const deleteTodo = async () => {
  const selectedIds = getCheckedIds();
  if (selectedIds.length === 0) {
    showAlert('error', "请选择待办事项!", 3000);
    return;
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除选中的待办事项吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const numericIds = selectedIds.map(id => Number(id));
    const response = await axios.post("http://localhost:8000/todo/deleteTodo", numericIds);

    if (response.data.code === 0) {
      showAlert('success', "删除成功", 3000);
      await getDate({
        day: dayjs().format("YYYY-MM-DDT00:00:00"),
        type: "current-month",
        isSelected: false,
        date: new Date()
      });
      // 关闭选择模式
      isSelectMode.value = false;
      accessCheckbox();
    } else {
      showAlert('error', response.data.message || "删除失败", 3000);
    }
  } catch (error) {
    if (error === 'cancel') {
      return;
    }
    console.error("删除请求失败:", error);
    showAlert('error', "服务器错误，请稍后重试", 3000);
  }
};
function checkToEdit() {
  alert("进入编辑模式");
  isCheck.value = true;
  PickerIsRead.value = false;
  titleIsReadOnly.value = false;
  contentIsReadOnly.value = false;
}

function checkReturn() {
  const checkTask = document.getElementById("check-task");
  const overlay = document.getElementById("overlay");
  (checkTask as HTMLElement | null)?.style.setProperty("display", "none");
  (overlay as HTMLElement | null)?.style.setProperty("display", "none");
}

function editReturn() {
  isCheck.value = false;
  PickerIsRead.value = true;
  titleIsReadOnly.value = true;
  contentIsReadOnly.value = true;
}

//双击查看详情功能
function check(task: Todo) {
  const checkTaskPage = document.getElementById("check-task");
  const overlay = document.getElementById("overlay");
  (checkTaskPage as HTMLElement | null)?.style.setProperty("display", "block");
  (overlay as HTMLElement | null)?.style.setProperty("display", "block");
  checkTaskValue.taskTitle = task.taskTitle;
  checkTaskValue.taskContent = task.taskContent;
  checkTaskValue.taskTags = task.taskTags;
  checkTaskValue.startTime = task.startTime;
  checkTaskValue.endTime = task.endTime;
}

// 待办、进行中、完成的挂载
export interface Todo {
  todoId: number;
  todoStatus: string;
  taskTitle: string;
  taskContent: string;
  taskTags: string[] | string;
  startTime: Date | string;
  endTime: Date | string;
  userAccount: string;
  createTime: Date | string;
  priority: number;
}

let waitingTodos: Todo[] = reactive([]);
let processTodos: Todo[] = reactive([]);
let completedTodos: Todo[] = reactive([]);
let milestones: Todo[] = reactive([]);

// 转化时间格式
// 将普通时间格式转换为ISO格式（YYYY-MM-DD hh:mm:ss → YYYY-MM-DDThh:mm:ss）
function convertToISOTime(normalTime: string | Date): string {
  const date = typeof normalTime === "string"
    ? new Date(normalTime.replace(" ", "T") + "Z")
    : new Date(normalTime);

  if (isNaN(date.getTime())) throw new Error("非法的日期格式");

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// 将ISO格式转换为普通时间格式（YYYY-MM-DDThh:mm:ss → YYYY-MM-DD hh:mm:ss）
function convertToNormalTime(isoTime: string | Date): string {
  const date = typeof isoTime === "string"
    ? new Date(isoTime.replace("T", " ").replace(/-/g, "/"))
    : new Date(isoTime);

  if (isNaN(date.getTime())) throw new Error("非法的ISO格式");

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function getAllTags() {
  const uniqueTags = new Set<string>(); // 用于存储不重复的标签

  // 遍历 waitingTodos、processTodos 和 completedTodos
  [waitingTodos, processTodos, completedTodos].forEach((todoList) => {
    todoList.forEach((todo) => {
      if (Array.isArray(todo.taskTags)) {
        // 如果 taskTags 是数组
        todo.taskTags.forEach((tag) => {
          if (tag) { // 确保 tag 是有效的字符串
            uniqueTags.add(tag); // 将标签添加到 Set 中
          }
        });
      } else if (todo.taskTags) {
        // 如果 taskTags 是字符串且不为空
        uniqueTags.add(todo.taskTags);
      }
    });
  });
  // 将 Set 转换为普通数组并更新 options
  options.splice(0, options.length, ...Array.from(uniqueTags));
}
// 添加即将到期的待办列表
const urgentTodos = ref<Todo[]>([]);

// 检查截止时间
function checkUrgentTodos() {
  const now = dayjs();
  const urgentList: Todo[] = [];
  
  // 检查所有待办
  [...waitingTodos, ...processTodos].forEach(todo => {
    if (typeof todo.endTime === 'string') {
      const endTime = dayjs(todo.endTime);
      const hoursLeft = endTime.diff(now, 'hour', true);
      
      if (hoursLeft > 0 && hoursLeft <= 3) {
        urgentList.push(todo);
      }
    }
  });
  
  urgentTodos.value = urgentList;
  
  // 如果有即将到期的待办，显示提示
  if (urgentList.length > 0) {
    ElMessageBox.alert(
      `您有 ${urgentList.length} 个待办距离截止日期不足3小时`,
      '截止提醒',
      {
        confirmButtonText: '确定',
        type: 'warning',
      }
    );
  }
}

onBeforeMount(async () => {
  await getAccount();
  if (Account.value){
    await getDate({
      day: dayjs().format("YYYY-MM-DDT00:00:00"),
      type: "current-month",
      isSelected: false,
      date: new Date()
    });
  }
});

// 修改 getDate 函数，在获取数据后检查截止时间
async function getDate(date: {
  type: "prev-month" | "current-month" | "next-month";
  isSelected: boolean;
  day: string;
  date: Date;
}) {
  try {
    const formattedDate = date.day.includes("T")
      ? date.day.split("T")[0] + "T00:00:00"
      : date.day + "T00:00:00";
      
    const [todoResponse, milestonesResponse] = await Promise.all([
      axios.get("http://localhost:8000/todo/getTodayTodoByAccount", {
        params: { account: Account.value, date: formattedDate }
      }),
      axios.get("http://localhost:8000/todo/getMilestones", {
        params: { account: Account.value }
      })
    ]);

    const todos: Todo[] = todoResponse.data.data;
    const milestonesData: Todo[] = milestonesResponse.data.data;

    // 处理 milestones 的日期和标签
    const processedMilestones = milestonesData.map((milestone: Todo) => {
      // 格式化日期字段
      if (typeof milestone.startTime === "string") {
        milestone.startTime = convertToNormalTime(milestone.startTime);
      }
      if (typeof milestone.endTime === "string") {
        milestone.endTime = convertToNormalTime(milestone.endTime);
      }
      if (typeof milestone.createTime === "string") {
        milestone.createTime = convertToNormalTime(milestone.createTime);
      }

      // 处理 taskTags
      if (typeof milestone.taskTags === "string") {
        milestone.taskTags = milestone.taskTags.split(",").map((tag: string) => tag.trim());
      } else if (!milestone.taskTags) {
        milestone.taskTags = [];
      }

      return milestone;
    });

    // 使用 Set 去重
    const uniqueMilestones = Array.from(new Set(processedMilestones.map((milestone: Todo) => JSON.stringify(milestone))))
      .map((milestoneString) => JSON.parse(milestoneString as string));

    // 清空 milestones 数组并添加去重后的数据
    milestones.splice(0, milestones.length, ...uniqueMilestones);

    // 清空其他数组
    waitingTodos.splice(0, waitingTodos.length);
    processTodos.splice(0, processTodos.length);
    completedTodos.splice(0, completedTodos.length);

    // 处理 todos 的日期，并根据状态分类
    todos.forEach((todo: Todo) => {
      // 格式化日期字段
      if (typeof todo.startTime === "string") {
        todo.startTime = convertToNormalTime(todo.startTime);
      }
      if (typeof todo.endTime === "string") {
        todo.endTime = convertToNormalTime(todo.endTime);
      }
      if (typeof todo.createTime === "string") {
        todo.createTime = convertToNormalTime(todo.createTime);
      }

      // 处理 taskTags
      if (typeof todo.taskTags === "string") {
        todo.taskTags = todo.taskTags.split(",").map((tag: string) => tag.trim());
      } else if (!todo.taskTags) {
        todo.taskTags = [];
      }

      if (todo.todoStatus === "待办") {
        waitingTodos.push(todo);
      } else if (todo.todoStatus === "进行中") {
        processTodos.push(todo);
      } else if (todo.todoStatus === "完成") {
        completedTodos.push(todo);
      }
    });
  } catch (error) {
    console.error("获取数据出错:", error);
  } finally {
    getAllTags();
    // 在获取完所有数据后检查一次截止时间
    checkUrgentTodos();
  }
}
//通过标签筛选
function searchByTagsConfirm(){

}
//转移事项处理
const thingRefs = ref<InstanceType<typeof Thing>[]>([]);
const getCheckedIds = () => {
  return thingRefs.value
    .filter(thing => thing.checkboxRef?.checked)
    .map(thing => thing.checkboxRef?.id)
}
// 添加选择模式状态
const isSelectMode = ref(false);

const accessCheckbox = () => {
  isSelectMode.value = !isSelectMode.value;
  thingRefs.value.forEach((thing) => {
    if (thing.checkboxRef) {
      if (isSelectMode.value) {
        thing.checkboxRef.style.display = "block";
      } else {
        thing.checkboxRef.checked = false;
        thing.checkboxRef.style.display = "none";
      }
    }
  });
};

// 修改 changeTodoStatus 方法，在操作完成后关闭选择模式
async function changeTodoStatus(Status: string) {
  const selectedIds = getCheckedIds();
  if (selectedIds.length === 0) {
    showAlert('error', "请选择待办事项!", 3000);
    return;
  }
  try {
    const response = await axios.post("http://localhost:8000/todo/changeStatusById", {
      ids: selectedIds,
      status: Status
    });
    await getDate({
      day: dayjs().format("YYYY-MM-DDT00:00:00"),
      type: "current-month",
      isSelected: false,
      date: new Date()
    });
    if (response.data.code === 0) {
      showAlert('success', "添加成功", 3000);
      // 关闭选择模式
      isSelectMode.value = false;
      accessCheckbox();
    } else {
      showAlert('error', "添加失败", 3000);
    }
  } catch (error) {
    showAlert('error', "服务器错误", 3000);
  }
}

function waitingToProcessing(){
  changeTodoStatus("待办")
}
function processToCompleted(){
  changeTodoStatus("进行中")
}
// 禁用今天之前的日期
const disabledDateFn = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7;
};
//标签
import { nextTick } from "vue";
import { ElInput } from "element-plus";
import type { InputInstance } from "element-plus";
import axios from "axios";

const inputValue = ref("");
const inputVisible = ref(false);
const InputRef = ref<InputInstance>();

const handleClose = (tag: string) => {
  if (Array.isArray(addTaskValue.taskTags) && addTaskValue.taskTags.length > 0) {
    addTaskValue.taskTags.splice(addTaskValue.taskTags.indexOf(tag), 1);
  }
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

function addReturn() {
  const addTask = document.getElementById("add-task");
  const overlay = document.getElementById("overlay");
  (addTask as HTMLElement | null)?.style.setProperty("display", "none");
  (overlay as HTMLElement | null)?.style.setProperty("display", "none");
}

function addTaskButton() {
  const addTask = document.getElementById("add-task");
  const overlay = document.getElementById("overlay");
  (addTask as HTMLElement | null)?.style.setProperty("display", "block");
  (overlay as HTMLElement | null)?.style.setProperty("display", "block");
}

const handleInputConfirm = () => {
  if (inputValue.value && Array.isArray(addTaskValue.taskTags)) {
    addTaskValue.taskTags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

// 添加获取剩余时间的函数
function getRemainingTime(endTime: string | Date): string {
  const now = dayjs();
  const end = dayjs(endTime);
  const hours = end.diff(now, 'hour');
  const minutes = end.diff(now, 'minute') % 60;
  return `${hours}小时${minutes}分钟`;
}

// 添加右侧面板控制
const showRightPanel = ref(true);

// 添加切换方法
function toggleRightPanel() {
  showRightPanel.value = !showRightPanel.value;
}
</script>
<style scoped>
:deep(.calendar-day) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.selected-day) {
  color: #67C23A; /* Element Plus的主题绿色 */
  font-weight: bold;
  border-radius: 50%;
  background-color: rgba(103, 194, 58, 0.1);
}

.demo-datetime-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.demo-datetime-picker .block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}

.demo-datetime-picker .block:last-child {
  border-right: none;
}

.demo-datetime-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

:deep(.el-collapse-item__content) {
  font-size: 12px;
}

:deep(.el-calendar-table .el-calendar-day) {
  width: 100%;
  height: 40px;
  text-align: center;
}

:deep(.el-calendar__body) {
  padding: 10px 10px 0;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.alert {
  /* 保持原有定位 */
  z-index: 100;
  width: 200px;
  top: 20px; /* 调整顶部间距 */
  left: 50%;
  transform: translateX(-50%);
  position: fixed; /* 改为 fixed 定位 */
}
.alert{
  z-index: 100;
  width: 200px;
  top: 0;
  left: 45%;
  position: absolute;
}
.left {
  border-right: rgb(220, 223, 230) 1px solid;
  width: 20%;
  height: 100vh;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.left-expanded {
  width: 25%;
}

.demo-collapse {
  width: 100%;
  height: 40%;
}

.status {
  margin-top: 10px;
  height: 30px;
  display: flex;
}

.status div span {
  margin-left: 5px;
}

.circle {
  margin-top: 7px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.function {
  display: flex;
}

.change {
  width: 110px;
  border-radius: 6px;
  height: 30px;
  background-color: white;
  border: solid 1px rgb(192, 214, 149);
}
.change:hover{
  background-color: rgb(192, 214, 149);
}
.buttons {
  display: flex;
}

.other {
  background-color: white;
  border-radius: 5px;
  border: solid 1px rgb(220, 223, 230);
  width: 80px;
  height: 30px;
  margin-left: 20px;
}

.todo, .In-progress, .finish {
  width: 300px;
}

.content-title {
  text-align: left;
  margin-bottom: 10px;
}

.title {
  margin-left: 40px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 25px;
  font-weight: 600;
  color: #34495e;
  text-shadow: 1px 1px 2px rgba(150, 150, 150, 0.5);
}

.calculator {
  margin-left: 40px;
}

.content {
  display: flex;
}

.waiting, .process, .completed, .milestones {
  margin-left: 30px
}
.completed{
  background-color: rgb(192, 214, 149);
}
.center-top {
  padding-bottom: 10px;
  border-bottom: rgb(220, 223, 230) 1px solid;
}

.waiting, .milestones {
  background-color: rgb(199, 208, 214);
}

.process {
  background-color: rgb(236, 212, 82);
}

.center {
  width: 60%;
  height: 100vh;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.center-expanded {
  width: 75%;
}

.right {
  border-left: rgb(220, 223, 230) 1px solid;
  width: 20%;
  height: 100vh;
  background-color: rgb(241, 241, 241);
  flex-shrink: 0;
}

.tasks {
  width: 100%;
  height: 270px;
}

.task {
  margin-left: 20px;
  margin-top: 20px;
  width: 40%;
  height: 70px;
}

.task span {
  font-size: 18px;
  font-family: 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  color: #3a3a3a;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.add-task, .check-task {
  display: none;
  top: 10%;
  left: 40%;
  z-index: 100;
  width: 400px;
  height: 490px;
  background-color: rgb(250, 250, 250);
  position: absolute;
  border: 1px solid rgba(220, 223, 230, 0.4);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12),
  0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(.25, .8, .25, 1);
}

.add-title, .check-title {
  margin-top: 20px;
  padding-bottom: 20px;
  border-bottom: rgb(220, 223, 230) 1px solid;
}

.inputs {
  width: 100%;
  height: 68%;
  border-bottom: rgb(220, 223, 230) 1px solid;
}

textarea, input {
  height: 25px;
  margin-top: 20px;
  width: 250px;
  border-radius: 5px;
  border: rgb(220, 223, 230) 1px solid;
  outline-color: rgb(192, 214, 149);
}

#task-content, #check-task-content {
  height: 100px;
}

.addTask-function, .checkTask-function {
  display: flex;
  text-align: left;
  margin-top: 20px;
}

.add-return, .add-confirm, .check-return, .check-to-edit, .editConfirm, .edit-return {
  border: solid 1px rgb(220, 223, 230);
  width: 80px;
  height: 30px;
}

.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

.urgent-todos {
  margin-top: 20px;
  padding: 10px;
  background-color: #FDF6EC;
  border-radius: 8px;
}

.urgent-list {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.urgent-item {
  margin: 10px;
  padding: 10px;
  background-color: #FFF;
  border-radius: 4px;
  border-left: 4px solid #E6A23C;
  cursor: pointer;
}

.urgent-item:hover {
  transform: none;
  box-shadow: none;
}

.urgent-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
}

.urgent-time {
  font-size: 12px;
  color: #E6A23C;
}

/* 添加过渡效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>