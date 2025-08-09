import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  maxRows?: number;
  minRows?: number;
}

/**
 * 自动调整文本域高度
 */
function useAutoResize(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  value: string,
  minRows: number = 1,
  maxRows: number = 4
) {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto';
    
    // 计算行高
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;
    
    // 设置新高度
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [value, minRows, maxRows]);
}

/**
 * 消息输入组件
 */
export function MessageInput({
  value,
  onChange,
  onSend,
  placeholder = '输入消息...',
  disabled = false,
  isLoading = false,
  className = '',
  maxRows = 4,
  minRows = 1
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 自动调整高度
  useAutoResize(textareaRef, value, minRows, maxRows);

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter 换行，不做任何处理
        return;
      } else {
        // Enter 发送消息
        e.preventDefault();
        handleSend();
      }
    }
  };

  // 处理发送消息
  const handleSend = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !disabled && !isLoading) {
      onSend(trimmedValue);
    }
  };

  // 聚焦到输入框
  const focusInput = () => {
    textareaRef.current?.focus();
  };

  // 判断是否可以发送
  const canSend = value.trim().length > 0 && !disabled && !isLoading;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-end space-x-3 p-3">
        {/* 文本输入区域 */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={minRows}
            className={`w-full resize-none border-0 outline-none text-sm leading-6 placeholder-gray-400 bg-transparent ${
              disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
            style={{
              minHeight: `${minRows * 1.5}rem`,
              maxHeight: `${maxRows * 1.5}rem`
            }}
          />
          
          {/* 字符计数（可选） */}
          {value.length > 500 && (
            <div className="absolute bottom-1 right-1 text-xs text-gray-400">
              {value.length}/1000
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            canSend
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="发送消息"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PaperAirplaneIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* 提示文本 */}
      <div className="px-3 pb-2">
        <p className="text-xs text-gray-500">
          按 <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> 发送，
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Shift + Enter</kbd> 换行
        </p>
      </div>
    </div>
  );
}

/**
 * 简化版消息输入组件（不带提示文本）
 */
export function SimpleMessageInput({
  value,
  onChange,
  onSend,
  placeholder = '输入消息...',
  disabled = false,
  isLoading = false,
  className = ''
}: Omit<MessageInputProps, 'maxRows' | 'minRows'>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmedValue = value.trim();
      if (trimmedValue && !disabled && !isLoading) {
        onSend(trimmedValue);
      }
    }
  };

  const handleSend = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !disabled && !isLoading) {
      onSend(trimmedValue);
    }
  };

  const canSend = value.trim().length > 0 && !disabled && !isLoading;

  return (
    <div className={`flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2 ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none border-0 outline-none text-sm placeholder-gray-400 bg-transparent"
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          canSend
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <PaperAirplaneIcon className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

/**
 * 消息输入组件的默认导出
 */
export default MessageInput;