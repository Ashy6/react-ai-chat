import { gql } from '@apollo/client';

// 消息片段 - 匹配 Worker Schema
export const MESSAGE_FRAGMENT = gql`
  fragment MessageFragment on Message {
    id
    content
    role
    timestamp
  }
`;

// 聊天会话片段 - 匹配 Worker Schema
export const CHAT_SESSION_FRAGMENT = gql`
  fragment ChatSessionFragment on ChatSession {
    id
    messages {
      ...MessageFragment
    }
    createdAt
    updatedAt
  }
  ${MESSAGE_FRAGMENT}
`;

// 查询：Hello 测试
export const HELLO_QUERY = gql`
  query Hello {
    hello
  }
`;

// 查询：获取聊天会话
export const GET_CHAT_SESSION = gql`
  query GetChatSession($sessionId: String!) {
    getChatSession(sessionId: $sessionId) {
      ...ChatSessionFragment
    }
  }
  ${CHAT_SESSION_FRAGMENT}
`;

// 变更：创建新会话
export const CREATE_CHAT_SESSION = gql`
  mutation CreateChatSession {
    createChatSession {
      ...ChatSessionFragment
    }
  }
  ${CHAT_SESSION_FRAGMENT}
`;

// 变更：发送消息
export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      message {
        ...MessageFragment
      }
      session {
        ...ChatSessionFragment
      }
    }
  }
  ${MESSAGE_FRAGMENT}
  ${CHAT_SESSION_FRAGMENT}
`;

// 以下是为了向后兼容保留的查询，但在 GraphQL 模式下不会使用
// 这些查询与当前 Worker Schema 不匹配，仅用于非 GraphQL 模式

// 查询：获取聊天历史（向后兼容）
export const GET_CHAT_HISTORY = gql`
  query GetChatHistory($sessionId: ID!, $userId: ID, $limit: Int, $offset: Int) {
    getChatHistory(sessionId: $sessionId, userId: $userId, limit: $limit, offset: $offset) {
      messages {
        id
        content
        sender
        timestamp
        sessionId
        isLoading
      }
      hasMore
      total
    }
  }
`;

// 查询：获取用户的所有会话（向后兼容）
export const GET_USER_SESSIONS = gql`
  query GetUserSessions($userId: ID!) {
    getUserSessions(userId: $userId) {
      id
      userId
      title
      createdAt
      updatedAt
      messages {
        id
        content
        sender
        timestamp
        sessionId
        isLoading
      }
    }
  }
`;

// 查询：获取单个会话详情（向后兼容）
export const GET_SESSION = gql`
  query GetSession($sessionId: ID!) {
    getSession(sessionId: $sessionId) {
      id
      userId
      title
      createdAt
      updatedAt
      messages {
        id
        content
        sender
        timestamp
        sessionId
        isLoading
      }
    }
  }
`;

// 变更：创建新会话（向后兼容）
export const CREATE_SESSION = gql`
  mutation CreateSession($input: CreateSessionInput!) {
    createSession(input: $input) {
      success
      session {
        id
        userId
        title
        createdAt
        updatedAt
        messages {
          id
          content
          sender
          timestamp
          sessionId
          isLoading
        }
      }
      error
    }
  }
`;

// 变更：删除会话（向后兼容）
export const DELETE_SESSION = gql`
  mutation DeleteSession($sessionId: ID!) {
    deleteSession(sessionId: $sessionId) {
      success
      error
    }
  }
`;

// 变更：更新会话标题（向后兼容）
export const UPDATE_SESSION_TITLE = gql`
  mutation UpdateSessionTitle($sessionId: ID!, $title: String!) {
    updateSessionTitle(sessionId: $sessionId, title: $title) {
      success
      session {
        id
        userId
        title
        createdAt
        updatedAt
        messages {
          id
          content
          sender
          timestamp
          sessionId
          isLoading
        }
      }
      error
    }
  }
`;

// 订阅：实时消息（为将来的实时功能做准备）
export const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded($sessionId: ID!) {
    messageAdded(sessionId: $sessionId) {
      id
      content
      sender
      timestamp
      sessionId
      isLoading
    }
  }
`;

// 订阅：AI 响应流（为流式响应做准备）
export const AI_RESPONSE_STREAM = gql`
  subscription OnAIResponseStream($messageId: ID!) {
    aiResponseStream(messageId: $messageId) {
      id
      content
      isComplete
      error
    }
  }
`;