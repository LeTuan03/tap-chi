import { Col, Form, Input, Row } from "antd";

export default function SettingsSocialsTab() {
  return (
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
}
