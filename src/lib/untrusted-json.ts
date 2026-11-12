export function validateJsonText(text: string, maxBytes: number, maxDepth = 32): void {
  if (text.length > maxBytes) throw new Error("JSON too large");
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error("JSON too large");

  let depth = 0;
  let quoted = false;
  let escaped = false;

  for (const character of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }

    if (character === '"') quoted = true;
    else if (character === "{" || character === "[") {
      depth += 1;
      if (depth > maxDepth) throw new Error("JSON too deep");
    } else if (character === "}" || character === "]") {
      depth -= 1;
      if (depth < 0) throw new Error("Invalid JSON");
    }
  }

  if (depth !== 0 || quoted) throw new Error("Invalid JSON");
}

export function parseJsonText(text: string, maxBytes: number, maxDepth = 32): unknown {
  validateJsonText(text, maxBytes, maxDepth);
  return JSON.parse(text);
}

export async function readJsonFile(file: File, maxBytes: number, maxDepth = 32): Promise<unknown> {
  if (!file.name.toLowerCase().endsWith(".json")) throw new Error("Unsupported backup file");
  if (file.size > maxBytes) throw new Error("JSON too large");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw new Error("JSON too large");
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return parseJsonText(text, maxBytes, maxDepth);
}
