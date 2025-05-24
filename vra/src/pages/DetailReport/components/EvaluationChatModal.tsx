import React, { useState, useEffect, useCallback } from 'react';
import { Award, Bot, Info, Send, X, Loader2 } from 'lucide-react';
import { generateText } from '../../../services/geminiAiService';
import { Task } from './index';

interface EvaluationChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number | null;
  evaluationSummary: string;
  tasks: Task[];
}

const EvaluationChatModal: React.FC<EvaluationChatModalProps> = ({
  isOpen,
  onClose,
  score,
  evaluationSummary,
  tasks = []
}) => {
  const [evaluationMessages, setEvaluationMessages] = useState<{type: 'user' | 'ai', content: string}[]>([]);
  const [evaluationNewMessage, setEvaluationNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize messages when modal opens
  useEffect(() => {
    if (isOpen && score !== null) {
      setEvaluationMessages([
        {type: 'ai', content: `Xin chào! Tôi là trợ lý VRA AI. Tôi đã đánh giá buổi học của học sinh với điểm số ${score}/10. Bạn muốn biết thêm chi tiết gì về đánh giá này?`},
        {type: 'ai', content: `Nhận xét tổng quan: ${evaluationSummary}`}
      ]);
    }
  }, [isOpen, score, evaluationSummary]);

  const getStarColor = (score: number) => {
    if (score >= 8) return '#FFD700'; // vàng
    if (score >= 5) return '#FFA500'; // cam
    return '#FF4B4B'; // đỏ
  };

  const generateAIResponse = useCallback(async (userMessage: string) => {
    try {
      setIsTyping(true);
      
      // Create context about the lesson for AI
      const taskContext = tasks.map(task => {
        return `
        Nhiệm vụ: ${task.name}
        - Số lần nhắc nhở: ${task.remind} lần
        - Thời gian phản hồi: ${task.response}s
        - Ghi chú: ${task.note}
        `;
      }).join('\n');
      
      // Create conversation history for AI context
      const conversationHistory = evaluationMessages.map(msg => 
        `${msg.type === 'user' ? 'Người dùng' : 'VRA AI'}: ${msg.content}`
      ).join('\n');
      
      // Create prompt
      const prompt = `
      Bạn là VRA AI, một trợ lý phân tích buổi học thực hành của trẻ bị tự kỷ.
      
      Thông tin về buổi học:
      Điểm số tổng thể: ${score}/10
      Đánh giá tổng quan: ${evaluationSummary}
      
      Chi tiết các nhiệm vụ:
      ${taskContext}
      
      Lịch sử trò chuyện:
      ${conversationHistory}
      
      Câu hỏi mới của người dùng: "${userMessage}"
      
      Hãy trả lời câu hỏi của người dùng dựa trên thông tin có sẵn. Nếu không có thông tin đủ, hãy nêu rõ. Trả lời ngắn gọn, chuyên nghiệp và thân thiện. Độ dài trả lời từ 2-3 câu.
      `;
      
      // Get AI response
      const aiResponse = await generateText(prompt);
      return aiResponse || "Xin lỗi, tôi không thể xử lý yêu cầu này ngay bây giờ. Vui lòng thử lại sau.";
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "Đã xảy ra lỗi khi kết nối với VRA AI. Vui lòng thử lại.";
    } finally {
      setIsTyping(false);
    }
  }, [evaluationMessages, score, evaluationSummary, tasks]);

  const handleSendEvaluationMessage = async () => {
    if (!evaluationNewMessage.trim() || isTyping) return;
    
    // Add user message
    const userMessage = evaluationNewMessage.trim();
    setEvaluationMessages(prev => [...prev, {type: 'user', content: userMessage}]);
    setEvaluationNewMessage('');
    
    // Add temporary AI typing indicator
    setIsTyping(true);
    
    // Get AI response
    const aiResponse = await generateAIResponse(userMessage);
    
    // Add AI response
    setEvaluationMessages(prev => [...prev, {type: 'ai', content: aiResponse}]);
  };

  if (!isOpen || score === null) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn border border-gray-100">
        {/* Modal Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-[#19395E] to-[#254b76] text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">VRA AI Trợ lý - Đánh giá tổng thể</h3>
              <div className="flex items-center mt-1">
                <div className="bg-[#19395E] bg-opacity-70 rounded-full px-3 py-0.5 mr-3 flex items-center">
                  <span className="text-xs text-white">Điểm số: </span>
                  <span className="text-sm font-medium text-white ml-1">{score}/10</span>
                </div>
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getStarColor(score) }}></div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 text-white"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Introduction panel */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-200">
          <div className="flex items-start">
            <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
              <Bot size={18} className="text-[#19395E]" />
            </div>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                VRA AI đã phân tích toàn bộ dữ liệu từ buổi học và đưa ra đánh giá tổng thể.
                Bạn có thể đặt các câu hỏi về điểm mạnh/yếu, cách cải thiện, hoặc chi tiết về từng phần.
              </p>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" id="chat-messages">
          {evaluationMessages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                  msg.type === 'user' 
                    ? 'bg-[#19395E] text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                }`}
              >
                {msg.type === 'ai' && (
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-200 p-1 rounded-full mr-2">
                      <Bot size={14} className="text-[#19395E]" />
                    </div>
                    <span className="text-xs font-medium text-[#19395E]">VRA AI</span>
                  </div>
                )}
                <p className={`text-sm ${msg.type === 'user' ? 'text-white' : 'text-gray-700'}`}>{msg.content}</p>
              </div>
            </div>
          ))}
          
          {/* AI Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg shadow-sm bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="bg-blue-200 p-1 rounded-full mr-2">
                    <Bot size={14} className="text-[#19395E]" />
                  </div>
                  <span className="text-xs font-medium text-[#19395E]">VRA AI</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center">
            <input
              type="text"
              value={evaluationNewMessage}
              onChange={(e) => setEvaluationNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendEvaluationMessage()}
              placeholder="Đặt câu hỏi về đánh giá tổng thể..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#19395E] focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSendEvaluationMessage}
              disabled={!evaluationNewMessage.trim() || isTyping}
              className={`px-4 py-3 rounded-r-lg transition-all duration-200 flex items-center justify-center ${
                !evaluationNewMessage.trim() || isTyping 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#19395E] hover:bg-[#254b76] text-white'
              }`}
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="transform rotate-0 hover:rotate-12 transition-transform" />}
            </button>
          </div>
          <div className="mt-3 flex items-start">
            <Info size={14} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-500 flex-1">
              <span className="font-medium">Gợi ý câu hỏi:</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <button 
                  onClick={() => setEvaluationNewMessage("Học sinh cần cải thiện điểm gì?")}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 text-xs transition-colors"
                  disabled={isTyping}
                >
                  Cần cải thiện điểm gì?
                </button>
                <button 
                  onClick={() => setEvaluationNewMessage("Điểm mạnh của học sinh là gì?")}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 text-xs transition-colors"
                  disabled={isTyping}
                >
                  Điểm mạnh?
                </button>
                <button 
                  onClick={() => setEvaluationNewMessage("Làm thế nào để cải thiện kỹ năng xịt xà phòng?")}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 text-xs transition-colors"
                  disabled={isTyping}
                >
                  Cải thiện kỹ năng xịt xà phòng?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationChatModal; 