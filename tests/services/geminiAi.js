import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: 'AIzaSyA1z6osRbWfC95GjZ8ZuFGeLH3Bx3IESKM'});

// System instructions for the VRA AI context
const SYSTEM_INSTRUCTION = `
Bạn là một AI chuyên gia phân tích mức độ nghiêm trọng cho các test case thất bại trong hệ thống kiểm thử VRA.

Nhiệm vụ của bạn là phân tích các test case bị fail và phân loại chúng theo 4 mức độ nghiêm trọng:

1. Minor (Nhỏ):
   - Lỗi nhỏ không ảnh hưởng đáng kể đến trải nghiệm người dùng
   - Hiếm khi được người dùng nhận thấy
   - Không gây cản trở việc sử dụng tính năng
   - VD: Căn lề không chính xác nhưng không ảnh hưởng đến việc đọc nội dung

2. Cosmetic (Mỹ thuật):
   - Lỗi về hiển thị, giao diện
   - Người dùng có thể nhận thấy nhưng không ảnh hưởng đến chức năng
   - Không làm gián đoạn luồng công việc của người dùng
   - VD: Màu sắc không đúng, font chữ không nhất quán, biểu tượng hiển thị sai

3. Blocker (Chặn):
   - Ngăn cản việc sử dụng một tính năng quan trọng
   - Gây gián đoạn đáng kể trong luồng công việc của người dùng
   - Chức năng quan trọng không hoạt động
   - VD: Không thể đăng nhập, không thể gửi biểu mẫu, trang không tải

4. Critical (Nghiêm trọng):
   - Gây sập ứng dụng hoặc khiến nó không thể sử dụng được
   - Có thể gây mất hoặc hỏng dữ liệu
   - Ảnh hưởng đến bảo mật hoặc riêng tư của người dùng
   - VD: Lỗi bảo mật, lỗi mất dữ liệu, sập hoàn toàn ứng dụng

Quy tắc phân tích:
- Phân tích dựa trên mức độ ảnh hưởng đến người dùng và tần suất gặp phải
- Các lỗi chức năng quan trọng (đăng nhập, thanh toán, đăng ký) có mức độ nghiêm trọng cao hơn
- Lỗi hiển thị thường có mức độ thấp hơn
- Lỗi liên quan đến bảo mật và dữ liệu luôn được xếp vào mức Critical

Đầu vào của bạn sẽ là thông tin về test case bị fail, bao gồm:
- Tên test case
- Nội dung đầy đủ test case
- Thông điệp lỗi
- Stack trace

Đầu ra của bạn phải đúng định dạng JSON và bao gồm các thông tin sau:
{
  "severity": "minor|cosmetic|blocker|critical",
  "reasoning": "Giải thích ngắn gọn tại sao bạn phân loại ở mức độ này",
  "impact": "Mô tả ngắn gọn tác động đến người dùng",
  "priority": "high|medium|low",
  "suggestedAction": "Đề xuất hành động tiếp theo"
}

Giữ phân tích chính xác, khách quan và ngắn gọn.
`;

export const generateText = async (text) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: text,
    config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
  });
  return response.text;
}

/**
 * Phân tích mức độ nghiêm trọng của test case thất bại
 * @param {Object} testCase Thông tin test case thất bại
 * @returns {Promise<Object>} Kết quả phân tích mức độ nghiêm trọng
 */
export const analyzeSeverity = async (testCase) => {
  try {
    const prompt = `
    Phân tích mức độ nghiêm trọng của test case thất bại sau:
    
    Tên test case: ${testCase.title}
    Mô tả đầy đủ: ${testCase.fullTitle}
    Thông điệp lỗi: ${testCase.error}
    File: ${testCase.file}
    
    Tổng thời gian thực thi: ${testCase.duration}ms
    
    ${testCase.stack ? `Stack trace: ${testCase.stack}` : ''}
    
    Vui lòng phân tích mức độ nghiêm trọng của lỗi này theo 4 mức độ: minor, cosmetic, blocker, critical.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseFormat: { type: "json" }
      },
    });

    const responseText = result.text || result.toString();
    
    try {
      // Loại bỏ backticks và các từ khóa JSON nếu có
      const cleanedJson = responseText
        .replace(/```json|```|json/g, '')
        .trim();
      
      return JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('Lỗi khi phân tích JSON từ phản hồi AI:', parseError);
      return {
        severity: "unknown",
        reasoning: "Không thể phân tích được mức độ nghiêm trọng",
        impact: "Không xác định",
        priority: "unknown",
        suggestedAction: "Kiểm tra lại test case và thông tin lỗi"
      };
    }
  } catch (error) {
    console.error('Lỗi khi phân tích mức độ nghiêm trọng:', error);
    return {
      severity: "unknown",
      reasoning: "Lỗi khi phân tích: " + error.message,
      impact: "Không xác định",
      priority: "unknown",
      suggestedAction: "Kiểm tra lại kết nối AI và thử lại"
    };
  }
};