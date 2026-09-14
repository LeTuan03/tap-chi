import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Select, Space, Typography } from "antd";

interface SettingsHomeTabProps {
  catOptions: { value: string; label: string }[];
  categories: { slug: string; name: string }[];
}

export default function SettingsHomeTab({ catOptions, categories }: SettingsHomeTabProps) {
  return (
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
}
