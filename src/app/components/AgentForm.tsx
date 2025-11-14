"use client";

import { Button, Input, Card, Alert } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useFormStatus } from "react-dom";
import styles from "./AgentForm.module.scss";
import { callAgentAction } from "./actions";
import { useState } from "react";

function SubmitButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="primary"
      htmlType="submit"
      icon={<SendOutlined />}
      onClick={() => setLoading(true)}
    ></Button>
  );
}

export default function AgentForm({
  searchParams: { query, response, error },
}: {
  searchParams: { query?: string; response?: string; error?: string };
}) {
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
      <Card className="mb-6">
        <form className="flex gap-2" action={callAgentAction}>
          <Input
            name="query"
            placeholder="输入您的旅行查询..."
            className="flex-1"
            defaultValue={query || ""}
          />
          <SubmitButton />
        </form>
      </Card>

      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      {loading && (
        <Card title="加载中..." className="mb-6">
          正在处理您的请求，请稍候...
        </Card>
      )}

      {response && (
        <Card title="代理响应" className="mb-6">
          {renderConversation(response)}
        </Card>
      )}
    </>
  );
}
