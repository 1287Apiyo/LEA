import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const shell = [
  "<!doctype html>",
  '<html lang="en">',
  "<head>",
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  "<title>LEA Organization</title>",
  '<link rel="icon" href="/images/favicon.png" type="image/png">',
  "</head>",
  "<body>",
  '<div id="app"></div>',
  '<script type="module" src="/main.js"></script>',
  "</body>",
  "</html>",
  "",
].join("\n");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await execFileAsync("npx", ["tsc"], { cwd: root, shell: true });
await writeFile(path.join(dist, "index.html"), shell);

const sourceFiles = ["src/data.ts", "src/main.ts", "src/programs.ts"];
const referencedAssets = new Set();
referencedAssets.add("images/favicon.png");

for (const sourceFile of sourceFiles) {
  const content = await readFile(path.join(root, sourceFile), "utf8");
  for (const match of content.matchAll(/images\/[^"']+/g)) {
    referencedAssets.add(match[0]);
  }
}

for (const asset of referencedAssets) {
  const source = path.join(root, asset);
  const target = path.join(dist, asset);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}
