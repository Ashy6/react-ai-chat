import { gql } from '@apollo/client';

// 消息片段
export const MESSAGE_FRAGMENT = gql`
  fragment MessageFragment on Message {
    id
    content
    sender
    timestamp
    sessionId
    isLoading
  }
`;

// 聊天会话片段
export const CHAT_SESSION_FRAGMENT = gql`
  fragment ChatSessionFragment on ChatSession {
    id
    userId
    title
    createdAt
    updatedAt
    messages {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`;

// 查询：获取聊天历史
export const GET_CHAT_HISTORY = gql`
  query GetChatHistory($sessionId: ID!, $userId: ID, $limit: Int, $offset: Int) {
    getChatHistory(sessionId: $sessionId, userId: $userId, limit: $limit, offset: $offset) {
      messages {
        ...MessageFragment
      }
      hasMore
      total
    }
  }
  ${MESSAGE_FRAGMENT}
`;

// 查询：获取用户的所有会话
export const GET_USER_SESSIONS = gql`
  query GetUserSessions($userId: ID!) {
    getUserSessions(userId: $userId) {
      ...ChatSessionFragment
    }
  }
  ${CHAT_SESSION_FRAGMENT}
`;

// 查询：获取单个会话详情
export const GET_SESSION = gql`
  query GetSession($sessionId: ID!) {
    getSession(sessionId: $sessionId) {
      ...ChatSessionFragment
    }
  }
  ${CHAT_SESSION_FRAGMENT}
`;

// 变更：发送消息
export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      success
      message {
        ...MessageFragment
      }
      aiResponse {
        ...MessageFragment
      }
      error
    }
  }
  ${MESSAGE_FRAGMENT}
`;

// 变更：创建新会话
export const CREATE_SESSION = gql`
  mutation CreateSession($input: CreateSessionInput!) {
    createSession(input: $input) {
      success
      session {
        ...ChatSessionFragment
      }
      error
    }
  }
  ${CHAT_SESSION_FRAGMENT}
`;

// 变更：删除会话
export const DELETE_SESSION = gql`
  mutation DeleteSession($sessionId: ID!) {
    deleteSession(sessionId: $sessionId) {
      success
      error
    }
  }
`;

// 变更：更新会话标题
export const UPDATE_SESSION_TITLE = gql`
  mutation UpdateSessionTitle($sessionId: ID!, $title: String!) {
    updateSessionTitle(sessionId: $sessionId, title: $title) {
      success
      session {
        ...ChatSessionFragment
      }
      error
    }
  }
  ${CHAT_SESSION_FRAGMENT}
`;

// 订阅：实时消息（为将来的实时功能做准备）
export const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded($sessionId: ID!) {
    messageAdded(sessionId: $sessionId) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
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