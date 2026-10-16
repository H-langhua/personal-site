// Next 16 static export writes segment-prefetch payloads to nested paths like
//   out/zh/about/__next.$d$locale/about/__PAGE__.txt
// but the client requests the flat, dot-joined name:
//   /zh/about/__next.$d$locale.about.__PAGE__.txt   → 404
// This copies each payload to the flat path so prefetch resolves (fixes the
// console 404s) without touching app code.
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const outDir = process.argv[2] ?? "out";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(await walk(full));
    else files.push(full);
  }
  return files;
}

async function main() {
  if (!existsSync(outDir)) {
    console.warn(`[flatten-prefetch] "${outDir}" not found, skipping`);
    return;
  }

  const files = await walk(outDir);
  let created = 0;

  for (const file of files) {
    if (!file.endsWith(".txt")) continue;

    const rel = path.relative(outDir, file).split(path.sep);
    const name = rel.pop();
    const marker = rel.findIndex((segment) => segment.startsWith("__next."));
    if (marker === -1) continue;

    const base = path.join(outDir, ...rel.slice(0, marker));
    const flat = [...rel.slice(marker), name].join(".");
    const target = path.join(base, flat);
    if (existsSync(target)) continue;

    await mkdir(base, { recursive: true });
    await copyFile(file, target);
    created += 1;
  }

  console.log(`[flatten-prefetch] wrote ${created} flat prefetch payload(s)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
