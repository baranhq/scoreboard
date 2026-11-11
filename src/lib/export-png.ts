const svgNamespace = "http://www.w3.org/2000/svg";
const htmlNamespace = "http://www.w3.org/1999/xhtml";

async function embeddedFonts(family: string): Promise<string> {
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
    return embedded.join("\n");
  }
  return "";
}

async function rasterizePng(
  svg: SVGSVGElement,
  title: string,
  width: number,
  height: number,
  requestedScale: 1 | 2,
): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const scale = Math.min(
    requestedScale,
    16384 / width,
    16384 / height,
    Math.sqrt(32_000_000 / (width * height)),
  );
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
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

// Native SVG-to-canvas export: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
export async function exportPng(
  svg: SVGSVGElement,
  title: string,
  requestedScale: 1 | 2 = 1,
): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const { width, height } = svg.viewBox.baseVal;
  clone.removeAttribute("class");
  const family = svg.getAttribute("font-family")?.split(",")[0] || "Inter";
  const fonts = await embeddedFonts(family);
  if (fonts) {
    const style = document.createElementNS(svgNamespace, "style");
    style.textContent = fonts;
    clone.prepend(style);
  }
  await rasterizePng(clone, title, width, height, requestedScale);
}

export async function exportElementPng(
  element: HTMLElement,
  title: string,
  canvas?: { width: number; height: number },
  requestedScale: 1 | 2 = 1,
): Promise<void> {
  await document.fonts.ready;
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) throw new Error("Preview is not visible");

  const width = canvas?.width ?? Math.round(rect.width);
  const height = canvas?.height ?? Math.round(rect.height);
  const clone = element.cloneNode(true) as HTMLElement;
  const sourceNodes = [element, ...element.querySelectorAll<HTMLElement>("*")];
  const cloneNodes = [clone, ...clone.querySelectorAll<HTMLElement>("*")];
  sourceNodes.forEach((source, index) => {
    const style = getComputedStyle(source);
    const target = cloneNodes[index];
    for (let property = 0; property < style.length; property += 1) {
      const name = style.item(property);
      target.style.setProperty(name, style.getPropertyValue(name), style.getPropertyPriority(name));
    }
  });

  clone.querySelectorAll("[data-export-hide]").forEach((control) => control.remove());
  clone.querySelectorAll<HTMLElement>("[data-export-static]").forEach((control) => {
    const display = document.createElement("div");
    for (const { name, value } of Array.from(control.attributes))
      if (name !== "type" && name !== "disabled" && !name.startsWith("aria-"))
        display.setAttribute(name, value);
    display.style.cssText = control.style.cssText;
    display.innerHTML = control.innerHTML;
    control.replaceWith(display);
  });

  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = "0";
  clone.style.maxWidth = "none";
  clone.style.maxHeight = "none";
  const scale = Math.min(width / rect.width, height / rect.height);
  const wrapper = document.createElementNS(htmlNamespace, "div");
  wrapper.style.cssText = `width:${rect.width}px;height:${rect.height}px;transform:translate(${(width - rect.width * scale) / 2}px,${(height - rect.height * scale) / 2}px) scale(${scale});transform-origin:top left;overflow:hidden`;
  wrapper.append(clone);

  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("xmlns", svgNamespace);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const family = getComputedStyle(element).fontFamily.split(",")[0].replaceAll('"', "").trim();
  const fonts = await embeddedFonts(family || "Inter");
  if (fonts) {
    const style = document.createElementNS(svgNamespace, "style");
    style.textContent = fonts;
    svg.append(style);
  }
  const foreignObject = document.createElementNS(svgNamespace, "foreignObject");
  foreignObject.setAttribute("width", String(width));
  foreignObject.setAttribute("height", String(height));
  foreignObject.append(wrapper);
  svg.append(foreignObject);
  await rasterizePng(svg, title, width, height, requestedScale);
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
