"use client";

import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { App, Button, Card, Input, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography } from "antd";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArticleService, CategoryService } from "@/lib/services";
import type { Article, Category } from "@/lib/types";
import { articlePath, formatDateTime } from "@/lib/utils";

interface ListResponse {
  items: Article[];
  total: number;
  page: number;
  pageSize: number;
}

export default function ArticleList() {
  const { message } = App.useApp();
  const [data, setData] = useState<ListResponse>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      setData(await ArticleService.list(params));
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, q, category, status, message]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    CategoryService.list()
      .then((r) => setCategories(r.items))
      .catch(() => undefined);
  }, []);

  const remove = async (id: number) => {
    try {
      await ArticleService.remove(id);
      message.success("Đã xóa bài viết");
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Bài viết
        </Typography.Title>
        <Link href="/admin/bai-viet/moi">
          <Button type="primary" icon={<PlusOutlined />}>
            Viết bài mới
          </Button>
        </Link>
      </div>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            placeholder="Tìm theo tiêu đề, mô tả, tác giả"
            prefix={<SearchOutlined />}
            style={{ width: 320 }}
            onSearch={(v) => {
              setPage(1);
              setQ(v.trim());
            }}
          />
          <Select
            allowClear
            showSearch
            placeholder="Chuyên mục"
            style={{ width: 220 }}
            optionFilterProp="label"
            options={categories.map((c) => ({ value: c.slug, label: c.parent ? `— ${c.name}` : c.name }))}
            onChange={(v) => {
              setPage(1);
              setCategory(v);
            }}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: 150 }}
            options={[
              { value: "published", label: "Đã đăng" },
              { value: "draft", label: "Nháp" },
            ]}
            onChange={(v) => {
              setPage(1);
              setStatus(v);
            }}
          />
        </Space>
        <Table<Article>
          rowKey="id"
          loading={loading}
          dataSource={data.items}
          size="middle"
          pagination={{ current: data.page, pageSize: data.pageSize, total: data.total, showSizeChanger: false, onChange: setPage, showTotal: (t) => `${t} bài viết` }}
          columns={[
            { title: "ID", dataIndex: "id", width: 70 },
            {
              title: "Tiêu đề",
              dataIndex: "title",
              render: (t: string, r) => (
                <Space direction="vertical" size={0}>
                  <Link href={`/admin/bai-viet/${r.id}`}>{t}</Link>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {r.author} · {r.views.toLocaleString("vi-VN")} lượt xem
                    {r.isFeatured && <Tag style={{ marginLeft: 8 }}>Tiêu điểm</Tag>}
                    {r.isSpotlight && <Tag>Nổi bật</Tag>}
                  </Typography.Text>
                </Space>
              ),
            },
            { title: "Chuyên mục", dataIndex: "category", width: 180, render: catName },
            {
              title: "Trạng thái",
              dataIndex: "status",
              width: 110,
              render: (s: string) => (s === "published" ? <Tag color="green">Đã đăng</Tag> : <Tag color="orange">Nháp</Tag>),
            },
            { title: "Đăng lúc", dataIndex: "publishedAt", width: 160, render: (d: string) => formatDateTime(d) },
            {
              title: "Thao tác",
              width: 130,
              render: (_, r) => (
                <Space>
                  <Tooltip title="Sửa">
                    <Link href={`/admin/bai-viet/${r.id}`}>
                      <Button size="small" icon={<EditOutlined />} />
                    </Link>
                  </Tooltip>
                  <Tooltip title="Xem">
                    <Button size="small" icon={<EyeOutlined />} href={articlePath(r)} target="_blank" />
                  </Tooltip>
                  <Popconfirm title="Xóa bài viết này?" okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => remove(r.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </Space>
  );
}
