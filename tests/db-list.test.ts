import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db";

describe("Database List APIs, Pagination & Soft Delete Integration", () => {
  it("should list articles with database-level pagination and default structure", async () => {
    const res = await db.articles.pagedList({ page: 1, pageSize: 10 });
    assert.equal(typeof res.total, "number");
    assert.equal(res.page, 1);
    assert.equal(res.pageSize, 10);
    assert.equal(typeof res.totalPages, "number");
    assert.ok(Array.isArray(res.items));
    assert.ok(res.items.length <= 10);

    for (const item of res.items) {
      assert.equal(item.isDeleted, false);
      assert.equal(item.deletedAt, null);
      assert.ok(item.createdAt);
      assert.ok(item.updatedAt);
    }
  });

  it("should filter articles by date range correctly", async () => {
    const fromDate = "2020-01-01T00:00:00.000Z";
    const toDate = "2030-12-31T23:59:59.999Z";

    const res = await db.articles.pagedList({
      fromDate,
      toDate,
      dateField: "createdAt",
      page: 1,
      pageSize: 5,
    });

    assert.ok(res.total >= 0);
    for (const item of res.items) {
      const itemTime = new Date(item.createdAt).getTime();
      assert.ok(itemTime >= new Date(fromDate).getTime());
      assert.ok(itemTime <= new Date(toDate).getTime());
    }
  });

  it("should handle empty data results gracefully", async () => {
    const res = await db.articles.pagedList({
      search: "non_existent_search_query_1234567890",
      page: 1,
      pageSize: 10,
    });

    assert.equal(res.total, 0);
    assert.equal(res.items.length, 0);
    assert.equal(res.totalPages, 0);
  });

  it("should execute soft deletion and verify excluded from standard list queries", async () => {
    // Create a temporary test article
    const testArticle = await db.articles.create({
      slug: `soft-delete-test-${Date.now()}`,
      title: "Soft Delete Test Article",
      subtitle: "",
      sapo: "Sapo test",
      description: "Test desc",
      content: "<p>Content</p>",
      image: "",
      ogImage: "",
      category: "tin-tuc",
      tags: ["test"],
      author: "Tester",
      source: "",
      type: "article",
      status: "published",
      isFeatured: false,
      isSpotlight: false,
      views: 0,
      publishedAt: new Date().toISOString(),
    });

    assert.ok(testArticle.id);
    assert.equal(testArticle.isDeleted, false);

    // Soft delete the article
    const deletedSuccess = await db.articles.remove(testArticle.id, "admin-user");
    assert.equal(deletedSuccess, true);

    // Verify it is excluded from standard get query
    const retrievedAfterDelete = await db.articles.get(testArticle.id, false);
    assert.equal(retrievedAfterDelete, undefined);

    // Verify it IS accessible when includeDeleted is true
    const retrievedWithDeleted = await db.articles.get(testArticle.id, true);
    assert.ok(retrievedWithDeleted);
    assert.equal(retrievedWithDeleted?.isDeleted, true);
    assert.ok(retrievedWithDeleted?.deletedAt);
    assert.equal(retrievedWithDeleted?.deletedBy, "admin-user");
  });
});
