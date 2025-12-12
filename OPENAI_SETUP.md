# 🤖 Hướng dẫn tích hợp OpenAI ChatGPT vào ChatBox

## ✅ Đã hoàn thành

Chat box đã được tích hợp với **OpenAI ChatGPT API**. Bây giờ bạn chỉ cần lấy API key và cấu hình.

---

## 📝 BƯỚC 1: Lấy API Key từ OpenAI

### 1. Truy cập OpenAI Platform

Vào: **https://platform.openai.com/api-keys**

### 2. Đăng ký/Đăng nhập

- Nếu chưa có tài khoản, click **"Sign up"**
- Nếu đã có, click **"Log in"**

### 3. Tạo API Key

1. Click nút **"+ Create new secret key"**
2. Đặt tên cho key (ví dụ: "Ban Xe De Chatbot")
3. Click **"Create secret key"**
4. **COPY KEY NGAY** (chỉ hiện 1 lần!) - Format: `sk-...`

⚠️ **LƯU Ý:** Key chỉ hiện 1 lần, nếu mất phải tạo key mới!

---

## 💰 BƯỚC 2: Kiểm tra Credit

### Tài khoản mới:

- ✅ Được **$5 credit miễn phí** (valid 3 tháng)
- ✅ Đủ cho ~2,500 tin nhắn
- ✅ Không cần thẻ tín dụng

### Kiểm tra credit:

Vào: **https://platform.openai.com/usage**

### Nếu hết credit:

1. Vào: **https://platform.openai.com/account/billing/overview**
2. Click **"Add payment method"**
3. Nạp tối thiểu $5

**Chi phí:** ~$0.002/tin nhắn (rất rẻ!)

---

## 🔧 BƯỚC 3: Cấu hình API Key

### 1. Tạo file `.env`

Tạo file `.env` ở thư mục gốc của project (nếu chưa có):

```env
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Thay `sk-proj-xxx...` bằng API key bạn vừa copy!**

### 2. Kiểm tra file `.gitignore`

Đảm bảo file `.env` đã được ignore (đã có sẵn):

```gitignore
.env
.env.local
.env.*.local
```

---

## 🚀 BƯỚC 4: Restart Development Server

```bash
npm run dev
```

---

## 🎉 BƯỚC 5: Test Chatbot

1. Mở website
2. Click vào icon mail ở góc dưới phải
3. Gửi tin nhắn: **"Tư vấn mua xe cho tôi"**
4. AI sẽ trả lời thông minh trong vài giây!

---

## ✨ Tính năng AI ChatGPT

### So với Gemini:

| Feature | ChatGPT (đang dùng) | Gemini |
|---------|---------------------|--------|
| Hoạt động ở VN | ✅ YES | ❌ NO |
| Chất lượng | ✅ Rất tốt | ✅ Tốt |
| Setup | ✅ Dễ | ⚠️ Phức tạp |
| Chi phí | ⚠️ $5 free → $0.002/msg | ✅ Free |
| Ổn định | ✅ Rất cao | ⚠️ Bị lỗi 404 |

### Model đang dùng:

- **gpt-3.5-turbo** - Nhanh, rẻ, chất lượng tốt
- Chi phí: ~$0.002/tin nhắn
- Tốc độ: 1-3 giây
- Hiểu tiếng Việt rất tốt

### Nâng cấp lên GPT-4 (Optional):

Nếu muốn AI thông minh hơn, sửa trong `src/api/openai.ts`:

```typescript
model: 'gpt-4' 
```

**Lưu ý:** GPT-4 đắt hơn (~$0.03/tin nhắn)

---

## 🔒 Bảo mật

### ⚠️ QUAN TRỌNG:

1. **KHÔNG** commit file `.env` lên Git
2. **KHÔNG** chia sẻ API key công khai
3. **KHÔNG** dùng API key ở production (frontend)

### Production Best Practice:

Nên tạo backend API để:
- Backend gọi OpenAI
- Frontend gọi backend
- API key được bảo mật ở server

**Hiện tại:** Đang gọi trực tiếp từ browser (OK cho demo/development)

---

## ❓ Xử lý sự cố

### Lỗi: "API key chưa được cấu hình"

✅ **Giải pháp:**
- Kiểm tra file `.env` đã tạo đúng chưa
- Đảm bảo tên biến là `VITE_OPENAI_API_KEY`
- Restart lại dev server

### Lỗi: "API key not valid"

✅ **Giải pháp:**
- Kiểm tra API key có đúng không (format: `sk-...`)
- Tạo API key mới nếu cần
- Kiểm tra API key chưa bị revoke

### Lỗi: "Insufficient quota" (hết credit)

✅ **Giải pháp:**
- Vào https://platform.openai.com/usage kiểm tra credit
- Nạp thêm tiền nếu hết $5 free
- Hoặc tạo tài khoản mới (nếu chưa dùng)

### Lỗi: "Rate limit exceeded"

✅ **Giải pháp:**
- Đợi 1 phút rồi thử lại
- Giảm số lượng request
- Nâng cấp tier nếu cần

### AI trả lời không liên quan

✅ **Giải pháp:**
- Sửa `SYSTEM_PROMPT` trong `src/api/openai.ts`
- Làm prompt chi tiết hơn
- Tăng/giảm `temperature` (0-1)

---

## 📊 Theo dõi sử dụng

### Xem usage:

Vào: **https://platform.openai.com/usage**

Bạn sẽ thấy:
- Số requests đã dùng
- Chi phí
- Token usage
- Credit còn lại

### Giới hạn mặc định:

- **Tier 1** (free): 3 requests/phút
- **Tier 2** (nạp $5): 60 requests/phút

---

## 🎨 Tùy chỉnh AI

### Sửa file: `src/api/openai.ts`

### 1. Thay đổi System Prompt:

```typescript
const SYSTEM_PROMPT = `
Bạn là trợ lý chuyên nghiệp về xe hơi...
[Viết lại prompt theo ý bạn]
`
```

### 2. Thay đổi độ sáng tạo:

```typescript
temperature: 0.7 // 0 = chính xác, 1 = sáng tạo
```

### 3. Giới hạn độ dài:

```typescript
max_tokens: 500 // Tăng/giảm độ dài response
```

### 4. Đổi model:

```typescript
model: 'gpt-4' // Hoặc 'gpt-3.5-turbo'
```

---

## 💡 Tips tối ưu

### 1. Giảm chi phí:

- Dùng `gpt-3.5-turbo` (đủ tốt)
- Giới hạn `max_tokens`
- Cache responses phổ biến

### 2. Tăng chất lượng:

- Viết system prompt chi tiết
- Cho AI examples
- Fine-tune temperature

### 3. Tăng tốc độ:

- Giảm `max_tokens`
- Dùng streaming (advanced)

---

## 📞 Hỗ trợ

### Nếu gặp vấn đề:

1. Xem Console (F12) để debug
2. Check usage tại: https://platform.openai.com/usage
3. Đọc docs: https://platform.openai.com/docs

### Liên hệ OpenAI:

- Help: https://help.openai.com
- Community: https://community.openai.com

---

## 🎉 Hoàn thành!

Chatbot của bạn đã:
- ✅ Tích hợp AI thật (ChatGPT)
- ✅ Trả lời thông minh
- ✅ Hiểu tiếng Việt
- ✅ Nhớ ngữ cảnh
- ✅ Tư vấn chuyên nghiệp về xe

**Chúc mừng! Hãy test và trải nghiệm! 🚀**

