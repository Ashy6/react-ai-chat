# DeepSeek GraphQL Cloudflare Worker

这个 Cloudflare Worker 提供了一个 GraphQL API，用于与 DeepSeek AI 模型进行交互。

## 功能特性

- 🚀 基于 Cloudflare Workers 的高性能 GraphQL API
- 🤖 集成 DeepSeek AI 模型
- 💾 使用 KV 存储管理聊天会话
- 🔒 支持 CORS 和认证
- 📝 完整的消息历史记录

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 KV 存储

```bash
# 创建生产环境 KV 存储
wrangler kv:namespace create "CHAT_SESSIONS"

# 创建预览环境 KV 存储
wrangler kv:namespace create "CHAT_SESSIONS" --preview
```

### 4. 更新 wrangler.toml

将上一步创建的 KV 存储 ID 更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "CHAT_SESSIONS"
id = "your-actual-kv-namespace-id"
preview_id = "your-actual-preview-kv-namespace-id"
```

### 5. 设置环境变量

```bash
# 设置 DeepSeek API Key
wrangler secret put DEEPSEEK_API_KEY
```

### 6. 部署 Worker

```bash
# 开发模式
npm run dev

# 部署到生产环境
npm run deploy
```

## GraphQL Schema

### 查询 (Queries)

```graphql
# 测试连接
query {
  hello
}

# 获取聊天会话
query GetChatSession($sessionId: String!) {
  getChatSession(sessionId: $sessionId) {
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
```

### 变更 (Mutations)

```graphql
# 创建新的聊天会话
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

# 发送消息
mutation SendMessage($input: SendMessageInput!) {
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
      updatedAt
    }
  }
}
```

## 使用示例

### 创建聊天会话

```javascript
const response = await fetch('https://your-worker.your-subdomain.workers.dev/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      mutation {
        createChatSession {
          id
          createdAt
        }
      }
    `
  })
});
```

### 发送消息

```javascript
const response = await fetch('https://your-worker.your-subdomain.workers.dev/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      mutation SendMessage($input: SendMessageInput!) {
        sendMessage(input: $input) {
          message {
            content
            role
          }
        }
      }
    `,
    variables: {
      input: {
        sessionId: "your-session-id",
        content: "你好，请介绍一下自己",
        role: "USER"
      }
    }
  })
});
```

## 环境变量

- `DEEPSEEK_API_KEY`: DeepSeek API 密钥（通过 wrangler secret 设置）
- `CHAT_SESSIONS`: KV 存储绑定（在 wrangler.toml 中配置）

## 故障排除

### 1. KV 存储问题

确保 KV 存储已正确创建并在 `wrangler.toml` 中配置了正确的 ID。

### 2. API Key 问题

确保 DeepSeek API Key 已正确设置：

```bash
wrangler secret list
```

### 3. CORS 问题

Worker 已配置了 CORS 头，支持跨域请求。

### 4. 查看日志

```bash
wrangler tail
```

## 性能优化

- 使用 KV 存储缓存聊天会话
- 实现请求限流
- 优化 GraphQL 查询解析
- 添加错误重试机制

## 安全考虑

- API Key 通过 Cloudflare Secrets 安全存储
- 实现适当的认证机制
- 添加请求验证和清理
- 监控异常请求模式