import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '..', 'apps', 'web', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeB = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcB]);
}

function createPNG(size) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB

  const rowLen = 1 + size * 3;
  const raw = Buffer.alloc(size * rowLen);

  // PHI-PRO green: #16a34a
  const r = 0x16, g = 0xa3, b = 0x4a;

  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const o = y * rowLen + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Create a simple ICO file (just wraps a 32x32 PNG)
function createICO(pngData) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: ICO
  header.writeUInt16LE(1, 4); // 1 image

  // ICO directory entry: 16 bytes
  const entry = Buffer.alloc(16);
  entry[0] = 32;  // width (0 = 256)
  entry[1] = 32;  // height
  entry[2] = 0;   // color palette
  entry[3] = 0;   // reserved
  entry.writeUInt16LE(1, 4);  // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngData.length, 8);  // image size
  entry.writeUInt32LE(22, 12); // offset (6 header + 16 entry)

  return Buffer.concat([header, entry, pngData]);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const s of sizes) {
  const fp = path.join(iconsDir, `icon-${s}x${s}.png`);
  fs.writeFileSync(fp, createPNG(s));
  console.log(`Created ${fp} (${fs.statSync(fp).size} bytes)`);
}

// Also create favicon.ico
const favicon32 = createPNG(32);
const faviconPath = path.join(__dirname, '..', 'apps', 'web', 'public', 'favicon.ico');
fs.writeFileSync(faviconPath, createICO(favicon32));
console.log(`Created ${faviconPath} (${fs.statSync(faviconPath).size} bytes)`);

console.log('\nAll icons generated successfully!');
