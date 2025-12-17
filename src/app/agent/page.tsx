"use client";

import { useRef, useEffect, useState } from "react";
import { useAgentStream } from "./hooks/useAgentStream";
import { ChatMessage } from "./components/ChatMessage";
import { InteractionModal } from "./components/InteractionModal";
import {
  SendOutlined,
  CloseOutlined,
  DeleteOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { Layout, Button, Input, Typography } from "antd";
import styles from "./page.module.scss";

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

export default function AgentPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // Modal 状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeControl, setActiveControl] = useState<{
    type: "select_plan" | "select_flight" | "select_hotel";
    options: any[];
  } | null>(null);

  const API_ENDPOINT =
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    "http://localhost:8000/api/vibe/stream";

  const {
    messages,
    isLoading,
    statusMessage,
    sendMessage,
    stopStream,
    clearMessages,
    handleControlInteraction,
  } = useAgentStream(API_ENDPOINT);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, statusMessage]);

  // 监听消息变化，自动打开 Modal
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === "assistant" &&
      lastMessage.control &&
      !lastMessage.control.isInteracted
    ) {
      setActiveControl(lastMessage.control);
      setIsModalOpen(true);
    }
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

  const handleModalConfirm = (value: string, displayText: string) => {
    setIsModalOpen(false);
    handleControlInteraction(value, displayText);
  };

  const handleOpenModal = (control: any) => {
    if (control && !control.isInteracted) {
      setActiveControl(control);
      setIsModalOpen(true);
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
            >
              清空
            </Button>
          )}
        </div>
      </Header>

      {/* Messages */}
      <Content className={styles.messagesContainer}>
        <div className={styles.messagesContent}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emoji}>🌍</div>
              <Title level={3} className={styles.emptyTitle}>
                开始你的旅行计划
              </Title>
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
                    block
                    style={{
                      height: "auto",
                      padding: "12px",
                      textAlign: "left",
                      justifyContent: "flex-start",
                    }}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onOpenModal={() => handleOpenModal(message.control)}
                />
              ))}

              {/* 状态提示 */}
              {statusMessage && (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "#888",
                    fontStyle: "italic",
                  }}
                >
                  {statusMessage}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </Content>

      {/* Interaction Modal */}
      <InteractionModal
        open={isModalOpen}
        control={activeControl}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />

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
