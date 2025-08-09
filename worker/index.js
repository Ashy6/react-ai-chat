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
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages.map(msg => ({
        role: msg.role.toLowerCase(),
        content: msg.content
      })),
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
      const sessionId = generateId();
      const session = {
        id: sessionId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await CHAT_SESSIONS.put(sessionId, JSON.stringify(session));
      return session;
    },
    sendMessage: async (parent, { input }, { CHAT_SESSIONS, DEEPSEEK_API_KEY }) => {
      const { sessionId, content, role } = input;
      
      // 获取现有会话
      let session = await CHAT_SESSIONS.get(sessionId);
      if (!session) {
        throw new Error('Chat session not found');
      }
      session = JSON.parse(session);
      
      // 创建用户消息
      const userMessage = {
        id: generateId(),
        content,
        role,
        timestamp: new Date().toISOString(),
      };
      
      session.messages.push(userMessage);
      
      // 如果是用户消息，调用 DeepSeek API 获取回复
      if (role === 'USER') {
        try {
          const aiResponse = await callDeepSeekAPI(session.messages, DEEPSEEK_API_KEY);
          
          const assistantMessage = {
            id: generateId(),
            content: aiResponse,
            role: 'ASSISTANT',
            timestamp: new Date().toISOString(),
          };
          
          session.messages.push(assistantMessage);
        } catch (error) {
          console.error('DeepSeek API error:', error);
          
          // 如果 API 调用失败，返回错误消息
          const errorMessage = {
            id: generateId(),
            content: '抱歉，我现在无法回复。请稍后再试。',
            role: 'ASSISTANT',
            timestamp: new Date().toISOString(),
          };
          
          session.messages.push(errorMessage);
        }
      }
      
      // 更新会话
      session.updatedAt = new Date().toISOString();
      await CHAT_SESSIONS.put(sessionId, JSON.stringify(session));
      
      return {
        message: session.messages[session.messages.length - 1],
        session,
      };
    },
  },
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
    // 处理 CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'POST') {
      try {
        const { query, variables } = await request.json();
        
        const context = {
          CHAT_SESSIONS: env.CHAT_SESSIONS,
          DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
        };
        
        const result = await executeGraphQL(query, variables, context);
        
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            errors: [{ message: error.message }] 
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // GET 请求返回 GraphQL Playground 或简单信息
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          message: 'DeepSeek GraphQL API is running!',
          endpoint: '/graphql'
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders,
    });
  },
};