"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, AgentEvent } from "../types";

export function useAgentStream(apiEndpoint: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const currentMessageRef = useRef<ChatMessage | null>(null);

    const sendMessage = useCallback(
        async (query: string) => {
            if (!query.trim() || isLoading) return;

            // 添加用户消息
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content: query,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);

            // 创建 AI 回复消息占位符
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: "",
                timestamp: new Date(),
                toolCalls: [],
                toolResults: [],
                isStreaming: true,
            };

            currentMessageRef.current = assistantMessage;
            setMessages((prev) => [...prev, assistantMessage]);

            // 创建 EventSource 连接
            const url = `${apiEndpoint}?query=${encodeURIComponent(query)}`;
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const parsedEvent: AgentEvent = JSON.parse(event.data);
                    if (parsedEvent.event === "message") {
                        // 处理消息事件
                        if (currentMessageRef.current) {
                            currentMessageRef.current.content += parsedEvent.data;
                        }
                    } else if (parsedEvent.event === "tool_call") {

                    }

                } catch (error) {
                    console.error("Error parsing SSE event:", error);
                }
            };

            eventSource.onerror = (error) => {
                console.error("EventSource error:", error);
                eventSource.close();
                eventSourceRef.current = null;

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                        lastMessage.isStreaming = false;
                        if (!lastMessage.content && !lastMessage.toolCalls?.length) {
                            lastMessage.content = "抱歉,连接出现问题,请重试。";
                        }
                    }
                    return newMessages;
                });

                setIsLoading(false);
            };

            // 监听连接关闭
            eventSource.addEventListener("end", () => {
                eventSource.close();
                eventSourceRef.current = null;

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                        lastMessage.isStreaming = false;
                    }
                    return newMessages;
                });

                setIsLoading(false);
            });
        },
        [apiEndpoint, isLoading]
    );

    const stopStream = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsLoading(false);

        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === "assistant") {
                lastMessage.isStreaming = false;
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
