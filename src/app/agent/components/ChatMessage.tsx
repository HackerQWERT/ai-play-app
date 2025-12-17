import React from "react";
import clsx from "clsx";
import { ChatMessage as ChatMessageType } from "../types";
import {
  UserOutlined,
  RobotOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Button, Typography } from "antd";
import ReactMarkdown from "react-markdown";
import styles from "./ChatMessage.module.scss";

const { Text } = Typography;

interface ChatMessageProps {
  message: ChatMessageType;
  onOpenModal?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOpenModal,
}) => {
  const isUser = message.role === "user";

  const renderControlStatus = () => {
    if (!message.control) return null;
    const { isInteracted } = message.control;

    if (isInteracted) {
      return (
        <div style={{ marginTop: 8, color: "#888", fontStyle: "italic" }}>
          <CheckCircleOutlined style={{ marginRight: 4 }} /> 已完成选择
        </div>
      );
    }

    return (
      <div style={{ marginTop: 8 }}>
        <Button type="primary" size="small" onClick={onOpenModal}>
          点击进行选择
        </Button>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        styles.messageContainer,
        isUser ? styles.user : styles.assistant
      )}
    >
      {/* 头像 */}
      <div
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
            !message.control && (
              <div className={styles.typingIndicator}>
                <span />
                <span />
                <span />
              </div>
            )
          )}
        </div>

        {/* 交互组件状态 */}
        {!isUser && message.control && renderControlStatus()}
      </div>
    </div>
  );
};
