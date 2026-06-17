# Instagram Business Frontend - Backend Integration Guide

## ✅ Integration Complete!

Frontend has been wired up with your Instagram Business Commerce backend APIs.

---

## 📁 Project Location

**Frontend**: `c:\Users\nitin\Desktop\Instagram\Insta_business_frontend\Insta_business`  
**Backend**: `c:\Users\nitin\Desktop\Instagram\Insta_business_backend\dryutil\backend\python\fastapi\project`

---

## 🔧 Configuration Changes Made

### 1. Environment Variables (.env.local)
```env
VITE_API_BASE_URL='http://localhost:8000/client/api/i/ona/x'
VITE_PUBLIC_API_BASE_URL='http://localhost:8000/client-public/api/i'
VITE_UTILITY_ID='705'
VITE_PROJECT_NAME='ona'
VITE_INSTANCE_NAME='x'
```

### 2. API Services Updated

#### instagram.service.ts
- ✅ `getStatus()` → `GET ?utility_id=705&action=instagram_health`
- ✅ `validate()` → `GET ?utility_id=705&action=instagram_validate`
- ✅ `startOAuth()` → `GET /client-public/api/i/meta_oauth_start`
- ✅ `connect()` → `POST ?utility_id=705&action=instagram_connect`
- ✅ `disconnect()` → `POST ?utility_id=705&action=meta_disconnect`
- ✅ `getCatalogDetails()` → `GET ?utility_id=705&action=instagram_catalog_details`

#### catalog.service.ts
- ✅ `getStatus()` → `GET ?utility_id=705&action=instagram_catalog_status`
- ✅ `syncAll()` → `POST ?utility_id=705&action=instagram_catalog_sync_full`
- ✅ `retryFailed()` → `POST ?utility_id=705&action=instagram_catalog_sync_full`
- ✅ `getHistory()` → `GET ?utility_id=705&action=instagram_sync_history`
- ✅ `getFailedProducts()` → `GET ?utility_id=705&action=instagram_sync_errors`
- ✅ `syncProduct()` → `POST ?utility_id=705&action=instagram_catalog_sync_product`

### 3. Stores Updated

#### instagram.store.ts
- ✅ Added OAuth flow method `startOAuth()`
- ✅ Fixed response parsing for backend format: `{ success: true, data: {...} }`
- ✅ Proper error handling
- ✅ Auto-redirects to Meta OAuth URL

#### catalog.store.ts
- ✅ Parse backend response structure properly
- ✅ Transform data to match frontend types
- ✅ Handle sync history and failed products
- ✅ Error handling with user-friendly messages

### 4. New Files Created

#### auth.helper.ts
Helper for managing JWT tokens and user authentication:
- `getToken()` / `setToken()` - Manage JWT
- `getUserId()` / `setUserId()` - Manage user ID
- `isAuthenticated()` - Check auth status
- `init()` - Initialize on app startup

---

## 🚀 How to Run

### Step 1: Start Backend Server

```bash
cd c:\Users\nitin\Desktop\Instagram\Insta_business_backend\dryutil\backend\python\fastapi\project
poetry run uvicorn src.index:app --reload --port 8000
```

**Verify backend is running**: http://localhost:8000/docs

### Step 2: Generate JWT Token

```bash
cd c:\Users\nitin\Desktop\Instagram\Insta_business_backend\dryutil\backend\python\fastapi\project
poetry run python generate_token.py
```

**Copy the token** (everything after "Bearer")

### Step 3: Install Frontend Dependencies

```bash
cd c:\Users\nitin\Desktop\Instagram\Insta_business_frontend\Insta_business
npm install
```

### Step 4: Start Frontend Dev Server

```bash
npm run dev
```

Frontend will run on: http://localhost:5173 (or next available port)

### Step 5: Set JWT Token in Browser

1. Open frontend in browser
2. Open **Developer Console** (F12)
3. Go to **Console** tab
4. Run this command (replace with your token):
```javascript
localStorage.setItem('auth_token', 'YOUR_JWT_TOKEN_HERE');
localStorage.setItem('user_id', 'seller_nitin_001');
```

5. **Refresh the page** (F5)

---

## 📱 Frontend Features

### 1. Dashboard View
- Overview of products and sync status
- Quick metrics display
- Recent activity feed

### 2. Instagram View
- View Instagram connection status
- **Connect Instagram** button → Redirects to Meta OAuth
- Shows Instagram username, catalog name
- Disconnect option

### 3. Catalog Sync View
- View sync metrics (total, synced, failed)
- **Sync All** button → Syncs all products
- **Retry Failed** button → Retries failed products
- Sync history table
- Failed products table with error details

### 4. Products View
- List all products
- Filter by sync status
- Individual product sync

### 5. Categories View
- Manage product categories
- View product count per category

### 6. Settings View
- Store configuration
- API settings

---

## 🔄 OAuth Flow

1. User clicks **"Connect Instagram"** in Instagram View
2. Frontend calls: `GET /client-public/api/i/meta_oauth_start`
3. Backend returns: `{ success: true, data: { auth_url: "https://facebook.com/..." } }`
4. Frontend redirects user to Meta OAuth page
5. User approves permissions on Facebook
6. Meta redirects to: `/client-public/api/i/meta_oauth_callback?code=...`
7. Backend:
   - Exchanges code for long-lived token
   - Discovers Instagram Business Account
   - Discovers Facebook Page
   - Discovers/creates Meta Catalog
   - Links catalog to Instagram Shop
   - Auto-syncs products
