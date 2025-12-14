<template>
  <div class="team-container">
    <!-- 左侧团队列表 -->
    <div class="left-team-list">
      <div class="team-header">
        <h3>我的团队</h3>
        <div class="team-actions">
          <el-tooltip content="创建团队" placement="top">
            <el-button type="primary" circle @click="showCreateTeamDialog">
              <el-icon><Plus /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="刷新列表" placement="top">
            <el-button circle @click="loadUserTeams">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 团队列表 -->
      <div class="teams-scrollable">
        <div v-if="teams.length === 0" class="empty-teams">
          <el-empty description="暂无团队" :image-size="80">
            <el-button type="primary" @click="showCreateTeamDialog">创建团队</el-button>
          </el-empty>
        </div>

        <el-collapse v-model="activeTeam" accordion>
          <el-collapse-item
              v-for="team in teams"
              :key="team.teamId"
              :name="team.teamId"
              class="team-item"
          >
            <template #title>
              <div class="team-title">
                <div class="team-info">
                  <el-avatar :size="32" :src="getTeamAvatar(team)" class="team-avatar">
                    {{ team.teamName.charAt(0) }}
                  </el-avatar>
                  <div class="team-details">
                    <span class="team-name">{{ team.teamName }}</span>
                    <span class="team-meta">
                      {{ team.memberCount || 0 }}人 · {{ team.role === 'admin' ? '管理员' : '成员' }}
                    </span>
                  </div>
                </div>
                <div class="team-actions-dropdown" v-if="team.role === 'admin'">
                  <el-dropdown @command="handleTeamCommand($event, team)">
                    <el-icon class="team-more"><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="invite">邀请成员</el-dropdown-item>
                        <el-dropdown-item command="edit">编辑团队</el-dropdown-item>
                        <el-dropdown-item command="dissolve" divided style="color: #f56c6c;">
                          解散团队
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>

            <!-- 团队成员列表 -->
            <div class="members-list">
              <div class="members-header">
                <span>团队成员</span>
                <el-button
                    v-if="team.role === 'admin'"
                    size="small"
                    type="primary"
                    text
                    @click="showInviteDialog(team)"
                >
                  邀请
                </el-button>
              </div>

              <div class="members-scrollable">
                <div
                    v-for="member in getTeamMembers(team.teamId)"
                    :key="member.userId"
                    class="member-item"
                    :class="{ active: selectedMember && selectedMember.userId === member.userId }"
                    @click="selectMember(member, team)"
                >
                  <div class="member-info">
                    <el-avatar :size="28" :src="member.userPic" class="member-avatar">
                      {{ member.userName ? member.userName.charAt(0) : 'U' }}
                    </el-avatar>
                    <div class="member-details">
                      <span class="member-name">
                        {{ member.userName }}
                        <el-tag v-if="member.role === 'admin'" size="small" type="danger">管理</el-tag>
                        <el-tag v-else size="small" type="info">成员</el-tag>
                      </span>
                      <span class="member-account">{{ member.account }}</span>
                    </div>
                  </div>
                  <div class="member-actions" v-if="team.role === 'admin' && member.role === 'member'">
                    <el-tooltip content="移除成员" placement="top">
                      <el-icon class="remove-icon" @click.stop="removeMember(team, member)">
                        <CloseBold />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 右侧文档区域 -->
    <div class="right-document-area">
      <div class="document-header">
        <div v-if="selectedMember" class="selected-info">
          <div class="member-info-header">
            <el-avatar :size="40" :src="selectedMember.userPic" class="selected-avatar">
              {{ selectedMember.userName ? selectedMember.userName.charAt(0) : 'U' }}
            </el-avatar>
            <div class="member-details-header">
              <h4>{{ selectedMember.userName }} 的文档</h4>
              <div class="member-meta">
                <span class="account">账号: {{ selectedMember.account }}</span>
                <span class="team-name">团队: {{ selectedTeam?.teamName }}</span>
              </div>
            </div>
          </div>
          <div class="action-buttons" v-if="selectedTeam?.role === 'admin'">
            <el-button type="danger" plain @click="removeMember(selectedTeam, selectedMember)">
              移除成员
            </el-button>
          </div>
        </div>
        <div v-else class="no-selection">
          <el-empty description="请选择团队成员以查看其文档" :image-size="100" />
        </div>
      </div>

      <!-- 文档编辑器组件 -->
      <div class="document-editor">
        <EditorComponent
            v-if="selectedMember"
            :key="editorKey"
            :account="selectedMember.account"
            :readonly="true"
        />
        <div v-else class="empty-editor">
          <el-empty description="请从左侧选择团队成员" :image-size="150" />
        </div>
      </div>
    </div>
  </div>

  <!-- 创建团队对话框 -->
  <el-dialog
      v-model="showCreateTeam"
      title="创建团队"
      width="500px"
      :close-on-click-modal="false"
  >
    <el-form :model="newTeam" label-width="80px" :rules="teamRules" ref="createFormRef">
      <el-form-item label="团队名称" prop="teamName">
        <el-input
            v-model="newTeam.teamName"
            placeholder="请输入团队名称"
            maxlength="20"
            show-word-limit
        />
      </el-form-item>
      <el-form-item label="团队描述" prop="teamDesc">
        <el-input
            v-model="newTeam.teamDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入团队描述（可选）"
            maxlength="200"
            show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showCreateTeam = false">取消</el-button>
        <el-button type="primary" @click="createTeam" :loading="creatingTeam">创建</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 邀请成员对话框 -->
  <el-dialog
      v-model="showInviteDialogVisible"
      :title="`邀请成员加入 ${invitingTeam?.teamName}`"
      width="500px"
      :close-on-click-modal="false"
  >
    <div class="invite-content">
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item label="用户账号">
          <el-input
              v-model="inviteForm.account"
              placeholder="请输入用户账号"
              @keyup.enter="searchUser"
          >
            <template #append>
              <el-button @click="searchUser" :loading="searchingUser">搜索</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 搜索结果 -->
      <div v-if="searchResult" class="search-result">
        <div class="user-found">
          <el-avatar :size="40" :src="searchResult.userPic" class="found-avatar">
            {{ searchResult.userName ? searchResult.userName.charAt(0) : 'U' }}
          </el-avatar>
          <div class="found-details">
            <h4>{{ searchResult.userName }}</h4>
            <p>账号: {{ searchResult.account }}</p>
          </div>
          <div class="found-actions">
            <el-button
                type="primary"
                @click="sendInvitation"
                :loading="sendingInvite"
                :disabled="isAlreadyMember || hasPendingInvite"
            >
              {{ getInviteButtonText }}
            </el-button>
          </div>
        </div>
        <div v-if="isAlreadyMember" class="invite-status">
          <el-alert type="info" :closable="false">该用户已是团队成员</el-alert>
        </div>
        <div v-if="hasPendingInvite" class="invite-status">
          <el-alert type="warning" :closable="false">该用户已有待处理的邀请</el-alert>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showInviteDialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 邀请通知列表 -->
  <el-dialog
      v-model="showInvitations"
      title="团队邀请"
      width="500px"
  >
    <div v-if="invitations.length === 0" class="empty-invitations">
      <el-empty description="暂无邀请" :image-size="80" />
    </div>

    <div v-else class="invitations-list">
      <div v-for="invite in invitations" :key="invite.id" class="invitation-item">
        <div class="invitation-info">
          <el-avatar :size="40" :src="getTeamAvatar(invite)" class="invitation-avatar">
            {{ invite.teamName ? invite.teamName.charAt(0) : 'T' }}
          </el-avatar>
          <div class="invitation-details">
            <h4>{{ invite.teamName }}</h4>
            <p>{{ invite.teamDesc || '暂无描述' }}</p>
            <p class="invite-time">邀请时间: {{ invite.inviteTime }}</p>
            <p class="inviter">邀请人: {{ invite.inviteUserName }}</p>
          </div>
        </div>
        <div class="invitation-actions">
          <el-button type="success" @click="acceptInvitation(invite)" size="small">接受</el-button>
          <el-button type="danger" @click="rejectInvitation(invite)" size="small">拒绝</el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showInvitations = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 邀请通知徽章 -->
  <div v-if="invitations.length > 0" class="invitation-badge" @click="showInvitations = true">
    <el-badge :value="invitations.length" :max="99" class="badge">
      <el-button circle>
        <el-icon><Bell /></el-icon>
      </el-button>
    </el-badge>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import {
  Plus,
  Refresh,
  MoreFilled,
  CloseBold,
  Bell,
} from '@element-plus/icons-vue'
import EditorComponent from './EditorComponent.vue'
import axios from 'axios'
import router from '@/router'

