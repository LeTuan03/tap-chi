import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** Tải ảnh lên thư mục public/uploads/YYYY/MM và trả về URL công khai */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Thiếu tệp tin" }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF, AVIF" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Ảnh vượt quá 8MB" }, { status: 400 });

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const base = slugify(path.parse(file.name).name) || "anh";
  const name = `${base}-${Date.now().toString(36)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", yyyy, mm);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${yyyy}/${mm}/${name}`, name, size: file.size });
}
