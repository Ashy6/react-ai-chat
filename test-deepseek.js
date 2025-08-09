// DeepSeek API 测试文件
// 用于排查 AI 聊天功能返回错误消息的问题

const DEEPSEEK_API_KEY = 'sk-137435b78e3748b58002cc9cb9292632';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 直接测试 DeepSeek API 调用
async function testDeepSeekAPI() {
  console.log('🔍 开始测试 DeepSeek API 调用...');
  console.log('API Key:', DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.substring(0, 10)}...` : '未设置');
  
  const testMessages = [
    {
      role: 'user',
      content: '你好，请简单回复一下测试消息'
    }
  ];

  try {
    console.log('📤 发送请求到 DeepSeek API...');
    console.log('请求数据:', JSON.stringify({
      model: 'deepseek-chat',
      messages: testMessages,
      max_tokens: 2000,
      temperature: 0.7
    }, null, 2));

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: testMessages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log('📥 收到响应:');
    console.log('状态码:', response.status);
    console.log('状态文本:', response.statusText);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('原始响应内容:', responseText);

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}\n响应内容: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('✅ API 调用成功!');
    console.log('解析后的响应:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('🤖 AI 回复:', data.choices[0].message.content);
      return data.choices[0].message.content;
    } else {
      console.log('⚠️ 响应格式异常，未找到 choices[0].message.content');
      return null;
    }
  } catch (error) {
    console.error('❌ DeepSeek API 调用失败:', error.message);
    console.error('错误详情:', error);
    return null;
  }
}

// 测试本地 GraphQL 端点
async function testLocalGraphQL() {
  console.log('\n🔍 开始测试本地 GraphQL 端点...');
  
  const graphqlEndpoint = 'http://localhost:8787';
  
  try {
    // 1. 测试创建会话
    console.log('📤 测试创建聊天会话...');
    const createSessionQuery = {
      query: `
        mutation {
          createChatSession {
            id
            messages {
              id
              content
              role
              timestamp
            }
            createdAt
            updatedAt
          }
        }
      `
    };

    const createResponse = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createSessionQuery),
    });

    console.log('创建会话响应状态:', createResponse.status);
    const createResult = await createResponse.json();
    console.log('创建会话响应:', JSON.stringify(createResult, null, 2));

    if (createResult.errors) {
      console.error('❌ 创建会话失败:', createResult.errors);
      return;
    }

    const sessionId = createResult.data.createChatSession.id;
    console.log('✅ 会话创建成功，ID:', sessionId);

    // 2. 测试发送消息
    console.log('\n📤 测试发送消息...');
    const sendMessageQuery = {
      query: `
        mutation SendMessage($input: MessageInput!) {
          sendMessage(input: $input) {
            message {
              id
              content
              role
              timestamp
            }
            session {
              id
              messages {
                id
                content
                role
                timestamp
              }
            }
          }
        }
      `,
      variables: {
        input: {
          sessionId: sessionId,
          content: '你好，这是一条测试消息',
          role: 'USER'
        }
      }
    };

    const sendResponse = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendMessageQuery),
    });

    console.log('发送消息响应状态:', sendResponse.status);
    const sendResult = await sendResponse.json();
    console.log('发送消息响应:', JSON.stringify(sendResult, null, 2));

    if (sendResult.errors) {
      console.error('❌ 发送消息失败:', sendResult.errors);
      return;
    }

    console.log('✅ GraphQL 测试完成');
    
    // 检查最后一条消息
    const messages = sendResult.data.sendMessage.session.messages;
    const lastMessage = messages[messages.length - 1];
    console.log('🤖 最后一条消息:', lastMessage);
    
    if (lastMessage.content === '抱歉，我现在无法回复。请稍后再试。') {
      console.log('⚠️ 发现问题：AI 返回了错误消息');
    } else {
      console.log('✅ AI 正常回复');
    }

  } catch (error) {
    console.error('❌ GraphQL 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始 DeepSeek API 诊断测试\n');
  
  // 测试 1: 直接调用 DeepSeek API
  await testDeepSeekAPI();
  
  // 测试 2: 测试本地 GraphQL 端点
  await testLocalGraphQL();
  
  console.log('\n🏁 测试完成');
}

// 运行测试
runTests().catch(console.error);