// 配置axios默认携带凭证（Cookie）
axios.defaults.withCredentials = true

// API基础URL
const API_BASE_URL = ref('http://localhost:8004')

// 用户信息 - 从Session获取
const currentUserId = ref<number | null>(null)

// 团队数据
const teams = ref<any[]>([])
const activeTeam = ref<string[]>([])
const teamMembersMap = ref<Map<number, any[]>>(new Map())

// 选中状态
const selectedTeam = ref<any>(null)
const selectedMember = ref<any>(null)
const editorKey = ref(0)

// 对话框控制
const showCreateTeam = ref(false)
const showInviteDialogVisible = ref(false)
const showInvitations = ref(false)

// 创建团队表单
const newTeam = ref({
  teamName: '',
  teamDesc: ''
})
const createFormRef = ref<InstanceType<typeof ElForm>>()
const creatingTeam = ref(false)

// 邀请成员
const invitingTeam = ref<any>(null)
const inviteForm = ref({
  account: ''
})
const searchResult = ref<any>(null)
const searchingUser = ref(false)
const sendingInvite = ref(false)

// 邀请列表
const invitations = ref<any[]>([])

// 表单验证规则
const teamRules = {
  teamName: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  teamDesc: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 检查登录状态
const checkLogin = async () => {
  try {
    // 可以添加一个检查登录的接口，或者从Session获取
    const userInfo = sessionStorage.getItem('userInfo')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      currentUserId.value = user.userId
      return true
    }
    return false
  } catch (e) {
    console.error('检查登录状态失败:', e)
    return false
  }
}

