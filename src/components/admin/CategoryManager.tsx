"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/admin-client";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";

type Row = Category & { articleCount: number };

const MENU_LABEL: Record<string, string> = { main: "Menu chính", more: "Menu mở rộng", hidden: "Ẩn khỏi menu" };

export default function CategoryManager() {
  const { message } = App.useApp();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null | undefined>(undefined); // undefined = đóng, null = tạo mới
  const [form] = Form.useForm<Category>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows((await api<{ items: Row[] }>("/api/admin/categories")).items);
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (c: Category | null) => {
    setEditing(c);
    form.setFieldsValue(c ?? { slug: "", name: "", parent: null, description: "", menu: "main", order: (rows.at(-1)?.order ?? 0) + 1 });
  };

  const save = async () => {
    const values = await form.validateFields();
    try {
      await api("/api/admin/categories", { method: "PUT", json: { ...values, parent: values.parent || null } });
      message.success("Đã lưu chuyên mục");
      setEditing(undefined);
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const remove = async (slug: string) => {
    try {
      await api(`/api/admin/categories?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      message.success("Đã xóa chuyên mục");
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const parents = rows.filter((c) => !c.parent);
  // Sắp xếp cha rồi tới con
  const ordered: Row[] = [];
  for (const p of parents) {
    ordered.push(p);
    ordered.push(...rows.filter((c) => c.parent === p.slug));
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Chuyên mục
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => open(null)}>
          Thêm chuyên mục
        </Button>
      </div>
      <Card>
        <Table<Row>
          rowKey="slug"
          loading={loading}
          dataSource={ordered}
          pagination={false}
          size="middle"
          columns={[
            { title: "Thứ tự", dataIndex: "order", width: 80 },
            {
              title: "Tên",
              dataIndex: "name",
              render: (n: string, r) => (r.parent ? <span style={{ paddingLeft: 24 }}>↳ {n}</span> : <strong>{n}</strong>),
            },
            { title: "Slug (URL)", dataIndex: "slug", render: (s: string, r) => <code>/{r.parent ? `${r.parent}/` : ""}{s}</code> },
            { title: "Vị trí", dataIndex: "menu", width: 150, render: (m: string) => <Tag>{MENU_LABEL[m] ?? m}</Tag> },
            { title: "Bài viết", dataIndex: "articleCount", width: 90 },
            {
              title: "Thao tác",
              width: 110,
              render: (_, r) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} onClick={() => open(r)} />
                  <Popconfirm title="Xóa chuyên mục này?" okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => remove(r.slug)}>
                    <Button size="small" danger icon={<DeleteOutlined />} disabled={r.articleCount > 0} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal open={editing !== undefined} title={editing ? "Sửa chuyên mục" : "Thêm chuyên mục"} onOk={save} onCancel={() => setEditing(undefined)} okText="Lưu" cancelText="Hủy" destroyOnHidden>
        <Form form={form} layout="vertical" onValuesChange={(c) => !editing && "name" in c && form.setFieldValue("slug", slugify(c.name ?? ""))}>
          <Form.Item name="name" label="Tên chuyên mục" rules={[{ required: true, message: "Nhập tên" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug (URL)" rules={[{ required: true, message: "Nhập slug" }]} tooltip={editing ? "Không đổi slug của chuyên mục đã có bài để tránh gãy liên kết" : undefined}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="parent" label="Chuyên mục cha">
            <Select allowClear options={parents.filter((p) => p.slug !== editing?.slug).map((p) => ({ value: p.slug, label: p.name }))} placeholder="(Không có – chuyên mục cấp 1)" />
          </Form.Item>
          <Form.Item name="menu" label="Vị trí trên menu">
            <Select options={Object.entries(MENU_LABEL).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="order" label="Thứ tự">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả (meta description của trang chuyên mục)" rules={[{ max: 320 }]}>
            <Input.TextArea rows={3} showCount maxLength={320} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
