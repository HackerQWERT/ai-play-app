"use client";

import { useState, useEffect } from "react";
import { Card, Spin, Alert, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { ApiService, OpenAPI } from "@/api";

interface Hotel {
  [key: string]: unknown;
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        OpenAPI.BASE = "http://127.0.0.1:8000";
        const result = await ApiService.getHotelsEndpointApiHotelsGet();
        setHotels(Array.isArray(result) ? result : [result]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch hotels");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />}>返回首页</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          可用酒店
        </h1>

        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid gap-4">
            {hotels.map((hotel, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(hotel, null, 2)}
                </pre>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
