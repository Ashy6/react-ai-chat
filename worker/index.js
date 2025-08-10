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
    AI
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

// 生成会话 ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2)}`;
}

// 生成消息 ID
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2)}`;
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
    createChatSession: async (parent, args, context) => {
      const sessionId = generateSessionId();
      
      // 创建会话记录
      const session = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      
      // 如果有KV存储，保存会话
      if (context.CHAT_SESSIONS) {
        await context.CHAT_SESSIONS.put(sessionId, JSON.stringify(session));
      }
      
      return session;
    },
    
    sendMessage: async (parent, { input }, context) => {
      const { sessionId, content } = input;
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
          timestamp: new Date().toISOString()
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
          role: 'AI',
          timestamp: new Date().toISOString()
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
    return { data: { sendMessage: { message: result, session: { id: variables.input.sessionId, messages: [result], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } } } };
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
        console.log('GraphQL request received:', { query: body.query, variables: body.variables });

        const { query, variables } = body;

        // 处理 hello 查询
        if (query.includes('hello')) {
          return new Response(JSON.stringify({
            data: {
              hello: resolvers.Query.hello()
            }
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        // 处理创建会话
        if (query.includes('createChatSession')) {
          const sessionId = generateSessionId();
          // 移除 console.log 调试语句
          
          return new Response(JSON.stringify({
            data: {
              createChatSession: {
                id: sessionId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messages: []
              }
            }
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        // 处理获取会话
        if (query.includes('getChatSession')) {
          console.log('Processing getChatSession with variables:', variables);
          const { sessionId } = variables;
          if (!sessionId) {
            console.error('Missing sessionId in getChatSession variables');
            return new Response(JSON.stringify({
              errors: [{ message: 'Missing sessionId parameter' }]
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }

          try {
            // 从KV存储获取会话数据
            const sessionData = await env.CHAT_SESSIONS?.get(sessionId);
            if (!sessionData) {
              // 如果会话不存在，返回空会话
              return new Response(JSON.stringify({
                data: {
                  getChatSession: {
                    id: sessionId,
                    messages: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                }
              }), {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              });
            }

            const session = JSON.parse(sessionData);
            return new Response(JSON.stringify({
              data: {
                getChatSession: session
              }
            }), {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });

          } catch (error) {
            console.error('getChatSession error:', error);
            return new Response(JSON.stringify({
              errors: [{
                message: `Failed to get chat session: ${error.message}`,
                extensions: { code: 'SESSION_FETCH_ERROR' }
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

        // 处理发送消息
        if (query.includes('sendMessage')) {
          console.log('Processing sendMessage with variables:', variables);
          const { input } = variables;
          if (!input) {
            console.error('Missing input in sendMessage variables');
            return new Response(JSON.stringify({
              errors: [{ message: 'Missing input parameter' }]
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
          const { sessionId, content } = input;
          console.log('SendMessage input:', { sessionId, content, role: input.role });

          try {
            // 获取 API 密钥
            const apiKey = env.DEEPSEEK_API_KEY;
            if (!apiKey) {
              throw new Error('DEEPSEEK_API_KEY not configured');
            }

            // 获取或创建会话数据
            let session;
            const existingSessionData = await env.CHAT_SESSIONS?.get(sessionId);
            if (existingSessionData) {
              session = JSON.parse(existingSessionData);
            } else {
              // 创建新会话
              session = {
                id: sessionId,
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            }

            // 添加用户消息
            const userMessage = {
              id: generateMessageId(),
              content: content,
              role: 'USER',
              timestamp: new Date().toISOString()
            };
            session.messages.push(userMessage);

            // 构建消息历史用于API调用
            const apiMessages = session.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }));

            // 调用 DeepSeek API
            const aiResponse = await callDeepSeekAPI(apiMessages, apiKey);
            // 移除 console.log 调试语句

            // 添加AI回复消息
            const aiMessage = {
              id: generateMessageId(),
              content: aiResponse,
              role: 'AI',
              timestamp: new Date().toISOString()
            };
            session.messages.push(aiMessage);
            session.updatedAt = new Date().toISOString();

            // 保存更新后的会话到KV存储
            if (env.CHAT_SESSIONS) {
              await env.CHAT_SESSIONS.put(sessionId, JSON.stringify(session));
            }

            return new Response(JSON.stringify({
              data: {
                sendMessage: {
                  message: aiMessage,
                  session: session
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
        console.error('GraphQL request parsing error:', error);
        return new Response(JSON.stringify({
          errors: [{ 
            message: 'Invalid request format', 
            details: error.message,
            stack: error.stack 
          }]
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