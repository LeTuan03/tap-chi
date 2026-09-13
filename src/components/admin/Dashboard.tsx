"use client";

import { EditOutlined, EyeOutlined, FileDoneOutlined, FileTextOutlined, FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-client";
import type { Article } from "@/lib/types";
import { articlePath, formatDateTime } from "@/lib/utils";

interface Stats {
  articles: number;
  published: number;
  drafts: number;
  categories: number;
  totalViews: number;
  latest: Article[];
}

export default function Dashboard() {
  const { message } = App.useApp();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((e) => message.error((e as Error).message));
  }, [message]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Tổng quan
        </Typography.Title>
        <Link href="/admin/bai-viet/moi">
          <Button type="primary" icon={<PlusOutlined />}>
            Viết bài mới
          </Button>
        </Link>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Tổng bài viết" value={stats?.articles ?? 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Đã đăng" value={stats?.published ?? 0} prefix={<FileDoneOutlined />} styles={{ content: { color: "#389e0d" } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Bản nháp" value={stats?.drafts ?? 0} prefix={<EditOutlined />} styles={{ content: { color: "#d46b08" } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Chuyên mục / Lượt xem" value={stats?.categories ?? 0} suffix={`/ ${(stats?.totalViews ?? 0).toLocaleString("vi-VN")}`} prefix={<FolderOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card title="Bài viết cập nhật gần đây">
        <Table<Article>
          rowKey="id"
          loading={!stats}
          dataSource={stats?.latest ?? []}
          pagination={false}
          size="middle"
          columns={[
            {
              title: "Tiêu đề",
              dataIndex: "title",
              render: (t: string, r) => <Link href={`/admin/bai-viet/${r.id}`}>{t}</Link>,
            },
            { title: "Chuyên mục", dataIndex: "category", width: 180 },
            {
              title: "Trạng thái",
              dataIndex: "status",
              width: 110,
              render: (s: string) => (s === "published" ? <Tag color="green">Đã đăng</Tag> : <Tag color="orange">Nháp</Tag>),
            },
            { title: "Cập nhật", dataIndex: "updatedAt", width: 160, render: (d: string) => formatDateTime(d) },
            {
              title: "",
              width: 60,
              render: (_, r) => (
                <a href={articlePath(r)} target="_blank" rel="noopener" title="Xem trên website">
                  <EyeOutlined />
                </a>
              ),
            },
          ]}
        />
      </Card>
    </Space>
  );
}
