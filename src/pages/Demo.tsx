import React, { useState } from 'react';
import { ChatContainer, CompactChatContainer } from '../components/ChatContainer';
import { useChatSessions } from '../hooks/useChat';
import type { Message } from '../lib/types';

/**
 * 模拟 AI 回复的函数
 */
const simulateAIResponse = async (userMessage: string): Promise<string> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // 简单的回复逻辑
  const responses = [
    `我理解你说的"${userMessage}"，这是一个很有趣的话题。`,
    `关于"${userMessage}"，我觉得可以从多个角度来看待这个问题。`,
    `你提到的"${userMessage}"让我想到了很多相关的内容，让我详细解释一下。`,
    `"${userMessage}"确实是个值得深入讨论的话题，我来分享一些我的想法。`,
    `基于你的问题"${userMessage}"，我建议我们可以这样分析...`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * 演示页面组件
 */
export function Demo() {
  const [activeTab, setActiveTab] = useState<'standard' | 'compact' | 'custom' | 'graphql'>('standard');
  const [useGraphQL, setUseGraphQL] = useState(false);
  const chatSessions = useChatSessions();

  // 处理消息发送
  const handleSendMessage = async (message: string): Promise<string> => {
    return await simulateAIResponse(message);
  };

  // 初始消息
  const initialMessages: Message[] = [
    {
      id: '1',
      content: '你好！我是 AI 助手，有什么可以帮助你的吗？',
      sender: 'ai',
      timestamp: Date.now() - 60000
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 聊天框组件演示
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基于 React + TypeScript + TailwindCSS 构建的现代化聊天组件，
            支持本地存储、自动滚动、响应式设计等功能。
          </p>
        </div>

        {/* 功能特性 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">智能对话</h3>
            <p className="text-gray-600">支持实时消息发送和接收，模拟真实的 AI 对话体验</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">本地存储</h3>
            <p className="text-gray-600">自动保存聊天历史到本地存储，刷新页面后数据不丢失</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">响应式设计</h3>
            <p className="text-gray-600">完美适配桌面端和移动端，提供一致的用户体验</p>
          </div>
        </div>

        {/* GraphQL 开关 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">GraphQL 模式</h3>
              <p className="text-sm text-gray-600 mt-1">
                {useGraphQL ? '当前使用 GraphQL API（需要后端服务）' : '当前使用模拟数据'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useGraphQL}
                onChange={(e) => setUseGraphQL(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {useGraphQL ? 'GraphQL' : '模拟数据'}
              </span>
            </label>
          </div>
        </div>

        {/* 选项卡导航 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'standard', label: '标准版本', desc: '完整功能的聊天组件' },
                { key: 'compact', label: '紧凑版本', desc: '简化版聊天组件' },
                { key: 'custom', label: '自定义配置', desc: '可配置的聊天组件' },
                { key: 'graphql', label: 'GraphQL 测试', desc: 'GraphQL 功能测试' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{tab.desc}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* 选项卡内容 */}
          <div className="p-6">
            {activeTab === 'standard' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">标准聊天组件</h3>
                  <p className="text-gray-600 mb-4">
                    包含完整的聊天头部、消息列表、输入框和状态指示器。支持清空历史记录功能。
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <ChatContainer
                    onSendMessage={handleSendMessage}
                    initialMessages={initialMessages}
                    placeholder="输入消息开始对话..."
                    maxHeight="500px"
                    enableHistory={true}
                    useGraphQL={useGraphQL}
                    userId="demo-user-1"
                  />
                </div>
              </div>
            )}

            {activeTab === 'compact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">紧凑聊天组件</h3>
                  <p className="text-gray-600 mb-4">
                    简化版本，去除了头部区域，适合嵌入到其他页面中使用。
                  </p>
                </div>
                <div className="max-w-xl mx-auto">
                  <CompactChatContainer
                    onSendMessage={handleSendMessage}
                    initialMessages={initialMessages.slice(0, 1)}
                    placeholder="输入消息..."
                    maxHeight="400px"
                    enableHistory={true}
                    useGraphQL={useGraphQL}
                    userId="demo-user-2"
                  />
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">自定义配置</h3>
                  <p className="text-gray-600 mb-4">
                    展示不同配置选项的效果，包括禁用历史记录、自定义占位符等。
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 禁用历史记录 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">禁用历史记录</h4>
                    <ChatContainer
                      onSendMessage={handleSendMessage}
                      placeholder="此会话不会保存历史记录"
                      maxHeight="350px"
                      enableHistory={false}
                      useGraphQL={useGraphQL}
                      userId="demo-user-3"
                    />
                  </div>
                  
                  {/* 自定义样式 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">自定义占位符</h4>
                    <CompactChatContainer
                      onSendMessage={handleSendMessage}
                      placeholder="🤖 向 AI 助手提问任何问题..."
                      maxHeight="350px"
                      enableHistory={true}
                      useGraphQL={useGraphQL}
                      userId="demo-user-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'graphql' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">GraphQL 功能测试</h3>
                  <p className="text-gray-600 mb-4">
                    测试 GraphQL 集成功能。启用 GraphQL 模式后，聊天组件将尝试连接到 GraphQL 服务器。
                  </p>
                  
                  {/* GraphQL 状态指示 */}
                  <div className={`p-4 rounded-lg border ${
                    useGraphQL 
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        useGraphQL ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium">
                        {useGraphQL ? 'GraphQL 模式已启用' : 'GraphQL 模式已禁用'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">
                      {useGraphQL 
                        ? '组件将尝试连接到 GraphQL 端点：' + (import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql')
                        : '当前使用模拟数据进行演示'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <ChatContainer
                    onSendMessage={handleSendMessage}
                    initialMessages={useGraphQL ? [] : initialMessages}
                    placeholder={useGraphQL ? "测试 GraphQL 消息发送..." : "GraphQL 模式未启用，使用模拟数据..."}
                    maxHeight="500px"
                    enableHistory={true}
                    useGraphQL={useGraphQL}
                    userId="graphql-test-user"
                  />
                </div>
                
                {/* GraphQL 配置信息 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">GraphQL 配置信息</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><strong>端点：</strong> {import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'}</div>
                    <div><strong>状态：</strong> {useGraphQL ? '已启用' : '已禁用'}</div>
                    <div><strong>用户ID：</strong> graphql-test-user</div>
                    <div><strong>会话管理：</strong> 自动创建</div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <strong>注意：</strong> 启用 GraphQL 模式需要后端服务运行在配置的端点上。
                    如果连接失败，组件会显示错误信息。
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 存储统计 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">本地存储统计</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{chatSessions.sessions.length}</div>
              <div className="text-sm text-gray-600">聊天会话</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {chatSessions.sessions.reduce((total, session) => total + session.messages.length, 0)}
              </div>
              <div className="text-sm text-gray-600">总消息数</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {chatSessions.sessions.length > 0 ? new Date().toLocaleDateString() : '无'}
              </div>
              <div className="text-sm text-gray-600">最后更新</div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">使用说明</h3>
          <div className="space-y-2 text-blue-800">
            <p>• 输入消息后按 Enter 键发送，Shift + Enter 换行</p>
            <p>• 聊天历史会自动保存到浏览器本地存储</p>
            <p>• 点击头部的垃圾桶图标可以清空聊天历史</p>
            <p>• 组件支持响应式设计，在移动设备上也能正常使用</p>
            <p>• 消息列表会自动滚动到底部，也可以手动滚动查看历史消息</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Demo;