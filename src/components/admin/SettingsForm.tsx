"use client";

import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import { CategoryService, SettingsService } from "@/lib/services";
import type { Category, SiteSettings } from "@/lib/types";
import SettingsGeneralTab from "./SettingsGeneralTab";
import SettingsContactTab from "./SettingsContactTab";
import SettingsSocialsTab from "./SettingsSocialsTab";
import SettingsHomeTab from "./SettingsHomeTab";
import SettingsAdsTab from "./SettingsAdsTab";

export default function SettingsForm() {
  const { message } = App.useApp();
  const [form] = Form.useForm<SiteSettings>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([SettingsService.get(), CategoryService.list()])
      .then(([s, c]) => {
        form.setFieldsValue(s);
        setCategories(c.items);
      })
      .catch((e) => message.error((e as Error).message))
      .finally(() => setLoading(false));
  }, [form, message]);

  const onFinish = async (values: SiteSettings) => {
    setSaving(true);
    try {
      await SettingsService.update(values);
      message.success("Đã lưu cài đặt. Website sẽ cập nhật trong giây lát.");
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categories.filter((c) => !c.parent).map((c) => ({ value: c.slug, label: c.name }));

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Cài đặt website
        </Typography.Title>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} disabled={loading}>
          Lưu cài đặt
        </Button>
      </div>
      <Card loading={loading}>
        <Tabs
          items={[
            { key: "general", label: "Thông tin chung & SEO", children: <SettingsGeneralTab /> },
            { key: "contact", label: "Liên hệ & chân trang", children: <SettingsContactTab /> },
            { key: "socials", label: "Mạng xã hội & Google", children: <SettingsSocialsTab /> },
            { key: "home", label: "Bố cục trang chủ", children: <SettingsHomeTab catOptions={catOptions} categories={categories} /> },
            { key: "ads", label: "Quảng cáo cột phải", children: <SettingsAdsTab /> },
          ]}
        />
      </Card>
    </Form>
  );
}
