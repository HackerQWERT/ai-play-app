"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage, AgentEvent } from "../types";

// 简单的 UUID 生成器
const generateThreadId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export function useAgentStream(apiEndpoint: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    // 新增：是否正在等待用户确认（中断状态）
    const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const currentMessageRef = useRef<ChatMessage | null>(null);

    // 核心：使用 useRef 持久化 thread_id，保证整个会话上下文一致
    const threadIdRef = useRef<string>("");

    useEffect(() => {
        // 组件挂载时生成一个新的 Thread ID
        threadIdRef.current = generateThreadId();
    }, []);

    const sendMessage = useCallback(
        async (query: string, isApproval = false) => {
            if ((!query.trim() && !isApproval) || isLoading) return;

            // 如果是确认操作，我们清除等待状态
            if (isApproval) {
                setIsWaitingForApproval(false);
            }

            // 1. 添加用户消息
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content: query,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);

            // 2. 创建 AI 回复消息占位符
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: "",
                timestamp: new Date(),
                toolCalls: [],
                isStreaming: true,
            };

            currentMessageRef.current = assistantMessage;
            setMessages((prev) => [...prev, assistantMessage]);

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        // 每次请求都带上 thread_id
                        thread_id: threadIdRef.current,
                        // 传递消息历史或仅当前消息，取决于你后端的实现
                        // LangGraph MemorySaver 通常只需要最新的 input 即可，它自己会记历史
                        // 这里我们保持发送完整列表以防万一，但建议确认后端是否只需要 { message: query }
                        messages: [...messages, userMessage],
                    }),
                    signal: abortController.signal,
                });

                if (!response.ok) throw new Error(response.statusText);
                if (!response.body) throw new Error("No response body");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const lines = buffer.split("\n\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine.startsWith("data: ")) continue;

                        const dataStr = trimmedLine.slice(6);
                        if (!dataStr || dataStr === "[DONE]") continue;

                        try {
                            const parsedEvent: AgentEvent = JSON.parse(dataStr);

                            switch (parsedEvent.event) {
                                case "delta":
                                    if (currentMessageRef.current) {
                                        currentMessageRef.current.content += parsedEvent.data;
                                        setMessages((prev) => [...prev]);
                                    }
                                    break;

                                case "tool_call":
                                    if (currentMessageRef.current) {
                                        const toolName = parsedEvent.data.name;
                                        const newToolCall = { name: toolName, status: "calling" as const };

                                        const existingTools = currentMessageRef.current.toolCalls || [];
                                        const lastTool = existingTools[existingTools.length - 1];
                                        if (!(lastTool && lastTool.name === toolName && lastTool.status === 'calling')) {
                                            currentMessageRef.current.toolCalls = [...existingTools, newToolCall];
                                            setMessages((prev) => [...prev]);
                                        }
                                    }
                                    break;

                                case "tool_result":
                                    if (currentMessageRef.current) {
                                        let toolName = parsedEvent.data.name;

                                        // 兼容 Command 逻辑 (与之前相同)
                                        if (!toolName && (parsedEvent.data as any).type === 'Command') {
                                            const msgs = (parsedEvent.data as any).update?.messages;
                                            if (Array.isArray(msgs)) {
                                                const toolMsg = msgs.find((m: any) => m.type === 'tool' || m.name);
                                                if (toolMsg) toolName = toolMsg.name;
                                            }
                                        }

                                        if (!toolName && currentMessageRef.current.toolCalls) {
                                            const callingTool = currentMessageRef.current.toolCalls.find(t => t.status === 'calling');
                                            if (callingTool) toolName = callingTool.name;
                                        }

                                        if (currentMessageRef.current.toolCalls) {
                                            currentMessageRef.current.toolCalls = currentMessageRef.current.toolCalls.map(t =>
                                                (t.name === toolName || !toolName) ? { ...t, status: "done" } : t
                                            );
                                            setMessages((prev) => [...prev]);
                                        }
                                    }
                                    break;

                                // === 新增：处理中断 ===
                                case "interrupt":
                                    console.log("Stream interrupted for approval");
                                    setIsWaitingForApproval(true);
                                    // 可以在这里给最后一条消息加上标记，或者 UI 层根据 state 处理
                                    // 我们选择停止 loading，等待用户输入
                                    setIsLoading(false);
                                    if (abortControllerRef.current) {
                                        abortControllerRef.current.abort(); // 停止当前流
                                        abortControllerRef.current = null;
                                    }
                                    break;

                                case "error":
                                    console.error("Agent error:", parsedEvent.data);
                                    break;
                            }

                        } catch (e) {
                            console.error("Error parsing JSON:", e, "Raw data:", dataStr);
                        }
                    }
                }
            } catch (error: any) {
                if (error.name === "AbortError") return;
                console.error("Stream error:", error);
                // ... (错误处理逻辑不变)
            } finally {
                // 只有在非中断且非 loading 状态下才重置
                // 如果是 interrupt 触发的 break，我们在 case "interrupt" 里面已经处理了 isLoading
                if (!isWaitingForApproval) {
                    setIsLoading(false);
                    abortControllerRef.current = null;
                    // ... (状态清理逻辑不变)
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage?.role === "assistant") {
                            lastMessage.isStreaming = false;
                            if (lastMessage.toolCalls) {
                                lastMessage.toolCalls = lastMessage.toolCalls.map(t =>
                                    t.status === 'calling' ? { ...t, status: 'done' } : t
                                );
                            }
                        }
                        return newMessages;
                    });
                }
            }
        },
        [apiEndpoint, isLoading, messages, isWaitingForApproval] // 依赖项更新
    );

    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
        setIsWaitingForApproval(false); // 手动停止也取消等待
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        stopStream();
        // 清空消息时，重置 thread_id，开始新会话
        threadIdRef.current = generateThreadId();
    }, [stopStream]);

    return {
        messages,
        isLoading,
        isWaitingForApproval, // 导出新状态
        sendMessage,
        stopStream,
        clearMessages,
    };
}