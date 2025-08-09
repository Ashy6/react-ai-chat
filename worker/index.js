// Cloudflare Worker for DeepSeek GraphQL API
// 这个 Worker 将处理 GraphQL 请求并调用 DeepSeek API

// GraphQL Schema 定义
const typeDefs = `
  type Query {
    hello: String
    getChatSession(sessionId: String!): ChatSession
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): SendMessageResponse!
    createChatSession: ChatSession!
  }

  type ChatSession {
    id: String!
    messages: [Message!]!
    createdAt: String!
    updatedAt: String!
  }

  type Message {
    id: String!
    content: String!
    role: MessageRole!
    timestamp: String!
  }

  enum MessageRole {
    USER
    ASSISTANT
  }

  input SendMessageInput {
    sessionId: String!
    content: String!
    role: MessageRole!
  }

  type SendMessageResponse {
    message: Message!
    session: ChatSession!
  }
`;

// DeepSeek API 调用函数
async function callDeepSeekAPI(messages, apiKey) {
  // 移除 console.log 调试语句

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  // 转换消息格式为 DeepSeek API 格式
  const formattedMessages = messages.map(msg => ({
    role: msg.role === 'USER' ? 'user' : 'assistant',
    content: msg.content
  }));

  // 移除 console.log 调试语句

  const requestBody = {
    model: 'deepseek-chat',
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 2000,
    stream: false
  };

  // 移除 console.log 调试语句

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    // 移除 console.log 调试语句

    if (!response.ok) {
      const errorText = await response.text();
      // 移除 console.error 调试语句
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    // 移除 console.log 调试语句

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from DeepSeek API');
    }
  } catch (error) {
    throw error;
  }
}

// 生成唯一 ID
function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// GraphQL 解析器
const resolvers = {
  Query: {
    hello: () => 'Hello from DeepSeek GraphQL API!',
    getChatSession: async (parent, { sessionId }, { CHAT_SESSIONS }) => {
      const session = await CHAT_SESSIONS.get(sessionId);
      return session ? JSON.parse(session) : null;
    },
  },
  Mutation: {
    createChatSession: async (parent, args, { CHAT_SESSIONS }) => {
      const sessionId = generateSessionId();
      
      // 在 KV 存储中创建会话记录
      const session = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        messages: []
      };
      
      await context.CHAT_SESSIONS.put(sessionId, JSON.stringify(session));
      
      return session;
    },
    
    sendMessage: async (parent, { sessionId, content }, context) => {
      try {
        // 获取会话信息
        const sessionData = await context.CHAT_SESSIONS.get(sessionId);
        if (!sessionData) {
          throw new Error('Session not found');
        }
        
        const session = JSON.parse(sessionData);
        
        // 添加用户消息
        const userMessage = {
          id: generateMessageId(),
          content,
          role: 'USER',
          createdAt: new Date().toISOString()
        };
        
        session.messages.push(userMessage);
        
        // 获取 API 密钥
        const DEEPSEEK_API_KEY = context.DEEPSEEK_API_KEY;
        // 移除 console.log 调试语句
        
        if (!DEEPSEEK_API_KEY) {
          throw new Error('DEEPSEEK_API_KEY not configured');
        }
        
        // 调用 DeepSeek API
        const aiResponse = await callDeepSeekAPI(session.messages, DEEPSEEK_API_KEY);
        // 移除 console.log 调试语句
        
        // 创建 AI 回复消息
        const aiMessage = {
          id: generateMessageId(),
          content: aiResponse,
          role: 'ASSISTANT',
          createdAt: new Date().toISOString()
        };
        
        session.messages.push(aiMessage);
        
        // 更新会话
        await context.CHAT_SESSIONS.put(sessionId, JSON.stringify(session));
        
        return aiMessage;
      } catch (error) {
        // 移除 console.error 调试语句
        throw error;
      }
    }
  }
};

// 简化的 GraphQL 执行器
async function executeGraphQL(query, variables, context) {
  // 这是一个简化的 GraphQL 执行器
  // 在生产环境中，您可能想要使用完整的 GraphQL 库

  if (query.includes('hello')) {
    return { data: { hello: resolvers.Query.hello() } };
  }

  if (query.includes('createChatSession')) {
    const result = await resolvers.Mutation.createChatSession(null, {}, context);
    return { data: { createChatSession: result } };
  }

  if (query.includes('getChatSession')) {
    const sessionId = variables.sessionId;
    const result = await resolvers.Query.getChatSession(null, { sessionId }, context);
    return { data: { getChatSession: result } };
  }

  if (query.includes('sendMessage')) {
    const result = await resolvers.Mutation.sendMessage(null, { input: variables.input }, context);
    return { data: { sendMessage: result } };
  }

  return { errors: [{ message: 'Unknown query' }] };
}

// Worker 主入口
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // 处理 GraphQL 请求
    if (url.pathname === '/graphql' && request.method === 'POST') {
      try {
        const body = await request.json();
        // 移除 console.log 调试语句

        const { query, variables } = body;

        // 处理创建会话
        if (query.includes('createChatSession')) {
          const sessionId = generateSessionId();
          // 移除 console.log 调试语句
          
          return new Response(JSON.stringify({
            data: {
              createChatSession: {
                id: sessionId,
                createdAt: new Date().toISOString()
              }
            }
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        // 处理发送消息
        if (query.includes('sendMessage')) {
          const { sessionId, content } = variables;
          // 移除 console.log 调试语句

          try {
            // 获取 API 密钥
            const apiKey = env.DEEPSEEK_API_KEY;
            if (!apiKey) {
              throw new Error('DEEPSEEK_API_KEY not configured');
            }

            // 构建消息历史（这里简化处理，实际应该从数据库获取）
            const messages = [
              { role: 'USER', content: content }
            ];

            // 调用 DeepSeek API
            const aiResponse = await callDeepSeekAPI(messages, apiKey);
            // 移除 console.log 调试语句

            return new Response(JSON.stringify({
              data: {
                sendMessage: {
                  id: generateMessageId(),
                  content: aiResponse,
                  role: 'ASSISTANT',
                  createdAt: new Date().toISOString()
                }
              }
            }), {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });

          } catch (error) {
            // 移除 console.error 调试语句
            return new Response(JSON.stringify({
              errors: [{
                message: `AI service error: ${error.message}`,
                extensions: { code: 'AI_SERVICE_ERROR' }
              }]
            }), {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        }

        // 未知的 GraphQL 操作
        return new Response(JSON.stringify({
          errors: [{ message: 'Unknown GraphQL operation' }]
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });

      } catch (error) {
        // 移除 console.error 调试语句
        return new Response(JSON.stringify({
          errors: [{ message: 'Invalid request format' }]
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 默认响应
    return new Response('Hello from Cloudflare Worker!', {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};