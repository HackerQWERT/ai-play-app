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
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const currentMessageRef = useRef<ChatMessage | null>(null);
    const threadIdRef = useRef<string>("");

    useEffect(() => {
        threadIdRef.current = generateThreadId();
    }, []);

    const sendMessage = useCallback(
        async (query: string, displayQuery?: string) => {
            if (!query.trim() || isLoading) return;

            // 1. 添加用户消息
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content: displayQuery || query, // 优先使用展示文本
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);
            setStatusMessage(null);

            // 2. 创建 AI 回复消息占位符
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: "",
                timestamp: new Date(),
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
                        thread_id: threadIdRef.current,
                        message: query, // 发送原始 query
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
                        // 解析 SSE 格式: event: ... \n data: ...
                        // 注意：有些 SSE 实现可能没有 event 行，只有 data 行，默认为 message
                        const eventMatch = line.match(/^event: (.*)$/m);
                        const dataMatch = line.match(/^data: (.*)$/m);

                        if (dataMatch) {
                            const eventType = eventMatch ? eventMatch[1].trim() : "message";
                            const dataStr = dataMatch[1].trim();

                            try {
                                const data = JSON.parse(dataStr);

                                switch (eventType) {
                                    case "message":
                                        setStatusMessage(null);
                                        if (currentMessageRef.current) {
                                            // 统一追加 (Append): 无论是流式字符还是完整文本块，都应追加
                                            currentMessageRef.current.content += data.content;
                                            setMessages((prev) => [...prev]);
                                        }
                                        break;

                                    case "status":
                                        setStatusMessage(data.content);
                                        break;

                                    case "control":
                                        setStatusMessage(null);
                                        if (currentMessageRef.current) {
                                            currentMessageRef.current.control = {
                                                type: data.type,
                                                options: data.options,
                                                isInteracted: false
                                            };
                                            setMessages((prev) => [...prev]);
                                        }
                                        break;

                                    case "error":
                                        console.error("API Error:", data.message);
                                        break;
                                }
                            } catch (e) {
                                console.error("Error parsing JSON:", e, "Raw data:", dataStr);
                            }
                        }
                    }
                }
            } catch (error: any) {
                if (error.name === "AbortError") return;
                console.error("Stream error:", error);
            } finally {
                setIsLoading(false);
                setStatusMessage(null);
                abortControllerRef.current = null;

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
        [apiEndpoint, isLoading]
    );

    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
        setStatusMessage(null);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        stopStream();
        threadIdRef.current = generateThreadId();
    }, [stopStream]);

    const handleControlInteraction = useCallback((interactionResult: string, displayResult?: string) => {
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.control) {
                lastMessage.control.isInteracted = true;
            }
            return newMessages;
        });
        sendMessage(interactionResult, displayResult);
    }, [sendMessage]);

    return {
        messages,
        isLoading,
        statusMessage,
        sendMessage,
        stopStream,
        clearMessages,
        handleControlInteraction
    };
}