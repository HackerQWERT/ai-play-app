"use client";

import { useState } from "react";
import { Button, Input, Card, Spin, Alert } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { ApiService, OpenAPI } from "../../api";
import styles from "./AgentForm.module.scss";

interface AgentResponse {
  result?: string;
  error?: string;
}

export default function AgentForm() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const renderConversation = (result: string) => {
    try {
      const parsed: { responses: string[] } = JSON.parse(result);
      if (parsed.responses && Array.isArray(parsed.responses)) {
        return (
          <div className={styles.conversationContainer}>
            {parsed.responses.map((message, index) => {
              const [role, ...contentParts] = message.split(": ");
              const content = contentParts.join(": ");
              const isUser = role.toLowerCase() === "user";
              const isSupervisor = role.toLowerCase() === "supervisor";

              return (
                <div
                  key={index}
                  className={
                    isUser
                      ? styles.userMessage
                      : isSupervisor
                      ? styles.supervisorMessage
                      : styles.otherMessage
                  }
                >
                  <div className={styles.messageRole}>{role}</div>
                  <div>{content}</div>
                </div>
              );
            })}
          </div>
        );
      }
    } catch (err) {
      // 如果解析失败，回退到原始显示
    }
    return (
      <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
        {result}
      </pre>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const result = await ApiService.agentEndpointApiAgentPost(query);
      console.log("Agent result:", result);
      setResponse({ result: JSON.stringify(result, null, 2) });
    } catch (err) {
      setResponse({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入您的旅行查询..."
            className="flex-1"
            disabled={loading}
          />
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SendOutlined />}
            disabled={!query.trim() || loading}
          >
            发送
          </Button>
        </form>
      </Card>

      {response?.error && (
        <Alert
          message="错误"
          description={response.error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      {loading && (
        <Card className="mb-6">
          <div className="flex items-center justify-center py-8">
            <Spin size="large" />
            <span className="ml-3">正在处理您的查询...</span>
          </div>
        </Card>
      )}

      {response?.result && !loading && (
        <Card title="代理响应" className="mb-6">
          {renderConversation(response.result)}
        </Card>
      )}
    </>
  );
}
