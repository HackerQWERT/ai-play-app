"use client";

import { ChatMessage as ChatMessageType } from "../types";
import {
  CarOutlined,
  HomeOutlined,
  TagOutlined,
  CloudOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  UserOutlined,
  RobotOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Typography, Space, Collapse, theme } from "antd";
import styles from "./ChatMessage.module.scss";

const { Text, Paragraph } = Typography;

interface ChatMessageProps {
  message: ChatMessageType;
}

const toolIcons: Record<string, React.ReactNode> = {
  book_flight: <CarOutlined />,
  book_hotel: <HomeOutlined />,
  book_ticket: <TagOutlined />,
  get_weather: <CloudOutlined />,
  search_travel_guides: <EnvironmentOutlined />,
  query_flights: <CarOutlined />,
  query_hotels: <HomeOutlined />,
};

const toolNameMap: Record<string, string> = {
  book_flight: "预订机票",
  book_hotel: "预订酒店",
  book_ticket: "预订门票",
  get_weather: "查询天气",
  search_travel_guides: "搜索旅游指南",
  query_flights: "查询机票",
  query_hotels: "查询酒店",
};

const agentNameMap: Record<string, string> = {
  flight_agent: "机票助手",
  hotel_agent: "酒店助手",
  ticket_agent: "门票助手",
  planner_agent: "规划师",
  query_agent: "查询助手",
  booking_team: "预订团队",
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const { token } = theme.useToken();

  // 检查消息是否为空（无内容且无可见工具调用）
  const hasContent = !!message.content;
  const hasVisibleToolCalls = message.toolCalls?.some(
    (t) => !t.name.startsWith("transfer_")
  );
  const hasVisibleToolResults = message.toolResults?.some(
    (r) => !r.name.startsWith("transfer_")
  );

  // 如果是 AI 消息，且没有任何可见内容，则不渲染
  if (
    !isUser &&
    !hasContent &&
    !hasVisibleToolCalls &&
    !hasVisibleToolResults &&
    !message.isStreaming
  ) {
    return null;
  }

  return (
    <div
      className={`${styles.messageContainer} ${
        isUser ? styles.user : styles.assistant
      }`}
    >
      {!isUser && (
        <Avatar
          icon={<RobotOutlined />}
          style={{ backgroundColor: "#3b82f6" }}
          size="large"
        />
      )}

      <div
        className={`${styles.contentWrapper} ${
          isUser ? styles.user : styles.assistant
        }`}
      >
        {/* Agent 标签 */}
        {!isUser && message.agent && (
          <Text
            type="secondary"
            style={{ fontSize: "12px", marginBottom: 4, paddingLeft: 8 }}
          >
            {agentNameMap[message.agent] || message.agent}
          </Text>
        )}

        {/* 消息内容 */}
        <div
          className={`${styles.messageBubble} ${
            isUser ? styles.user : styles.assistant
          }`}
        >
          {message.content && (
            <div className={styles.textContent}>{message.content}</div>
          )}

          {/* 工具调用 */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <Space
              direction="vertical"
              style={{ width: "100%", marginTop: 12 }}
            >
              {message.toolCalls.map((tool) => {
                // 隐藏内部路由工具
                if (tool.name.startsWith("transfer_")) return null;

                return (
                  <Card
                    key={tool.id}
                    size="small"
                    type="inner"
                    className={styles.toolCard}
                    style={{
                      backgroundColor: "#eff6ff",
                      borderColor: "#bfdbfe",
                    }}
                  >
                    <Space align="start">
                      <span style={{ color: "#2563eb" }}>
                        {toolIcons[tool.name] || <ToolOutlined />}
                      </span>
                      <div>
                        <Text strong style={{ color: "#1d4ed8" }}>
                          {toolNameMap[tool.name] || tool.name}
                        </Text>
                        <div style={{ fontSize: "12px", color: "#2563eb" }}>
                          {Object.entries(tool.args).map(([key, value]) => (
                            <span key={key} style={{ marginRight: 8 }}>
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                      {message.isStreaming && (
                        <LoadingOutlined style={{ color: "#3b82f6" }} />
                      )}
                    </Space>
                  </Card>
                );
              })}
            </Space>
          )}

          {/* 工具结果 */}
          {message.toolResults && message.toolResults.length > 0 && (
            <Space
              direction="vertical"
              style={{ width: "100%", marginTop: 12 }}
            >
              {message.toolResults.map((result) => {
                // 隐藏内部路由工具结果
                if (result.name.startsWith("transfer_")) return null;

                return (
                  <Card
                    key={result.id}
                    size="small"
                    type="inner"
                    className={styles.resultCard}
                    style={{
                      backgroundColor: "#f0fdf4",
                      borderColor: "#bbf7d0",
                    }}
                  >
                    <Space align="start" direction="vertical" size={0}>
                      <Space>
                        <span style={{ color: "#16a34a" }}>
                          {toolIcons[result.name] || <ToolOutlined />}
                        </span>
                        <Text strong style={{ color: "#15803d" }}>
                          {toolNameMap[result.name] || result.name} 结果
                        </Text>
                      </Space>
                      <Text
                        style={{ color: "#15803d", whiteSpace: "pre-wrap" }}
                      >
                        {result.result}
                      </Text>
                    </Space>
                  </Card>
                );
              })}
            </Space>
          )}

          {/* 流式加载指示器 */}
          {message.isStreaming && !message.toolCalls?.length && (
            <div className={styles.loadingIndicator}>
              <LoadingOutlined className={styles.loadingIcon} />
              <Text type="secondary" style={{ fontSize: "14px" }}>
                正在思考...
              </Text>
            </div>
          )}
        </div>

        {/* 时间戳 */}
        <Text
          type="secondary"
          style={{
            fontSize: "12px",
            marginTop: 4,
            display: "block",
            textAlign: isUser ? "right" : "left",
          }}
        >
          {message.timestamp.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </div>

      {isUser && (
        <Avatar
          icon={<UserOutlined />}
          style={{ backgroundColor: "#4b5563" }}
          size="large"
        />
      )}
    </div>
  );
}
