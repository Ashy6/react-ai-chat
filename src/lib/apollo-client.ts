import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

// GraphQL endpoint - 指向 Cloudflare Workers
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:8787',
});

// 错误处理链接
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(() => {
      // 移除 console.error 调试语句
    });
  }

  if (networkError) {
    // 移除 console.error 调试语句
  }
});

// 认证链接（为将来的认证做准备）
const authLink = setContext((_, { headers }) => {
  // 从本地存储获取认证令牌
  const token = localStorage.getItem('auth-token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
});

// 创建 Apollo Client 实例
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // 聊天消息的缓存策略
          messages: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// 导出类型
export type { ApolloClient } from '@apollo/client';