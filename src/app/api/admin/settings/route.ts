import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import type { SiteSettings } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await db.settings.get());
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<SiteSettings> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const current = await db.settings.get();
  const merged: SiteSettings = {
    ...current,
    ...body,
    adsContact: { ...current.adsContact, ...(body.adsContact || {}) },
    socials: { ...current.socials, ...(body.socials || {}) },
    partnerLink: { ...current.partnerLink, ...(body.partnerLink || {}) },
    home: { ...current.home, ...(body.home || {}) },
    ads: { ...current.ads, ...(body.ads || {}) },
    weather: Array.isArray(body.weather) ? body.weather : current.weather,
    keywords: Array.isArray(body.keywords) ? body.keywords.map(String) : current.keywords,
  };
  if (!merged.siteName?.trim()) return NextResponse.json({ error: "Tên website không được để trống" }, { status: 400 });
  await db.settings.save(merged);
  revalidateSite();
  return NextResponse.json(merged);
}
