# AI Travel Agent (LangChainApp Frontend)

这是一个基于 Next.js 构建的智能旅行代理前端应用，对接 LangChainApp 后端 API。

## 功能特性

- **实时对话**: 基于 SSE (Server-Sent Events) 实现流式响应，采用 Gemini 风格的渐变出现动画。
- **智能交互**: 支持富交互组件（方案选择、航班预订、酒店预订），通过弹窗形式展示。
- **状态感知**: 实时展示 AI 思考状态，使用浮动胶囊样式显示在消息下方。
- **美观界面**: 使用 Ant Design 和 CSS Modules 构建的现代化聊天界面。
- **Markdown 支持**: AI 回复支持完整的 Markdown 渲染。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI 组件库**: Ant Design 5.x
- **样式**: SCSS Modules, clsx
- **Markdown 渲染**: react-markdown
- **图标**: @ant-design/icons

## 快速开始

1.  **安装依赖**:

    ```bash
    pnpm install
    ```

2.  **配置环境变量**:

    在根目录创建 `.env.local` 文件，并配置 API 地址：

    ```env
    NEXT_PUBLIC_API_ENDPOINT=http://localhost:8000/vibe/stream
    ```

3.  **启动开发服务器**:

    ```bash
    pnpm dev
    ```

    打开 [http://localhost:3000/agent](http://localhost:3000/agent) 访问应用。

## 目录结构

```
src/app/agent/
├── components/
│   ├── ChatMessage.tsx       # 消息气泡组件（支持 Markdown 和渐变动画）
│   ├── ChatMessage.module.scss
│   ├── InteractionModal.tsx  # 交互弹窗组件（方案/航班/酒店选择）
│   └── ApprovalCard.tsx      # 审批确认卡片
├── hooks/
│   └── useAgentStream.ts     # 核心 Hook，处理 SSE 连接和消息状态管理
├── types.ts                  # 类型定义（AgentEvent, ChatMessage）
├── page.tsx                  # 主页面
└── page.module.scss          # 页面样式
```

## API 对接说明

本项目对接 `/vibe/stream` 接口，支持以下 SSE 事件：

| 事件类型 | 说明 | 前端处理 |
|---------|------|---------|
| `message` | 文本消息 | 追加到当前气泡，支持流式 |
| `status` | 系统状态 | 显示浮动状态提示 |
| `control` | 交互组件 | 弹出选择弹窗 |
| `error` | 错误信息 | 控制台输出 |

### 交互组件类型

- `select_plan`: 方案选择（卡片形式）
- `select_flight`: 航班选择（表格形式）
- `select_hotel`: 酒店选择（表格形式）

## 核心功能说明

### 消息渲染
- 使用 Gemini 风格的渐变动画（由浅到深、模糊到清晰）
- 流式消息实时追加内容
- 完整的 Markdown 支持

### 交互弹窗
- 收到 `control` 事件时自动弹出选择弹窗
- 用户选择后自动发送选择结果给后端
- 聊天界面显示友好的选择结果（如"我选择了 经济游"）

### 状态提示
- 浮动胶囊样式，带 Loading 动画
- 收到新消息或交互组件时自动隐藏
