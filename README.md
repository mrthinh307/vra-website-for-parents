# VRA Test Framework Integrated With Gemini AI

Framework kiểm thử tự động cho dự án VRA, hỗ trợ việc chạy test, báo cáo kết quả và phân tích mức độ nghiêm trọng của lỗi.

## Cài đặt

```bash
cd VRA/tests
npm install
```

## Cấu trúc thư mục

### Chạy test

Framework hỗ trợ nhiều cách chạy test:

```bash
# Chạy tất cả các test
npm test

# Chạy các test end-to-end
npm run test:e2e

# Chạy test từ file cụ thể
node runTests.js --file ./path/to/test.js

# Chạy tất cả các test và chụp ảnh màn hình khi thất bại
npm run test:screenshot
```

### Phân tích mức độ nghiêm trọng với AI

Framework tích hợp với Google Gemini để phân tích mức độ nghiêm trọng của các lỗi test:

```bash
# Chạy tất cả các test và phân tích mức độ nghiêm trọng
npm run test:analyze

# Chạy các test end-to-end và phân tích mức độ nghiêm trọng
npm run test:e2e:analyze

# Tùy chỉnh với các tùy chọn khác
node runTests.js --file ./path/to/test.js --analyze --format all
```

Mỗi lỗi test sẽ được phân tích và phân loại theo 4 mức độ nghiêm trọng:

1. **Minor** - Lỗi nhỏ, ít ảnh hưởng đến người dùng
2. **Cosmetic** - Lỗi giao diện, không ảnh hưởng đến chức năng
3. **Blocker** - Lỗi làm gián đoạn một chức năng quan trọng
4. **Critical** - Lỗi nghiêm trọng như sập ứng dụng, mất dữ liệu, lỗi bảo mật

Báo cáo phân tích sẽ được tạo trong thư mục `reports` với các định dạng HTML và Text.

### Tùy chọn dòng lệnh

```
Sử dụng:
  node runTests.js [options]
  
Options:
  -h, --help                 Hiển thị trợ giúp
  -f, --file <path>          Chạy test từ file hoặc thư mục cụ thể
  -o, --output <filename>    Tên file báo cáo (không cần phần mở rộng)
  -t, --format <format>      Định dạng báo cáo (html, text, json, hoặc all)
  -a, --all                  Chạy tất cả các test
  -e, --e2e                  Chạy các test end-to-end
  -s, --screenshot           Chụp ảnh màn hình trong quá trình test
  -z, --analyze              Phân tích mức độ nghiêm trọng của lỗi bằng AI
```

## Cấu trúc thư mục

```
VRA/tests/
│
├── e2e/                  # Test end-to-end
├── reports/              # Thư mục chứa báo cáo
│   └── screenshots/      # Ảnh chụp màn hình khi test thất bại
│
├── services/             # Các dịch vụ hỗ trợ
│   ├── geminiAi.js       # Dịch vụ AI phân tích mức độ nghiêm trọng
│   └── severityAnalyzer.js # Phân tích và tạo báo cáo mức độ nghiêm trọng
│
├── utils/                # Các tiện ích
│   ├── index.js          # Export các utilities
│   ├── reportGenerator.js # Tạo báo cáo test
│   ├── screenshotHelper.js # Hỗ trợ chụp ảnh màn hình
│   └── testRunner.js     # Chạy test
│
├── runTests.js           # CLI cho việc chạy test
└── package.json          # Cấu hình npm
```

## Báo cáo

Framework tạo các loại báo cáo sau:

1. **Báo cáo test** - Hiển thị các test đã chạy, thành công, thất bại, thời gian chạy
2. **Báo cáo ảnh chụp màn hình** - Chụp ảnh màn hình khi test thất bại
3. **Báo cáo phân tích mức độ nghiêm trọng** - Phân tích và phân loại các lỗi test

## Phân tích mức độ nghiêm trọng

Hệ thống phân tích mức độ nghiêm trọng sử dụng Google Gemini AI để phân loại các lỗi test theo 4 mức độ:

### 1. Minor (Nhỏ)

- Lỗi nhỏ không ảnh hưởng đáng kể đến trải nghiệm người dùng
- Hiếm khi được người dùng nhận thấy
- Không gây cản trở việc sử dụng tính năng
- VD: Căn lề không chính xác nhưng không ảnh hưởng đến việc đọc nội dung

### 2. Cosmetic (Mỹ thuật)

- Lỗi về hiển thị, giao diện
- Người dùng có thể nhận thấy nhưng không ảnh hưởng đến chức năng
- Không làm gián đoạn luồng công việc của người dùng
- VD: Màu sắc không đúng, font chữ không nhất quán, biểu tượng hiển thị sai

### 3. Blocker (Chặn)

- Ngăn cản việc sử dụng một tính năng quan trọng
- Gây gián đoạn đáng kể trong luồng công việc của người dùng
- Chức năng quan trọng không hoạt động
- VD: Không thể đăng nhập, không thể gửi biểu mẫu, trang không tải

### 4. Critical (Nghiêm trọng)

- Gây sập ứng dụng hoặc khiến nó không thể sử dụng được
- Có thể gây mất hoặc hỏng dữ liệu
- Ảnh hưởng đến bảo mật hoặc riêng tư của người dùng
- VD: Lỗi bảo mật, lỗi mất dữ liệu, sập hoàn toàn ứng dụng

Mỗi báo cáo phân tích bao gồm:

- Mức độ nghiêm trọng
- Lý do phân loại
- Tác động đến người dùng
- Mức độ ưu tiên
- Đề xuất xử lý

## Ví dụ

### Phân tích mức độ nghiêm trọng của lỗi

```bash
# Chạy tất cả các test với phân tích AI
node runTests.js --all --analyze
```

Kết quả sẽ bao gồm:
1. Báo cáo test thông thường (HTML, text hoặc JSON)
2. Báo cáo phân tích mức độ nghiêm trọng (HTML và text)

Báo cáo HTML sẽ hiển thị các lỗi được phân loại và màu sắc theo mức độ nghiêm trọng, cùng với phân tích chi tiết và khuyến nghị xử lý.

## Môi trường phát triển

Để phát triển framework test:

1. Cài đặt các dependencies
   ```bash
   npm install
   ```

2. Thêm test cases mới vào thư mục phù hợp

3. Chạy test để kiểm tra
   ```bash
   npm test
   ```
