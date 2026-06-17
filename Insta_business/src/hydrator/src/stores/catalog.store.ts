import { defineStore } from 'pinia'
import { ref } from 'vue'
import { call } from '../services/api'
import type { CatalogStatus, SyncResult, SyncHistoryItem, FailedProduct } from '../types'

export const useCatalogStore = defineStore('catalog', () => {
  const status   = ref<CatalogStatus | null>(null)
  const history  = ref<SyncHistoryItem[]>([])
  const errors   = ref<FailedProduct[]>([])
  const syncing  = ref(false)
  const loading  = ref(false)
  const error    = ref<string | null>(null)
  const lastSync = ref<SyncResult | null>(null)

  async function fetchStatus() {
    loading.value = true
    error.value = null
    try {
      const res = await call('instagram_catalog_status')
      status.value = res.data?.data ?? null
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchHistory() {
    try {
      const res = await call('instagram_sync_history', { limit: 20 })
      history.value = res.data?.data?.history ?? []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function fetchErrors() {
    try {
      const res = await call('instagram_sync_errors')
      errors.value = res.data?.data?.errors ?? []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function syncAll() {
    syncing.value = true
    error.value = null
    try {
      const res = await call('instagram_catalog_sync_full', { trigger: 'manual' })
      lastSync.value = res.data?.data ?? null
      await Promise.all([fetchStatus(), fetchHistory()])
    } catch (e: any) {
      error.value = e.message
    } finally {
      syncing.value = false
    }
  }

  return {
    status,
    history,
    errors,
    syncing,
    loading,
    error,
    lastSync,
    fetchStatus,
    fetchHistory,
    fetchErrors,
    syncAll
  }
})
