# React AI Chat Component with DeepSeek Integration

一个现代化的 React AI 聊天组件，集成了 DeepSeek AI 模型，通过 Cloudflare Workers 提供 GraphQL API 服务。

## ✨ 特性

- 🤖 **DeepSeek AI 集成**: 使用 DeepSeek 的强大 AI 模型
- ⚡ **Cloudflare Workers**: 高性能的边缘计算 GraphQL API
- 🎨 **多种聊天样式**: 标准、紧凑、自定义三种聊天界面
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🔄 **实时对话**: 流畅的聊天体验
- 💾 **会话存储**: 基于 Cloudflare KV 的聊天历史记录
- 🎯 **TypeScript**: 完整的类型安全
- 🎨 **Tailwind CSS**: 现代化的样式系统

## 🏗️ 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Apollo GraphQL Client
- Vite

### 后端
- Cloudflare Workers
- GraphQL
- DeepSeek API
- Cloudflare KV Storage

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd react-ai
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置您的 GraphQL 端点。

### 4. 启动开发服务器

```bash
npm run dev
```

## 📦 部署指南

详细的部署步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)，包括：

- Cloudflare Workers 配置
- DeepSeek API 集成
- Cloudflare Pages 部署
- 环境变量设置

## 🔧 配置选项

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `VITE_GRAPHQL_ENDPOINT` | GraphQL API 端点 | - |
| `VITE_ENABLE_GRAPHQL` | 是否启用 GraphQL | `false` |
| `VITE_NODE_ENV` | 环境类型 | `development` |

### 聊天组件配置

```tsx
import { ChatContainer } from '@/components/ChatContainer';

<ChatContainer
  variant="standard" // "standard" | "compact" | "custom"
  enableGraphQL={true}
  placeholder="输入您的消息..."
/>
```

## 📁 项目结构

```
react-ai/
├── src/
│   ├── components/          # React 组件
│   │   ├── ChatContainer.tsx
│   │   ├── MessageList.tsx
│   │   └── MessageInput.tsx
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useChat.ts
│   │   └── useChatGraphQL.ts
│   ├── lib/                # 工具库
│   │   ├── apollo-client.ts
│   │   └── graphql-queries.ts
│   └── pages/              # 页面组件
│       └── Demo.tsx
├── worker/                 # Cloudflare Worker
│   ├── index.js           # Worker 主文件
│   ├── wrangler.toml      # Worker 配置
│   └── README.md          # Worker 文档
└── DEPLOYMENT.md          # 部署指南
```

## 🎯 使用示例

### 基础聊天组件

```tsx
import { useState } from 'react';
import { ChatContainer } from '@/components/ChatContainer';

function App() {
  return (
    <div className="h-screen">
      <ChatContainer 
        variant="standard"
        enableGraphQL={true}
      />
    </div>
  );
}
```

### 自定义样式

```tsx
<ChatContainer
  variant="custom"
  className="max-w-4xl mx-auto"
  messageClassName="bg-blue-50"
  inputClassName="border-blue-300"
/>
```

## 🔌 GraphQL API

### 查询示例

```graphql
# 创建聊天会话
mutation {
  createChatSession {
    id
    createdAt
  }
}

# 发送消息
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    message {
      content
      role
    }
    session {
      id
      messages {
        content
        role
        timestamp
      }
    }
  }
}
```

## 🛠️ 开发

### 本地开发

```bash
# 启动前端开发服务器
npm run dev

# 启动 Worker 本地开发
cd worker
npm run dev
```

### 构建

```bash
# 构建前端
npm run build

# 部署 Worker
cd worker
npm run deploy
```

## 🧪 测试

```bash
# 运行测试
npm test

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果您遇到问题，请：

1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 部署指南
2. 检查 [Issues](../../issues) 中的已知问题
3. 创建新的 Issue 描述您的问题

---

**享受与 AI 的对话吧！** 🎉

基于 React + TypeScript + TailwindCSS 的现代化 AI 聊天框组件，支持 Markdown 渲染、GraphQL 集成和响应式设计。

## ✨ 特性

- 🚀 **现代技术栈**: React 18 + TypeScript 5 + TailwindCSS 3 + Vite
- 💬 **AI 聊天对话**: 智能对话界面，支持实时消息交互
- 📝 **Markdown 渲染**: 支持 AI 回复的 Markdown 格式渲染
- 🔗 **GraphQL 集成**: 完整的 GraphQL 客户端配置和 Apollo Client 集成
- 📱 **响应式设计**: 适配桌面端和移动端
- 💾 **本地存储**: 聊天历史本地持久化
- 🛡️ **TypeScript**: 完整的类型支持和类型安全
- 🎨 **优雅 UI**: 基于 TailwindCSS 的现代化界面设计
- ⚡ **快捷键支持**: Enter 发送，Shift+Enter 换行
- 🔄 **自动滚动**: 智能消息列表滚动管理

## 🛠️ 技术栈

- **前端框架**: React 18.3.1
- **类型系统**: TypeScript 5.8.3
- **样式框架**: TailwindCSS 3.4.17
- **构建工具**: Vite 6.3.5
- **GraphQL**: Apollo Client 3.13.9
- **Markdown**: react-markdown 10.1.0
- **图标库**: Heroicons 2.2.0
- **状态管理**: Zustand 5.0.3

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/Ashy6/react-ai-chat.git
cd react-ai-chat

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 🚀 使用

### 基本使用

```tsx
import { ChatContainer } from './components/ChatContainer'

function App() {
  return (
    <div className="h-screen">
      <ChatContainer />
    </div>
  )
}
```

### 环境配置

复制 `.env.example` 到 `.env` 并配置相关参数：

```bash
# GraphQL 配置
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_ENABLE_GRAPHQL=false

# 其他配置...
```

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── ChatContainer.tsx    # 主聊天容器
│   ├── MessageList.tsx      # 消息列表
│   ├── MessageInput.tsx     # 消息输入框
│   └── Message.tsx          # 单条消息
├── hooks/              # 自定义 Hooks
│   ├── useChat.ts          # 聊天逻辑
│   ├── useChatGraphQL.ts   # GraphQL 聊天
│   ├── useLocalStorage.ts  # 本地存储
│   └── useAutoScroll.ts    # 自动滚动
├── lib/                # 工具库
│   ├── apollo-client.ts    # Apollo 客户端
│   ├── graphql-types.ts    # GraphQL 类型
│   ├── graphql-queries.ts  # GraphQL 查询
│   └── types.ts           # 通用类型
└── pages/              # 页面组件
    ├── Demo.tsx           # 演示页面
    └── Home.tsx          # 首页
```

## 🔧 开发

```bash
# 开发模式
pnpm dev

# 类型检查
pnpm check

# 代码检查
pnpm lint

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 🌟 核心功能

### 1. 聊天对话
- 支持用户输入和 AI 回复
- 实时消息显示
- 消息状态管理（发送中、已发送、错误）

### 2. Markdown 渲染
- AI 回复支持 Markdown 格式
- 代码高亮
- 表格、列表、链接等完整支持

### 3. GraphQL 集成
- Apollo Client 配置
- 错误处理和重试机制
- 类型安全的查询和变更

### 4. 响应式设计
- 移动端适配
- 灵活的布局系统
- 触摸友好的交互

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题，请通过 GitHub Issues 联系。
