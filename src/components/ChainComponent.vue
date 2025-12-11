<template>
  <div class="graph-container">
    <div class="filter-panel">
      <el-checkbox v-model="showExternal" label="显示外部文章" size="small" />
    </div>

    <div class="legend-panel">
      <div class="legend-title">文章引用网络</div>
      <div class="legend-items">
        <div class="item">
          <span class="dot internal"></span>
          <span>内部文章 ({{ currentInternalCount }})</span>
        </div>
        <div class="item">
          <span class="dot external"></span>
          <span>外部文章 ({{ currentExternalCount }})</span>
        </div>
      </div>
    </div>

    <div ref="chartRef" class="chart-area"></div>

    <div
      v-if="contextMenu.visible"
      :style="contextMenuStyle"
      class="context-menu"
      @mouseleave="contextMenu.visible = false"
    >
      <div class="menu-title">节点操作 ({{ contextMenu.nodeName }})</div>
      <div class="menu-item" @click="handleViewDetails">显示详情</div>
      <a :href="contextMenu.nodeUrl" target="_blank" class="menu-item" @click="contextMenu.visible = false">网址：{{ contextMenu.nodeUrl }}</a>
    </div>

    <div class="info-panel">
      <p>说明：</p>
      <ol>
        <li>节点代表文章，箭头代表引用/父子关系。</li>
        <li>支持鼠标滚轮缩放，拖拽节点调整位置。</li>
        <li>右键节点查看操作菜单，双击节点收起/展开子树。</li>
      </ol>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted, nextTick, watch } from 'vue';
import * as d3 from 'd3';
import axios from "axios";
import { ElMessage, ElCheckbox } from "element-plus";
import { useAuthStore } from "@/store/auth";
import router from "@/router";

type SVGSelection = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
// --- 类型定义 ---
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'internal' | 'external';
  group: number;
  isCollapsed?: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

// 定义 G 元素的 D3 Selection 类型
// 保持这个定义，但在赋值时使用 as unknown as GSelection
type GSelection = d3.Selection<SVGGElement, unknown, HTMLElement, any>;

// --- 状态管理 ---
const authStore = useAuthStore();
const token = ref(authStore.token);
const Account = ref("");
const chartRef = ref<HTMLElement | null>(null);
let simulation: d3.Simulation<GraphNode, GraphLink> | null = null;
let originalGraphData: { nodes: GraphNode[], links: GraphLink[] } = { nodes: [], links: [] };

const graphData = ref<{ nodes: GraphNode[], links: GraphLink[] }>({
  nodes: [],
  links: []
});

const showExternal = ref(true);

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  nodeName: '',
  nodeUrl: 'note.com',
  nodeId: '',
});

// --- D3 引用：用于保存当前的 G 元素以便于缩放/拖拽操作 ---
let gElement: GSelection | null = null;
let currentTransform: d3.ZoomTransform = d3.zoomIdentity;

// --- 计算属性 (Count Update Optimization) ---

const currentInternalCount = computed(() =>
  graphData.value.nodes.filter(n => n.type === 'internal').length
);

const currentExternalCount = computed(() =>
  graphData.value.nodes.filter(n => n.type === 'external').length
);

// --- 方法：账户与数据加载 ---

const getAccount = async () => {
  if (!token.value) {
    console.error("Token为空");
    return null;
  }
  try {
    const res = await axios.post("http://localhost:8005/token/getAccount", {
      token: token.value
    });
    Account.value = res.data;
    return Account.value;
  } catch (error) {
    console.error("获取账户信息失败:", error);
    ElMessage.error("获取账户信息失败");
    authStore.clearToken();
    return null;
  }
};

const transformTreeToGraph = (treeNodes: any[]) => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const traverse = (node: any) => {
    // 确保创建的节点符合 GraphNode 接口
    nodes.push({
      id: String(node.id),
      name: node.label,
      type: 'internal',
      group: 1,
      x: 0, y: 0,
      vx: 0, vy: 0,
    } as GraphNode);

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        links.push({
          source: String(node.id),
          target: String(child.id)
        });
        traverse(child);
      });
    }
  };

  treeNodes.forEach(root => traverse(root));

  return { nodes, links };
};

