import { flushSync } from "react-dom";
import { useLayoutEffect, useRef, type ReactNode } from "react";
// AuthSession remounts this child when the identity/organization changes.
// Clear private server values lifted into an otherwise public draft form.
export function PrivateDraftBoundary({
  children,
  onExit,
}: {
  children: ReactNode;
  onExit: () => void;
}) {
  const exit = useRef(onExit);
  exit.current = onExit;
  const active = useRef(false);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      queueMicrotask(() => {
        if (!active.current) flushSync(() => exit.current());
      });
    };
  }, []);
  return children;
}
