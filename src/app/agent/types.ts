// 定义后端返回的事件结构
export type AgentEvent =
    | {
        event: "delta";
        data: string; // delta 的 data 是直接的字符串
    }
    | {
        event: "tool_call";
        data: {
            name: string;
            inputs: any;
        };
    }
    | {
        event: "tool_result";
        data: {
            name: string;
            content: string;
            status: string;
        };
    }
    | {
        event: "error";
        data: any;
    };

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    toolCalls?: Array<{ name: string; status: "calling" | "done" }>; // 用于在UI上显示正在调用工具
    isStreaming?: boolean;
}