const loadTree = async () => {
  try {
    const response = await axios.get("http://localhost:8003/editor/onLoad", {
      params: { account: Account.value },
      transformResponse: [(data) => {
        try { return JSON.parse(data); } catch (e) { return data; }
      }]
    });

    const rawTreeData = response.data.data;
    const { nodes: internalNodes, links: internalLinks } = transformTreeToGraph(rawTreeData);

    const externalNodes: GraphNode[] = [
      { id: 'ext-1', name: '外部资料: Java Guide', type: 'external', group: 2, x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'ext-2', name: '外部资料: Vue 官网', type: 'external', group: 2, x: 0, y: 0, vx: 0, vy: 0 }
    ].map(n => n as GraphNode);

    const sampleLinks: GraphLink[] = [];
    if (internalNodes.length > 0) {
      const sourceId = internalNodes[0]?.id;
      if (sourceId) {
        sampleLinks.push({ source: sourceId, target: 'ext-1' });
      }
    }
    sampleLinks.push({ source: 'ext-1', target: 'ext-2' });

    originalGraphData = {
      nodes: [...internalNodes, ...externalNodes].map(n => ({ ...n, isCollapsed: n.isCollapsed ?? false })),
      links: [...internalLinks, ...sampleLinks]
    };

    applyFilters();

    ElMessage.success("图谱数据加载成功");

  } catch (error) {
    console.error("加载树数据失败:", error);
    ElMessage.error("数据加载异常");
  }
};


//筛选与收起

const findAllDescendantIds = (startNodeId: string): string[] => {
  const descendants: string[] = [];
  let queue: string[] = [startNodeId];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const parentId = queue.shift()!;

    const childrenLinks = originalGraphData.links.filter(
      l => String((l.source as GraphNode).id || l.source) === parentId
    );

    for (const link of childrenLinks) {
      const childId = String((link.target as GraphNode).id || link.target);
      if (!visited.has(childId) && originalGraphData.nodes.find(n => n.id === childId)?.type === 'internal') {
        visited.add(childId);
        descendants.push(childId);
        queue.push(childId);
      }
    }
  }
  return descendants;
};

const applyFilters = () => {
  if (!originalGraphData.nodes.length) return;

  const collapsedNodesIds = new Set<string>();
  for (const node of originalGraphData.nodes) {
    if (node.isCollapsed) {
      const descendants = findAllDescendantIds(node.id);
      descendants.forEach(id => collapsedNodesIds.add(id));
    }
  }

  const finalNodes = originalGraphData.nodes.filter(n =>
    (n.type === 'internal' || (n.type === 'external' && showExternal.value)) &&
    !collapsedNodesIds.has(n.id)
  );

  const finalNodesIds = new Set(finalNodes.map(n => n.id));
  const finalLinks = originalGraphData.links.filter(link => {
    const sourceId = String((link.source as GraphNode).id || link.source);
    const targetId = String((link.target as GraphNode).id || link.target);

    return finalNodesIds.has(sourceId) && finalNodesIds.has(targetId);
  });

  const oldNodesMap = new Map(graphData.value.nodes.map(n => [n.id, n]));

  const nodesWithPos = finalNodes.map(n => {
    const oldNode = oldNodesMap.get(n.id);
    if (oldNode) {
      n.x = oldNode.x;
      n.y = oldNode.y;
      n.vx = oldNode.vx;
      n.vy = oldNode.vy;
    }
    return n;
  });

  graphData.value = {
    nodes: nodesWithPos,
    links: finalLinks
  };

  nextTick(initGraph);
};

watch(showExternal, applyFilters);


