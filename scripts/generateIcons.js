import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePngBuffer(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // Generate pixels (RGBA)
  // Each scanline: 1 filter byte (0) + width * 4 bytes
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Colors: Navy background #151C27, Primary #0052AC / #246BCE, Shield #93F7BA / #FFFFFF
      if (isMaskable) {
        // Full bleed background for Android maskable
        let r = 21, g = 28, b = 39; // #151C27
        if (dist < radius) {
          // Central emblem: blue badge
          r = 0; g = 82; b = 172; // #0052AC
          if (dist < radius * 0.7) {
            // Inner cot accent
            r = 36; g = 107; b = 206; // #246BCE
          }
          if (dist < radius * 0.35) {
            // Verified checkmark / center highlight
            r = 147; g = 247; b = 186; // #93F7BA
          }
        }
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
        rawData[pixelOffset + 3] = 255;
      } else {
        // Rounded squircle / circular icon
        const cornerRadius = width * 0.22;
        // Box distance test
        const qx = Math.abs(x - cx) - (width * 0.5 - cornerRadius);
        const qy = Math.abs(y - cy) - (height * 0.5 - cornerRadius);
        const inside = (qx <= 0 || qy <= 0) || (Math.hypot(Math.max(0, qx), Math.max(0, qy)) <= cornerRadius);

        if (inside) {
          // Gradient from #0052AC (top) to #151C27 (bottom)
          const t = y / height;
          let r = Math.round(0 * (1 - t) + 21 * t);
          let g = Math.round(82 * (1 - t) + 28 * t);
          let b = Math.round(172 * (1 - t) + 39 * t);

          if (dist < radius * 0.75) {
            // Bed frame & cot emblem
            r = 36; g = 107; b = 206; // #246BCE
            if (Math.abs(dx) < radius * 0.55 && Math.abs(dy - radius * 0.1) < radius * 0.25) {
              r = 255; g = 255; b = 255; // White mattress / cot
            }
            if (dist < radius * 0.28) {
              r = 147; g = 247; b = 186; // Verified green badge center
            }
          }
          rawData[pixelOffset] = r;
          rawData[pixelOffset + 1] = g;
          rawData[pixelOffset + 2] = b;
          rawData[pixelOffset + 3] = 255;
        } else {
          // Transparent outside
          rawData[pixelOffset] = 0;
          rawData[pixelOffset + 1] = 0;
          rawData[pixelOffset + 2] = 0;
          rawData[pixelOffset + 3] = 0;
        }
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressedData);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = path.resolve(process.cwd(), 'public');

console.log('Generating PWA and Play Store compliant PNG assets in', publicDir);

const sizes = [
  { name: 'pwa-192x192.png', width: 192, height: 192, isMaskable: false },
  { name: 'pwa-512x512.png', width: 512, height: 512, isMaskable: false },
  { name: 'pwa-maskable-512x512.png', width: 512, height: 512, isMaskable: true },
  { name: 'apple-touch-icon.png', width: 180, height: 180, isMaskable: false },
  { name: 'favicon-32x32.png', width: 32, height: 32, isMaskable: false },
];

for (const s of sizes) {
  const filePath = path.join(publicDir, s.name);
  const buf = generatePngBuffer(s.width, s.height, s.isMaskable);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated ${s.name} (${s.width}x${s.height}, ${buf.length} bytes)`);
}

// Also write favicon.ico by copying 32x32 PNG (modern browsers accept PNG in .ico)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), fs.readFileSync(path.join(publicDir, 'favicon-32x32.png')));
console.log('Generated favicon.ico');

console.log('All PWA and Play Store icons generated successfully!');
