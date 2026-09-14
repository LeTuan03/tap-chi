import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import ImageField from "./ImageField";

export default function SettingsAdsTab() {
  return (
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
}
