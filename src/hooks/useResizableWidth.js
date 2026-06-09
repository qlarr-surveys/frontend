import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw == null ? NaN : parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Pointer-capture width resizer for a side panel that sits at the END of a
 * horizontal flex row (e.g. the design preview panel, to the right of the
 * canvas). Dragging the gutter toward the canvas makes the panel wider.
 *
 * While dragging we write the live width straight to a CSS custom property on
 * `containerRef` (`cssVar`) — no React render per frame, so the heavy survey
 * tree inside the panel never reconciles mid-drag. We only commit to React
 * state + localStorage on pointer-up.
 *
 * The panel width is clamped to [min, max] AND to whatever keeps the canvas at
 * least `canvasMin` wide given the live container width (`reservedWidth` is the
 * total px taken by everything that is neither the canvas nor this panel — the
 * left rail and the gutter). RTL is handled by reading the container's computed
 * direction at drag start and flipping the delta.
 */
export function useResizableWidth({
  containerRef,
  cssVar = "--preview-width",
  storageKey,
  min = 320,
  max = 640,
  defaultWidth = 420,
  canvasMin = 400,
  reservedWidth = 0,
}) {
  const [width, setWidth] = useState(() =>
    clamp(readStored(storageKey, defaultWidth), min, max)
  );
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ node: null, startX: 0, startWidth: width, latest: width, rtl: false });

  const maxForContainer = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    if (!containerWidth) return max;
    const allowedByCanvas = containerWidth - reservedWidth - canvasMin;
    return clamp(Math.min(max, allowedByCanvas), min, max);
  }, [containerRef, reservedWidth, canvasMin, min, max]);

  // Re-clamp a stored/previous width that no longer fits the current viewport,
  // so a wide preview from a bigger screen doesn't overflow a smaller one.
  useEffect(() => {
    const reclamp = () => setWidth((w) => clamp(w, min, maxForContainer()));
    reclamp();
    window.addEventListener("resize", reclamp);
    return () => window.removeEventListener("resize", reclamp);
  }, [maxForContainer, min]);

  const onPointerMove = useCallback(
    (e) => {
      const { startX, startWidth, rtl } = drag.current;
      const delta = (e.clientX - startX) * (rtl ? -1 : 1);
      const next = clamp(startWidth - delta, min, maxForContainer());
      drag.current.latest = next;
      containerRef.current?.style.setProperty(cssVar, `${next}px`);
    },
    [containerRef, cssVar, min, maxForContainer]
  );

  const endDrag = useCallback(
    (e) => {
      const { node, latest } = drag.current;
      if (node) {
        try {
          node.releasePointerCapture?.(e.pointerId);
        } catch {}
        node.removeEventListener("pointermove", onPointerMove);
        node.removeEventListener("pointerup", endDrag);
        node.removeEventListener("pointercancel", endDrag);
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setDragging(false);
      setWidth(latest);
      try {
        window.localStorage.setItem(storageKey, String(latest));
      } catch {}
    },
    [onPointerMove, storageKey]
  );

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      const node = e.currentTarget;
      const rtl =
        (containerRef.current &&
          getComputedStyle(containerRef.current).direction === "rtl") ||
        false;
      drag.current = { node, startX: e.clientX, startWidth: width, latest: width, rtl };
      try {
        node.setPointerCapture?.(e.pointerId);
      } catch {}
      node.addEventListener("pointermove", onPointerMove);
      node.addEventListener("pointerup", endDrag);
      node.addEventListener("pointercancel", endDrag);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      setDragging(true);
    },
    [containerRef, width, onPointerMove, endDrag]
  );

  return { width, dragging, onPointerDown };
}
