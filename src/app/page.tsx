import Link from "next/link";
import { Card, Button } from "antd";
import { RobotOutlined, SearchOutlined, HomeOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          AI 旅行助手
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <RobotOutlined className="text-4xl text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">AI 代理</h2>
            <p className="text-gray-600 mb-4">使用 AI 代理处理您的旅行查询</p>
            <Link href="/agent">
              <Button type="primary" size="large">
                开始对话
              </Button>
            </Link>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <SearchOutlined className="text-4xl text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">航班查询</h2>
            <p className="text-gray-600 mb-4">查看可用航班信息</p>
            <Link href="/flights">
              <Button type="default" size="large">
                查看航班
              </Button>
            </Link>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <HomeOutlined className="text-4xl text-purple-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">酒店预订</h2>
            <p className="text-gray-600 mb-4">查找和预订酒店</p>
            <Link href="/hotels">
              <Button type="default" size="large">
                查看酒店
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
