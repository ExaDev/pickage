import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePackageColumn } from "./usePackageColumn";

describe("usePackageColumn", () => {
  it("initializes with 2 empty columns", () => {
    const { result } = renderHook(() => usePackageColumn());

    expect(result.current.columns).toHaveLength(2);
    expect(result.current.columns[0].value).toBe("");
    expect(result.current.columns[0].searchQuery).toBe("");
    expect(result.current.columns[1].value).toBe("");
    expect(result.current.columns[1].searchQuery).toBe("");
  });

  it("initializes columns with unique IDs", () => {
    const { result } = renderHook(() => usePackageColumn());

    const ids = result.current.columns.map((col) => col.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("can add columns up to MAX_PACKAGES (6)", () => {
    const { result } = renderHook(() => usePackageColumn());

    // Start with 2 columns
    expect(result.current.columns).toHaveLength(2);
    expect(result.current.canAddMore).toBe(true);

    // Add 4 more columns
    act(() => {
      result.current.addColumn();
      result.current.addColumn();
      result.current.addColumn();
      result.current.addColumn();
    });

    // Should have 6 columns total
    expect(result.current.columns).toHaveLength(6);
    expect(result.current.canAddMore).toBe(false);

    // Try to add one more (should be ignored)
    act(() => {
      result.current.addColumn();
    });

    expect(result.current.columns).toHaveLength(6);
  });

  it("can remove columns down to MIN_PACKAGES (2)", () => {
    const { result } = renderHook(() => usePackageColumn());

    // Add 2 more columns to have 4 total
    act(() => {
      result.current.addColumn();
      result.current.addColumn();
    });

    expect(result.current.columns).toHaveLength(4);
    expect(result.current.canRemove).toBe(true);

    // Remove 2 columns
    const idsToRemove = result.current.columns.slice(2).map((col) => col.id);
    act(() => {
      idsToRemove.forEach((id) => {
        result.current.removeColumn(id);
      });
    });

    expect(result.current.columns).toHaveLength(2);
    expect(result.current.canRemove).toBe(false);

    // Try to remove one more (should be ignored)
    const remainingId = result.current.columns[0].id;
    act(() => {
      result.current.removeColumn(remainingId);
    });

    expect(result.current.columns).toHaveLength(2);
  });

  it("can update column values", () => {
    const { result } = renderHook(() => usePackageColumn());

    const columnId = result.current.columns[0].id;

    act(() => {
      result.current.updateColumn(columnId, {
        value: "react",
        searchQuery: "react",
      });
    });

    expect(result.current.columns[0].value).toBe("react");
    expect(result.current.columns[0].searchQuery).toBe("react");
  });

  it("can update partial column values", () => {
    const { result } = renderHook(() => usePackageColumn());

    const columnId = result.current.columns[0].id;

    act(() => {
      result.current.updateColumn(columnId, { value: "vue" });
    });

    expect(result.current.columns[0].value).toBe("vue");
    expect(result.current.columns[0].searchQuery).toBe(""); // unchanged
  });

  it("removes the correct column by ID", () => {
    const { result } = renderHook(() => usePackageColumn());

    const initialIds = result.current.columns.map((col) => col.id);

    // Add a column
    act(() => {
      result.current.addColumn();
    });

    const newColumnId = result.current.columns[2].id;
    expect(result.current.columns).toHaveLength(3);

    // Remove the middle column
    act(() => {
      result.current.removeColumn(initialIds[1]);
    });

    expect(result.current.columns).toHaveLength(2);
    expect(result.current.columns.map((col) => col.id)).toEqual([
      initialIds[0],
      newColumnId,
    ]);
  });

  it("maintains column order when adding", () => {
    const { result } = renderHook(() => usePackageColumn());

    const initialIds = result.current.columns.map((col) => col.id);

    act(() => {
      result.current.addColumn();
    });

    expect(result.current.columns[0].id).toBe(initialIds[0]);
    expect(result.current.columns[1].id).toBe(initialIds[1]);
    expect(result.current.columns[2].id).not.toBe(initialIds[0]);
    expect(result.current.columns[2].id).not.toBe(initialIds[1]);
  });

  it("preserves other columns when updating one", () => {
    const { result } = renderHook(() => usePackageColumn());

    const firstColumnId = result.current.columns[0].id;
    const secondColumnId = result.current.columns[1].id;

    act(() => {
      result.current.updateColumn(firstColumnId, { value: "react" });
      result.current.updateColumn(secondColumnId, { value: "vue" });
    });

    expect(result.current.columns[0].value).toBe("react");
    expect(result.current.columns[1].value).toBe("vue");
  });
});