8. User is redirected back to frontend
9. Frontend shows connected status

---

## 🐛 Troubleshooting

### Issue 1: CORS Error
**Error**: "Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS"

**Solution**: Add CORS middleware in backend:
```python
# src/index.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: 401 Unauthorized
**Error**: All API calls return 401

**Solution**: 
1. Generate fresh JWT token: `poetry run python generate_token.py`
2. Set in browser console: `localStorage.setItem('auth_token', 'NEW_TOKEN')`
3. Refresh page

### Issue 3: Network Error
**Error**: "Network Error" or "Failed to fetch"

**Solution**: 
1. Check backend is running on port 8000
2. Check `.env.local` has correct `VITE_API_BASE_URL`
3. Restart frontend dev server

### Issue 4: Empty Response
**Error**: Data not showing even though API returns 200

**Solution**: 
1. Check browser console for errors
2. Verify response structure matches: `{ success: true, data: {...} }`
3. Check store is parsing data correctly

### Issue 5: OAuth Redirect Not Working
**Error**: After Meta OAuth approval, redirect fails

**Solution**:
1. Check `meta_oauth_callback` is registered in backend
2. Verify redirect_uri in Meta App settings matches backend URL
3. Check backend logs for errors during callback

---

## 📊 API Response Formats

### Instagram Health
```json
{
  "success": true,
  "data": {
    "healthy": true,
    "checks": { "token": true, "instagram_account": true, ... },
    "details": {
      "instagram_account": { "username": "nitin_test", ... },
      "catalog": { "name": "My Catalog", "product_count": 25 }
    }
  }
}
```

### Catalog Sync Full
```json
{
  "success": true,
  "data": {
    "sync_id": "uuid",
    "status": "completed",
    "total": 25,
    "synced": 23,
    "failed": 2,
    "started_at": "2026-06-14T...",
    "completed_at": "2026-06-14T..."
  }
}
```

### Sync History
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "catalog_id": "123",
        "status": "completed",
        "total_products": 25,
        "synced": 23,
        "failed": 2,
        "started_at": "...",
        "completed_at": "..."
      }
    ]
  }
}
```

### Sync Errors
```json
{
  "success": true,
  "data": {
    "sync_id": "uuid",
    "total_errors": 2,
    "errors": [
      {
        "id": "uuid",
        "product_id": "prod_123",
        "name": "Product Name",
        "reason": "Invalid image URL"
      }
    ]
  }
}
```

---

## 🎨 UI Components Used

- **Tailwind CSS** - Styling
- **Vue 3** - Framework
- **Pinia** - State management
- **Axios** - HTTP client
- **Vue Router** - Navigation

---

## 🔐 Security Notes

1. ✅ JWT tokens stored in `localStorage`
2. ✅ Tokens auto-attached to all API requests
3. ✅ User ID stored for multi-user support
4. ✅ OAuth flow handled server-side
5. ⚠️ **Never commit JWT tokens to Git**
6. ⚠️ **Tokens expire after 24 hours** - regenerate daily

---

## 📝 Testing Checklist

### Before Testing:
- [ ] Backend server running on port 8000
- [ ] Database table `instagram_business` created
- [ ] Frontend dev server running
- [ ] JWT token generated and set in browser
- [ ] User ID set in localStorage

### Test Flow:
1. [ ] Open frontend in browser
2. [ ] Navigate to Instagram view
3. [ ] Click "Connect Instagram"
4. [ ] Complete Meta OAuth approval
5. [ ] Verify connection status shows "Connected"
6. [ ] Navigate to Catalog Sync view
7. [ ] Click "Sync All"
8. [ ] Verify sync completes successfully
9. [ ] Check sync history table
10. [ ] View any failed products

---

## 🚀 Production Deployment

### Environment Variables (Production)

```env
VITE_API_BASE_URL='https://your-backend-domain.com/client/api/i/ona/x'
VITE_PUBLIC_API_BASE_URL='https://your-backend-domain.com/client-public/api/i'
VITE_UTILITY_ID='705'
VITE_PROJECT_NAME='ona'
VITE_INSTANCE_NAME='x'
```

### Build Frontend

```bash
npm run build
```

Output will be in `dist/` folder - deploy to any static hosting (Vercel, Netlify, S3, etc.)

---

## 📞 Need Help?

1. Check browser **Console** for errors (F12)
2. Check browser **Network** tab for failed API calls
3. Check backend logs for server-side errors
4. Verify all environment variables are correct
5. Ensure JWT token is valid and not expired

---

## ✅ Integration Summary

**Total API Endpoints Integrated**: 11
- Instagram: 6 endpoints
- Catalog: 5 endpoints

**Files Modified**: 7
- 2 service files
- 2 store files
- 1 view file
- 1 environment file
- 1 type file

**Files Created**: 2
- auth.helper.ts
- FRONTEND_INTEGRATION_GUIDE.md

**Status**: ✅ Ready for testing!

---

Happy coding! 🎉
