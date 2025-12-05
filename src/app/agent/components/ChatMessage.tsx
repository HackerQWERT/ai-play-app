import React from "react";
import { ChatMessage as ChatMessageType } from "../types";
import { Sparkles, User, Loader2, CheckCircle2, Cpu } from "lucide-react";
import { Avatar, Space, Typography, Card } from "antd";
import ReactMarkdown from "react-markdown";
import styles from "./ChatMessage.module.scss";

const { Text } = Typography;

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`${styles.messageContainer} ${
        isUser ? styles.user : styles.assistant
      }`}
    >
      {/* 头像 - 使用 Lucide 图标 + 自定义渐变背景 */}
      <div
        className={`${styles.avatarContainer} ${
          isUser ? styles.userAvatar : styles.assistantAvatar
        }`}
      >
        {isUser ? (
          <User size={20} color="white" />
        ) : (
          <Sparkles size={20} color="white" fill="rgba(255,255,255,0.2)" />
        )}
      </div>

      <div
        className={`${styles.contentWrapper} ${
          isUser ? styles.user : styles.assistant
        }`}
      >
        {/* 名字和时间 */}
        <div className={styles.messageMeta}>
          <span>{isUser ? "我" : "AI 助理"}</span>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* 消息气泡 */}
        <div
          className={`${styles.messageBubble} ${
            isUser ? styles.user : styles.assistant
          }`}
        >
          {message.content ? (
            <div className={styles.textContent}>
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p style={{ margin: 0 }} {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            message.isStreaming &&
            (!message.toolCalls || message.toolCalls.length === 0) && (
              <div className={styles.typingIndicator}>
                <span />
                <span />
                <span />
              </div>
            )
          )}
        </div>

        {/* 工具调用状态显示 (仅针对 Assistant) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className={styles.toolArea}>
            {message.toolCalls.map((tool, index) => (
              <div key={index} className={styles.toolCard}>
                {tool.status === "calling" ? (
                  <Loader2
                    size={14}
                    className={styles.spinning}
                    color="#3b82f6"
                  />
                ) : (
                  <CheckCircle2 size={14} color="#10b981" />
                )}
                <span className={styles.toolText}>
                  {tool.status === "calling"
                    ? `正在使用 ${tool.name}...`
                    : `已完成 ${tool.name}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
