import React from "react";
import {
  Modal,
  Card,
  Button,
  Table,
  List,
  Typography,
  Row,
  Col,
  Tag,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface InteractionModalProps {
  open: boolean;
  control: {
    type: "select_plan" | "select_flight" | "select_hotel";
    options: any[];
  } | null;
  onCancel: () => void;
  onConfirm: (value: string, displayText: string) => void;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  open,
  control,
  onCancel,
  onConfirm,
}) => {
  if (!control) return null;

  const { type, options } = control;

  const renderContent = () => {
    switch (type) {
      case "select_plan":
        return (
          <Row gutter={[16, 16]}>
            {options.map((opt: any, idx: number) => (
              <Col span={8} key={idx} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  title={opt.name}
                  extra={
                    <Text type="danger" strong>
                      {opt.price}
                    </Text>
                  }
                  actions={[
                    <Button
                      type="primary"
                      block
                      onClick={() =>
                        onConfirm(`方案${idx + 1}`, `我选择了 ${opt.name}`)
                      }
                    >
                      选择此方案
                    </Button>,
                  ]}
                >
                  <p style={{ minHeight: 60 }}>{opt.details}</p>
                </Card>
              </Col>
            ))}
          </Row>
        );

      case "select_flight":
        const flightColumns = [
          { title: "航空公司", dataIndex: "airline", key: "airline" },
          { title: "航班号", dataIndex: "flight_number", key: "flight_number" },
          {
            title: "价格",
            dataIndex: "price",
            key: "price",
            render: (text: string) => <Text type="danger">{text}</Text>,
          },
          {
            title: "操作",
            key: "action",
            render: (_: any, record: any, index: number) => (
              <Button
                type="primary"
                size="small"
                onClick={() =>
                  onConfirm(
                    `F${index + 1}`,
                    `我选择了 ${record.airline} ${record.flight_number}`
                  )
                }
              >
                预订
              </Button>
            ),
          },
        ];
        return (
          <Table
            dataSource={options}
            columns={flightColumns}
            pagination={false}
            rowKey={(record) => record.flight_number || Math.random()}
          />
        );

      case "select_hotel":
        const hotelColumns = [
          { title: "酒店名称", dataIndex: "name", key: "name" },
          {
            title: "价格",
            dataIndex: "price",
            key: "price",
            render: (text: string) => <Text type="danger">{text}</Text>,
          },
          {
            title: "操作",
            key: "action",
            render: (_: any, record: any, index: number) => (
              <Button
                type="primary"
                size="small"
                onClick={() =>
                  onConfirm(`H${index + 1}`, `我选择了 ${record.name}`)
                }
              >
                预订
              </Button>
            ),
          },
        ];
        return (
          <Table
            dataSource={options}
            columns={hotelColumns}
            pagination={false}
            rowKey={(record) => record.name || Math.random()}
          />
        );

      default:
        return <div>未知组件类型</div>;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "select_plan":
        return "请选择旅行方案";
      case "select_flight":
        return "请选择航班";
      case "select_hotel":
        return "请选择酒店";
      default:
        return "请选择";
    }
  };

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      {renderContent()}
    </Modal>
  );
};
