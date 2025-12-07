"use client";

import { useRef, useEffect, useState } from "react";
import { useAgentStream } from "./hooks/useAgentStream";
import { ChatMessage } from "./components/ChatMessage";
import { ApprovalCard } from "./components/ApprovalCard"; // 引入新组件
import {
  SendOutlined,
  CloseOutlined,
  DeleteOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { Layout, Button, Input, Typography, Space, message } from "antd";
import styles from "./page.module.scss";

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function AgentPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  const API_ENDPOINT =
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    "http://localhost:8000/api/agent/vibe/stream";

  const {
    messages,
    isLoading,
    isWaitingForApproval, // 获取等待状态
    sendMessage,
    stopStream,
    clearMessages,
  } = useAgentStream(API_ENDPOINT);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingForApproval]); // 状态变化也滚动

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  // 点击“确认”按钮
  const handleConfirm = () => {
    // 发送肯定指令，后端接收后会 Resume
    sendMessage("确认，请继续执行。", true);
  };

  // 点击“修改”按钮
  const handleModify = () => {
    // 这里简单地让输入框获得焦点，提示用户输入
    inputRef.current?.focus();
    message.info("请在输入框中输入您的修改意见");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Layout className={styles.pageContainer}>
      {/* Header (保持不变) */}
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
              {/* (Empty state 内容保持不变) */}
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
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* 🟢 关键：如果处于等待确认状态，显示确认卡片 */}
              {isWaitingForApproval && (
                <ApprovalCard
                  onConfirm={handleConfirm}
                  onModify={handleModify}
                />
              )}

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
            // 🟢 如果正在等待确认，修改 placeholder 提示
            placeholder={
              isWaitingForApproval
                ? "请输入修改意见，或点击上方确认按钮..."
                : "输入你的旅行需求... (Shift+Enter 换行)"
            }
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={isLoading} // 只有 loading 时禁用，等待确认时允许输入(用于修改)
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
