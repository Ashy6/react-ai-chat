# DeepSeek + Cloudflare Workers + React 部署指南

本指南将帮助您将 React AI 聊天应用与 DeepSeek API 通过 Cloudflare Workers 连接起来。

## 📋 前置要求

- Cloudflare 账户
- DeepSeek API Key
- Node.js 和 npm/pnpm
- Git

## 🚀 部署步骤

### 第一步：准备 Cloudflare 环境

#### 1.1 安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 1.2 登录 Cloudflare

```bash
wrangler login
```

这将打开浏览器，请登录您的 Cloudflare 账户并授权。

### 第二步：配置 Cloudflare Worker

#### 2.1 创建 KV 存储

```bash
# 进入 worker 目录
cd worker

# 创建生产环境 KV 存储
wrangler kv:namespace create "CHAT_SESSIONS"

# 创建预览环境 KV 存储  
wrangler kv:namespace create "CHAT_SESSIONS" --preview
```

#### 2.2 更新 wrangler.toml

将上一步输出的 KV 存储 ID 复制到 `worker/wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "CHAT_SESSIONS"
id = "your-actual-kv-namespace-id"        # 替换为实际的 ID
preview_id = "your-actual-preview-kv-namespace-id"  # 替换为实际的预览 ID
```

#### 2.3 设置 DeepSeek API Key

```bash
# 在 worker 目录下执行
wrangler secret put DEEPSEEK_API_KEY
```

输入您的 DeepSeek API Key。

#### 2.4 部署 Worker

```bash
# 安装依赖
npm install

# 本地测试
npm run dev

# 部署到生产环境
npm run deploy
```

部署成功后，您会看到类似这样的输出：
```
✨ Success! Deployed to https://deepseek-graphql-api.your-subdomain.workers.dev
```

### 第三步：配置前端项目

#### 3.1 创建环境变量文件

在项目根目录创建 `.env` 文件：

```bash
# 复制示例文件
cp .env.example .env
```

#### 3.2 更新环境变量

编辑 `.env` 文件，将 Worker URL 替换为您的实际 URL：

```env
# GraphQL API 配置
VITE_GRAPHQL_ENDPOINT=https://deepseek-graphql-api.your-subdomain.workers.dev/

# 启用 GraphQL
VITE_ENABLE_GRAPHQL=true

# 开发环境配置
VITE_NODE_ENV=development
```

#### 3.3 测试连接

启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:5173，测试聊天功能。

### 第四步：部署到 Cloudflare Pages

#### 4.1 连接 GitHub 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Pages" 部分
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 选择您的 GitHub 仓库

#### 4.2 配置构建设置

- **Framework preset**: React
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (项目根目录)

#### 4.3 设置环境变量

在 Cloudflare Pages 项目设置中添加环境变量：

```
VITE_GRAPHQL_ENDPOINT=https://deepseek-graphql-api.your-subdomain.workers.dev/
VITE_ENABLE_GRAPHQL=true
VITE_NODE_ENV=production
```

#### 4.4 部署

点击 "Save and Deploy"，Cloudflare Pages 将自动构建和部署您的应用。

## 🧪 测试部署

### 测试 Worker API

```bash
# 测试基本连接
curl https://deepseek-graphql-api.your-subdomain.workers.dev/

# 测试 GraphQL
curl -X POST https://deepseek-graphql-api.your-subdomain.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{"query": "{ hello }"}'
```

### 测试前端应用

1. 访问您的 Cloudflare Pages URL
2. 尝试发送消息
3. 检查是否收到 AI 回复

## 🔧 故障排除

### Worker 相关问题

#### 1. KV 存储错误

```bash
# 检查 KV 存储是否正确创建
wrangler kv:namespace list
```

#### 2. API Key 问题

```bash
# 检查 secrets 是否正确设置
wrangler secret list
```

#### 3. 查看 Worker 日志

```bash
# 实时查看日志
wrangler tail
```

### 前端相关问题

#### 1. CORS 错误

确保 Worker 中的 CORS 配置正确，检查 `worker/index.js` 中的 `corsHeaders`。

#### 2. GraphQL 连接失败

检查环境变量是否正确设置：

```bash
# 检查环境变量
echo $VITE_GRAPHQL_ENDPOINT
echo $VITE_ENABLE_GRAPHQL
```

#### 3. 构建错误

```bash
# 清理缓存并重新构建
rm -rf node_modules dist
npm install
npm run build
```

## 📊 监控和优化

### 1. Cloudflare Analytics

在 Cloudflare Dashboard 中查看：
- Worker 请求数量
- 响应时间
- 错误率

### 2. 性能优化

- 启用 Cloudflare 缓存
- 优化 GraphQL 查询
- 实现请求限流

### 3. 安全配置

- 设置适当的 CORS 策略
- 实现 API 密钥验证
- 添加请求频率限制

## 🔄 更新部署

### 更新 Worker

```bash
cd worker
npm run deploy
```

### 更新前端

推送代码到 GitHub，Cloudflare Pages 将自动重新部署。

## 📝 环境变量参考

### Worker 环境变量

| 变量名 | 类型 | 描述 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | Secret | DeepSeek API 密钥 |
| `CHAT_SESSIONS` | KV Binding | 聊天会话存储 |

### 前端环境变量

| 变量名 | 示例值 | 描述 |
|--------|--------|------|
| `VITE_GRAPHQL_ENDPOINT` | `https://worker.workers.dev/` | GraphQL API 端点 |
| `VITE_ENABLE_GRAPHQL` | `true` | 是否启用 GraphQL |
| `VITE_NODE_ENV` | `production` | 环境类型 |

## 🆘 获取帮助

如果遇到问题，请检查：

1. [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
3. [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
4. 项目的 GitHub Issues

## 🎉 完成！

恭喜！您已经成功部署了一个完整的 AI 聊天应用，包括：

- ✅ React 前端应用（Cloudflare Pages）
- ✅ GraphQL API（Cloudflare Workers）
- ✅ DeepSeek AI 集成
- ✅ 聊天会话存储（Cloudflare KV）

现在您可以享受与 AI 的对话了！