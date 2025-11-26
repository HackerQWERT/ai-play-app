"use server";
import Link from "next/link";
import { Button } from "antd";
import Layout from "antd/es/layout/layout";
import Header from "antd/es/layout/layout";
import Content from "antd/es/layout/layout";
import Footer from "antd/es/layout/layout";

import {
  RobotOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  StarOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import styles from "./home.module.scss";
import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/agent");
}
