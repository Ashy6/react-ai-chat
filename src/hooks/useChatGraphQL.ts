import { useState, useCallback, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { useLocalStorage } from './useLocalStorage';
import {
  SEND_MESSAGE,
  CREATE_CHAT_SESSION,
  GET_CHAT_SESSION,
  HELLO_QUERY
} from '../lib/graphql-queries';
import { useGraphQLErrorHandler } from '../lib/graphql-error-handler';
import type {
  Message,
  UseChatReturn,
  MessageSender,
  StoredChatData,
  ChatSession
} from '../lib/types';
import { STORAGE_KEYS, DEFAULT_STORAGE_DATA } from '../lib/types';

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 生成会话 ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2)}`;
}

/**
 * 将 GraphQL 消息转换为本地消息格式
 * Worker Schema: { id, content, role, timestamp }
 * Local Format: { id, content, sender, timestamp }
 */
function convertGraphQLMessage(gqlMessage: any): Message {
  return {
    id: gqlMessage.id,
    content: gqlMessage.content,
    sender: gqlMessage.role === 'USER' ? 'user' : 'ai',
    timestamp: new Date(gqlMessage.timestamp).getTime(),
    isLoading: false
  };
}

/**
 * 将本地消息格式转换为 GraphQL 格式
 */
function convertToGraphQLRole(sender: string): 'USER' | 'ASSISTANT' {
  return sender === 'user' ? 'USER' : 'ASSISTANT';
}

/**
 * 模拟 AI 回复函数（作为备选方案）
 */
const fallbackAIResponse: MessageSender = async (message: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const responses = [
    `我理解你说的是：**"${message}"**。这是一个很有趣的话题！\n\n让我为你提供一些相关信息：\n- 这个话题很值得深入探讨\n- 我们可以从多个角度来分析\n- 你的观点很有见地`,
    `关于 **${message}**，我觉得这需要更深入的思考。\n\n## 我的分析\n\n1. 首先，这是一个复杂的问题\n2. 其次，需要考虑多个因素\n3. 最后，我们应该保持开放的心态\n\n> 思考是人类最宝贵的能力之一。`,
    `谢谢你分享 \`${message}\`。我很乐意继续这个对话。\n\n### 相关建议\n\n- **保持好奇心**：继续探索这个话题\n- **多角度思考**：从不同的视角来看待问题\n- **实践应用**：将理论与实践相结合`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * GraphQL 聊天 Hook
 * @param options 配置选项
 * @returns 聊天状态和操作函数
 */
