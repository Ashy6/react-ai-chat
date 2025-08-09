// 消息类型定义
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  isLoading?: boolean;
}

// 聊天会话类型
export interface ChatSession {
  sessionId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// 组件属性类型
export interface ChatComponentProps {
  onSendMessage?: (message: string) => Promise<string>;
  initialMessages?: Message[];
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  enableHistory?: boolean;
  theme?: 'light' | 'dark';
  useGraphQL?: boolean; // 是否使用 GraphQL
  userId?: string; // 用户 ID
  sessionId?: string; // 会话 ID
}

// 聊天状态类型
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  inputValue: string;
}

// 聊天钩子返回类型
export interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  isLoading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  error?: string | null; // 错误信息
}

// 本地存储数据结构
export interface StoredChatData {
  version: string; // 数据版本，用于迁移
  sessions: {
    [sessionId: string]: ChatSession;
  };
  currentSessionId: string;
  settings: {
    theme: 'light' | 'dark';
    enableHistory: boolean;
  };
}

// 本地存储键名常量
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'ai-chat-history',
  CHAT_SESSION: 'ai-chat-session'
} as const;

// 默认存储数据
export const DEFAULT_STORAGE_DATA: StoredChatData = {
  version: '1.0.0',
  sessions: {},
  currentSessionId: '',
  settings: {
    theme: 'light',
    enableHistory: true
  }
};

// 消息发送器类型
export type MessageSender = (message: string) => Promise<string>;

// 主题类型
export type Theme = 'light' | 'dark';

// 消息发送者类型
export type SenderType = 'user' | 'ai';