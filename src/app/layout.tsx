"use server";

import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.scss";
import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
