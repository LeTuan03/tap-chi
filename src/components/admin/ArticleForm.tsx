"use client";

import { ArrowLeftOutlined, EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Switch, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArticleService, CategoryService, SettingsService } from "@/lib/services";
import type { Article, Category, SiteSettings } from "@/lib/types";
import { articlePath, slugify, stripHtml } from "@/lib/utils";
import ArticleFormMain from "./ArticleFormMain";
import ArticleFormSidebar from "./ArticleFormSidebar";

interface FormValues extends Omit<Article, "id" | "createdAt" | "updatedAt" | "deletedAt" | "isDeleted" | "createdBy" | "updatedBy" | "deletedBy" | "version" | "publishedAt"> {
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
    Promise.all([CategoryService.list(), SettingsService.get()])
      .then(([c, s]) => {
        setCategories(c.items);
        setSettings(s);
      })
      .catch((e) => message.error((e as Error).message));
  }, [message]);

  useEffect(() => {
    if (!id) return;
    ArticleService.get(id)
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
        await ArticleService.update(id, payload);
        message.success("Đã lưu bài viết");
        router.refresh();
      } else {
        const created = await ArticleService.create(payload);
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
          <ArticleFormMain id={id} loading={loading} />
        </Col>
        <Col xs={24} lg={8}>
          <ArticleFormSidebar
            loading={loading}
            categoryOptions={categoryOptions}
            title={title}
            description={description}
            sapo={sapo}
            previewPath={previewPath}
            settings={settings}
          />
        </Col>
      </Row>
    </Form>
  );
}
