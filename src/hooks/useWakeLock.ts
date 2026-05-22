import { useEffect } from "react";

interface WakeLockSentinel {
  released: boolean;
  release(): Promise<void>;
  addEventListener?(type: "release", listener: () => void): void;
}

interface WakeLockApi {
  request(type: "screen"): Promise<WakeLockSentinel>;
}

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === "undefined") return;
    const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock;
    if (!api) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const next = await api.request("screen");
        if (cancelled) {
          void next.release();
          return;
        }
        sentinel = next;
      } catch {
        // browser may deny under power-save, etc.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !sentinel) void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release().catch(() => undefined);
    };
  }, [active]);
}
