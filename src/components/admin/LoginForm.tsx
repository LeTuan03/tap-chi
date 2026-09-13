"use client";

import { LockOutlined } from "@ant-design/icons";
import { App, Button, Card, Form, Input, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/admin-client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ password }: { password: string }) => {
    setLoading(true);
    try {
      await api("/api/admin/auth", { method: "POST", json: { password } });
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f5f5", padding: 16 }}>
      <Card style={{ width: 380, maxWidth: "100%" }}>
        <Typography.Title level={4} style={{ textAlign: "center", color: "#da251c", marginBottom: 4 }}>
          Tạp chí Làng nghề Việt Nam
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: "center" }}>
          Đăng nhập trang quản trị
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Nhập mật khẩu" }]}>
            <Input.Password prefix={<LockOutlined />} size="large" autoFocus />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </div>
  );
}
