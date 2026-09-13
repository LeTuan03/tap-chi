import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata: Metadata = { title: "Soạn bài viết" };

export default async function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "moi") return <ArticleForm />;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();
  return <ArticleForm id={n} />;
}
