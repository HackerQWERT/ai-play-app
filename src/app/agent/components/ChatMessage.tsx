import React from "react";
// 引入 clsx
import clsx from "clsx";
import { ChatMessage as ChatMessageType, getReadableToolInfo } from "../types";
import {
  UserOutlined,
  RobotOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
import ReactMarkdown from "react-markdown";
import styles from "./ChatMessage.module.scss";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      // 🟢 变化 1: 使用 clsx 组合基础样式和条件样式
      // 以前: className={`${styles.messageContainer} ${isUser ? styles.user : styles.assistant}`}
      // 现在: 逗号分隔，清晰明了
      className={clsx(
        styles.messageContainer,
        isUser ? styles.user : styles.assistant
      )}
    >
      {/* 头像 */}
      <div
        // 🟢 变化 2: 同样适用于多个类名的组合
        className={clsx(
          styles.avatarContainer,
          isUser ? styles.userAvatar : styles.assistantAvatar
        )}
      >
        {isUser ? (
          <UserOutlined style={{ fontSize: 20, color: "white" }} />
        ) : (
          <RobotOutlined style={{ fontSize: 20, color: "white" }} />
        )}
      </div>

      <div
        className={clsx(
          styles.contentWrapper,
          isUser ? styles.user : styles.assistant
        )}
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
          className={clsx(
            styles.messageBubble,
            isUser ? styles.user : styles.assistant
          )}
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
            {message.toolCalls.map((tool, index) => {
              const toolInfo = getReadableToolInfo(tool.name, tool.status);

              return (
                <div key={index} className={styles.toolCard}>
                  {tool.status === "calling" ? (
                    <LoadingOutlined
                      className={styles.spinning}
                      style={{ fontSize: 14, color: toolInfo.iconColor }}
                    />
                  ) : (
                    <CheckCircleOutlined
                      style={{ fontSize: 14, color: toolInfo.iconColor }}
                    />
                  )}
                  <span className={styles.toolText}>{toolInfo.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
