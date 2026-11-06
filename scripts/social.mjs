import { readFileSync } from "node:fs";

const image = readFileSync("public/social.png");
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const isPng = image.length >= 24 && image.subarray(0, 8).equals(pngSignature);

if (!isPng) {
  throw new Error("public/social.png must be a valid PNG image.");
}

const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);

if (width !== 1200 || height !== 630) {
  throw new Error("public/social.png must be a 1200 × 630 PNG image.");
}
