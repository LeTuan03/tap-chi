/**
 * Nạp dữ liệu mẫu từ thư mục `data/` vào cơ sở dữ liệu.
 * Chạy: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "data");

async function loadJson(name) {
  return JSON.parse(await readFile(path.join(DATA_DIR, name), "utf8"));
}

async function main() {
  const [categories, articles, epapers, settings] = await Promise.all([
    loadJson("categories.json"),
    loadJson("articles.json"),
    loadJson("epapers.json"),
    loadJson("settings.json"),
  ]);

  // Chuyên mục cha trước, con sau
  const parents = categories.filter((c) => !c.parent);
  const children = categories.filter((c) => c.parent);
  for (const c of [...parents, ...children]) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, parentSlug: c.parent ?? null, description: c.description ?? "", menu: c.menu ?? "main", order: c.order ?? 0 },
      update: { name: c.name, parentSlug: c.parent ?? null, description: c.description ?? "", menu: c.menu ?? "main", order: c.order ?? 0 },
    });
  }
  console.log(`Chuyên mục: ${categories.length}`);

  let count = 0;
  for (const a of articles) {
    const data = {
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle ?? "",
      sapo: a.sapo ?? "",
      description: a.description ?? "",
      content: a.content ?? "",
      image: a.image ?? "",
      ogImage: a.ogImage ?? "",
      categorySlug: a.category,
      tags: JSON.stringify(a.tags ?? []),
      author: a.author ?? "",
      source: a.source ?? "",
      type: a.type ?? "article",
      status: a.status ?? "published",
      isFeatured: !!a.isFeatured,
      isSpotlight: !!a.isSpotlight,
      views: a.views ?? 0,
      publishedAt: new Date(a.publishedAt),
      createdAt: new Date(a.createdAt ?? a.publishedAt),
      // Giữ đúng thời điểm sửa gốc thay vì để Prisma gán thời điểm seed
      updatedAt: new Date(a.updatedAt ?? a.publishedAt),
    };
    await prisma.article.upsert({ where: { id: a.id }, create: { id: a.id, ...data }, update: data });
    count++;
  }
  console.log(`Bài viết: ${count}`);

  for (const e of epapers) {
    await prisma.epaper.upsert({
      where: { id: e.id },
      create: { id: e.id, title: e.title, slug: e.slug, cover: e.cover, link: e.link, publishedAt: new Date(e.publishedAt) },
      update: { title: e.title, slug: e.slug, cover: e.cover, link: e.link, publishedAt: new Date(e.publishedAt) },
    });
  }
  console.log(`Tạp chí in: ${epapers.length}`);

  await prisma.setting.upsert({
    where: { key: "site" },
    create: { key: "site", value: JSON.stringify(settings) },
    update: { value: JSON.stringify(settings) },
  });
  console.log("Cài đặt site: OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
