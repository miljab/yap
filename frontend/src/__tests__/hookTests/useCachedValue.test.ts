import { useCachedValue } from "@/hooks/useCachedValue";
import { describe, vi, beforeEach, it, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockUseNavigationType = vi.fn();
const mockUseLocation = vi.fn(() => ({ state: {} }));

vi.mock("react-router", () => ({
  useNavigationType: (...args: unknown[]) => mockUseNavigationType(...args),
  useLocation: () => mockUseLocation(),
  NavigationType: {
    Pop: "pop",
    Push: "push",
    Replace: "replace",
  },
}));

describe("useCachedValue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUseNavigationType.mockReturnValue("push");
    mockUseLocation.mockReturnValue({ state: {} });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("returns default value on initial render", () => {
    mockUseNavigationType.mockReturnValue("push");

    const { result } = renderHook(() =>
      useCachedValue("test-key", "default"),
    );

    expect(result.current[0]).toBe("default");
  });

  it("returns value from sessionStorage on back navigation (Pop)", () => {
    mockUseNavigationType.mockReturnValue("pop");
    sessionStorage.setItem("test-key", "cached-value");

    const { result } = renderHook(() =>
      useCachedValue("test-key", "default"),
    );

    expect(result.current[0]).toBe("cached-value");
  });

  it("returns value from sessionStorage when location.state.restoreCache is true", () => {
    mockUseLocation.mockReturnValue({
      state: { restoreCache: true },
    });
    sessionStorage.setItem("test-key", "restored-value");

    const { result } = renderHook(() =>
      useCachedValue("test-key", "default"),
    );

    expect(result.current[0]).toBe("restored-value");
  });

  it("returns default when sessionStorage value is null on back navigation", () => {
    mockUseNavigationType.mockReturnValue("pop");

    const { result } = renderHook(() =>
      useCachedValue("non-existent-key", "default"),
    );

    expect(result.current[0]).toBe("default");
  });

  it("returns default when sessionStorage value is empty string on back navigation", () => {
    mockUseNavigationType.mockReturnValue("pop");
    sessionStorage.setItem("empty-key", "");

    const { result } = renderHook(() =>
      useCachedValue("empty-key", "default"),
    );

    expect(result.current[0]).toBe("default");
  });

  it("updates value and stores in sessionStorage", () => {
    mockUseNavigationType.mockReturnValue("push");

    const { result } = renderHook(() =>
      useCachedValue<string>("test-key", "default" as string),
    );

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(sessionStorage.getItem("test-key")).toBe("new-value");
  });

  it("does not restore cache on push navigation", () => {
    mockUseNavigationType.mockReturnValue("push");
    sessionStorage.setItem("test-key", "cached-value");

    const { result } = renderHook(() =>
      useCachedValue("test-key", "default"),
    );

    expect(result.current[0]).toBe("default");
  });

  it("does not restore cache on replace navigation", () => {
    mockUseNavigationType.mockReturnValue("replace");
    sessionStorage.setItem("test-key", "cached-value");

    const { result } = renderHook(() =>
      useCachedValue("test-key", "default"),
    );

    expect(result.current[0]).toBe("default");
  });
});