// 加载用户加入的团队
const loadUserTeams = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.value}/api/team/list`)

    if (response.data.code === 200) {
      teams.value = response.data.data || []
      // 为每个团队加载成员
      await Promise.all(teams.value.map(team => loadTeamMembers(team.teamId)))
    } else if (response.data.code === 401) {
      // 未登录
      ElMessage.warning('请先登录')
      await router.push('/login')
    } else {
      ElMessage.error(response.data.message || '加载团队列表失败')
    }
  } catch (error) {
    console.error('加载团队失败:', error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ElMessage.warning('登录已过期，请重新登录')
      await router.push('/login')
    } else {
      ElMessage.error('加载团队失败')
    }
  }
}

// 加载团队成员
const loadTeamMembers = async (teamId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL.value}/api/team/${teamId}/members`)

    if (response.data.code === 200) {
      teamMembersMap.value.set(teamId, response.data.data || [])
    } else if (response.data.code === 401) {
      // 未登录
      ElMessage.warning('请先登录')
      await router.push('/login')
    }
  } catch (error) {
    console.error(`加载团队 ${teamId} 成员失败:`, error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await router.push('/login')
    }
  }
}

// 获取团队成员列表
const getTeamMembers = (teamId: number) => {
  return teamMembersMap.value.get(teamId) || []
}

// 获取团队头像
const getTeamAvatar = (team: any) => {
  // 这里可以返回团队头像，如果没有则返回默认
  return null
}

// 显示创建团队对话框
const showCreateTeamDialog = () => {
  newTeam.value = { teamName: '', teamDesc: '' }
  showCreateTeam.value = true
}

// 创建团队
const createTeam = async () => {
  if (!createFormRef.value) return

  await createFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      creatingTeam.value = true
      try {
        const response = await axios.post(`${API_BASE_URL.value}/api/team/create`, newTeam.value)

        if (response.data.code === 200) {
          ElMessage.success('团队创建成功')
          showCreateTeam.value = false
          await loadUserTeams()
        } else if (response.data.code === 401) {
          // 未登录
          ElMessage.warning('请先登录')
          await router.push('/login')
        } else {
          ElMessage.error(response.data.message || '创建团队失败')
        }
      } catch (error) {
        console.error('创建团队失败:', error)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          ElMessage.warning('登录已过期，请重新登录')
          await router.push('/login')
        } else {
          ElMessage.error('创建团队失败')
        }
      } finally {
        creatingTeam.value = false
      }
    }
  })
}

