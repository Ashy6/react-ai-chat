import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useChatGraphQL } from './useChatGraphQL';
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
 * 模拟 AI 回复函数
 */
const defaultAIResponse: MessageSender = async (message: string): Promise<string> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // 简单的回复逻辑，包含 Markdown 格式
  const responses = [
    `我理解你说的是：**"${message}"**。这是一个很有趣的话题！\n\n让我为你提供一些相关信息：\n- 这个话题很值得深入探讨\n- 我们可以从多个角度来分析\n- 你的观点很有见地`,
    `关于 **${message}**，我觉得这需要更深入的思考。\n\n## 我的分析\n\n1. 首先，这是一个复杂的问题\n2. 其次，需要考虑多个因素\n3. 最后，我们应该保持开放的心态\n\n> 思考是人类最宝贵的能力之一。`,
    `谢谢你分享 \`${message}\`。我很乐意继续这个对话。\n\n### 相关建议\n\n- **保持好奇心**：继续探索这个话题\n- **多角度思考**：从不同的视角来看待问题\n- **实践应用**：将理论与实践相结合`,
    `**"${message}"** 确实值得讨论。你还有其他想法吗？\n\n\`\`\`\n这里是一些代码示例或者重要信息\n可以帮助你更好地理解这个概念\n\`\`\`\n\n希望这些信息对你有帮助！`,
    `基于你提到的 *${message}*，我想说这是一个复杂的问题。\n\n---\n\n**总结要点：**\n\n1. 问题的复杂性需要我们仔细分析\n2. 不同的观点都有其合理性\n3. 持续学习和思考是关键\n\n*让我们继续深入探讨这个话题吧！*`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * 聊天 Hook
 * @param options 配置选项
 * @returns 聊天状态和操作函数
 */
export function useChat(options: {
  initialMessages?: Message[];
  onSendMessage?: MessageSender;
  enableHistory?: boolean;
  sessionId?: string;
  userId?: string;
  useGraphQL?: boolean; // 是否使用 GraphQL，默认 false
} = {}): UseChatReturn {
  const {
    initialMessages = [],
    onSendMessage = defaultAIResponse,
    enableHistory = true,
    sessionId: providedSessionId,
    userId,
    useGraphQL = false
  } = options;

  // GraphQL Hook - 始终调用，但只在需要时使用结果
  const graphqlResult = useChatGraphQL({
    initialMessages,
    enableHistory,
    sessionId: providedSessionId,
    userId,
    useGraphQL: useGraphQL
  });

  // 本地存储管理
  const [storedData, setStoredData] = useLocalStorage<StoredChatData>(
    STORAGE_KEYS.CHAT_HISTORY,
    DEFAULT_STORAGE_DATA
  );

  // 当前会话 ID
  const [currentSessionId] = useState(() => {
    if (providedSessionId) return providedSessionId;
    if (storedData.currentSessionId) return storedData.currentSessionId;
    return generateSessionId();
  });

  // 聊天状态
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 获取当前会话的消息
  const currentSession = storedData.sessions[currentSessionId];
  const messages = currentSession?.messages || initialMessages;

  // 初始化会话
  useEffect(() => {
    if (enableHistory && !currentSession) {
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
  }, [currentSessionId, enableHistory, currentSession, initialMessages, setStoredData]);

  // 更新会话消息
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

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      content: content.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    // 添加用户消息
    const messagesWithUser = [...messages, userMessage];
    updateSessionMessages(messagesWithUser);

    // 清空输入框
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
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
      const aiResponse = await onSendMessage(content);

      // 更新 AI 消息
      const finalAIMessage: Message = {
        ...loadingAIMessage,
        content: aiResponse,
        isLoading: false
      };

      const finalMessages = [...messagesWithUser, finalAIMessage];
      updateSessionMessages(finalMessages);
    } catch (error) {
      setError(error instanceof Error ? error.message : '发送消息时出现错误');
      
      // 发送错误消息
      const errorMessage: Message = {
        id: generateId(),
        content: '抱歉，发送消息时出现错误，请稍后重试。',
        sender: 'ai',
        timestamp: Date.now()
      };

      const messagesWithError = [...messagesWithUser, errorMessage];
      updateSessionMessages(messagesWithError);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, onSendMessage, updateSessionMessages]);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    if (enableHistory) {
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
  }, [currentSessionId, enableHistory, setStoredData]);

  // 根据 useGraphQL 参数决定返回哪个结果
  if (useGraphQL) {
    return graphqlResult;
  }

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

/**
 * 获取所有聊天会话的 Hook
 * @returns 所有会话数据
 */
export function useChatSessions() {
  const [storedData] = useLocalStorage<StoredChatData>(
    STORAGE_KEYS.CHAT_HISTORY,
    DEFAULT_STORAGE_DATA
  );

  return {
    sessions: Object.values(storedData.sessions),
    currentSessionId: storedData.currentSessionId,
    settings: storedData.settings
  };
}