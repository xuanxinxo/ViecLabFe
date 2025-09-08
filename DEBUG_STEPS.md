# Debug Steps - API Route 404 Error

## Vấn đề hiện tại:
- API route `/api/auth/register` trả về 404 Not Found
- Next.js không nhận diện được API route

## Các bước debug:

### 1. **Kiểm tra server có chạy không:**
```bash
netstat -an | findstr :3000
```

### 2. **Test Basic API trước:**
```
URL: http://localhost:3000/test-api
```
- Click "Test Basic API" button
- Nếu thành công → Next.js API routes hoạt động
- Nếu thất bại → Có vấn đề với Next.js setup

### 3. **Test Register API:**
```
URL: http://localhost:3000/test-api
```
- Click "Test Register" button
- Xem response trong console

### 4. **Kiểm tra file structure:**
```
src/app/api/auth/register/route.ts ✅ (tồn tại)
src/app/api/test/route.ts ✅ (tồn tại)
```

### 5. **Kiểm tra console logs:**
- Mở Developer Tools (F12)
- Tab Console
- Thử đăng ký và xem logs

### 6. **Kiểm tra Network tab:**
- Tab Network
- Xem request/response details
- Kiểm tra status code và response body

## Expected Results:

### ✅ **Test Basic API should return:**
```json
{
  "success": true,
  "message": "Test POST API working!",
  "received": {"test": "data"},
  "timestamp": "2025-01-08T..."
}
```

### ✅ **Test Register should return:**
```json
{
  "success": true,
  "message": "Đăng ký thành công (test mode)",
  "data": {
    "user": {
      "id": "test_user_id",
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "test_jwt_token"
  }
}
```

## Nếu vẫn lỗi 404:

### 1. **Restart server:**
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Start server
npm run dev
```

### 2. **Clear browser cache:**
- Hard refresh: Ctrl + Shift + R
- Clear browser cache

### 3. **Kiểm tra Next.js version:**
```bash
npm list next
```

### 4. **Kiểm tra file permissions:**
- Đảm bảo file `route.ts` có quyền đọc

## Debug Commands:

```bash
# Check if server is running
netstat -an | findstr :3000

# Check Next.js version
npm list next

# Check file structure
Get-ChildItem src\app\api\ -Recurse

# Restart server
npm run dev
```

## Next Steps:

1. **Test Basic API first** - Nếu thành công → API routes hoạt động
2. **Test Register API** - Nếu thành công → Register route hoạt động
3. **Test actual register page** - Nếu thành công → Hoàn thành

## Contact:
Nếu vẫn gặp vấn đề, hãy:
1. Chụp screenshot console logs
2. Chụp screenshot Network tab
3. Gửi kết quả test Basic API
