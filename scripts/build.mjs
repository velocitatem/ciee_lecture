#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import { computeStepAttrs } from "./layout.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const md = new MarkdownIt({ html: true, linkify: true, typographer: true }).use(
  markdownItAnchor,
  {
    permalink: false,
  },
);

const IMPRESS_COMMENT =
  /^<!--\s*impress:\s*([\s\S]*?)\s*-->\s*/;

function splitSlides(raw) {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  return normalized
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSlideBlock(block) {
  const m = block.match(IMPRESS_COMMENT);
  if (!m) {
    return { extraAttrs: "", body: block };
  }
  return { extraAttrs: m[1].trim(), body: block.slice(m[0].length).trim() };
}

function buildStepHtml(index, total, innerHtml, meta, impressComment) {
  const attrs = computeStepAttrs(meta, index, total, impressComment);
  return `    <div class="step slide" ${attrs}>\n      <div class="slide-inner">\n${innerHtml}\n      </div>\n    </div>`;
}

async function loadMeta() {
  const metaPath = path.join(root, "content", "meta.json");
  const raw = await fs.readFile(metaPath, "utf8");
  const parsed = JSON.parse(raw);
  return {
    title: String(parsed.title ?? "Presentation"),
    description: String(parsed.description ?? ""),
    stepWidth: Number(parsed.stepWidth ?? 1200),
    layout: parsed.layout ?? "depth-tilt",
    layoutOptions:
      typeof parsed.layoutOptions === "object" && parsed.layoutOptions !== null
        ? parsed.layoutOptions
        : {},
    transitionMs: Number(parsed.transitionMs ?? 950),
    perspectivePx: Number(parsed.perspectivePx ?? 1500),
  };
}

async function copyDirIfExists(from, to) {
  try {
    await fs.cp(from, to, { recursive: true });
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

async function build() {
  const meta = await loadMeta();
  const slidesPath = path.join(root, "content", "slides.md");
  const slidesMd = await fs.readFile(slidesPath, "utf8");
  const blocks = splitSlides(slidesMd);

  const n = blocks.length;
  const steps = blocks.map((block, i) => {
    const { extraAttrs, body } = parseSlideBlock(block);
    const inner = md.render(body);
    return buildStepHtml(i, n, inner, meta, extraAttrs);
  });

  const templatePath = path.join(root, "templates", "index.html");
  let html = await fs.readFile(templatePath, "utf8");
  const slidesHtml = steps.join("\n\n");
  html = html
    .replaceAll("{{TITLE}}", escapeHtml(meta.title))
    .replaceAll("{{DESCRIPTION}}", escapeHtml(meta.description))
    .replaceAll("{{TRANSITION_MS}}", String(meta.transitionMs))
    .replaceAll("{{PERSPECTIVE_PX}}", String(meta.perspectivePx))
    .replace("{{SLIDES}}", slidesHtml);

  const outDir = path.join(root, "dist");
  const jsDir = path.join(outDir, "js");
  await fs.mkdir(jsDir, { recursive: true });
  const impressSrc = path.join(
    root,
    "node_modules",
    "impress.js",
    "js",
    "impress.min.js",
  );
  await fs.copyFile(impressSrc, path.join(jsDir, "impress.min.js"));
  await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
  await copyDirIfExists(path.join(root, "content", "assets"), path.join(outDir, "assets"));
  console.log(`Built ${outDir}/index.html (${blocks.length} slides)`);
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

await build();

const watch = process.argv.includes("--watch");
if (watch) {
  const chokidar = (await import("chokidar")).default;
  const watchPaths = [
    path.join(root, "content", "**/*"),
    path.join(root, "templates", "**/*"),
  ];
  chokidar.watch(watchPaths, { ignoreInitial: true }).on("all", async () => {
    try {
      await build();
    } catch (e) {
      console.error(e);
    }
  });
  console.log("Watching content/ and templates/ …");
}
