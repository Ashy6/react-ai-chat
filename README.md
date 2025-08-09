# React AI Chat Component

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