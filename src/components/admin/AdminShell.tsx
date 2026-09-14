"use client";

import { AppstoreOutlined, DashboardOutlined, FileTextOutlined, GlobalOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { App, Button, Layout, Menu, Space, Typography } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AuthService } from "@/lib/services";

const { Sider, Header, Content } = Layout;

const items = [
  { key: "/admin", icon: <DashboardOutlined />, label: <Link href="/admin">Tổng quan</Link> },
  { key: "/admin/bai-viet", icon: <FileTextOutlined />, label: <Link href="/admin/bai-viet">Bài viết</Link> },
  { key: "/admin/chuyen-muc", icon: <AppstoreOutlined />, label: <Link href="/admin/chuyen-muc">Chuyên mục</Link> },
  { key: "/admin/cai-dat", icon: <SettingOutlined />, label: <Link href="/admin/cai-dat">Cài đặt website</Link> },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { message } = App.useApp();
  const selected = items.map((i) => i.key).filter((k) => (k === "/admin" ? pathname === "/admin" : pathname.startsWith(k)));

  const logout = async () => {
    await AuthService.logout();
    message.success("Đã đăng xuất");
    router.replace("/admin/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth={0} width={230} style={{ borderRight: "1px solid #f0f0f0" }}>
        <div style={{ padding: "18px 20px 10px" }}>
          <Typography.Title level={5} style={{ margin: 0, color: "#da251c" }}>
            Làng nghề Việt Nam
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Trang quản trị
          </Typography.Text>
        </div>
        <Menu mode="inline" selectedKeys={selected} items={items} style={{ borderInlineEnd: 0 }} />
      </Sider>
      <Layout>
        <Header style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 24px", borderBottom: "1px solid #f0f0f0" }}>
          <Space>
            <Button icon={<GlobalOutlined />} href="/" target="_blank">
              Xem website
            </Button>
            <Button icon={<LogoutOutlined />} onClick={logout}>
              Đăng xuất
            </Button>
          </Space>
        </Header>
        <Content style={{ padding: 24, background: "#f5f5f5" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
