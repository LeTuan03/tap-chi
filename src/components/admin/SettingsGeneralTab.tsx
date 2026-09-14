import { Col, Form, Input, Row, Select } from "antd";
import ImageField from "./ImageField";

export default function SettingsGeneralTab() {
  return (
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
}
