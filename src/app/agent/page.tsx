"use client";

import { useRef, useEffect, useState } from "react";
import { useAgentStream } from "./hooks/useAgentStream";
import { ChatMessage } from "./components/ChatMessage";
import {
  SendOutlined,
  CloseOutlined,
  DeleteOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { Layout, Button, Input, Typography, Space, Card } from "antd";
import styles from "./page.module.scss";

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function AgentPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Input.TextArea 的 ref 类型不同，这里简化处理，或者使用 any
  const inputRef = useRef<any>(null);

  // 使用 SSE Hook (需要配置你的后端地址)
  const API_ENDPOINT =
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    "http://localhost:8000/api/agent/vibe/stream";
  const { messages, isLoading, sendMessage, stopStream, clearMessages } =
    useAgentStream(API_ENDPOINT);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;

    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Layout className={styles.pageContainer}>
      {/* Header */}
      <Header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <Title level={4} className={styles.title} style={{ margin: 0 }}>
              ✈️ AI 旅行代理
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              机票、酒店、门票预订 | 行程规划 | 天气查询
            </Text>
          </div>
          {messages?.length > 0 && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={clearMessages}
              title="清空对话"
            >
              清空
            </Button>
          )}
        </div>
      </Header>

      {/* Messages Container */}
      <Content className={styles.messagesContainer}>
        <div className={styles.messagesContent}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emoji}>🌍</div>
              <Title level={3} className={styles.emptyTitle}>
                开始你的旅行计划
              </Title>
              <Paragraph type="secondary" className={styles.emptyDesc}>
                我可以帮你预订机票、酒店、门票,制定行程,查询天气等。试试问我：
              </Paragraph>
              <div className={styles.examplesGrid}>
                {[
                  "帮我预订从北京到上海的机票",
                  "查询我的所有酒店预订",
                  "11月25日纽约的天气怎么样?",
                  "推荐巴黎的旅游景点",
                ].map((example, i) => (
                  <Button
                    key={i}
                    onClick={() => setInput(example)}
                    className={styles.exampleButton}
                    icon={<BulbOutlined />}
                    style={{
                      height: "auto",
                      padding: "12px",
                      textAlign: "left",
                      justifyContent: "flex-start",
                    }}
                    block
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </Content>

      {/* Input Area */}
      <Footer className={styles.inputWrapper} style={{ padding: 0 }}>
        <div className={styles.inputContainer}>
          <TextArea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的旅行需求... (Shift+Enter 换行)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={isLoading}
            style={{ resize: "none", flex: 1 }}
          />
          {isLoading ? (
            <Button
              type="primary"
              danger
              onClick={stopStream}
              icon={<CloseOutlined />}
              size="large"
              className={styles.sendButton}
            >
              停止
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={!input.trim()}
              icon={<SendOutlined />}
              size="large"
              className={styles.sendButton}
            >
              发送
            </Button>
          )}
        </div>
      </Footer>
    </Layout>
  );
}
