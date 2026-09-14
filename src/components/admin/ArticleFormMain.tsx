import { Card, Form, Input } from "antd";
import RichEditor from "./RichEditor";

interface ArticleFormMainProps {
  id?: number;
  loading: boolean;
}

export default function ArticleFormMain({ id, loading }: ArticleFormMainProps) {
  return (
    <Card loading={loading}>
      <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Nhập tiêu đề" }, { max: 250 }]}>
        <Input size="large" showCount maxLength={250} placeholder="Tiêu đề bài viết (nên 40–65 ký tự)" />
      </Form.Item>
      <Form.Item name="slug" label="Đường dẫn (slug)" tooltip="Tự tạo từ tiêu đề, có thể sửa. URL bài viết: /slug-id">
        <Input addonBefore="/" addonAfter={`-${id ?? "id"}`} />
      </Form.Item>
      <Form.Item name="subtitle" label="Tiêu đề phụ (kicker)">
        <Input placeholder="Dòng ngắn hiển thị phía trên tiêu đề" />
      </Form.Item>
      <Form.Item name="sapo" label="Sa-pô (đoạn mở đầu)" rules={[{ max: 2000 }]}>
        <Input.TextArea rows={3} showCount maxLength={2000} placeholder="LNV - Tóm tắt ngắn gọn nội dung bài viết" />
      </Form.Item>
      <Form.Item name="content" label="Nội dung" valuePropName="value" trigger="onChange">
        <RichEditor />
      </Form.Item>
    </Card>
  );
}
