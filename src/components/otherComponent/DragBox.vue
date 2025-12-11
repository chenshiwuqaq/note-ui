<template>
  <div ref='dragBox' style='display: flex; width: 100%; height: 100%; box-sizing: border-box;'>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 定义 ref
const dragBox = ref<HTMLElement | null>(null);

// 如果 dragItem 没有定义宽度，则 flex=1
const setDragItemFlex = () => {
  if (dragBox.value) {
    const childrenLen = dragBox.value.children.length;
    for (let i = 0; i < childrenLen; i++) {
      // 将 node 类型断言为 HTMLElement
      const node = dragBox.value.children[i] as HTMLElement;
      if (!node.style.width) {
        // 如果没有定义宽度，则 flex=1
        node.style.flex = '1';
      }
    }
  }
};

// 获取下一个兄弟元素的兼容函数
const getNextElement = (element: HTMLElement | null): HTMLElement | null => {
  if (element) {
    if (element.nextElementSibling) {
      return element.nextElementSibling as HTMLElement;
    } else {
      let next = element.nextSibling;
      while (next && next.nodeType !== 1) {
        next = next.nextSibling;
      }
      return next as HTMLElement | null;
    }
  }
  return null;
};

// 定义一个状态变量来控制是否正在进行拖拽操作
const isDragging = ref(false);

// 处理鼠标按下事件
let resizeBox: HTMLElement | null = null;
let currentBox: HTMLElement | null = null;
let rightBox: HTMLElement | null = null;
let curLen = 0;
let otherBoxWidth = 0;
let startX = 0;

const onMouseDown = (e: MouseEvent) => {
  resizeBox = e.target as HTMLElement;
  currentBox = resizeBox.parentNode as HTMLElement;
  rightBox = getNextElement(currentBox);
  if (!rightBox) return;
  curLen = currentBox.clientWidth;
  if (dragBox.value) {
    otherBoxWidth = dragBox.value.clientWidth - currentBox.clientWidth - rightBox.clientWidth;
  }
  startX = e.clientX;
  isDragging.value = true;
};

// 处理鼠标移动事件
const onMousemove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const endX = e.clientX;
  const moveLen = endX - startX; // （endx-startx）= 移动的距离
  if (dragBox.value && currentBox && rightBox && resizeBox) {
    const CurBoxLen = curLen + moveLen; // resize[i].left+移动的距离=左边区域最后的宽度
    const rightBoxLen = dragBox.value.clientWidth - CurBoxLen - otherBoxWidth; // 右侧宽度=总宽度-左侧宽度-其它盒子宽度

    // 限制左侧盒子最大宽度为 500px
    const maxWidth = 500;
    let finalCurBoxLen = CurBoxLen;
    let finalRightBoxLen = rightBoxLen;

    if (CurBoxLen > maxWidth) {
      finalCurBoxLen = maxWidth;
      finalRightBoxLen = dragBox.value.clientWidth - finalCurBoxLen - otherBoxWidth;
    }

    // 当最小宽度时，无法继续拖动
    if (finalCurBoxLen <= 250 || finalRightBoxLen <= 250) return;

    currentBox.style.width = finalCurBoxLen + 'px'; // 当前盒子的宽度
    resizeBox.style.left = finalCurBoxLen + 'px'; // 设置左侧区域的宽度，这里需要加上单位 'px'
    rightBox.style.width = finalRightBoxLen + 'px';
  }
};

// 处理鼠标松开事件
const onMouseup = () => {
  if (resizeBox) {
    // 颜色恢复
    resizeBox.style.background = '#d6d6d6';
  }
  isDragging.value = false;
};

// 为拖拽条添加事件监听器
const dragControllerDiv = () => {
  const resizeElements = document.getElementsByClassName('resize');
  for (let i = 0; i < resizeElements.length; i++) {
    const element = resizeElements[i] as HTMLElement;
    // 明确指定事件类型
    element.addEventListener<"mousedown">('mousedown', onMouseDown);
  }
  document.addEventListener('mousemove', onMousemove);
  document.addEventListener('mouseup', onMouseup);
};

onMounted(() => {
  setDragItemFlex();
  dragControllerDiv();
});
</script>
