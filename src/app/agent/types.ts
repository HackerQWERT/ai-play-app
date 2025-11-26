// 后端 SSE 事件类型
export type AgentEvent =
    | MessageEvent
    | ToolCallEvent
    | ToolResultEvent;

export interface MessageEvent {
    event: "message";
    agent: string;
    data: string;
}

export interface ToolCallEvent {
    event: "tool_call";
    agent: string;
    data: {
        name: string;
        args: Record<string, any>;
        id: string;
    };
}

export interface ToolResultEvent {
    event: "tool_result";
    agent: string;
    data: {
        name: string;
        result: string;
        tool_call_id: string;
    };
}

// 前端消息类型
export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    agent?: string;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
    isStreaming?: boolean;
}

export interface ToolCall {
    id: string;
    name: string;
    args: Record<string, any>;
    agent: string;
}

export interface ToolResult {
    id: string;
    name: string;
    result: string;
    agent: string;
    toolCallId: string;
}
