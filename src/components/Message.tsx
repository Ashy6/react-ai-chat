import React from 'react';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import type { Message as MessageType } from '../lib/types';

interface MessageProps {
  message: MessageType;
  className?: string;
}

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return '刚刚';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}小时前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * 加载动画组件
 */
function LoadingDots() {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

/**
 * 单条消息组件
 */
export function Message({ message, className = '' }: MessageProps) {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  return (
    <div
      className={`flex items-start space-x-3 animate-fade-in ${className} ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      {/* 头像 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}
      >
        {isUser ? (
          <UserIcon className="w-5 h-5" />
        ) : (
          <CpuChipIcon className="w-5 h-5" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
        isUser ? 'flex flex-col items-end' : ''
      }`}>
        {/* 消息气泡 */}
        <div
          className={`px-4 py-2 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center space-x-2">
              <LoadingDots />
              <span className="text-sm text-gray-500">AI 正在思考...</span>
            </div>
          ) : isAI ? (
            <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-800 prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>

        {/* 时间戳 */}
        <div
          className={`mt-1 text-xs text-gray-500 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

/**
 * 消息组件的默认导出
 */
export default Message;