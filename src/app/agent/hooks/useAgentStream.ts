"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, AgentEvent } from "../types";

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
                    // 确保这里发送的是数组，匹配你后端的定义
                    body: JSON.stringify({ messages: [...messages, userMessage] }),

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

                    // 处理粘包：以双换行符分隔 SSE 消息
                    const lines = buffer.split("\n\n");
                    // 保留最后一个可能不完整的片段
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
                                        // 简单去重：如果最后一个工具就是这个名字且正在调用，就不重复添加
                                        const lastTool = existingTools[existingTools.length - 1];
                                        if (lastTool && lastTool.name === toolName && lastTool.status === 'calling') {
                                            // pass
                                        } else {
                                            currentMessageRef.current.toolCalls = [...existingTools, newToolCall];
                                            setMessages((prev) => [...prev]);
                                        }
                                    }
                                    break;

                                case "tool_result":
                                    if (currentMessageRef.current) {
                                        let toolName = parsedEvent.data.name;

                                        // === 核心修复 1: 提取 Command 对象中的工具名 ===
                                        if (!toolName && (parsedEvent.data as any).type === 'Command') {
                                            // 尝试从 update.messages 里的 tool 消息获取 name
                                            const msgs = (parsedEvent.data as any).update?.messages;
                                            if (Array.isArray(msgs)) {
                                                const toolMsg = msgs.find((m: any) => m.type === 'tool' || m.name);
                                                if (toolMsg) toolName = toolMsg.name;
                                            }
                                        }

                                        // === 核心修复 2: 模糊匹配兜底 ===
                                        // 如果还是没名字，就找列表中第一个还在 loading 的工具
                                        if (!toolName && currentMessageRef.current.toolCalls) {
                                            const callingTool = currentMessageRef.current.toolCalls.find(t => t.status === 'calling');
                                            if (callingTool) toolName = callingTool.name;
                                        }

                                        // 更新状态
                                        if (currentMessageRef.current.toolCalls) {
                                            currentMessageRef.current.toolCalls = currentMessageRef.current.toolCalls.map(t =>
                                                // 如果名字匹配，或者找不到名字(兜底全部设为done)，则更新状态
                                                (t.name === toolName || !toolName) ? { ...t, status: "done" } : t
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

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                        lastMessage.content += "\n[连接异常，请重试]";
                    }
                    return newMessages;
                });
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;

                // === 核心修复 3: 强制清理所有状态 ===
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];

                    if (lastMessage?.role === "assistant") {
                        lastMessage.isStreaming = false;

                        // 1. 强制结束所有还在转圈的工具
                        if (lastMessage.toolCalls) {
                            lastMessage.toolCalls = lastMessage.toolCalls.map(t =>
                                t.status === 'calling' ? { ...t, status: 'done' } : t
                            );
                        }

                        // 2. 移除末尾的 "FINISH"
                        if (lastMessage.content && lastMessage.content.endsWith("FINISH")) {
                            lastMessage.content = lastMessage.content.replace(/FINISH$/, "");
                        }
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

        // 手动停止时也要清理状态
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