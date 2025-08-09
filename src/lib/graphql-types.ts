// GraphQL 类型定义

// 消息角色枚举 - 匹配 Worker Schema
export type MessageRole = 'USER' | 'ASSISTANT';

// GraphQL 消息类型 - 匹配 Worker Schema
export interface GraphQLMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string; // ISO string from Worker
}

// GraphQL 聊天会话类型 - 匹配 Worker Schema
export interface GraphQLChatSession {
  id: string;
  messages: GraphQLMessage[];
  createdAt: string; // ISO string from Worker
  updatedAt: string; // ISO string from Worker
}

// 发送消息的输入类型 - 匹配 Worker Schema
export interface SendMessageInput {
  sessionId: string;
  content: string;
  role: MessageRole;
}

// 发送消息的响应类型 - 匹配 Worker Schema
export interface SendMessageResponse {
  message: GraphQLMessage;
  session: GraphQLChatSession;
}

// Hello 查询响应类型
export interface HelloResponse {
  hello: string;
}

// 获取聊天会话的响应类型
export interface GetChatSessionResponse {
  getChatSession: GraphQLChatSession | null;
}

// 创建聊天会话的响应类型
export interface CreateChatSessionResponse {
  createChatSession: GraphQLChatSession;
}

// 以下是为了向后兼容保留的类型定义，用于非 GraphQL 模式

// 旧版消息类型（向后兼容）
export interface LegacyGraphQLMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  sessionId: string;
  isLoading?: boolean;
}

// 旧版聊天会话类型（向后兼容）
export interface LegacyGraphQLChatSession {
  id: string;
  userId?: string;
  messages: LegacyGraphQLMessage[];
  createdAt: number;
  updatedAt: number;
  title?: string;
}

// 旧版发送消息的输入类型（向后兼容）
export interface LegacySendMessageInput {
  content: string;
  sessionId: string;
  userId?: string;
}

// 旧版发送消息的响应类型（向后兼容）
export interface LegacySendMessageResponse {
  success: boolean;
  message?: LegacyGraphQLMessage;
  aiResponse?: LegacyGraphQLMessage;
  error?: string;
}

// 获取聊天历史的输入类型（向后兼容）
export interface GetChatHistoryInput {
  sessionId: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

// 获取聊天历史的响应类型（向后兼容）
export interface GetChatHistoryResponse {
  messages: LegacyGraphQLMessage[];
  hasMore: boolean;
  total: number;
}

// 创建会话的输入类型（向后兼容）
export interface CreateSessionInput {
  userId?: string;
  title?: string;
}

// 创建会话的响应类型（向后兼容）
export interface CreateSessionResponse {
  success: boolean;
  session?: LegacyGraphQLChatSession;
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