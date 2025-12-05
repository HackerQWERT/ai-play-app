import React from "react";
import { ChatMessage as ChatMessageType } from "../types";
import {
  UserOutlined,
  RobotOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Avatar, Space, Typography, Card, theme } from "antd";
import ReactMarkdown from "react-markdown";

const { Text } = Typography;

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { token } = theme.useToken();
  const isUser = message.role === "user";

  // 容器样式
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isUser ? "row-reverse" : "row",
    marginBottom: "24px",
    alignItems: "flex-start",
    gap: "12px",
    padding: "0 16px",
  };

  // 气泡样式
  const bubbleStyle: React.CSSProperties = {
    maxWidth: "80%",
    padding: "12px 16px",
    borderRadius: "12px",
    backgroundColor: isUser ? token.colorPrimary : token.colorFillSecondary,
    color: isUser ? "#fff" : token.colorText,
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    position: "relative",
    // 确保长文本换行
    wordBreak: "break-word",
  };

  return (
    <div style={containerStyle}>
      {/* 头像 */}
      <Avatar
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          backgroundColor: isUser
            ? token.colorPrimaryActive
            : token.colorSuccess,
          flexShrink: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          maxWidth: "100%",
        }}
      >
        {/* 名字和时间 */}
        <Space size={8} style={{ marginBottom: 4, padding: "0 4px" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isUser ? "我" : "AI 助理"}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Space>

        {/* 消息气泡 */}
        <div style={bubbleStyle}>
          {message.content ? (
            <div className="markdown-body">
              {/* 如果没装 react-markdown，可以直接用 <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div> */}
              <ReactMarkdown
                components={{
                  // 简单的样式覆盖，确保在黑色/白色背景下都可见
                  p: ({ node, ...props }) => (
                    <p style={{ margin: 0, color: "inherit" }} {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      style={{
                        color: isUser ? "#fff" : token.colorPrimary,
                        textDecoration: "underline",
                      }}
                      {...props}
                    />
                  ),
                  code: ({ node, ...props }) => (
                    <code
                      style={{
                        backgroundColor: "rgba(0,0,0,0.1)",
                        padding: "2px 4px",
                        borderRadius: 4,
                      }}
                      {...props}
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            /* 如果内容为空但正在流式传输或有工具调用，显示加载点 */
            message.isStreaming &&
            (!message.toolCalls || message.toolCalls.length === 0) && (
              <LoadingOutlined />
            )
          )}
        </div>

        {/* 工具调用状态显示 (仅针对 Assistant) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {message.toolCalls.map((tool, index) => (
              <Card
                key={index}
                size="small"
                bodyStyle={{
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                style={{
                  backgroundColor: token.colorBgLayout,
                  borderColor: token.colorBorderSecondary,
                  width: "fit-content",
                }}
              >
                {tool.status === "calling" ? (
                  <LoadingOutlined spin style={{ color: token.colorPrimary }} />
                ) : (
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {tool.status === "calling"
                    ? `正在使用 ${tool.name}...`
                    : `已完成 ${tool.name}`}
                </Text>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
