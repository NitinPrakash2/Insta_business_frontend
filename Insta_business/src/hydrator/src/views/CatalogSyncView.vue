<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Catalog Sync</h1>
        <p class="text-sm text-slate-500 mt-0.5">Sync your products to Instagram Catalog</p>
      </div>
      <button @click="load" :disabled="store.loading"
        class="flex items-center gap-2 text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50">
        <svg class="w-4 h-4" :class="{ 'animate-spin': store.loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Refresh
      </button>
    </div>

    <div v-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex justify-between">
      <span>{{ store.error }}</span>
      <button @click="load" class="underline">Retry</button>
    </div>

    <!-- Status Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <p class="text-xs text-slate-400 uppercase tracking-wider">Status</p>
        <div class="flex items-center gap-2 mt-1">
          <span :class="['w-2.5 h-2.5 rounded-full', healthColor]"/>
          <p class="text-sm font-semibold text-slate-700 capitalize">{{ store.status?.sync_health ?? '—' }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <p class="text-xs text-slate-400 uppercase tracking-wider">Catalog Products</p>
        <p class="text-2xl font-bold text-slate-800 mt-1">{{ store.status?.product_count ?? 0 }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <p class="text-xs text-slate-400 uppercase tracking-wider">Last Synced</p>
        <p class="text-sm font-semibold text-slate-700 mt-1">{{ lastSyncTime }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <p class="text-xs text-slate-400 uppercase tracking-wider">Catalog</p>
        <p class="text-sm font-semibold text-slate-700 mt-1 truncate">{{ store.status?.catalog_name || '—' }}</p>
      </div>
    </div>

    <!-- Sync Button -->
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-base font-semibold text-slate-800">Sync All Products</h2>
        <p class="text-sm text-slate-500 mt-0.5">Push all products to your Meta Catalog</p>
      </div>
      <button @click="store.syncAll()" :disabled="store.syncing || !store.status?.connected"
        class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition disabled:opacity-50 min-w-[140px] justify-center">
        <svg v-if="store.syncing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke-width="4" class="opacity-75"/>
        </svg>
        {{ store.syncing ? 'Syncing...' : 'Sync Now' }}
      </button>
    </div>

    <!-- Last Sync Result -->
    <div v-if="store.lastSync" class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 flex gap-4 flex-wrap">
      <span>Sync complete:</span>
      <span><b>{{ store.lastSync.synced }}</b> synced</span>
      <span><b>{{ store.lastSync.failed }}</b> failed</span>
      <span>Status: <b>{{ store.lastSync.status }}</b></span>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="flex border-b border-slate-100">
        <button v-for="tab in tabs" :key="tab.key"
          @click="activeTab = tab.key"
          :class="['px-4 py-3 text-sm font-medium transition', activeTab === tab.key ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700']">
          {{ tab.label }}
          <span v-if="tab.key === 'errors' && store.errors.length" class="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{{ store.errors.length }}</span>
        </button>
      </div>

      <!-- History -->
      <div v-if="activeTab === 'history'" class="overflow-x-auto">
        <div v-if="store.loading" class="p-6 space-y-3">
          <div v-for="i in 4" :key="i" class="h-3 bg-slate-100 animate-pulse rounded"/>
        </div>
        <div v-else-if="!store.history.length" class="px-4 py-10 text-center text-slate-400 text-sm">No sync history yet.</div>
        <table v-else class="w-full text-sm">
          <thead><tr class="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
            <th class="px-4 py-3 text-left">Date</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Total</th>
            <th class="px-4 py-3 text-left">Synced</th>
            <th class="px-4 py-3 text-left">Failed</th>
            <th class="px-4 py-3 text-left">Trigger</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="h in store.history" :key="h.id" class="hover:bg-slate-50/60">
              <td class="px-4 py-3 text-slate-600">{{ h.completed_at ? new Date(h.completed_at).toLocaleString() : '—' }}</td>
              <td class="px-4 py-3"><span :class="['text-xs font-medium px-2 py-0.5 rounded-full', statusBadge(h.status)]">{{ h.status }}</span></td>
              <td class="px-4 py-3 text-slate-600">{{ h.total_products }}</td>
              <td class="px-4 py-3 text-emerald-600 font-medium">{{ h.synced }}</td>
              <td class="px-4 py-3" :class="h.failed > 0 ? 'text-red-500 font-medium' : 'text-slate-400'">{{ h.failed }}</td>
              <td class="px-4 py-3 text-slate-400 capitalize">{{ h.trigger }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Errors -->
      <div v-if="activeTab === 'errors'">
        <div v-if="!store.errors.length" class="px-4 py-10 text-center text-slate-400 text-sm">No failed products.</div>
        <table v-else class="w-full text-sm">
          <thead><tr class="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
            <th class="px-4 py-3 text-left">Product</th>
            <th class="px-4 py-3 text-left">Error</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="e in store.errors" :key="e.id" class="hover:bg-slate-50/60">
              <td class="px-4 py-3 font-medium text-slate-700">{{ e.name || e.product_id }}</td>
              <td class="px-4 py-3 text-red-500 text-xs">{{ e.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useCatalogStore } from '../stores/catalog.store'

const store     = useCatalogStore()
const activeTab = ref<'history' | 'errors'>('history')
const tabs      = [
  { key: 'history', label: 'Sync History' },
  { key: 'errors',  label: 'Failed Products' },
]

const healthColor = computed(() => ({
  good:    'bg-emerald-500',
  partial: 'bg-amber-500',
  failed:  'bg-red-500',
  unknown: 'bg-slate-300',
}[store.status?.sync_health ?? 'unknown']))

const lastSyncTime = computed(() => {
  const t = store.status?.last_sync
  return t ? new Date(t).toLocaleString() : 'Never'
})

function statusBadge(s: string) {
  return { completed: 'bg-emerald-100 text-emerald-700', partial: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', running: 'bg-blue-100 text-blue-700' }[s] ?? 'bg-slate-100 text-slate-600'
}

async function load() {
  await Promise.all([store.fetchStatus(), store.fetchHistory(), store.fetchErrors()])
}

onMounted(load)
</script>
