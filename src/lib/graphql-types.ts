// GraphQL 类型定义

// 消息类型
export interface GraphQLMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  sessionId: string;
  isLoading?: boolean;
}

// 聊天会话类型
export interface GraphQLChatSession {
  id: string;
  userId?: string;
  messages: GraphQLMessage[];
  createdAt: number;
  updatedAt: number;
  title?: string;
}

// 发送消息的输入类型
export interface SendMessageInput {
  content: string;
  sessionId: string;
  userId?: string;
}

// 发送消息的响应类型
export interface SendMessageResponse {
  success: boolean;
  message?: GraphQLMessage;
  aiResponse?: GraphQLMessage;
  error?: string;
}

// 获取聊天历史的输入类型
export interface GetChatHistoryInput {
  sessionId: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

// 获取聊天历史的响应类型
export interface GetChatHistoryResponse {
  messages: GraphQLMessage[];
  hasMore: boolean;
  total: number;
}

// 创建会话的输入类型
export interface CreateSessionInput {
  userId?: string;
  title?: string;
}

// 创建会话的响应类型
export interface CreateSessionResponse {
  success: boolean;
  session?: GraphQLChatSession;
  error?: string;
}

// DeepSeek API 配置类型
export interface DeepSeekConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

// AI 响应流类型
export interface AIStreamResponse {
  id: string;
  content: string;
  isComplete: boolean;
  error?: string;
}

// GraphQL 错误类型
export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
  extensions?: {
    code?: string;
    [key: string]: any;
  };
}

// GraphQL 响应包装类型
export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
  loading: boolean;
}