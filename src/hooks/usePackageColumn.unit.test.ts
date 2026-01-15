import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePackageColumn } from "./usePackageColumn";

// Mock @mantine/notifications
vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe("usePackageColumn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear URL params before each test
    window.history.replaceState({}, "", "/");
  });

  it("initializes with empty packages array", () => {
    const { result } = renderHook(() => usePackageColumn());

    expect(result.current.packages).toHaveLength(0);
    expect(result.current.canRemove).toBe(false);
  });

  it("can add packages", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("react");
    });

    expect(result.current.packages).toHaveLength(1);
    expect(result.current.packages[0].packageName).toBe("react");
    expect(result.current.canRemove).toBe(true);
  });

  it("trims whitespace from package names", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("  react  ");
    });

    expect(result.current.packages[0].packageName).toBe("react");
  });

  it("ignores empty package names", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("");
      result.current.addPackage("   ");
    });

    expect(result.current.packages).toHaveLength(0);
  });

  it("prevents duplicate packages (case-insensitive)", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("react");
    });

    act(() => {
      result.current.addPackage("React");
    });

    act(() => {
      result.current.addPackage("REACT");
    });

    expect(result.current.packages).toHaveLength(1);
    expect(result.current.packages[0].packageName).toBe("react");
  });

  it("can add multiple unique packages", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("react");
      result.current.addPackage("vue");
      result.current.addPackage("angular");
    });

    expect(result.current.packages).toHaveLength(3);
    expect(result.current.packages.map((p) => p.packageName)).toEqual([
      "react",
      "vue",
      "angular",
    ]);
  });

  it("can remove packages", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("react");
      result.current.addPackage("vue");
    });

    expect(result.current.packages).toHaveLength(2);

    const reactId = result.current.packages[0].id;
    act(() => {
      result.current.removePackage(reactId);
    });

    expect(result.current.packages).toHaveLength(1);
    expect(result.current.packages[0].packageName).toBe("vue");
  });

  it("can remove all packages", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("react");
      result.current.addPackage("vue");
    });

    const ids = result.current.packages.map((p) => p.id);
    act(() => {
      ids.forEach((id) => {
        result.current.removePackage(id);
      });
    });

    expect(result.current.packages).toHaveLength(0);
    expect(result.current.canRemove).toBe(false);
  });

  it("generates unique IDs for each package", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("react");
      result.current.addPackage("vue");
      result.current.addPackage("angular");
    });

    const ids = result.current.packages.map((p) => p.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("removes the correct package by ID", () => {
    const { result } = renderHook(() => usePackageColumn());

    act(() => {
      result.current.addPackage("react");
      result.current.addPackage("vue");
      result.current.addPackage("angular");
    });

    const vueId = result.current.packages[1].id;
    act(() => {
      result.current.removePackage(vueId);
    });

    expect(result.current.packages).toHaveLength(2);
    expect(result.current.packages.map((p) => p.packageName)).toEqual([
      "react",
      "angular",
    ]);
  });
});
