// Generates PNG icons using only Node.js built-ins (zlib + fs).
// Design: blue→violet gradient background with a white bridge arch (beam + two pillars).
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    table[i] = c;
  }
  return table;
}
const CRC_TABLE = makeCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u32be(n) {
  return Buffer.from([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

function pngChunk(type, dataBuf) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = u32be(dataBuf.length);
  const crcBuf = u32be(crc32(Buffer.concat([typeBuf, dataBuf])));
  return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
}

function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

function generateIcon(size) {
  const top = [0x25, 0x63, 0xeb]; // #2563EB
  const bot = [0x7c, 0x3a, 0xed]; // #7C3AED

  const ihdr = Buffer.concat([u32be(size), u32be(size), Buffer.from([8, 2, 0, 0, 0])]);

  const rows = [];
  for (let y = 0; y < size; y++) {
    const t = size > 1 ? y / (size - 1) : 0;
    const fy = y / size;
    rows.push(0); // filter byte = None
    for (let x = 0; x < size; x++) {
      const fx = x / size;
      let white = false;
      if (size >= 32) {
        // Beam: horizontal bar across top third
        if (fy >= 0.30 && fy < 0.44 && fx >= 0.14 && fx < 0.86) white = true;
        // Left pillar below beam
        if (fy >= 0.44 && fy < 0.76 && fx >= 0.14 && fx < 0.30) white = true;
        // Right pillar below beam
        if (fy >= 0.44 && fy < 0.76 && fx >= 0.70 && fx < 0.86) white = true;
      }
      rows.push(
        white ? 255 : lerp(top[0], bot[0], t),
        white ? 255 : lerp(top[1], bot[1], t),
        white ? 255 : lerp(top[2], bot[2], t),
      );
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rows), { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const iconDir = path.join(__dirname, '..', 'public', 'icon');
fs.mkdirSync(iconDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const buf = generateIcon(size);
  fs.writeFileSync(path.join(iconDir, `${size}.png`), buf);
  console.log(`✓ icon/${size}.png`);
}
console.log('Icons ready.');