export function useChatGraphQL(options: {
  initialMessages?: Message[];
  enableHistory?: boolean;
  sessionId?: string;
  userId?: string;
  useGraphQL?: boolean; // 是否使用 GraphQL，默认 false（使用模拟数据）
} = {}): UseChatReturn {
  const {
    initialMessages = [],
    enableHistory = true,
    sessionId: providedSessionId,
    userId,
    useGraphQL = false
  } = options;

  const apolloClient = useApolloClient();
  const { handleError } = useGraphQLErrorHandler();

  // 本地存储管理
  const [storedData, setStoredData] = useLocalStorage<StoredChatData>(
    STORAGE_KEYS.CHAT_HISTORY,
    DEFAULT_STORAGE_DATA
  );

  // 当前会话 ID
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    if (providedSessionId) return providedSessionId;
    if (storedData.currentSessionId) return storedData.currentSessionId;
    return generateSessionId();
  });

  // 聊天状态
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [graphqlSessionId, setGraphqlSessionId] = useState<string | null>(null);
  // GraphQL 模式下的本地临时消息状态
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // GraphQL Mutations
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const [createChatSessionMutation] = useMutation(CREATE_CHAT_SESSION);

  // GraphQL Queries
  const { data: chatSessionData, refetch: refetchSession } = useQuery(GET_CHAT_SESSION, {
    variables: {
      sessionId: graphqlSessionId || currentSessionId
    },
    skip: !useGraphQL || !graphqlSessionId,
    errorPolicy: 'all'
  });

  // 获取当前会话的消息
  const currentSession = storedData.sessions[currentSessionId];
  const localStoredMessages = currentSession?.messages || initialMessages;
  const graphqlMessages = chatSessionData?.getChatSession?.messages?.map(convertGraphQLMessage) || [];
  
  // 合并消息：优先使用 GraphQL 数据，本地消息作为临时显示
  const messages = useMemo(() => {
    if (useGraphQL) {
      // GraphQL 模式下，优先使用 GraphQL 数据源的消息
      if (graphqlMessages.length > 0) {
        // 如果有本地临时消息（正在发送中的消息），合并显示
        if (localMessages.length > 0) {
          // 找出本地消息中不在 GraphQL 数据中的消息（通常是正在发送的消息）
          const graphqlMessageIds = new Set(graphqlMessages.map(msg => msg.id));
          const pendingLocalMessages = localMessages.filter(msg => !graphqlMessageIds.has(msg.id));
          
          return [...graphqlMessages, ...pendingLocalMessages];
        }
        
        return graphqlMessages;
      }
      
      // 如果 GraphQL 数据还没有加载，使用本地临时消息
      return localMessages;
    }
    return localStoredMessages;
  }, [useGraphQL, localMessages, graphqlMessages, localStoredMessages]);

  // 初始化 GraphQL 会话
  const initializeGraphQLSession = useCallback(async () => {
    if (!useGraphQL || graphqlSessionId) return;

    try {
      const result = await createChatSessionMutation();
      const newSessionId = result.data?.createChatSession?.id;
      
      if (newSessionId) {
        setGraphqlSessionId(newSessionId);
        console.log('Created GraphQL session:', newSessionId);
      }
    } catch (error) {
      console.error('Failed to create GraphQL session:', error);
      setError('无法创建聊天会话');
    }
  }, [useGraphQL, graphqlSessionId, createChatSessionMutation]);

  // 初始化会话
  useEffect(() => {
    if (useGraphQL) {
      initializeGraphQLSession();
    } else if (enableHistory && !currentSession) {
      const newSession: ChatSession = {
        sessionId: currentSessionId,
        messages: initialMessages,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      setStoredData(prev => ({
        ...prev,
        sessions: {
          ...prev.sessions,
          [currentSessionId]: newSession
        },
        currentSessionId
      }));
    }
  }, [useGraphQL, currentSessionId, enableHistory, currentSession, initialMessages, setStoredData, initializeGraphQLSession]);

  // 更新本地会话消息
  const updateSessionMessages = useCallback((newMessages: Message[]) => {
    if (!enableHistory) return;

    setStoredData(prev => {
      const updatedSession: ChatSession = {
        ...prev.sessions[currentSessionId],
        messages: newMessages,
        updatedAt: Date.now()
      };

      return {
        ...prev,
        sessions: {
          ...prev.sessions,
          [currentSessionId]: updatedSession
        }
      };
    });
  }, [currentSessionId, enableHistory, setStoredData]);

  // GraphQL 发送消息
  const sendMessageGraphQL = useCallback(async (content: string) => {
    if (!graphqlSessionId) {
      throw new Error('GraphQL 会话未初始化');
    }

    try {
      const input = {
        sessionId: graphqlSessionId,
        content: content.trim(),
        role: 'USER' as const
      };

      console.log('🚀 Sending GraphQL message:', input);

      const result = await sendMessageMutation({
        variables: { input }
      });

      console.log('📨 GraphQL response:', result);
      console.log('📨 Response data:', result.data);
      console.log('📨 SendMessage data:', result.data?.sendMessage);
      console.log('📨 Message content:', result.data?.sendMessage?.message?.content);

      if (result.errors && result.errors.length > 0) {
        console.error('❌ GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      if (!result.data?.sendMessage?.message?.content) {
        console.error('❌ No message content in response');
        throw new Error('未收到有效的回复内容');
      }

      const aiResponse = result.data.sendMessage.message.content;
      console.log('✅ AI Response:', aiResponse);

      // 检查是否是错误消息
      if (aiResponse === '抱歉，我现在无法回复。请稍后再试。') {
        console.error('❌ Received error message from AI');
        throw new Error('AI 服务暂时不可用');
      }

      // 刷新会话数据
      await refetchSession();

      return aiResponse;
    } catch (error) {
      console.error('❌ GraphQL send message error:', error);
      throw error; // 直接抛出原始错误，不再包装
    }
  }, [graphqlSessionId, sendMessageMutation, refetchSession]);

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: generateId(),
      content: content.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    try {
      if (useGraphQL) {
        // 使用 GraphQL - 简化状态管理
        console.log('📝 Adding user message to local state');
        
        // 添加用户消息
        const messagesWithUser = [...messages, userMessage];
        setLocalMessages(messagesWithUser);
        
        // 创建加载中的 AI 消息
        const loadingAIMessage: Message = {
          id: generateId(),
          content: '正在思考中...',
          sender: 'ai',
          timestamp: Date.now(),
          isLoading: true
        };
        
        const messagesWithLoading = [...messagesWithUser, loadingAIMessage];
        setLocalMessages(messagesWithLoading);
        
        console.log('🤖 Calling GraphQL API...');
        // 发送 GraphQL 请求
        const aiResponse = await sendMessageGraphQL(content);
        console.log('✅ Got AI response:', aiResponse);
        
        // 创建最终的 AI 消息
        const finalAIMessage: Message = {
          id: generateId(),
          content: aiResponse,
          sender: 'ai',
          timestamp: Date.now()
        };
        
        // 更新最终消息状态
        const finalMessages = [...messagesWithUser, finalAIMessage];
        setLocalMessages(finalMessages);
        
        // 更新会话存储
        updateSessionMessages(finalMessages);
      } else {
        // 使用本地模拟
        const messagesWithUser = [...messages, userMessage];
        updateSessionMessages(messagesWithUser);

        // 创建加载中的 AI 消息
        const loadingAIMessage: Message = {
          id: generateId(),
          content: '',
          sender: 'ai',
          timestamp: Date.now(),
          isLoading: true
        };

        const messagesWithLoading = [...messagesWithUser, loadingAIMessage];
        updateSessionMessages(messagesWithLoading);

        // 获取 AI 回复
        const aiResponse = await fallbackAIResponse(content);

        // 更新 AI 消息
        const finalAIMessage: Message = {
          ...loadingAIMessage,
          content: aiResponse,
          isLoading: false
        };

        const finalMessages = [...messagesWithUser, finalAIMessage];
        updateSessionMessages(finalMessages);
      }

      // 清空输入框
      setInputValue('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : '发送消息时出现错误';
      setError(errorMessage);
      
      if (useGraphQL) {
        // GraphQL 错误处理 - 简化错误显示
        const aiErrorMessage: Message = {
          id: generateId(),
          content: `抱歉，发送消息时出现错误：${errorMessage}`,
          sender: 'ai',
          timestamp: Date.now()
        };
        
        // 简化错误状态更新
        const messagesWithUser = [...messages, userMessage];
        const messagesWithError = [...messagesWithUser, aiErrorMessage];
        setLocalMessages(messagesWithError);
        updateSessionMessages(messagesWithError);
      } else {
        // 本地错误处理
        const aiErrorMessage: Message = {
          id: generateId(),
          content: '抱歉，发送消息时出现错误，请稍后重试。',
          sender: 'ai',
          timestamp: Date.now()
        };

        const messagesWithError = [...messages, userMessage, aiErrorMessage];
        updateSessionMessages(messagesWithError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, useGraphQL, sendMessageGraphQL, updateSessionMessages, handleError]);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    if (useGraphQL) {
      // 对于 GraphQL，我们需要清空本地临时消息和缓存
      setLocalMessages([]);
      if (apolloClient) {
        apolloClient.cache.evict({ fieldName: 'getChatSession' });
        apolloClient.cache.gc();
      }
      // 重新初始化会话
      setGraphqlSessionId(null);
      if (initializeGraphQLSession) {
        initializeGraphQLSession();
      }
    } else if (enableHistory) {
      setStoredData(prev => ({
        ...prev,
        sessions: {
          ...prev.sessions,
          [currentSessionId]: {
            ...prev.sessions[currentSessionId],
            messages: [],
            updatedAt: Date.now()
          }
        }
      }));
    }
  }, [currentSessionId, enableHistory, setStoredData, useGraphQL, apolloClient, initializeGraphQLSession]);

  return {
    messages,
    sendMessage,
    clearHistory,
    isLoading,
    inputValue,
    setInputValue,
    error
  };
}