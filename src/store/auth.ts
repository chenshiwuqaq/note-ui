import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from "@/router";

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token') || null)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const clearToken = () => {
    token.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  const isAuthenticated = computed(() => !!token.value)

  return {
    token,
    setToken,
    clearToken,
    isAuthenticated
  }
})