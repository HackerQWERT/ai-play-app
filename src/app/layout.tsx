"use server";

import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.scss";
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
