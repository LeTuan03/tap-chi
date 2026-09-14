import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Article, BaseEntity, Category, Epaper } from "../src/lib/types";

describe("BaseEntity Specification", () => {
  it("should enforce mandatory BaseEntity fields on entity instances", () => {
    const mockEntity: BaseEntity<number> = {
      id: 101,
      createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-01-02T00:00:00.000Z").toISOString(),
      deletedAt: null,
      isDeleted: false,
      createdBy: "admin",
      updatedBy: "admin",
      deletedBy: null,
      version: 1,
    };

    assert.equal(mockEntity.id, 101);
    assert.equal(mockEntity.isDeleted, false);
    assert.equal(mockEntity.deletedAt, null);
    assert.equal(typeof mockEntity.createdAt, "string");
    assert.equal(typeof mockEntity.updatedAt, "string");
    assert.equal(mockEntity.version, 1);
  });

  it("should support soft-deleted BaseEntity state", () => {
    const deletedEntity: BaseEntity<string> = {
      id: "cat-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-05T12:00:00.000Z",
      deletedAt: "2026-01-05T12:00:00.000Z",
      isDeleted: true,
      deletedBy: "user-123",
      version: 2,
    };

    assert.equal(deletedEntity.isDeleted, true);
    assert.equal(deletedEntity.deletedBy, "user-123");
    assert.ok(deletedEntity.deletedAt);
  });

  it("should ensure Article, Category, and Epaper types inherit from BaseEntity", () => {
    const article: Article = {
      id: 1,
      slug: "test-article",
      title: "Test Title",
      subtitle: "",
      sapo: "Sapo text",
      description: "Description",
      content: "<p>Content</p>",
      image: "/img.jpg",
      ogImage: "/og.jpg",
      category: "tin-tuc",
      tags: ["news"],
      author: "Admin",
      source: "Self",
      type: "article",
      status: "published",
      isFeatured: false,
      isSpotlight: false,
      views: 10,
      publishedAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: null,
      isDeleted: false,
    };

    const category: Category = {
      id: "tin-tuc",
      slug: "tin-tuc",
      name: "Tin Tức",
      parent: null,
      description: "Mô tả",
      menu: "main",
      order: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: null,
      isDeleted: false,
    };

    const epaper: Epaper = {
      id: 10,
      title: "Số 01/2026",
      slug: "so-01-2026",
      cover: "/cover.jpg",
      link: "/epaper.pdf",
      publishedAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: null,
      isDeleted: false,
    };

    assert.equal(article.isDeleted, false);
    assert.equal(category.id, category.slug);
    assert.equal(epaper.isDeleted, false);
  });
});
