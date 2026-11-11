// Native SVG-to-canvas export: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
export async function exportPng(svg: SVGSVGElement, title: string): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const { width, height } = svg.viewBox.baseVal;
  const scale = Math.min(
    2,
    16384 / width,
    16384 / height,
    Math.sqrt(32_000_000 / (width * height)),
  );
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("class");
  // Embed only the self-hosted faces used by this graphic, including Cyrillic and Turkish subsets.
  const family = svg.getAttribute("font-family")?.split(",")[0] || "Inter";
  if (family !== "Georgia") {
    const css = await fetch("/fonts/export.css").then((r) => {
      if (!r.ok) throw new Error("Fonts unavailable");
      return r.text();
    });
    const rules =
      css.match(/@font-face\s*\{[^}]+\}/g)?.filter((rule) => rule.includes(`'${family}'`)) || [];
    const embedded = await Promise.all(
      rules.map(async (rule) => {
        const path = /url\('([^']+)'\)/.exec(rule)?.[1];
        if (!path || !path.startsWith("/fonts/")) throw new Error("Invalid font path");
        const response = await fetch(path);
        if (!response.ok) throw new Error("Font unavailable");
        const fontBlob = await response.blob();
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(fontBlob);
        });
        return rule.replace(path, data);
      }),
    );
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = embedded.join("\n");
    clone.prepend(style);
  }
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("PNG unavailable"))),
      "image/png",
    ),
  );
  downloadBlob(blob, `${safeFilename(title)}.png`);
}
export function safeFilename(title: string) {
  return (
    title
      .replace(/[^\p{L}\p{N} _-]/gu, "")
      .trim()
      .slice(0, 80) || "scoreboard"
  );
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
