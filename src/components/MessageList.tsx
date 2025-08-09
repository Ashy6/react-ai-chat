import React from 'react';
import { Message } from './Message';
import { useSmartAutoScroll } from '../hooks/useAutoScroll';
import type { Message as MessageType } from '../lib/types';

interface MessageListProps {
  messages: MessageType[];
  className?: string;
  maxHeight?: string;
  showScrollToBottom?: boolean;
}

/**
 * 空状态组件
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-600">开始对话</p>
        <p className="text-sm text-gray-500 mt-1">发送消息开始与 AI 助手对话</p>
      </div>
    </div>
  );
}

/**
 * 滚动到底部按钮
 */
interface ScrollToBottomButtonProps {
  onClick: () => void;
  show: boolean;
}

function ScrollToBottomButton({ onClick, show }: ScrollToBottomButtonProps) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50 z-10"
      aria-label="滚动到底部"
    >
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </button>
  );
}

/**
 * 消息列表组件
 */
export function MessageList({
  messages,
  className = '',
  maxHeight = '400px',
  showScrollToBottom = true
}: MessageListProps) {
  // 使用智能自动滚动
  const [scrollRef, isAtBottom, scrollToBottom] = useSmartAutoScroll<HTMLDivElement>(
    [messages.length, messages[messages.length - 1]?.content],
    50
  );

  // 如果没有消息，显示空状态
  if (messages.length === 0) {
    return (
      <div
        className={`relative bg-gray-50 rounded-lg border border-gray-200 ${className}`}
        style={{ height: maxHeight }}
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 消息滚动容器 */}
      <div
        ref={scrollRef}
        className="overflow-y-auto bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ height: maxHeight }}
      >
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            className={`${
              index === 0 ? 'animate-fade-in-up' : 'animate-fade-in'
            }`}
          />
        ))}
        
        {/* 底部间距 */}
        <div className="h-2" />
      </div>

      {/* 滚动到底部按钮 */}
      {showScrollToBottom && (
        <ScrollToBottomButton
          onClick={scrollToBottom}
          show={!isAtBottom && messages.length > 0}
        />
      )}
    </div>
  );
}

/**
 * 消息列表组件的默认导出
 */
export default MessageList;