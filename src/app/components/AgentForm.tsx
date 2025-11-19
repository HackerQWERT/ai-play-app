"use client";

import { Button, Input, Card, Alert } from "antd";
import { SendOutlined } from "@ant-design/icons";
import styles from "./AgentForm.module.scss";
import { callAgentAction } from "../../server/actions";
// import ServerCom from "./serverCom";
import { useState, useTransition } from "react";
import { useAgentStore } from "../../stores/AgentStore";

export default function AgentForm({
  searchParams: { query, response, error: errorParam },
}: {
  searchParams: { query?: string; response?: string; error?: string };
}) {
  console.log("AgentForm 重新渲染");
  const { data, setData } = useAgentStore();
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(query || "");
  const [error, setError] = useState<string | null>(errorParam || null);

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

  return (
    <>
      {/* <ServerCom /> */}
      <Card className="mb-6">
        <form className="flex gap-2">
          <Input
            name="query"
            placeholder="输入您的旅行查询..."
            className="flex-1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={isPending}
            onClick={() => {
              if (!inputValue.trim()) return;
              setError(null);
              startTransition(async () => {
                const formData = new FormData();
                formData.append("query", inputValue);
                const result = await callAgentAction(formData);
                if (result.error) {
                  setError(result.error);
                } else {
                  setData(result.data);
                }
              });
            }}
          >
            发送
          </Button>
        </form>
      </Card>
      {isPending && (
        <Card className="mb-6">
          <div>加载中，请稍候...</div>
        </Card>
      )}
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}
      {data && (
        <Card title="代理响应" className="mb-6">
          {data.responses.map((message: string, index: number) => (
            <div key={index} className={styles.otherMessage}>
              {message}
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
