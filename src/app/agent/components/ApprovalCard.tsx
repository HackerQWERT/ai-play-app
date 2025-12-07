import React from "react";
import { Card, Button, Typography, Space } from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  InfoCircleFilled,
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface ApprovalCardProps {
  onConfirm: () => void;
  onModify: () => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  onConfirm,
  onModify,
}) => {
  return (
    <Card
      style={{
        width: "100%",
        marginTop: 16,
        border: "1px solid #1677ff",
        background: "#f0f5ff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(22, 119, 255, 0.15)",
      }}
      bodyStyle={{ padding: "16px 24px" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <InfoCircleFilled
          style={{ fontSize: 24, color: "#1677ff", marginTop: 4 }}
        />
        <div style={{ flex: 1 }}>
          <Title
            level={5}
            style={{ marginTop: 0, marginBottom: 8, color: "#1f2937" }}
          >
            需要您的确认
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            AI
            助理准备执行预订操作。请检查上方信息是否正确，确认后将继续，或输入新的指令进行修改。
          </Text>

          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={onConfirm}
              size="large"
              style={{ borderRadius: 8, paddingLeft: 24, paddingRight: 24 }}
            >
              确认并继续
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={onModify}
              size="large"
              style={{ borderRadius: 8 }}
            >
              修改信息
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
};
