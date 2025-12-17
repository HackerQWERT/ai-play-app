# AI Travel Agent (LangChainApp Frontend)

这是一个基于 Next.js 构建的智能旅行代理前端应用，对接 LangChainApp 后端 API。

## 功能特性

- **实时对话**: 基于 SSE (Server-Sent Events) 实现打字机效果的流式响应。
- **智能交互**: 支持富交互组件（方案选择、航班预订、酒店预订）。
- **状态感知**: 实时展示 AI 思考状态（"正在思考..."、"正在查询航班..."）。
- **美观界面**: 使用 Ant Design 和 CSS Modules 构建的现代化聊天界面。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI 组件库**: Ant Design
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
│   ├── ChatMessage.tsx       # 消息气泡组件（支持 Markdown 和打字机效果）
│   ├── InteractionModal.tsx  # 交互弹窗组件（方案/航班/酒店选择）
│   └── ...
├── hooks/
│   └── useAgentStream.ts     # 核心 Hook，处理 SSE 连接和消息状态管理
├── types.ts                  # 类型定义
├── page.tsx                  # 主页面
└── page.module.scss          # 页面样式
```

## API 对接说明

本项目对接 `/vibe/stream` 接口，支持以下 SSE 事件：

- `message`: 文本消息（支持流式追加）。
- `status`: 系统状态更新。
- `control`: 触发交互组件（`select_plan`, `select_flight`, `select_hotel`）。
- `error`: 错误处理。
