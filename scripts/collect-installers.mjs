import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const [sourceDirectory, outputDirectory, platform, architecture] =
  process.argv.slice(2);
if (!sourceDirectory || !outputDirectory || !platform || !architecture) {
  throw new Error(
    "Usage: node scripts/collect-installers.mjs <bundle-directory> <output-directory> <windows|macos> <x64|aarch64>",
  );
}
const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const expected = platform === "windows" ? [".exe", ".msi"] : [".dmg"];
const files = [];
function visit(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) visit(file);
    else if (expected.includes(path.extname(item.name))) files.push(file);
  }
}
visit(sourceDirectory);
mkdirSync(outputDirectory, { recursive: true });
const artifacts = [];
for (const extension of expected) {
  const candidates = files.filter((file) => path.extname(file) === extension);
  if (candidates.length !== 1)
    throw new Error(
      `Expected one ${extension} installer, found ${candidates.length}`,
    );
  const suffix =
    extension === ".exe"
      ? `${architecture}-setup.exe`
      : `${architecture}${extension}`;
  const name = `HeheCharging_${version}_${suffix}`;
  const destination = path.join(outputDirectory, name);
  copyFileSync(candidates[0], destination);
  const contents = readFileSync(destination);
  artifacts.push({
    name,
    platform,
    architecture,
    version,
    size: contents.length,
    sha256: createHash("sha256").update(contents).digest("hex"),
  });
}
writeFileSync(
  path.join(outputDirectory, `manifest-${platform}-${architecture}.json`),
  JSON.stringify(
    {
      product: "禾禾充电桩",
      version,
      signing: "unsigned-preview",
      files: artifacts,
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(
  path.join(outputDirectory, `SHA256SUMS-${platform}-${architecture}.txt`),
  artifacts.map((file) => `${file.sha256}  ${file.name}`).join("\n") + "\n",
);
console.log(JSON.stringify(artifacts, null, 2));