// 显示邀请对话框
const showInviteDialog = (team: any) => {
  invitingTeam.value = team
  inviteForm.value.account = ''
  searchResult.value = null
  showInviteDialogVisible.value = true
}

// 搜索用户
const searchUser = async () => {
  if (!inviteForm.value.account.trim()) {
    ElMessage.warning('请输入用户账号')
    return
  }

  searchingUser.value = true
  try {
    const response = await axios.get(`${API_BASE_URL.value}/api/team/search/user`, {
      params: {
        keyword: inviteForm.value.account
      }
    })

    if (response.data.code === 200 && response.data.data) {
      searchResult.value = response.data.data[0] // 取第一个结果
    } else if (response.data.code === 401) {
      ElMessage.warning('请先登录')
      await router.push('/login')
    } else {
      ElMessage.error('未找到该用户')
      searchResult.value = null
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ElMessage.warning('登录已过期，请重新登录')
      await router.push('/login')
    } else {
      ElMessage.error('搜索用户失败')
    }
    searchResult.value = null
  } finally {
    searchingUser.value = false
  }
}

// 检查是否已经是成员
const isAlreadyMember = computed(() => {
  if (!searchResult.value || !invitingTeam.value) return false
  const members = getTeamMembers(invitingTeam.value.teamId)
  return members.some((member: any) => member.userId === searchResult.value.userId)
})

// 检查是否有待处理的邀请
const hasPendingInvite = computed(() => {
  // 这里可以根据实际情况实现检查逻辑
  return false
})

// 获取邀请按钮文本
const getInviteButtonText = computed(() => {
  if (isAlreadyMember.value) return '已是成员'
  if (hasPendingInvite.value) return '已邀请'
  return '发送邀请'
})

// 发送邀请
const sendInvitation = async () => {
  if (!searchResult.value || !invitingTeam.value || isAlreadyMember.value || hasPendingInvite.value) {
    return
  }

  sendingInvite.value = true
  try {
    const response = await axios.post(
        `${API_BASE_URL.value}/api/team/${invitingTeam.value.teamId}/invite`,
        null,
        {
          params: {
            inviteUserId: searchResult.value.userId
          }
        }
    )

    if (response.data.code === 200) {
      ElMessage.success('邀请发送成功')
      showInviteDialogVisible.value = false
    } else if (response.data.code === 401) {
      ElMessage.warning('请先登录')
      await router.push('/login')
    } else {
      ElMessage.error(response.data.message || '邀请发送失败')
    }
  } catch (error) {
    console.error('发送邀请失败:', error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ElMessage.warning('登录已过期，请重新登录')
      await router.push('/login')
    } else {
      ElMessage.error('发送邀请失败')
    }
  } finally {
    sendingInvite.value = false
  }
}

