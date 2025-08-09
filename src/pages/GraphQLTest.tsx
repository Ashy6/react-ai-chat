import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CHAT_SESSION, SEND_MESSAGE, GET_CHAT_SESSION } from '../lib/graphql-queries';

const GraphQLTest: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState('你好，这是一条测试消息');
  const [logs, setLogs] = useState<string[]>([]);

  // GraphQL mutations and queries
  const [createSession] = useMutation(CREATE_CHAT_SESSION);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { data: sessionData, refetch } = useQuery(GET_CHAT_SESSION, {
    variables: { sessionId },
    skip: !sessionId,
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[GraphQL Test] ${message}`);
  };

  const handleCreateSession = async () => {
    try {
      addLog('🔄 创建新的聊天会话...');
      const result = await createSession();
      
      if (result.errors) {
        addLog(`❌ 创建会话失败: ${result.errors.map(e => e.message).join(', ')}`);
        return;
      }
      
      const newSessionId = result.data?.createChatSession?.id;
      if (newSessionId) {
        setSessionId(newSessionId);
        addLog(`✅ 会话创建成功，ID: ${newSessionId}`);
      } else {
        addLog('❌ 创建会话失败：未返回会话ID');
      }
    } catch (error) {
      addLog(`❌ 创建会话异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSendMessage = async () => {
    if (!sessionId) {
      addLog('❌ 请先创建会话');
      return;
    }

    try {
      addLog(`🔄 发送消息: "${testMessage}"`);
      
      const input = {
        sessionId,
        content: testMessage,
        role: 'USER' as const
      };
      
      addLog(`📤 发送参数: ${JSON.stringify(input)}`);
      
      const result = await sendMessage({
        variables: { input }
      });
      
      addLog(`📥 GraphQL 响应: ${JSON.stringify(result, null, 2)}`);
      
      if (result.errors) {
        addLog(`❌ 发送消息失败: ${result.errors.map(e => e.message).join(', ')}`);
        return;
      }
      
      const message = result.data?.sendMessage?.message;
      if (message) {
        addLog(`✅ 消息发送成功`);
        addLog(`🤖 AI 回复: "${message.content}"`);
        
        // 检查是否是错误消息
        if (message.content === '抱歉，我现在无法回复。请稍后再试。') {
          addLog('⚠️ 检测到错误回复消息！');
        }
      } else {
        addLog('❌ 发送消息失败：未返回消息数据');
      }
      
      // 刷新会话数据
      await refetch();
      
    } catch (error) {
      addLog(`❌ 发送消息异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    addLog('🚀 GraphQL 测试页面已加载');
    addLog(`📍 GraphQL 端点: ${import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:8787'}`);
    addLog(`🔧 GraphQL 模式: ${import.meta.env.VITE_ENABLE_GRAPHQL || 'false'}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">GraphQL 聊天功能测试</h1>
        
        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制面板</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前会话ID:
              </label>
              <input 
                type="text" 
                value={sessionId || ''} 
                readOnly 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="未创建会话"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试消息:
              </label>
              <input 
                type="text" 
                value={testMessage} 
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={handleCreateSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                创建会话
              </button>
              
              <button 
                onClick={handleSendMessage}
                disabled={!sessionId}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                发送消息
              </button>
              
              <button 
                onClick={clearLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
              >
                清空日志
              </button>
            </div>
          </div>
        </div>
        
        {/* 会话数据显示 */}
        {sessionData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">当前会话数据</h2>
            <div className="space-y-4">
              <div>
                <strong>会话ID:</strong> {sessionData.getChatSession?.id}
              </div>
              <div>
                <strong>创建时间:</strong> {sessionData.getChatSession?.createdAt}
              </div>
              <div>
                <strong>更新时间:</strong> {sessionData.getChatSession?.updatedAt}
              </div>
              <div>
                <strong>消息数量:</strong> {sessionData.getChatSession?.messages?.length || 0}
              </div>
              
              {sessionData.getChatSession?.messages && sessionData.getChatSession.messages.length > 0 && (
                <div>
                  <strong>消息列表:</strong>
                  <div className="mt-2 space-y-2">
                    {sessionData.getChatSession.messages.map((msg: any, index: number) => (
                      <div key={index} className={`p-3 rounded-md ${
                        msg.role === 'USER' ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-green-50 border-l-4 border-green-400'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-600">
                              {msg.role === 'USER' ? '👤 用户' : '🤖 AI'}
                            </div>
                            <div className="mt-1 text-gray-900">{msg.content}</div>
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 日志显示 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">测试日志</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">暂无日志...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphQLTest;