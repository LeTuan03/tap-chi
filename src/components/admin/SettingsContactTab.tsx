import { Col, Form, Input, Row } from "antd";

export default function SettingsContactTab() {
  return (
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
}