//D3初始化与交互逻辑
const initGraph = () => {
  if (!chartRef.value || !graphData.value.nodes.length) {
    if (chartRef.value) d3.select(chartRef.value).selectAll("*").remove();
    return;
  }

  const width = chartRef.value.clientWidth || 800;
  const height = chartRef.value.clientHeight || 600;
  graphData.value.nodes.forEach(n => {
    // 仅在首次渲染或没有历史位置时设置，以避免覆盖旧位置
    if (n.x === undefined || n.y === undefined || (n.x === 0 && n.y === 0)) {
      n.x = width / 2;
      n.y = height / 2;
      n.vx = 0;
      n.vy = 0;
    }
  });

  d3.select(chartRef.value).selectAll("*").remove();

  const svg = d3.select(chartRef.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);
  gElement = svg.append("g")
    .attr("transform", currentTransform.toString()) as unknown as GSelection;


  // 定义箭头
  svg.append("defs").selectAll("marker")
    .data(["arrow"])
    .enter().append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 18)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", "#999")
    .attr("d", "M0,-5L10,0L0,5");

// 力导向配置
  if (simulation) simulation.stop();
  simulation = d3.forceSimulation<GraphNode, GraphLink>(graphData.value.nodes)
    .force("link", d3.forceLink(graphData.value.links).id(d => (d as GraphNode).id).distance(110))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("x", d3.forceX(width / 2).strength(0.08))
    .force("y", d3.forceY(height / 2).strength(0.08))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide<GraphNode>().radius(30).iterations(2));

  // 绘制连线
  // 使用 ! 确保 gElement 非空
  const link = gElement!.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(graphData.value.links)
    .join("line")
    .attr("stroke-width", 1.5)
    .attr("marker-end", "url(#arrow)");

  // 绘制节点
  const nodeGroup = gElement!.append("g")
    .selectAll("g")
    .data(graphData.value.nodes)
    .join("g")
    .attr("class", "node-group")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("contextmenu", handleContextMenu)
    .on("dblclick", handleDoubleClick)
    .call(d3.drag<any, any>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended) as any);

  // 节点圆形
  nodeGroup.append("circle")
    .attr("r", 10)
    .attr("fill", (d: GraphNode) => d.type === 'external' ? '#f1c40f' : '#8d6e63')
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .classed("internal-node", (d: GraphNode) => d.type === 'internal')
    .classed("external-node", (d: GraphNode) => d.type === 'external');

  // 节点文字
  nodeGroup.append("text")
    .text((d: GraphNode) => d.name)
    .attr("x", 14)
    .attr("y", 4)
    .style("font-size", "12px")
    .style("fill", "#333")
    .style("text-shadow", "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff")
    .style("pointer-events", "none");

  // 更新位置
  simulation.on("tick", () => {
    link
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);

    nodeGroup
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
  });

  // 缩放
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      currentTransform = event.transform;
      gElement?.attr("transform", currentTransform.toString());
    });

  svg.call(zoom as any)
    .on("dblclick.zoom", null);
  if (graphData.value.nodes.length > 0) {
    setTimeout(() => {
      // 💥 关键修改 3: 传递 zoom 实例给 fitView
      fitView(svg as any, width, height, zoom);
    }, 500);
  }

  svg.on("contextmenu", (event) => {
    event.preventDefault();
    contextMenu.value.visible = false;
  });
};


const fitView = (
  svg: SVGSelection,
  width: number,
  height: number,
  zoomInstance: d3.ZoomBehavior<SVGSVGElement, unknown> // 新增参数
) => {
  if (!graphData.value.nodes.length || !simulation) return;

  simulation.stop();

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  graphData.value.nodes.forEach(node => {
    if (node.x !== undefined && node.y !== undefined) {
      const radius = 10;
      minX = Math.min(minX, node.x - radius);
      minY = Math.min(minY, node.y - radius);
      maxX = Math.max(maxX, node.x + radius);
      maxY = Math.max(maxY, node.y + radius);
    }
  });

  if (minX === Infinity || minX === maxX || minY === maxY) {
    minX = 0; minY = 0;
    maxX = width; maxY = height;
  }

  const boundsWidth = maxX - minX;
  const boundsHeight = maxY - minY;
  const padding = 50;

  const scaleX = (width - padding * 2) / boundsWidth;
  const scaleY = (height - padding * 2) / boundsHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  const translateX = width / 2 - (minX + maxX) / 2 * scale;
  const translateY = height / 2 - (minY + maxY) / 2 * scale;

  const newTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

  svg.transition()
    .duration(750)
    .call(zoomInstance.transform, newTransform);

  currentTransform = newTransform;
};


