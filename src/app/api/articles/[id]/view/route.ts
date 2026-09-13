import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Tăng lượt xem bài viết (gọi từ ViewBeacon phía client) */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return NextResponse.json({ ok: false }, { status: 400 });
  await db.articles.incrementViews(n);
  return NextResponse.json({ ok: true });
}
