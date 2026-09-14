import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseListQueryDto } from "../src/lib/validate";

describe("ListQueryDto Validation & Date Range Filtering", () => {
  it("should parse default query parameters when no filters are passed", () => {
    const res = parseListQueryDto({});
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.value.page, 1);
      assert.equal(res.value.pageSize, 20);
      assert.equal(res.value.dateField, "createdAt");
      assert.equal(res.value.fromDate, undefined);
      assert.equal(res.value.toDate, undefined);
      assert.equal(res.value.includeDeleted, false);
    }
  });

  it("should validate and parse valid fromDate and toDate range", () => {
    const params = new URLSearchParams({
      fromDate: "2026-01-01",
      toDate: "2026-01-31",
      dateField: "updatedAt",
    });
    const res = parseListQueryDto(params);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.value.dateField, "updatedAt");
      assert.ok(res.value.fromDate?.startsWith("2026-01-01"));
      assert.ok(res.value.toDate?.startsWith("2026-01-31"));
    }
  });

  it("should return validation error when fromDate > toDate", () => {
    const params = new URLSearchParams({
      fromDate: "2026-02-15",
      toDate: "2026-02-01",
    });
    const res = parseListQueryDto(params);
    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.ok(res.errors.includes("Ngày bắt đầu không được lớn hơn ngày kết thúc"));
    }
  });

  it("should return error when fromDate or toDate is invalid date string", () => {
    const params = new URLSearchParams({
      fromDate: "invalid-date",
      toDate: "2026-02-01",
    });
    const res = parseListQueryDto(params);
    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.ok(res.errors.some((e) => e.includes("fromDate")));
    }
  });

  it("should handle pagination limits and bounds", () => {
    const params = new URLSearchParams({
      page: "-5",
      pageSize: "500",
    });
    const res = parseListQueryDto(params);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.value.page, 1);
      assert.equal(res.value.pageSize, 100); // capped at 100
    }
  });
});
