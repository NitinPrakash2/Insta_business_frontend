<template>
  <div class="seller-connect-page">
    <!-- Simple Header -->
    <div class="header">
      <div class="header-content">
        <h1>📸 Instagram Shopping Setup</h1>
        <p>Connect your Instagram account to auto-sync products</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <!-- Step 1: Connect Button -->
      <div v-if="step === 'connect'" class="card">
        <div class="icon-large">🔗</div>
        <h2>Connect Your Instagram</h2>
        <p class="desc">
          Click below to log in with your Instagram Business account.<br>
          Your products will automatically sync to Instagram Shopping.
        </p>
        
        <button @click="startOAuth" :disabled="loading" class="btn-connect">
          <span v-if="!loading">Login with Instagram</span>
          <span v-else>
            <span class="spinner"></span> Connecting...
          </span>
        </button>

        <p class="footnote">
          ✓ Secure • ✓ 1-click setup • ✓ Auto-sync products
        </p>
      </div>

      <!-- Step 2: Syncing -->
      <div v-if="step === 'syncing'" class="card syncing">
        <div class="spinner-large"></div>
        <h2>Setting Up...</h2>
        <p class="desc">{{ syncStatus }}</p>
        <div class="progress">
          <div class="progress-bar" :style="{ width: syncProgress + '%' }"></div>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div v-if="step === 'success'" class="card success">
        <div class="icon-large success-icon">✅</div>
        <h2>All Set!</h2>
        <div class="success-info">
          <p><strong>Account:</strong> {{ successData.username }}</p>
          <p><strong>Products Synced:</strong> <span class="number">{{ successData.count }}</span></p>
          <p><strong>Catalog:</strong> {{ successData.catalog }}</p>
        </div>
        
        <button @click="goToDashboard" class="btn-primary">
          Go to Dashboard
        </button>
        <button @click="viewSync" class="btn-secondary">
          View Sync Details
        </button>
      </div>

      <!-- Error State -->
      <div v-if="error" class="card error">
        <div class="icon-large error-icon">⚠️</div>
        <h2>Connection Failed</h2>
        <p class="error-msg">{{ error }}</p>
        
        <button @click="reset" class="btn-retry">
          Try Again
        </button>
        
        <details class="debug-info">
          <summary>Error Details</summary>
          <pre>{{ errorDetails }}</pre>
        </details>
      </div>
    </div>

    <!-- FAQ -->
    <div v-if="step === 'connect'" class="faq">
      <h3>🤔 Common Questions</h3>
      <div class="faq-item">
        <strong>What if I don't have a Business Account?</strong>
        <p>Log in with your personal account first, then we'll help you convert it to Business. Takes 2 minutes.</p>
      </div>
      <div class="faq-item">
        <strong>Will this affect my current followers?</strong>
        <p>No. Your account stays the same. We just add shopping capability.</p>
      </div>
      <div class="faq-item">
        <strong>How long does sync take?</strong>
        <p>Usually 1-2 minutes depending on product count.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SellerInstagramConnect',
  data() {
    return {
      step: 'connect',
      loading: false,
      error: null,
      errorDetails: '',
      syncStatus: 'Discovering your Instagram account...',
      syncProgress: 0,
      successData: {
        username: '',
        count: 0,
        catalog: ''
      }
    }
  },
  methods: {
    async startOAuth() {
      this.loading = true
      this.error = null
      try {
        const userId = this.getOrCreateUserId()
        const backendUrl = 'http://localhost:8000'
        
        const tokenRes = await fetch(`${backendUrl}/auth/get_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        })
        const tokenData = await tokenRes.json()
        const token = tokenData.data.access_token
        localStorage.setItem('jwt_token', token)
        
        const response = await fetch(`${backendUrl}/client/api/i/ona/instagram?typ=meta_oauth_start`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userId,
            redirect_uri: window.location.origin + '/oauth/callback'
          })
        })

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status} ${response.statusText}`)
        }

        const text = await response.text()
        if (!text) {
          throw new Error('Empty response from backend')
        }

        const data = JSON.parse(text)
        if (!data.success) {
          throw new Error(data.message || 'Failed to start connection')
        }

        localStorage.setItem('instagram_setup_start', Date.now())
        window.location.href = data.data.auth_url
      } catch (err) {
        this.error = err.message
        this.errorDetails = err.stack || ''
        this.step = 'error'
      } finally {
        this.loading = false
      }
    },

    async handleOAuthCallback(code) {
      this.step = 'syncing'
      this.syncProgress = 20
      this.syncStatus = 'Exchanging authorization...'
      const backendUrl = 'http://localhost:8000'
      const userId = this.getOrCreateUserId()
      const token = localStorage.getItem('jwt_token')

      try {
        const response = await fetch(`${backendUrl}/client/api/i/ona/instagram?typ=meta_oauth_callback`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userId,
            code: code,
            redirect_uri: window.location.origin + '/oauth/callback'
          })
        })

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.message || 'Authorization failed')
        }

        this.syncProgress = 50
        this.syncStatus = 'Preparing your catalog...'

        await this.autoSync()

        this.syncProgress = 100
        this.step = 'success'
      } catch (err) {
        this.error = err.message
        this.errorDetails = err.stack || ''
        this.step = 'error'
      }
    },

    async autoSync() {
      this.syncStatus = 'Syncing products...'
      const backendUrl = 'http://localhost:8000'
      const userId = this.getOrCreateUserId()
      const token = localStorage.getItem('jwt_token')
      
      const response = await fetch(`${backendUrl}/client/api/i/ona/instagram?typ=instagram_catalog_sync_full`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          trigger: 'oauth'
        })
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Sync failed')
      }

      this.syncProgress = 80
      this.syncStatus = `Synced ${data.data.synced} products!`

      const statusRes = await fetch(`${backendUrl}/client/api/i/ona/instagram?typ=meta_connection_status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId
        })
      })

      const statusData = await statusRes.json()
      this.successData = {
        username: statusData.data.data.instagram_username || 'Your Account',
        count: data.data.synced,
        catalog: statusData.data.data.catalog_name || 'Your Catalog'
      }
    },

    getOrCreateUserId() {
      let userId = localStorage.getItem('user_id')
      if (!userId) {
        userId = 'seller_' + Date.now()
        localStorage.setItem('user_id', userId)
      }
      return userId
    },

    goToDashboard() {
      this.$router.push('/dashboard')
    },

    viewSync() {
      this.$router.push('/catalog-sync')
    },

    reset() {
      this.step = 'connect'
      this.error = null
      this.errorDetails = ''
      this.syncProgress = 0
    }
  },

  mounted() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      this.handleOAuthCallback(code)
      window.history.replaceState({}, '', window.location.pathname + window.location.hash)
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.seller-connect-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.header {
  background: rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.header-content h1 {
  font-size: 32px;
  margin-bottom: 8px;
  font-weight: 600;
}

.header-content p {
  font-size: 16px;
  opacity: 0.9;
}

.container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 50px 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-large {
  font-size: 60px;
  margin-bottom: 20px;
}

.success-icon {
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.error-icon {
  animation: shake 0.5s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

h2 {
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 16px;
  font-weight: 600;
}

.desc {
  color: #666;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.btn-connect {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-connect:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-connect:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary,
.btn-secondary,
.btn-retry {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 10px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-retry {
  background: #ff6b6b;
  color: white;
}

.btn-retry:hover {
  background: #ee5a6f;
}

.footnote {
  font-size: 13px;
  color: #999;
  margin-top: 20px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.syncing .desc {
  color: #667eea;
  font-weight: 500;
}

.progress {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 20px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.success {
  background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%);
  border: 2px solid #10b981;
}

.success h2 {
  color: #10b981;
}

.success-info {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.success-info p {
  font-size: 14px;
  color: #333;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
}

.number {
  font-weight: 600;
  color: #10b981;
}

.error {
  background: linear-gradient(135deg, #fef2f2 0%, #fef9f3 100%);
  border: 2px solid #dc2626;
}

.error h2 {
  color: #dc2626;
}

.error-msg {
  color: #991b1b;
  font-size: 14px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin: 15px 0;
}

.debug-info {
  text-align: left;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.debug-info summary {
  cursor: pointer;
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.debug-info pre {
  font-size: 11px;
  color: #666;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  overflow: auto;
  max-height: 150px;
}

.faq {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 40px 20px;
  margin-top: 40px;
}

.faq h3 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 30px;
}

.faq-item {
  max-width: 600px;
  margin: 0 auto 25px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.faq-item strong {
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
}

.faq-item p {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .header-content h1 {
    font-size: 24px;
  }

  .card {
    padding: 30px 20px;
  }

  h2 {
    font-size: 20px;
  }

  .icon-large {
    font-size: 48px;
  }

  .faq {
    display: none;
  }
}
</style>
