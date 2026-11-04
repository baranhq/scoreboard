import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
// Original geometric score display, drawn without third-party images or fonts.
const w = 1200,
  h = 630,
  pixels = Buffer.alloc(w * h * 3);
function rect(x, y, width, height, color) {
  const rgb = color.match(/../g).map((n) => parseInt(n, 16));
  for (let row = y; row < Math.min(h, y + height); row++)
    for (let col = x; col < Math.min(w, x + width); col++) {
      const i = (row * w + col) * 3;
      pixels[i] = rgb[0];
      pixels[i + 1] = rgb[1];
      pixels[i + 2] = rgb[2];
    }
}
rect(0, 0, w, h, "f7f8f3");
rect(0, 0, w, 20, "285b35");
rect(40, 60, 550, 510, "e3eef5");
rect(610, 60, 550, 510, "f7e8da");
function zero(x, color) {
  rect(x, 170, 150, 24, color);
  rect(x, 436, 150, 24, color);
  rect(x, 170, 24, 290, color);
  rect(x + 126, 170, 24, 290, color);
}
zero(240, "24516d");
zero(830, "814719");
rect(275, 500, 80, 12, "2c607f");
rect(865, 500, 80, 12, "8c4a1f");
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function chunk(type, data) {
  const t = Buffer.from(type),
    size = Buffer.alloc(4);
  size.writeUInt32BE(data.length);
  let crc = 0xffffffff;
  for (const b of Buffer.concat([t, data])) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([size, t, data, sum]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(w);
header.writeUInt32BE(h, 4);
header[8] = 8;
header[9] = 2;
const rows = Buffer.alloc((w * 3 + 1) * h);
for (let y = 0; y < h; y++) pixels.copy(rows, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
writeFileSync(
  "public/social.png",
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0)),
  ]),
);
