"use client";

import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-client";
import type { Category, SiteSettings } from "@/lib/types";
import ImageField from "./ImageField";

export default function SettingsForm() {
  const { message } = App.useApp();
  const [form] = Form.useForm<SiteSettings>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api<SiteSettings>("/api/admin/settings"), api<{ items: Category[] }>("/api/admin/categories")])
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
      await api("/api/admin/settings", { method: "PUT", json: values });
      message.success("Đã lưu cài đặt. Website sẽ cập nhật trong giây lát.");
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categories.filter((c) => !c.parent).map((c) => ({ value: c.slug, label: c.name }));

  const general = (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name="siteName" label="Tên website" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="shortName" label="Tên ngắn">
          <Input />
        </Form.Item>
        <Form.Item name="tagline" label="Khẩu hiệu / tên đầy đủ">
          <Input />
        </Form.Item>
        <Form.Item name="issn" label="ISSN">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Mô tả website (meta description trang chủ)" rules={[{ max: 320 }]}>
          <Input.TextArea rows={3} showCount maxLength={320} />
        </Form.Item>
        <Form.Item name="keywords" label="Từ khóa">
          <Select mode="tags" tokenSeparators={[","]} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="logoBanner" label="Logo ngang (đầu trang, 850×113)">
          <ImageField />
        </Form.Item>
        <Form.Item name="logo" label="Logo vuông (schema.org, RSS)">
          <Input />
        </Form.Item>
        <Form.Item name="logoFooter" label="Logo chân trang">
          <Input />
        </Form.Item>
        <Form.Item name="ogImage" label="Ảnh chia sẻ mặc định (1200×630)">
          <Input />
        </Form.Item>
      </Col>
    </Row>
  );

  const contact = (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name="editorInChief" label="Tổng biên tập">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ tòa soạn">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input type="email" />
        </Form.Item>
        <Form.Item name="phone" label="Điện thoại">
          <Input />
        </Form.Item>
        <Form.Item name="hotline" label="Hotline">
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="license" label="Giấy phép">
          <Input />
        </Form.Item>
        <Form.Item name={["adsContact", "name"]} label="Liên hệ quảng cáo – tên">
          <Input />
        </Form.Item>
        <Form.Item name={["adsContact", "phone"]} label="Liên hệ quảng cáo – điện thoại">
          <Input />
        </Form.Item>
        <Form.Item name="copyright" label="Ghi chú bản quyền">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name={["partnerLink", "url"]} label="Liên kết đối tác (thanh trên cùng) – URL">
          <Input />
        </Form.Item>
        <Form.Item name={["partnerLink", "image"]} label="Liên kết đối tác – ảnh">
          <Input />
        </Form.Item>
        <Form.Item name={["partnerLink", "label"]} label="Liên kết đối tác – nhãn">
          <Input />
        </Form.Item>
      </Col>
    </Row>
  );

  const socials = (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name={["socials", "facebook"]} label="Facebook">
          <Input />
        </Form.Item>
        <Form.Item name={["socials", "youtube"]} label="YouTube">
          <Input />
        </Form.Item>
        <Form.Item name={["socials", "tiktok"]} label="TikTok">
          <Input />
        </Form.Item>
        <Form.Item name={["socials", "twitter"]} label="X (Twitter)">
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="googleSiteVerification" label="Google Search Console – mã xác minh">
          <Input placeholder="Nội dung thẻ meta google-site-verification" />
        </Form.Item>
        <Form.Item name="gtmId" label="Google Tag Manager ID">
          <Input placeholder="GTM-XXXXXXX" />
        </Form.Item>
      </Col>
    </Row>
  );

  const home = (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name={["home", "stageCategories"]} label="4 chuyên mục cột phải (dưới tin nổi bật)" tooltip="Kéo thả để đổi thứ tự">
          <Select mode="multiple" options={catOptions} />
        </Form.Item>
        <Form.Item name={["home", "gridCategories"]} label="Các chuyên mục ở lưới phía dưới">
          <Select mode="multiple" options={catOptions} />
        </Form.Item>
        <Form.Item name={["home", "multimediaCategories"]} label="Chuyên mục Multimedia">
          <Select mode="multiple" options={categories.map((c) => ({ value: c.slug, label: c.name }))} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name={["home", "tickerCount"]} label="Số tin chạy chữ">
          <InputNumber min={1} max={20} />
        </Form.Item>
        <Form.Item name={["home", "coverListCount"]} label="Số tin cột giữa đầu trang">
          <InputNumber min={1} max={10} />
        </Form.Item>
        <Form.Item name={["home", "spotlightCount"]} label="Số tin dải Nổi bật">
          <InputNumber min={4} max={20} />
        </Form.Item>
        <Form.Item name={["home", "breakingCount"]} label="Số tin mới nhất">
          <InputNumber min={4} max={30} />
        </Form.Item>
        <Typography.Text type="secondary">Thời tiết (hiển thị tĩnh):</Typography.Text>
        <Form.List name="weather">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: "100%", marginTop: 8 }}>
              {fields.map((f) => (
                <Space key={f.key} align="baseline" wrap>
                  <Form.Item name={[f.name, "city"]} noStyle>
                    <Input placeholder="Thành phố" style={{ width: 160 }} />
                  </Form.Item>
                  <Form.Item name={[f.name, "temp"]} noStyle>
                    <InputNumber placeholder="°C" style={{ width: 80 }} />
                  </Form.Item>
                  <Form.Item name={[f.name, "icon"]} noStyle>
                    <Input placeholder="Mã icon (10n)" style={{ width: 120 }} />
                  </Form.Item>
                  <Button icon={<DeleteOutlined />} onClick={() => remove(f.name)} />
                </Space>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ city: "", temp: 25, icon: "01d" })}>
                Thêm thành phố
              </Button>
            </Space>
          )}
        </Form.List>
      </Col>
    </Row>
  );

  const ads = (
    <Form.List name={["ads", "sidebar"]}>
      {(fields, { add, remove }) => (
        <Space direction="vertical" style={{ width: "100%" }}>
          {fields.map((f) => (
            <Card key={f.key} size="small" extra={<Button size="small" danger icon={<DeleteOutlined />} onClick={() => remove(f.name)} />} title={`Banner ${f.name + 1}`}>
              <Row gutter={12}>
                <Col xs={24} md={8}>
                  <Form.Item name={[f.name, "image"]} label="Ảnh (300px)" rules={[{ required: true }]}>
                    <ImageField />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item name={[f.name, "link"]} label="Liên kết khi bấm">
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <Form.Item name={[f.name, "alt"]} label="Mô tả (alt)">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
          <Button icon={<PlusOutlined />} onClick={() => add({ image: "", link: "", alt: "" })}>
            Thêm banner
          </Button>
        </Space>
      )}
    </Form.List>
  );

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
            { key: "general", label: "Thông tin chung & SEO", children: general },
            { key: "contact", label: "Liên hệ & chân trang", children: contact },
            { key: "socials", label: "Mạng xã hội & Google", children: socials },
            { key: "home", label: "Bố cục trang chủ", children: home },
            { key: "ads", label: "Quảng cáo cột phải", children: ads },
          ]}
        />
      </Card>
    </Form>
  );
}
