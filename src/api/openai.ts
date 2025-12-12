import OpenAI from 'openai'

const getOpenAIClient = () => {
  const apiKey = import.meta.env['VITE_OPENAI_API_KEY']
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY không được cấu hình trong file .env')
  }
  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  })
}

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn bán xe thông minh cho website "Bán xe đê!!!".

Nhiệm vụ của bạn:
- Tư vấn khách hàng về các loại xe ô tô, xe máy
- Giải đáp thắc mắc về giá xe, thông số kỹ thuật, trả góp
- Hỗ trợ tìm kiếm xe phù hợp với nhu cầu và ngân sách
- Hướng dẫn quy trình mua bán xe
- Giọng điệu thân thiện, nhiệt tình, chuyên nghiệp

Lưu ý:
- Trả lời ngắn gọn, súc tích (2-4 câu)
- Sử dụng tiếng Việt
- Nếu không chắc chắn, khuyên khách hàng liên hệ trực tiếp
- Không bịa đặt thông tin không có
- Sử dụng emoji phù hợp để thân thiện hơn`

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Gửi tin nhắn đến OpenAI ChatGPT và nhận phản hồi
 * @param userMessage - Tin nhắn từ người dùng
 * @param chatHistory - Lịch sử chat (optional)
 * @returns Phản hồi từ AI
 */
export async function sendMessageToOpenAI(
  userMessage: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const openai = getOpenAIClient()

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory,
      { role: 'user', content: userMessage }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseText = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.'
    
    return responseText.trim()
  } catch (error) {
    console.error('Lỗi khi gọi OpenAI API:', error)

    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('Incorrect API key')) {
        return 'Lỗi: API key không hợp lệ. Vui lòng kiểm tra lại API key trong file .env'
      }
      if (error.message.includes('quota') || error.message.includes('insufficient') || error.message.includes('exceeded')) {
        return '⚠️ Tài khoản OpenAI đã hết credit.\n\n💡 Giải pháp:\n• Nạp thêm tiền tại: platform.openai.com/billing\n• Hoặc tạo tài khoản mới (free $5)\n• Hoặc liên hệ quản trị viên'
      }
      if (error.message.includes('rate_limit') || error.message.includes('429')) {
        return 'Xin lỗi, đã vượt quá giới hạn requests. Vui lòng thử lại sau 1 phút.'
      }
    }

    return 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi.'
  }
}

export function isOpenAIConfigured(): boolean {
  return !!import.meta.env["VITE_OPENAI_API_KEY"];
}
