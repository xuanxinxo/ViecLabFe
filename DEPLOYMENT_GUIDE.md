# 🚀 Hướng dẫn Deploy và Troubleshooting

## 📋 Checklist trước khi Deploy

### 1. Environment Variables
Tạo file `.env.local` với các biến sau:
```env
NEXT_PUBLIC_API_URL=https://vieclabbe.onrender.com
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
NODE_ENV=production
```

### 2. Build và Test
```bash
# Build ứng dụng
npm run build

# Test locally
npm run start

# Kiểm tra tất cả routes hoạt động
```

### 3. Kiểm tra API Health
```bash
# Test API endpoint
curl https://vieclabbe.onrender.com/api/health

# Test specific endpoints
curl https://vieclabbe.onrender.com/api/jobs
curl https://vieclabbe.onrender.com/api/hirings
curl https://vieclabbe.onrender.com/api/newjobs
```

## 🔧 Các vấn đề đã được sửa

### 1. **Response Format Normalization**
- ✅ Tất cả API routes giờ đây trả về format nhất quán: `{ success: boolean, data: any, message: string }`
- ✅ Frontend có thể xử lý nhiều format response khác nhau
- ✅ Error handling được cải thiện với thông báo rõ ràng

### 2. **Error Handling**
- ✅ Component `ErrorDisplay` hiển thị lỗi thân thiện
- ✅ Retry mechanism cho failed requests
- ✅ Fallback UI khi không có data

### 3. **Debug Tools**
- ✅ `ApiDebugger` class để monitor API calls
- ✅ `DebugPanel` component (chỉ hiển thị trong development)
- ✅ Comprehensive logging cho troubleshooting

## 🐛 Troubleshooting

### Lỗi "Định dạng dữ liệu không hợp lệ từ máy chủ"

**Nguyên nhân:**
- Backend API trả về format khác với expected format
- Network issues hoặc CORS problems
- Backend server không response đúng format

**Giải pháp:**
1. **Kiểm tra Network Tab** trong DevTools
2. **Sử dụng Debug Panel** (development mode)
3. **Kiểm tra API Health** endpoint
4. **Verify CORS settings** trên backend

### Các lỗi thường gặp khác:

#### 1. **404 Not Found**
```bash
# Kiểm tra route có tồn tại không
curl https://your-domain.com/api/jobs/123
```

#### 2. **CORS Issues**
- Đảm bảo backend có cấu hình CORS đúng
- Kiểm tra `Access-Control-Allow-Origin` headers

#### 3. **Timeout Issues**
- Backend server có thể đang sleep (Render.com free tier)
- Implement retry mechanism đã có sẵn

## 📊 Monitoring

### 1. **API Health Check**
```javascript
import { apiDebugger } from '@/lib/debugApi';

// Check API health
const isHealthy = await apiDebugger.checkApiHealth();
console.log('API Health:', isHealthy ? 'OK' : 'FAILED');
```

### 2. **Debug Information**
```javascript
// Get debug summary
const summary = apiDebugger.getDebugSummary();
console.log('API Debug Summary:', summary);
```

### 3. **Error Tracking**
- Tất cả API errors được log với context đầy đủ
- Response time tracking
- Success/error rate monitoring

## 🚀 Deploy Steps

### 1. **Netlify Deploy**
```bash
# Build command
npm run build

# Publish directory
.next

# Environment variables (set in Netlify dashboard)
NEXT_PUBLIC_API_URL=https://vieclabbe.onrender.com
NEXT_PUBLIC_BASE_URL=https://your-netlify-domain.netlify.app
NODE_ENV=production
```

### 2. **Vercel Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_BASE_URL
```

### 3. **Manual Deploy**
```bash
# Build
npm run build

# Upload .next folder to server
# Configure web server (nginx/apache) to serve Next.js app
```

## 🔍 Testing sau Deploy

### 1. **Test các trang chính**
- [ ] Trang chủ: `/`
- [ ] Danh sách jobs: `/jobs`
- [ ] Danh sách hirings: `/hirings`
- [ ] Danh sách new jobs: `/jobnew`
- [ ] Danh sách news: `/news`

### 2. **Test các trang chi tiết**
- [ ] Job detail: `/jobs/[id]`
- [ ] Hiring detail: `/detailjobs/[id]`
- [ ] New job detail: `/jobnew/[id]`
- [ ] News detail: `/news/[id]`

### 3. **Test Admin Panel**
- [ ] Admin login: `/admin/login`
- [ ] Admin dashboard: `/admin`
- [ ] Job management: `/admin/jobs`
- [ ] News management: `/admin/news`

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra console logs trong browser
2. Sử dụng Debug Panel (development mode)
3. Kiểm tra network requests trong DevTools
4. Verify API endpoints hoạt động trực tiếp

## 🎯 Performance Tips

1. **Image Optimization**: Sử dụng Next.js Image component
2. **API Caching**: Đã implement 5-minute cache
3. **Error Boundaries**: Có fallback UI cho errors
4. **Loading States**: Tất cả pages có loading indicators
5. **Retry Logic**: Automatic retry cho failed requests
