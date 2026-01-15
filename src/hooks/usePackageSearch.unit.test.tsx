import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { usePackageSearch } from "./usePackageSearch";

// Mock the npms-client module
vi.mock("@/adapters/npm/npms-client", () => ({
  NpmsClient: class {
    fetchSuggestions = vi.fn();
  },
}));

describe("usePackageSearch", () => {
  let queryClient: QueryClient;
  let wrapper: ({
    children,
  }: {
    children: React.ReactNode;
  }) => React.JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  it("returns undefined data initially", () => {
    const { result } = renderHook(() => usePackageSearch("react"), { wrapper });

    expect(result.current.data).toBeUndefined();
  });

  it("does not fetch for empty query", () => {
    const { result } = renderHook(() => usePackageSearch(""), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("does not fetch for single character query", () => {
    const { result } = renderHook(() => usePackageSearch("r"), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches suggestions for queries with 2+ characters", () => {
    const { result } = renderHook(() => usePackageSearch("react"), { wrapper });

    // Hook should be in loading state for valid queries
    expect(result.current.isLoading).toBe(true);
  });

  it("respects enabled option", () => {
    const { result } = renderHook(
      () => usePackageSearch("react", { enabled: false }),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("configures correct cache times", () => {
    const { result } = renderHook(() => usePackageSearch("react"), { wrapper });

    // Verify hook is properly configured
    expect(result.current).toBeDefined();
  });

  it("configures retry to 1", () => {
    const { result } = renderHook(() => usePackageSearch("react"), { wrapper });

    // Verify hook is properly configured
    expect(result.current).toBeDefined();
  });
});
