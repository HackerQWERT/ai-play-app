"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, AgentEvent } from "../types"; // 确保引入了上面定义的类型

export function useAgentStream(apiEndpoint: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const currentMessageRef = useRef<ChatMessage | null>(null);

    const sendMessage = useCallback(
        async (query: string) => {
            if (!query.trim() || isLoading) return;

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
                toolCalls: [], // 初始化工具调用列表
                isStreaming: true,
            };

            currentMessageRef.current = assistantMessage;
            setMessages((prev) => [...prev, assistantMessage]);

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                // 注意：这里已经按你之前的修改，去掉了外层的 { messages: ... } 包裹，直接发数组
                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ messages: [...messages, userMessage] }),
                    signal: abortController.signal,
                });

                if (!response.ok) throw new Error(response.statusText);
                if (!response.body) throw new Error("No response body");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = ""; // 添加 buffer 处理跨包截断的情况

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    // SSE 消息通常以双换行符分隔
                    const lines = buffer.split("\n\n");
                    // 保留最后一个可能不完整的片段在 buffer 中
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine.startsWith("data: ")) continue;

                        const dataStr = trimmedLine.slice(6);
                        if (!dataStr || dataStr === "[DONE]") continue;

                        try {
                            const parsedEvent: AgentEvent = JSON.parse(dataStr);

                            // === 核心修改：根据新的 event 类型进行分发 ===
                            switch (parsedEvent.event) {
                                case "delta":
                                    // 处理文本流：直接追加字符串
                                    if (currentMessageRef.current) {
                                        currentMessageRef.current.content += parsedEvent.data;
                                        // 强制触发 React 重渲染
                                        setMessages((prev) => [...prev]);
                                    }
                                    break;

                                case "tool_call":
                                    // 处理工具调用开始：可以在 UI 上显示 "正在查询酒店..."
                                    if (currentMessageRef.current) {
                                        const toolName = parsedEvent.data.name;
                                        const newToolCall = { name: toolName, status: "calling" as const };

                                        const existingTools = currentMessageRef.current.toolCalls || [];
                                        currentMessageRef.current.toolCalls = [...existingTools, newToolCall];
                                        setMessages((prev) => [...prev]);
                                    }
                                    break;

                                case "tool_result":
                                    // 处理工具调用结束
                                    if (currentMessageRef.current) {
                                        const toolName = parsedEvent.data.name;
                                        // 更新对应工具的状态为 done
                                        if (currentMessageRef.current.toolCalls) {
                                            currentMessageRef.current.toolCalls = currentMessageRef.current.toolCalls.map(t =>
                                                t.name === toolName ? { ...t, status: "done" } : t
                                            );
                                            setMessages((prev) => [...prev]);
                                        }
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

                // 错误处理：在消息中显示错误提示
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                        lastMessage.isStreaming = false;
                        lastMessage.content += "\n[连接中断，请重试]";
                    }
                    return newMessages;
                });
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;

                // 结束流状态
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage?.role === "assistant") {
                        lastMessage.isStreaming = false;
                    }
                    return newMessages;
                });
            }
        },
        [apiEndpoint, isLoading, messages]
    );

    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        stopStream();
    }, [stopStream]);

    return {
        messages,
        isLoading,
        sendMessage,
        stopStream,
        clearMessages,
    };
}