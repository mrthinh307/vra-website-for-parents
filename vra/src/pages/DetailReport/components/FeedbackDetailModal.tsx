import React from 'react';
import { Bot, Info, X } from 'lucide-react';
import type { Task } from './index';

interface FeedbackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTask: Task;
  taskFeedbacks: {[key: number]: {summary: string, full: string}};
}

const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  isOpen,
  onClose,
  currentTask,
  taskFeedbacks
}) => {
  if (!isOpen || !currentTask || !taskFeedbacks[currentTask.stt]) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl animate-fadeIn overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-[#19395E] to-[#254b76] text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Info size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Nhận xét chi tiết</h3>
              <p className="text-sm text-blue-100 mt-0.5">{currentTask.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 text-white"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Feedback Content */}
        <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-full p-2 mt-1 flex-shrink-0">
              <Bot size={22} className="text-[#19395E]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#19395E] font-medium mb-2">Phân tích của VRA AI:</div>
              <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm break-words">
                {taskFeedbacks[currentTask.stt].full}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end items-center">
          <div className="text-xs text-gray-500 italic mr-auto">
            Phân tích được cung cấp bởi VRA AI
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-medium transition-all duration-200 flex items-center"
          >
            <X size={16} className="mr-1.5" />
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailModal; 