import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import type { ArticleStatus } from "@/lib/types";
import { parseArticleInput } from "@/lib/validate";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
  const q = url.searchParams.get("q")?.trim() || undefined;
  const category = url.searchParams.get("category") || undefined;
  const statusRaw = url.searchParams.get("status");
  const status = statusRaw === "published" || statusRaw === "draft" ? (statusRaw as ArticleStatus) : undefined;
  const query = { search: q, categories: category ? [category] : undefined, status, orderBy: "updatedAt" as const };
  const [items, total] = await Promise.all([db.articles.list({ ...query, skip: (page - 1) * pageSize, take: pageSize }), db.articles.count(query)]);
  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = await parseArticleInput(body);
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  const article = await db.articles.create(parsed.value);
  revalidateSite();
  return NextResponse.json(article, { status: 201 });
}
