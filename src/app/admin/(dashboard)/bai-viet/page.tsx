import type { Metadata } from "next";
import ArticleList from "@/components/admin/ArticleList";

export const metadata: Metadata = { title: "Bài viết" };

export default function ArticlesPage() {
  return <ArticleList />;
}
