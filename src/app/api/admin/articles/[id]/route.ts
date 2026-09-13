import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { parseArticleInput } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  const article = await db.articles.get(id);
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  const existing = await db.articles.get(id);
  if (!existing) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = await parseArticleInput(body, existing);
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  const article = await db.articles.update(id, parsed.value);
  revalidateSite();
  return NextResponse.json(article);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  const ok = await db.articles.remove(id);
  if (!ok) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
  revalidateSite();
  return NextResponse.json({ ok: true });
}