function dragstarted(event: any, d: any) {
  if (!event.active) simulation?.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event: any, d: any) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event: any, d: any) {
  if (!event.active) simulation?.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function handleMouseOver(event: MouseEvent, d: GraphNode) {
  d3.select(event.currentTarget as Element)
    .select("circle")
    .transition().duration(100)
    .attr("stroke-width", 3)
    .attr("stroke", "#e74c3c");
}

function handleMouseOut(event: MouseEvent, d: GraphNode) {
  d3.select(event.currentTarget as Element)
    .select("circle")
    .transition().duration(100)
    .attr("stroke-width", 1.5)
    .attr("stroke", "#fff");
}

function handleContextMenu(event: MouseEvent, d: GraphNode) {
  event.preventDefault();
  event.stopPropagation();

  contextMenu.value = {
    visible: true,
    x: event.pageX,
    y: event.pageY,
    nodeName: d.name,
    nodeUrl: d.type === 'internal' ? 'note.com/' + d.id : 'https://www.google.com',
    nodeId: d.id,
  };
}

const handleViewDetails = () => {
  ElMessage.info(`您点击了节点：${contextMenu.value.nodeName} 的详情`);
  contextMenu.value.visible = false;
};

function handleDoubleClick(event: MouseEvent, d: GraphNode) {
  event.stopPropagation();
  event.preventDefault();

  const hasChildren = originalGraphData.links.some(
    l => String((l.source as GraphNode).id || l.source) === d.id
  );

  if (d.type === 'external') {
    ElMessage.warning(`该节点 (${d.name}) 是外部资料，无法收起/展开。`);
    return;
  }

  if (!hasChildren && !d.isCollapsed) {
    ElMessage.warning(`该节点 (${d.name}) 没有可收起的子节点。`);
    return;
  }

  const originalNode = originalGraphData.nodes.find(n => n.id === d.id);
  if (originalNode) {
    originalNode.isCollapsed = !originalNode.isCollapsed;
    // ElMessage.success(`${originalNode.isCollapsed ? '收起' : '展开'}节点 ${d.name}`);
    applyFilters();
  }
}


// --- 生命周期 ---

onMounted(async () => {
  document.addEventListener('click', () => {
    contextMenu.value.visible = false;
  });

  await getAccount();
  if (Account.value) {
    await loadTree();
  } else {
    ElMessage.error("需要登录");
    await router.push({ name: "login" });
  }

  window.addEventListener('resize', () => {
    currentTransform = d3.zoomIdentity;
    applyFilters();
  });
});

onUnmounted(() => {
  if (simulation) simulation.stop();
  window.removeEventListener('resize', () => {
    currentTransform = d3.zoomIdentity;
    applyFilters();
  });
  document.removeEventListener('click', () => contextMenu.value.visible = false);
});


// 计算右键菜单样式
const contextMenuStyle = computed(() => ({
  left: `${contextMenu.value.x}px`,
  top: `${contextMenu.value.y}px`,
}));
</script>
<style scoped>
/* 保持原有样式不变 */
.graph-container {
  position: relative;
  width: 95%;
  height: 850px;
  background-color: #fcfcfc;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.chart-area {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.chart-area:active {
  cursor: grabbing;
}

.filter-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.legend-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #5c3b2e;
}

.legend-items .item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 13px;
  color: #666;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.dot.internal { background-color: #8d6e63; }
.dot.external { background-color: #f1c40f; }

.context-menu {
  position: absolute;
  width: 180px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  cursor: default;
}

.menu-title {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: bold;
  color: #606266;
  border-bottom: 1px solid #eee;
}

.menu-item {
  display: block;
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px dashed #ccc;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #999;
  max-width: 300px;
  z-index: 10;
}

.info-panel ol {
  padding-left: 20px;
  margin: 5px 0 0 0;
}
</style>