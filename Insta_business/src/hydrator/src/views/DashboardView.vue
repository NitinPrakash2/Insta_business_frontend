<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-0.5">Overview of your store & catalog sync</p>
      </div>
      <button @click="load" :disabled="loading"
        class="flex items-center gap-2 text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-sm transition-all disabled:opacity-50">
        <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Refresh
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-center justify-between bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
      <span>{{ error }}</span>
      <button @click="load" class="underline font-medium">Retry</button>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in metricCards" :key="card.label"
        class="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0', card.bg]">
          {{ card.icon }}
        </div>
        <div>
          <p class="text-xs text-slate-400 uppercase tracking-wider">{{ card.label }}</p>
          <div v-if="loading" class="mt-1 h-6 w-14 bg-slate-100 animate-pulse rounded"/>
          <p v-else :class="['text-2xl font-bold', card.color]">{{ card.value }}</p>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-700">Recent Sync Activity</span>
          <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{{ activity.length }} events</span>
        </div>
        <div v-if="loading" class="p-4 space-y-3">
          <div v-for="i in 4" :key="i" class="flex gap-3 items-center">
            <div class="w-2 h-2 rounded-full bg-slate-100 animate-pulse"/>
            <div class="flex-1 h-3 bg-slate-100 animate-pulse rounded"/>
          </div>
        </div>
        <div v-else-if="!activity.length" class="px-4 py-10 text-center text-slate-400 text-sm">
          No sync activity yet. Sync your products to see activity here.
        </div>
        <ul v-else class="divide-y divide-slate-50">
          <li v-for="item in activity" :key="item.id" class="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60">
            <span :class="['mt-1.5 w-2 h-2 rounded-full flex-shrink-0', dotColor(item.type)]"/>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-600">{{ item.message }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ item.time }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Right Col -->
      <div class="flex flex-col gap-4">

        <!-- Instagram Status -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p class="text-sm font-semibold text-slate-700 mb-3">Instagram</p>
          <div v-if="loading" class="h-4 bg-slate-100 animate-pulse rounded"/>
          <div v-else-if="igConnected" class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"/>
            <span class="text-sm text-slate-700">@{{ igUsername }}</span>
            <span class="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Connected</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-300"/>
            <span class="text-sm text-slate-500">Not connected</span>
          </div>
        </div>

        <!-- Catalog Health -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-semibold text-slate-700">Catalog Health</p>
            <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', syncRate >= 80 ? 'bg-emerald-100 text-emerald-600' : syncRate > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500']">
              {{ syncRate }}%
            </span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 mb-3">
            <div :class="['h-1.5 rounded-full transition-all', syncRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500']" :style="{ width: syncRate + '%' }"/>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-emerald-50 rounded-lg p-2.5 text-center border border-emerald-100">
              <p class="text-lg font-bold text-emerald-600">{{ syncedCount }}</p>
              <p class="text-xs text-slate-400">Synced</p>
            </div>
            <div class="bg-red-50 rounded-lg p-2.5 text-center border border-red-100">
              <p class="text-lg font-bold text-red-500">{{ failedCount }}</p>
              <p class="text-xs text-slate-400">Failed</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { call } from '../services/api'

const loading  = ref(false)
const error    = ref<string | null>(null)
const igConnected = ref(false)
const igUsername  = ref('')
const syncedCount = ref(0)
const failedCount = ref(0)
const totalCount  = ref(0)
const activity    = ref<{ id: string; message: string; time: string; type: string }[]>([])

const metricCards = computed(() => [
  { label: 'Total Products',  value: totalCount.value,  icon: '📦', bg: 'bg-blue-50',    color: 'text-slate-800' },
  { label: 'Synced Products', value: syncedCount.value, icon: '✅', bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'Failed Products', value: failedCount.value, icon: '⚠️', bg: 'bg-red-50',     color: failedCount.value > 0 ? 'text-red-500' : 'text-slate-800' },
  { label: 'Instagram',       value: igConnected.value ? 'Live' : 'Off', icon: '📸', bg: 'bg-pink-50', color: igConnected.value ? 'text-emerald-600' : 'text-slate-400' },
])

const syncRate = computed(() => {
  if (!totalCount.value) return 0
  return Math.round((syncedCount.value / totalCount.value) * 100)
})

function dotColor(type: string) {
  return { sync: 'bg-violet-400', product: 'bg-emerald-400', instagram: 'bg-pink-400' }[type] ?? 'bg-slate-300'
}

async function load() {
  loading.value = true; error.value = null
  try {
    const [igRes, histRes] = await Promise.all([
      call('meta_connection_status'),
      call('instagram_sync_history', { limit: 8 }),
    ])

    const ig = igRes.data?.data ?? {}
    igConnected.value = ig.connected ?? false
    igUsername.value  = ig.instagram_username ?? ''
    totalCount.value  = ig.catalog_product_count ?? 0

    const history: any[] = histRes.data?.data?.history ?? []
    const last = history[0]
    syncedCount.value = last?.synced ?? 0
    failedCount.value = last?.failed ?? 0

    activity.value = history.map((h: any) => ({
      id:      h.id,
      type:    'sync',
      message: `Sync ${h.status}: ${h.synced} synced, ${h.failed} failed (${h.trigger})`,
      time:    h.completed_at ? new Date(h.completed_at).toLocaleString() : new Date(h.started_at).toLocaleString(),
    }))
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
