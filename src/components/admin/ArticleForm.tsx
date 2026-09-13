"use client";

import { ArrowLeftOutlined, EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Switch, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/admin-client";
import type { Article, Category, SiteSettings } from "@/lib/types";
import { articlePath, slugify, stripHtml } from "@/lib/utils";
import ImageField from "./ImageField";
import RichEditor from "./RichEditor";
import SeoPreview from "./SeoPreview";

interface FormValues extends Omit<Article, "id" | "createdAt" | "updatedAt" | "publishedAt"> {
  publishedAt: Dayjs;
}

const EMPTY: FormValues = {
  slug: "",
  title: "",
  subtitle: "",
  sapo: "",
  description: "",
  content: "",
  image: "",
  ogImage: "",
  category: "",
  tags: [],
  author: "",
  source: "",
  type: "article",
  status: "draft",
  isFeatured: false,
  isSpotlight: false,
  views: 0,
  publishedAt: dayjs(),
};

export default function ArticleForm({ id }: { id?: number }) {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  const title = Form.useWatch("title", form) ?? "";
  const slug = Form.useWatch("slug", form) ?? "";
  const description = Form.useWatch("description", form) ?? "";
  const sapo = Form.useWatch("sapo", form) ?? "";

  useEffect(() => {
    Promise.all([api<{ items: Category[] }>("/api/admin/categories"), api<SiteSettings>("/api/admin/settings")])
      .then(([c, s]) => {
        setCategories(c.items);
        setSettings(s);
      })
      .catch((e) => message.error((e as Error).message));
  }, [message]);

  useEffect(() => {
    if (!id) return;
    api<Article>(`/api/admin/articles/${id}`)
      .then((a) => {
        setArticle(a);
        form.setFieldsValue({ ...a, publishedAt: dayjs(a.publishedAt) });
      })
      .catch((e) => message.error((e as Error).message))
      .finally(() => setLoading(false));
  }, [id, form, message]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.slug, label: c.parent ? `${categories.find((p) => p.slug === c.parent)?.name ?? ""} › ${c.name}` : c.name })),
    [categories],
  );

  const onFinish = async (values: FormValues) => {
    setSaving(true);
    try {
      const payload = { ...values, publishedAt: values.publishedAt.toISOString() };
      if (id) {
        await api(`/api/admin/articles/${id}`, { method: "PUT", json: payload });
        message.success("Đã lưu bài viết");
        router.refresh();
      } else {
        const created = await api<Article>("/api/admin/articles", { method: "POST", json: payload });
        message.success("Đã tạo bài viết");
        router.replace(`/admin/bai-viet/${created.id}`);
      }
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const previewSlug = slug || slugify(title);
  const previewPath = `/${previewSlug || "duong-dan"}-${id ?? "id"}`;

  return (
    <Form<FormValues>
      form={form}
      layout="vertical"
      initialValues={EMPTY}
      onFinish={onFinish}
      onValuesChange={(changed) => {
        // Tự tạo slug từ tiêu đề khi người dùng chưa sửa slug thủ công
        if ("title" in changed && !form.isFieldTouched("slug")) form.setFieldValue("slug", slugify(changed.title ?? ""));
        // Gợi ý meta description từ sa-pô nếu đang trống
        if ("sapo" in changed && !form.getFieldValue("description")) form.setFieldValue("description", stripHtml(changed.sapo ?? "").replace(/^LNV\s*-\s*/, "").slice(0, 160));
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <Space>
          <Link href="/admin/bai-viet">
            <Button icon={<ArrowLeftOutlined />}>Danh sách</Button>
          </Link>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {id ? `Sửa bài viết #${id}` : "Viết bài mới"}
          </Typography.Title>
        </Space>
        <Space>
          {article && (
            <Button icon={<EyeOutlined />} href={articlePath(article)} target="_blank">
              Xem
            </Button>
          )}
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} disabled={loading}>
            Lưu
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
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
        </Col>
        <Col xs={24} lg={8}>
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
        </Col>
      </Row>
    </Form>
  );
}
