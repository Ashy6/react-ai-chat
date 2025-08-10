import React from 'react';
import { TrashIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '../hooks/useChat';
import type { ChatComponentProps } from '../lib/types';

/**
 * 聊天头部组件
 */
interface ChatHeaderProps {
  onClearHistory: () => void;
  messageCount: number;
  isLoading: boolean;
}

function ChatHeader({ onClearHistory, messageCount, isLoading }: ChatHeaderProps) {
  const handleClearHistory = () => {
    if (messageCount === 0) return;

    const confirmed = window.confirm('确定要清空聊天历史吗？此操作不可撤销。');
    if (confirmed) {
      onClearHistory();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI 助手</h2>
          <p className="text-sm text-gray-500">
            {isLoading ? '正在思考中...' : `${messageCount} 条消息`}
          </p>
        </div>
      </div>

      <button
        onClick={handleClearHistory}
        disabled={messageCount === 0 || isLoading}
        className={`p-2 rounded-lg transition-colors ${messageCount === 0 || isLoading
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
          }`}
        title="清空聊天历史"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

/**
 * 聊天状态指示器
 */
interface ChatStatusProps {
  isLoading: boolean;
  messageCount: number;
  error?: string | null;
}

function ChatStatus({ isLoading, messageCount, error }: ChatStatusProps) {
  // 显示错误信息
  if (error) {
    return (
      <div className="flex items-center justify-center py-3 bg-red-50 border-t border-red-100">
        <div className="flex items-center space-x-2 text-red-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    );
  }

  // 显示加载状态
  if (!isLoading || messageCount === 0) return null;

  return (
    <div className="flex items-center justify-center py-2 bg-blue-50 border-t border-blue-100">
      <div className="flex items-center space-x-2 text-blue-600">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">AI 正在思考...</span>
      </div>
    </div>
  );
}

/**
 * 主聊天容器组件
 */
export function ChatContainer({
  onSendMessage,
  initialMessages = [],
  placeholder = '输入消息开始对话...',
  className = '',
  maxHeight = '600px',
  enableHistory = true,
  useGraphQL = false,
  userId,
  sessionId
}: ChatComponentProps) {
  // 使用聊天 Hook
  const {
    messages,
    sendMessage,
    clearHistory,
    isLoading,
    inputValue,
    setInputValue,
    error
  } = useChat({
    initialMessages,
    onSendMessage,
    enableHistory,
    sessionId,
    userId,
    useGraphQL
  });

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  // 计算消息列表高度
  const headerHeight = 73; // 头部高度
  const inputHeight = 120; // 输入框区域高度
  const statusHeight = (isLoading || error) ? 40 : 0; // 状态指示器高度
  const messageListHeight = `calc(${maxHeight} - ${headerHeight + inputHeight + statusHeight}px)`;

  return (
    <div
      className={`flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}
      style={{ height: maxHeight }}
    >
      {/* 聊天头部 */}
      <ChatHeader
        onClearHistory={clearHistory}
        messageCount={messages.length}
        isLoading={isLoading}
      />

      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          maxHeight={messageListHeight}
          showScrollToBottom={true}
        />
      </div>

      {/* 状态指示器 */}
      <ChatStatus isLoading={isLoading} messageCount={messages.length} error={error} />

      {/* 消息输入 */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          placeholder={placeholder}
          disabled={isLoading}
          isLoading={isLoading}
          maxRows={4}
          minRows={1}
        />
      </div>
    </div>
  );
}

/**
 * 紧凑版聊天容器（无头部）
 */
export function CompactChatContainer({
  onSendMessage,
  initialMessages = [],
  placeholder = '输入消息...',
  className = '',
  maxHeight = '400px',
  enableHistory = true,
  useGraphQL = false,
  userId,
  sessionId
}: ChatComponentProps) {
  const {
    messages,
    sendMessage,
    isLoading,
    inputValue,
    setInputValue
  } = useChat({
    initialMessages,
    onSendMessage,
    enableHistory,
    sessionId,
    userId,
    useGraphQL
  });

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const inputHeight = 80;
  const messageListHeight = `calc(${maxHeight} - ${inputHeight}px)`;

  return (
    <div
      className={`flex flex-col bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${className}`}
      style={{ height: maxHeight }}
    >
      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          maxHeight={messageListHeight}
          showScrollToBottom={true}
        />
      </div>

      {/* 消息输入 */}
      <div className="border-t border-gray-200 p-3">
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          placeholder={placeholder}
          disabled={isLoading}
          isLoading={isLoading}
          maxRows={2}
          minRows={1}
        />
      </div>
    </div>
  );
}

/**
 * 聊天容器组件的默认导出
 */
export default ChatContainer;