// 加载邀请列表
const loadInvitations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.value}/api/team/invitations`)

    if (response.data.code === 200) {
      invitations.value = response.data.data || []
    } else if (response.data.code === 401) {
      // 未登录，不清空邀请列表
      invitations.value = []
    }
  } catch (error) {
    console.error('加载邀请列表失败:', error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // 未登录，不清空邀请列表
      invitations.value = []
    }
  }
}

// 接受邀请
const acceptInvitation = async (invite: any) => {
  try {
    const response = await axios.post(
        `${API_BASE_URL.value}/api/team/${invite.teamId}/accept`,
        null
    )

    if (response.data.code === 200) {
      ElMessage.success('已加入团队')
      showInvitations.value = false
      await loadInvitations()
      await loadUserTeams()
    } else if (response.data.code === 401) {
      ElMessage.warning('请先登录')
      await router.push('/login')
    } else {
      ElMessage.error(response.data.message || '接受邀请失败')
    }
  } catch (error) {
    console.error('接受邀请失败:', error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ElMessage.warning('登录已过期，请重新登录')
      await router.push('/login')
    } else {
      ElMessage.error('接受邀请失败')
    }
  }
}

// 拒绝邀请
const rejectInvitation = async (invite: any) => {
  try {
    const response = await axios.post(
        `${API_BASE_URL.value}/api/team/${invite.teamId}/reject`,
        null
    )

    if (response.data.code === 200) {
      ElMessage.success('已拒绝邀请')
      await loadInvitations()
    } else if (response.data.code === 401) {
      ElMessage.warning('请先登录')
      await router.push('/login')
    } else {
      ElMessage.error(response.data.message || '拒绝邀请失败')
    }
  } catch (error) {
    console.error('拒绝邀请失败:', error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ElMessage.warning('登录已过期，请重新登录')
      await router.push('/login')
    } else {
      ElMessage.error('拒绝邀请失败')
    }
  }
}

// 选择成员
const selectMember = async (member: any, team: any) => {
  selectedTeam.value = team
  selectedMember.value = member
  editorKey.value++ // 强制重新加载编辑器
}

// 移除成员
const removeMember = async (team: any, member: any) => {
  try {
    await ElMessageBox.confirm(
        `确定要将 ${member.userName} 从团队 ${team.teamName} 中移除吗？`,
        '移除成员',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const response = await axios.delete(
        `${API_BASE_URL.value}/api/team/${team.teamId}/member/${member.userId}`
    )

    if (response.data.code === 200) {
      ElMessage.success('成员已移除')
      // 如果移除的是当前选中的成员，清空选择
      if (selectedMember.value?.userId === member.userId) {
        selectedMember.value = null
      }
      // 重新加载团队成员
      await loadTeamMembers(team.teamId)
    } else if (response.data.code === 401) {
      ElMessage.warning('请先登录')
      await router.push('/login')
    } else {
      ElMessage.error(response.data.message || '移除成员失败')
    }
  } catch (error) {
    console.error('移除成员失败:', error)
    if (error !== 'cancel') {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        ElMessage.warning('登录已过期，请重新登录')
        await router.push('/login')
      } else {
        ElMessage.error('移除成员失败')
      }
    }
  }
}

// 处理团队操作命令
const handleTeamCommand = async (command: string, team: any) => {
  switch (command) {
    case 'invite':
      showInviteDialog(team)
      break
    case 'edit':
      await editTeam(team)
      break
    case 'dissolve':
      await dissolveTeam(team)
      break
  }
}

// 编辑团队
const editTeam = async (team: any) => {
  ElMessage.info('编辑团队功能开发中')
}

// 解散团队
const dissolveTeam = async (team: any) => {
  try {
    await ElMessageBox.confirm(
        `确定要解散团队 "${team.teamName}" 吗？此操作不可恢复。`,
        '解散团队',
        {
          confirmButtonText: '解散',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
    )

    const response = await axios.delete(`${API_BASE_URL.value}/api/team/${team.teamId}`)

    if (response.data.code === 200) {
      ElMessage.success('团队已解散')
      await loadUserTeams()
      if (selectedTeam.value?.teamId === team.teamId) {
        selectedTeam.value = null
        selectedMember.value = null
      }
    } else if (response.data.code === 401) {
      ElMessage.warning('请先登录')
      await router.push('/login')
    } else {
      ElMessage.error(response.data.message || '解散团队失败')
    }
  } catch (error) {
    console.error('解散团队失败:', error)
    if (error !== 'cancel') {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        ElMessage.warning('登录已过期，请重新登录')
        await router.push('/login')
      } else {
        ElMessage.error('解散团队失败')
      }
    }
  }
}

// 退出团队
const quitTeam = async (team: any) => {
  try {
    await ElMessageBox.confirm(
        `确定要退出团队 "${team.teamName}" 吗？`,
        '退出团队',
        {
          confirmButtonText: '退出',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const response = await axios.post(
        `${API_BASE_URL.value}/api/team/${team.teamId}/quit`,
        null
    )

    if (response.data.code === 200) {
      ElMessage.success('已退出团队')
      await loadUserTeams()
      if (selectedTeam.value?.teamId === team.teamId) {
        selectedTeam.value = null
        selectedMember.value = null
      }
    } else if (response.data.code === 401) {
      ElMessage.warning('请先登录')
      await router.push('/login')
    } else {
      ElMessage.error(response.data.message || '退出团队失败')
    }
  } catch (error) {
    console.error('退出团队失败:', error)
    if (error !== 'cancel') {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        ElMessage.warning('登录已过期，请重新登录')
        await router.push('/login')
      } else {
        ElMessage.error('退出团队失败')
      }
    }
  }
}

// 初始化
// onMounted(async () => {
//   // 检查登录状态
//   const isLoggedIn = await checkLogin()
//   if (isLoggedIn) {
//     await loadUserTeams()
//     await loadInvitations()
//   } else {
//     ElMessage.warning('请先登录')
//     await router.push('/login')
//   }
// })
</script>

<style scoped>
.team-container {
  display: flex;
  height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

/* 左侧团队列表样式 */
.left-team-list {
  width: 320px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.team-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.team-actions {
  display: flex;
  gap: 8px;
}

.teams-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-teams {
  padding: 40px 20px;
  text-align: center;
}

.team-item {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.team-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  width: 100%;
}

.team-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.team-avatar {
  margin-right: 12px;
  background-color: #409eff;
  color: white;
  font-weight: bold;
}

.team-details {
  flex: 1;
  min-width: 0;
}

.team-name {
  display: block;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-meta {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.team-actions-dropdown {
  margin-left: 8px;
}

.team-more {
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.team-more:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

/* 团队成员列表样式 */
.members-list {
  padding: 12px;
  background-color: #fafafa;
  border-top: 1px solid #e4e7ed;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.members-scrollable {
  max-height: 300px;
  overflow-y: auto;
}

.member-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.member-item:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.member-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.member-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.member-avatar {
  margin-right: 8px;
  background-color: #67c23a;
  color: white;
}

.member-details {
  flex: 1;
  min-width: 0;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.member-account {
  display: block;
  font-size: 12px;
  color: #909399;
}

.member-actions .remove-icon {
  color: #f56c6c;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.member-actions .remove-icon:hover {
  background-color: #fef0f0;
}

/* 右侧文档区域样式 */
.right-document-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 8px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.document-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
}

.selected-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-info-header {
  display: flex;
  align-items: center;
}

.selected-avatar {
  margin-right: 16px;
  background-color: #409eff;
  color: white;
}

.member-details-header h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
}

.member-meta {
  display: flex;
  gap: 16px;
  color: #606266;
  font-size: 14px;
}

.account,
.team-name {
  display: flex;
  align-items: center;
  gap: 4px;
}

.no-selection {
  text-align: center;
  padding: 40px 0;
}

.document-editor {
  flex: 1;
  overflow: hidden;
}

.empty-editor {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 邀请相关样式 */
.invitation-badge {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

.badge :deep(.el-badge__content) {
  cursor: pointer;
}

.invite-content {
  padding: 8px 0;
}

.search-result {
  margin-top: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.user-found {
  display: flex;
  align-items: center;
  gap: 16px;
}

.found-avatar {
  background-color: #67c23a;
  color: white;
}

.found-details h4 {
  margin: 0 0 4px 0;
  color: #303133;
}

.found-details p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.found-actions {
  margin-left: auto;
}

.invite-status {
  margin-top: 12px;
}

.invitations-list {
  max-height: 400px;
  overflow-y: auto;
}

.invitation-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 12px;
  background: #fafafa;
}

.invitation-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.invitation-avatar {
  background-color: #e6a23c;
  color: white;
}

.invitation-details h4 {
  margin: 0 0 4px 0;
  color: #303133;
}

.invitation-details p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}

.invite-time,
.inviter {
  font-size: 12px !important;
  color: #909399 !important;
}

.invitation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.empty-invitations {
  padding: 40px 0;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .team-container {
    flex-direction: column;
  }

  .left-team-list {
    width: 100%;
    height: 300px;
  }

  .right-document-area {
    margin: 8px 0 0 0;
    border-radius: 0;
  }
}
</style>