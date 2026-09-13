import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { parseCategoryInput } from "@/lib/validate";

export async function GET() {
  const [items, counts] = await Promise.all([db.categories.all(), db.categories.countArticles()]);
  return NextResponse.json({ items: items.map((c) => ({ ...c, articleCount: counts[c.slug] ?? 0 })) });
}

/** Tạo mới hoặc cập nhật (theo slug) */
export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parseCategoryInput(body);
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  if (parsed.value.parent) {
    const parent = await db.categories.get(parsed.value.parent);
    if (!parent) return NextResponse.json({ errors: ["Chuyên mục cha không tồn tại"] }, { status: 400 });
    if (parent.parent) return NextResponse.json({ errors: ["Chỉ hỗ trợ 2 cấp chuyên mục"] }, { status: 400 });
  }
  const saved = await db.categories.upsert(parsed.value);
  revalidateSite();
  return NextResponse.json(saved);
}

export async function DELETE(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!slug) return NextResponse.json({ error: "Thiếu slug" }, { status: 400 });
  const result = await db.categories.remove(slug);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 409 });
  revalidateSite();
  return NextResponse.json({ ok: true });
}
