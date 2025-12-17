// 定义后端返回的 SSE 事件结构
export type AgentEvent =
    | {
        event: "message";
        data: {
            content: string;
            is_stream: boolean;
        };
    }
    | {
        event: "status";
        data: {
            content: string;
            node: string;
        };
    }
    | {
        event: "control";
        data: {
            type: "select_plan" | "select_flight" | "select_hotel";
            options: any[];
        };
    }
    | {
        event: "error";
        data: {
            message: string;
        };
    };

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
    // 新增：用于存储交互组件数据
    control?: {
        type: "select_plan" | "select_flight" | "select_hotel";
        options: any[];
        isInteracted?: boolean; // 标记是否已交互
    };
}

// 移除旧的 Tool 相关定义，因为新文档没有提到 tool_call/tool_result 事件
// 如果需要保留旧逻辑作为兼容，可以保留，但根据要求是“完全重构”，所以我将移除不相关的部分以保持清洁。
