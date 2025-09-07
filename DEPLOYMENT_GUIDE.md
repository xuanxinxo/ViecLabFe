# 🚀 Hướng dẫn Deploy Toredco

## 📋 Chuẩn bị trước khi deploy

### 1. Tạo file .env cho production
Tạo file `.env.local` hoặc `.env.production` với nội dung:

```env
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=vieclab
DB_PORT=3306

# MongoDB Database
MONGODB_URI=mongodb://your-mongodb-connection-string

# JWT Secret (tạo một chuỗi ngẫu nhiên mạnh)
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Google Analytics
NEXT_PUBLIC_GA_ID=G-5QFWM3S7ZQ

# Environment
NODE_ENV=production
```

## 🌐 Deploy lên Netlify

### Bước 1: Chuẩn bị repository
1. Đẩy code lên GitHub repository
2. Đảm bảo file `netlify.toml` đã có sẵn

### Bước 2: Deploy trên Netlify
1. Truy cập [netlify.com](https://netlify.com)
2. Đăng nhập và chọn "New site from Git"
3. Kết nối với GitHub repository của bạn
4. Cấu hình build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18.x

### Bước 3: Cấu hình Environment Variables
Trong Netlify Dashboard:
1. Vào Site settings > Environment variables
2. Thêm tất cả các biến môi trường từ file .env

### Bước 4: Deploy
1. Click "Deploy site"
2. Chờ quá trình build hoàn tất
3. Truy cập URL được cung cấp

## ⚡ Deploy lên Vercel (Alternative)

### Bước 1: Cài đặt Vercel CLI
```bash
npm i -g vercel
```

### Bước 2: Deploy
```bash
cd Toredco
vercel
```

### Bước 3: Cấu hình
1. Follow prompts để cấu hình
2. Thêm environment variables trong Vercel dashboard
3. Deploy production: `vercel --prod`

## 🗄️ Cấu hình Database

### MySQL Database
1. Tạo database trên hosting provider
2. Import schema nếu có
3. Cập nhật connection string trong .env

### MongoDB (nếu sử dụng)
1. Tạo cluster trên MongoDB Atlas
2. Lấy connection string
3. Cập nhật MONGODB_URI trong .env

## ☁️ Cấu hình Cloudinary
1. Tạo tài khoản Cloudinary
2. Lấy Cloud Name, API Key, API Secret
3. Cập nhật trong environment variables

## 🔧 Troubleshooting

### Lỗi Build
- Kiểm tra tất cả dependencies đã được cài đặt
- Đảm bảo không có lỗi TypeScript
- Chạy `npm run build` local để test

### Lỗi Database Connection
- Kiểm tra connection string
- Đảm bảo database server accessible
- Kiểm tra firewall settings

### Lỗi Environment Variables
- Đảm bảo tất cả biến môi trường đã được set
- Kiểm tra tên biến có đúng không
- Restart deployment sau khi thay đổi env vars

## 📱 Sau khi deploy

1. **Test tất cả tính năng:**
   - Đăng ký/Đăng nhập
   - Tạo việc làm
   - Upload file
   - Admin panel

2. **Cấu hình domain (nếu có):**
   - Thêm custom domain trong hosting dashboard
   - Cập nhật DNS records

3. **Monitoring:**
   - Setup error tracking (Sentry)
   - Monitor performance
   - Setup backup database

## 🎯 Checklist Deploy

- [ ] Code đã được push lên repository
- [ ] File .env đã được cấu hình
- [ ] Database đã được setup
- [ ] Cloudinary đã được cấu hình
- [ ] Build thành công local
- [ ] Environment variables đã được set trên hosting
- [ ] Domain đã được cấu hình (nếu có)
- [ ] Test tất cả tính năng sau deploy

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình deploy, hãy kiểm tra:
1. Logs trong hosting dashboard
2. Console errors trong browser
3. Network requests trong DevTools
4. Database connection status

