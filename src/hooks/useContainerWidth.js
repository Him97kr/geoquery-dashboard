// D3 charts need a concrete pixel number to build their scales/SVG width —
// they can't just use CSS %/vw internally. This hook is the bridge: it
// watches the chart's container element with a ResizeObserver and returns
// its *current* width, so a chart's `useEffect` can include this value in
// its dependency array and redraw whenever the container is actually
// resized, instead of freezing at whatever width was measured once on
// mount. That one-time snapshot (`container.clientWidth`) going stale is
// what was causing charts to overflow their card after a window resize,
// sidebar toggle, or late webfont reflow.
import { useEffect, useState } from "react";

export function useContainerWidth(ref) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;

    let frame;
    const observer = new ResizeObserver((entries) => {
      // rAF-debounce: ResizeObserver can fire multiple times per layout
      // pass (e.g. during a drag-resize), so coalesce to one redraw per frame.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = entries[0]?.contentRect?.width;
        if (w) setWidth(w);
      });
    });

    observer.observe(el);
    // Seed with the current width immediately so the first paint doesn't
    // wait a frame for the observer's initial callback.
    setWidth(el.clientWidth);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ref]);

  return width;
}