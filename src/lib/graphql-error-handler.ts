import { ApolloError } from '@apollo/client';
import type { GraphQLError } from './graphql-types';

/**
 * GraphQL 错误类型
 */
export enum GraphQLErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  GRAPHQL_ERROR = 'GRAPHQL_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 错误信息映射
 */
const ERROR_MESSAGES = {
  [GraphQLErrorType.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [GraphQLErrorType.GRAPHQL_ERROR]: 'GraphQL 查询错误',
  [GraphQLErrorType.AUTHENTICATION_ERROR]: '身份验证失败，请重新登录',
  [GraphQLErrorType.VALIDATION_ERROR]: '输入数据验证失败',
  [GraphQLErrorType.SERVER_ERROR]: '服务器内部错误，请稍后重试',
  [GraphQLErrorType.UNKNOWN_ERROR]: '未知错误，请稍后重试'
};

/**
 * 解析 Apollo 错误
 * @param error Apollo 错误对象
 * @returns 错误类型和用户友好的错误消息
 */
export function parseApolloError(error: ApolloError): {
  type: GraphQLErrorType;
  message: string;
  originalError: ApolloError;
} {
  // 网络错误
  if (error.networkError) {
    const networkError = error.networkError;
    
    // 检查是否是连接错误
    if ('code' in networkError && networkError.code === 'NETWORK_ERROR') {
      return {
        type: GraphQLErrorType.NETWORK_ERROR,
        message: ERROR_MESSAGES[GraphQLErrorType.NETWORK_ERROR],
        originalError: error
      };
    }
    
    // 检查 HTTP 状态码
    if ('statusCode' in networkError) {
      const statusCode = networkError.statusCode as number;
      
      if (statusCode === 401 || statusCode === 403) {
        return {
          type: GraphQLErrorType.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES[GraphQLErrorType.AUTHENTICATION_ERROR],
          originalError: error
        };
      }
      
      if (statusCode >= 500) {
        return {
          type: GraphQLErrorType.SERVER_ERROR,
          message: ERROR_MESSAGES[GraphQLErrorType.SERVER_ERROR],
          originalError: error
        };
      }
    }
    
    return {
      type: GraphQLErrorType.NETWORK_ERROR,
      message: `网络错误: ${networkError.message}`,
      originalError: error
    };
  }
  
  // GraphQL 错误
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0];
    
    // 检查错误扩展信息
    if (graphQLError.extensions) {
      const { code } = graphQLError.extensions;
      
      switch (code) {
        case 'UNAUTHENTICATED':
        case 'FORBIDDEN':
          return {
            type: GraphQLErrorType.AUTHENTICATION_ERROR,
            message: ERROR_MESSAGES[GraphQLErrorType.AUTHENTICATION_ERROR],
            originalError: error
          };
          
        case 'BAD_USER_INPUT':
        case 'VALIDATION_ERROR':
          return {
            type: GraphQLErrorType.VALIDATION_ERROR,
            message: graphQLError.message || ERROR_MESSAGES[GraphQLErrorType.VALIDATION_ERROR],
            originalError: error
          };
          
        case 'INTERNAL_SERVER_ERROR':
          return {
            type: GraphQLErrorType.SERVER_ERROR,
            message: ERROR_MESSAGES[GraphQLErrorType.SERVER_ERROR],
            originalError: error
          };
      }
    }
    
    return {
      type: GraphQLErrorType.GRAPHQL_ERROR,
      message: graphQLError.message || ERROR_MESSAGES[GraphQLErrorType.GRAPHQL_ERROR],
      originalError: error
    };
  }
  
  // 未知错误
  return {
    type: GraphQLErrorType.UNKNOWN_ERROR,
    message: error.message || ERROR_MESSAGES[GraphQLErrorType.UNKNOWN_ERROR],
    originalError: error
  };
}

/**
 * 处理 GraphQL 错误的 Hook
 * @param error 错误对象
 * @returns 处理后的错误信息
 */
export function useGraphQLErrorHandler() {
  const handleError = (error: unknown): string => {
    if (error instanceof ApolloError) {
      const { message } = parseApolloError(error);
      return message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return ERROR_MESSAGES[GraphQLErrorType.UNKNOWN_ERROR];
  };
  
  return { handleError };
}

/**
 * 检查错误是否为网络连接问题
 * @param error 错误对象
 * @returns 是否为网络连接问题
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApolloError) {
    const { type } = parseApolloError(error);
    return type === GraphQLErrorType.NETWORK_ERROR;
  }
  return false;
}

/**
 * 检查错误是否为认证问题
 * @param error 错误对象
 * @returns 是否为认证问题
 */
export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof ApolloError) {
    const { type } = parseApolloError(error);
    return type === GraphQLErrorType.AUTHENTICATION_ERROR;
  }
  return false;
}

/**
 * 检查错误是否可以重试
 * @param error 错误对象
 * @returns 是否可以重试
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApolloError) {
    const { type } = parseApolloError(error);
    return [
      GraphQLErrorType.NETWORK_ERROR,
      GraphQLErrorType.SERVER_ERROR
    ].includes(type);
  }
  return false;
}