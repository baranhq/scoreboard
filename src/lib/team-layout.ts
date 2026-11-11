import type { Appearance } from "./appearance";

export function teamGridClass(
  count: number,
  layout: Appearance["layout"],
  _full: boolean,
  canvas?: { width: number; height: number },
): string {
  if (layout === "auto") {
    if (canvas && canvas.width / canvas.height < 0.8)
      return `grid ${_full ? "auto-rows-fr" : ""} grid-cols-1`;
    const columns =
      count <= 1
        ? "grid-cols-1"
        : count === 2
          ? "grid-cols-2"
          : count === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : count === 4
              ? "grid-cols-2"
              : count <= 9
                ? "grid-cols-2 lg:grid-cols-3"
                : "grid-cols-2 overflow-auto auto-rows-[minmax(14rem,1fr)] lg:grid-cols-4";
    return `grid ${_full ? "auto-rows-fr" : ""} ${columns}`;
  }
  return layout === "horizontal"
    ? "grid grid-flow-col auto-cols-[minmax(18rem,1fr)] overflow-x-auto"
    : layout === "vertical"
      ? "grid grid-cols-1"
      : "grid grid-cols-2 md:grid-cols-3";
}
