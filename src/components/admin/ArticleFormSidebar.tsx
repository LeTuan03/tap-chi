import { Card, Col, DatePicker, Form, Input, Row, Select, Space, Switch } from "antd";
import type { SiteSettings } from "@/lib/types";
import { stripHtml } from "@/lib/utils";
import ImageField from "./ImageField";
import SeoPreview from "./SeoPreview";

interface ArticleFormSidebarProps {
  loading: boolean;
  categoryOptions: { value: string; label: string }[];
  title: string;
  description: string;
  sapo: string;
  previewPath: string;
  settings: SiteSettings | null;
}

export default function ArticleFormSidebar({
  loading,
  categoryOptions,
  title,
  description,
  sapo,
  previewPath,
  settings,
}: ArticleFormSidebarProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card title="Xuất bản" size="small" loading={loading}>
        <Form.Item name="status" label="Trạng thái">
          <Select
            options={[
              { value: "published", label: "Đã đăng" },
              { value: "draft", label: "Bản nháp" },
            ]}
          />
        </Form.Item>
        <Form.Item name="publishedAt" label="Thời gian đăng" rules={[{ required: true }]}>
          <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="category" label="Chuyên mục" rules={[{ required: true, message: "Chọn chuyên mục" }]}>
          <Select showSearch optionFilterProp="label" options={categoryOptions} placeholder="Chọn chuyên mục" />
        </Form.Item>
        <Form.Item name="type" label="Loại bài">
          <Select
            options={[
              { value: "article", label: "Bài viết" },
              { value: "photo", label: "Phóng sự ảnh" },
              { value: "video", label: "Video" },
            ]}
          />
        </Form.Item>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item name="isFeatured" label="Tiêu điểm (slider)" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isSpotlight" label="Dải Nổi bật" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="author" label="Tác giả">
          <Input placeholder="Tên tác giả" />
        </Form.Item>
        <Form.Item name="source" label="Nguồn">
          <Input placeholder="Theo ..." />
        </Form.Item>
        <Form.Item name="views" label="Lượt xem" tooltip="Dùng để xếp hạng mục Đọc nhiều">
          <Input type="number" min={0} />
        </Form.Item>
      </Card>
      <Card title="Ảnh đại diện" size="small" loading={loading}>
        <Form.Item name="image" noStyle>
          <ImageField />
        </Form.Item>
        <Form.Item name="ogImage" label="Ảnh chia sẻ mạng xã hội (1200×630)" tooltip="Bỏ trống sẽ dùng ảnh đại diện" style={{ marginTop: 12, marginBottom: 0 }}>
          <Input placeholder="URL ảnh 1200×630" />
        </Form.Item>
      </Card>
      <Card title="SEO" size="small" loading={loading}>
        <Form.Item name="description" label="Mô tả (meta description)" rules={[{ max: 320 }]} extra="Nên 120–160 ký tự, chứa từ khóa chính.">
          <Input.TextArea rows={3} showCount maxLength={320} />
        </Form.Item>
        <Form.Item name="tags" label="Từ khóa (tags)">
          <Select mode="tags" tokenSeparators={[","]} placeholder="Nhập từ khóa, Enter để thêm" />
        </Form.Item>
        <SeoPreview
          siteName={settings?.siteName ?? "Tạp chí Làng nghề Việt Nam"}
          siteUrl={typeof window !== "undefined" ? window.location.origin : ""}
          path={previewPath}
          title={title}
          description={description || stripHtml(sapo).slice(0, 160)}
        />
      </Card>
    </Space>
  );
}
