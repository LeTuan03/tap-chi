import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import type { ArticleStatus } from "@/lib/types";
import { parseArticleInput, parseListQueryDto } from "@/lib/validate";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsedQuery = parseListQueryDto(url.searchParams);
  if (!parsedQuery.ok) {
    return NextResponse.json({ errors: parsedQuery.errors }, { status: 400 });
  }

  const category = url.searchParams.get("category") || undefined;
  const statusRaw = url.searchParams.get("status");
  const status = statusRaw === "published" || statusRaw === "draft" ? (statusRaw as ArticleStatus) : undefined;

  const query = {
    ...parsedQuery.value,
    categories: category ? [category] : undefined,
    status,
    orderBy: "updatedAt" as const,
  };

  const result = await db.articles.pagedList(query);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = await parseArticleInput(body);
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  const article = await db.articles.create(parsed.value);
  revalidateSite();
  return NextResponse.json(article, { status: 201 });
}
