# Cloudflare Workers 部署教程

本教程将指导您如何将本地可用的 Cloudflare Worker 成功部署到线上环境。

## 1. 环境准备和配置

### 1.1 安装必要工具

确保您已安装以下工具：

```bash
# 安装 Node.js (推荐 18+ 版本)
node --version
npm --version

# 全局安装 Wrangler CLI
npm install -g wrangler

# 验证安装
wrangler --version
```

### 1.2 Cloudflare 账户设置

1. 注册或登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 获取您的账户 ID：
   - 在右侧边栏找到 "Account ID"
   - 复制并保存此 ID

### 1.3 认证配置

```bash
# 登录 Cloudflare 账户
wrangler auth login

# 或者使用 API Token（推荐）
wrangler auth token
```

## 2. 项目配置

### 2.1 检查 wrangler.toml 配置

确保您的 `worker/wrangler.toml` 文件配置正确：

```toml
name = "deepseek-graphql-api"
main = "index.js"
compatibility_date = "2024-01-15"

# KV 存储配置
[[kv_namespaces]]
binding = "CHAT_SESSIONS"
id = "your-kv-namespace-id"  # 需要替换为实际的 KV ID
preview_id = "your-preview-kv-id"  # 需要替换为实际的预览 KV ID

# 环境变量
[vars]
NODE_ENV = "production"

# 本地开发环境变量
[env.development.vars]
NODE_ENV = "development"
```

### 2.2 创建 KV 存储

```bash
# 进入 worker 目录
cd worker

# 创建生产环境 KV 存储
wrangler kv:namespace create "CHAT_SESSIONS"

# 创建预览环境 KV 存储
wrangler kv:namespace create "CHAT_SESSIONS" --preview
```

执行后会得到类似输出：
```
🌀 Creating namespace with title "deepseek-graphql-api-CHAT_SESSIONS"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "CHAT_SESSIONS", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

将获得的 ID 更新到 `wrangler.toml` 文件中。

## 3. 环境变量和密钥设置

### 3.1 设置 DeepSeek API Key

```bash
# 设置生产环境密钥
wrangler secret put DEEPSEEK_API_KEY
# 输入您的 DeepSeek API Key

# 验证密钥是否设置成功
wrangler secret list
```

### 3.2 本地开发环境变量

在 `worker/.dev.vars` 文件中添加：

```env
# 本地开发环境变量文件
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

**注意**：`.dev.vars` 文件已在 `.gitignore` 中，不会被提交到版本控制。

## 4. 部署步骤

### 4.1 预部署检查

```bash
# 进入 worker 目录
cd worker

# 检查配置
wrangler whoami
wrangler kv:namespace list
wrangler secret list
```

### 4.2 执行部署

```bash
# 部署到生产环境
wrangler deploy

# 或者指定环境
wrangler deploy --env production
```

成功部署后，您会看到类似输出：
```
✨ Success! Uploaded 1 files (x.xx sec)
✨ Deployment complete! Take a flight at https://deepseek-graphql-api.your-subdomain.workers.dev
```

### 4.3 验证部署

```bash
# 测试部署的 Worker
curl https://your-worker-url.workers.dev

# 测试 GraphQL 端点
curl -X POST https://your-worker-url.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

## 5. 前端配置更新

### 5.1 更新环境变量

在项目根目录的 `.env` 文件中更新：

```env
# GraphQL 端点配置
VITE_GRAPHQL_ENDPOINT=https://your-worker-url.workers.dev/graphql

# 启用 GraphQL 模式
VITE_ENABLE_GRAPHQL=true

# 生产环境标识
VITE_NODE_ENV=production
```

### 5.2 重新构建前端

```bash
# 重新构建前端应用
npm run build

# 预览构建结果
npm run preview
```

## 6. 常见问题排查

### 6.1 部署失败

**问题**：`Error: A request to the Cloudflare API failed`

**解决方案**：
```bash
# 重新认证
wrangler auth login

# 检查账户权限
wrangler whoami
```

### 6.2 KV 存储错误

**问题**：`Error: KV namespace not found`

**解决方案**：
```bash
# 检查 KV 命名空间
wrangler kv:namespace list

# 重新创建 KV 存储
wrangler kv:namespace create "CHAT_SESSIONS"
```

### 6.3 环境变量问题

**问题**：`DEEPSEEK_API_KEY is not configured`

**解决方案**：
```bash
# 检查密钥列表
wrangler secret list

# 重新设置密钥
wrangler secret put DEEPSEEK_API_KEY
```

### 6.4 CORS 错误

**问题**：前端请求被 CORS 策略阻止

**解决方案**：检查 Worker 代码中的 CORS 头设置：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 6.5 调试和日志

```bash
# 查看实时日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --since 1h

# 过滤错误日志
wrangler tail --level error
```

## 7. 部署后验证清单

- [ ] Worker 部署成功，可以访问基础端点
- [ ] GraphQL 端点响应正常
- [ ] KV 存储可以正常读写
- [ ] DeepSeek API 调用正常
- [ ] 前端可以成功连接到线上 Worker
- [ ] 聊天功能完整可用
- [ ] 错误处理和日志记录正常

## 8. 生产环境最佳实践

### 8.1 监控和告警

- 在 Cloudflare Dashboard 中设置告警规则
- 监控 Worker 的请求量和错误率
- 定期检查 KV 存储使用情况

### 8.2 安全考虑

- 定期轮换 API 密钥
- 实施适当的速率限制
- 考虑添加身份验证机制

### 8.3 性能优化

- 监控响应时间
- 优化 KV 存储访问模式
- 考虑实施缓存策略

## 9. 故障恢复

### 9.1 回滚部署

```bash
# 查看部署历史
wrangler deployments list

# 回滚到指定版本
wrangler rollback [deployment-id]
```

### 9.2 数据备份

```bash
# 导出 KV 数据
wrangler kv:bulk get --binding CHAT_SESSIONS > backup.json

# 恢复 KV 数据
wrangler kv:bulk put --binding CHAT_SESSIONS backup.json
```

---

通过以上步骤，您应该能够成功将本地可用的 Cloudflare Worker 部署到线上环境。如果遇到问题，请参考常见问题排查部分，或查看 Cloudflare Workers 官方文档获取更多帮助。