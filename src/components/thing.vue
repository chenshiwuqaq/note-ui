<script setup lang="ts">
import { ref } from "vue";
import {Todo} from "@/components/TodoComponent.vue"
const checked = ref(false);
const props = defineProps({
  todo:{
    type:Object as () => Todo,
    required:true
  }
})
const checkboxRef = ref<HTMLInputElement | null>(null);
defineExpose({
  checkboxRef
});
</script>

<template>
  <div class="thing" title="双击查看详情">
    <div style="display: flex">
      <div style="margin-left: 0"><span style="font-size: 16px">标题:</span><span style="font-size: 14px">{{todo.taskTitle}}</span></div>
      <input  ref="checkboxRef" type="checkbox" class="checkBox" :key="todo.todoId" v-model="checked" @dblclick.stop :id="`${todo.todoId}`">
    </div>
    <div><span style="font-size: 16px">标签:</span>
      <span v-for="(tag, index) in todo.taskTags" :key="index" style="font-size: 14px">
  {{ tag }}<!-- 添加插值表达式 -->
  {{ index < props.todo.taskTags.length - 1? ',' : '' }}<!-- 添加插值表达式 -->
</span>
    </div>
    <div><span style="font-size: 16px">截止时间:</span><span style="font-size: 14px">{{props.todo.endTime}}</span></div>
    <div><span style="font-size: 16px">优先级:</span><span style="font-size: 14px">{{props.todo.priority}}</span></div>
  </div>
</template>

<style scoped>
*{
  margin: 0;
  line-height: 1.4;
}
span{
  color: black;
}
.thing{
  position: relative;
  text-align: left;
  height: 120px;
  width: 250px;
}
.thing div{
  margin-top: 5px;
  margin-left: 5px;
}
.checkBox {
  width: 15px;
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  height: 15px;
  display: none;
  z-index: 2;
}
</style>