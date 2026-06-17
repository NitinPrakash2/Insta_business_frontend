import { defineStore } from 'pinia'
import { ref } from 'vue'
import { call } from '../services/api'
import type { InstagramStatus } from '../types'

export const useInstagramStore = defineStore('instagram', () => {
  const status   = ref<InstagramStatus | null>(null)
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  async function fetchStatus() {
    loading.value = true
    error.value = null
    try {
      const res = await call('meta_connection_status')
      status.value = res.data?.data ?? null
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function startOAuth() {
    loading.value = true
    error.value = null
    try {
      const redirect_uri = `${window.location.origin}/oauth/callback`
      const res = await call('meta_oauth_start', { redirect_uri })
      const auth_url = res.data?.data?.auth_url
      if (auth_url) {
        window.location.href = auth_url
      }
    } catch (e: any) {
      error.value = e.message
      loading.value = false
    }
  }

  async function disconnect() {
    loading.value = true
    error.value = null
    try {
      await call('meta_disconnect')
      status.value = null
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    status,
    loading,
    error,
    fetchStatus,
    startOAuth,
    disconnect
  }
})
