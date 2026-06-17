// ── Auth ──────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

// ── Product ───────────────────────────────────────────────────────────────
export interface ProductVariant {
  id: string
  color?: string
  size?: string
  price: number
  mrp: number
  stock: number
}

export interface Product {
  id: string
  name: string
  description: string
  brand: string
  category_id: string
  category_name?: string
  price: number
  mrp: number
  stock: number
  status: 'active' | 'inactive'
  sync_status: 'synced' | 'pending' | 'failed' | 'not_synced'
  images: string[]
  variants: ProductVariant[]
  created_at?: string
  updated_at?: string
}

export interface ProductForm {
  name: string
  description: string
  brand: string
  category_id: string
  price: number
  mrp: number
  stock: number
  images: string[]
  variants: ProductVariant[]
}

// ── Category ──────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  description: string
  product_count: number
}

// ── Instagram ─────────────────────────────────────────────────────────────
export interface InstagramStatus {
  connected: boolean
  instagram_username?: string
  instagram_business_account_id?: string
  fb_page_id?: string
  fb_page_name?: string
  catalog_id?: string
  catalog_name?: string
  catalog_product_count?: number
  connected_at?: string
  token_days_left?: number
}

// ── Catalog Sync ──────────────────────────────────────────────────────────
export interface CatalogStatus {
  connected: boolean
  catalog_id: string
  catalog_name: string
  product_count: number
  sync_health: 'good' | 'partial' | 'failed' | 'unknown'
  last_sync: string | null
}

export interface SyncResult {
  sync_id: string
  status: string
  total: number
  synced: number
  failed: number
  started_at: string
  completed_at: string
}

export interface SyncHistoryItem {
  id: string
  catalog_id: string
  status: string
  total_products: number
  synced: number
  failed: number
  trigger: string
  started_at: string
  completed_at: string | null
}

export interface FailedProduct {
  id: string
  product_id: string
  name: string
  reason: string
}

// ── Store Settings ────────────────────────────────────────────────────────
export interface StoreSettings {
  title: string
  description: string
  category: string
  logo_url: string
  contact_email?: string
  contact_phone?: string
  website?: string
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardMetrics {
  total_products: number
  active_products: number
  synced_products: number
  failed_products: number
}

export interface ActivityItem {
  id: string
  message: string
  time: string
  type: 'sync' | 'product' | 'instagram'
}
