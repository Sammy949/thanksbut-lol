/**
 * Run after bun run build. Requires Playwright on the module path, or an
 * explicit PLAYWRIGHT_MODULE. CHROME_BIN optionally selects Chromium.
 * Synthetic images only; no app services or credentials are used.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = await mkdtemp(path.join(tmpdir(), "thanksbut-redaction-"));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
await symlink(path.join(root, "node_modules"), path.join(output, "node_modules"));
const entry = [
  'import React, { useState } from "react";',
  'import { createRoot } from "react-dom/client";',
  "import { ImageEditor } from " +
    JSON.stringify(path.join(root, "components/upload/image-editor/image-editor.tsx")) +
    ";",
  "import { RedactionEditor } from " +
    JSON.stringify(
      path.join(root, "components/upload/image-editor/redaction-editor.tsx"),
    ) +
    ";",
  "import { applyRedactions } from " +
    JSON.stringify(path.join(root, "lib/image-editing.ts")) +
    ";",
  'const source=document.createElement("canvas"), params=new URLSearchParams(location.search);',
  'source.width=Number(params.get("w")||1200); source.height=Number(params.get("h")||900);',
  'const ctx=source.getContext("2d");',
  'for(let y=0;y<source.height;y+=8) for(let x=0;x<source.width;x+=8){ctx.fillStyle=(x/8+y/8)%2?"#fff":"#333";ctx.fillRect(x,y,8,8);}',
  "window.source=source;window.applyRedactions=applyRedactions;",
  "function Harness(){",
  "const [boxes,setBoxes]=useState([]),[selected,select]=useState(null),[file,setFile]=useState(null);",
  "window.boxes=boxes;",
  'React.useEffect(()=>{source.toBlob(blob=>setFile(new File([blob],"synthetic.png",{type:"image/png"})));},[]);',
  'if(params.has("direct")) return <div style={{width:"100vw",height:"100vh",padding:16}}><RedactionEditor source={source} redactions={boxes} selectedId={selected} onChange={setBoxes} onSelect={select}/></div>;',
  "return file && <ImageEditor file={file} onCancel={()=>{}} onComplete={async file=>{",
  'const image=await createImageBitmap(file),canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;canvas.getContext("2d").drawImage(image,0,0);window.saved=canvas;',
  "}}/>;}",
  'createRoot(document.getElementById("root")).render(<Harness/>);',
].join("\n");
await writeFile(path.join(output, "harness.tsx"), entry);
execFileSync(
  "bun",
  [
    "build",
    path.join(output, "harness.tsx"),
    "--target",
    "browser",
    "--outfile",
    path.join(output, "bundle.js"),
    "--tsconfig-override",
    path.join(root, "tsconfig.json"),
  ],
  { cwd: root, stdio: "pipe" },
);
async function cssFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await cssFiles(file)));
    else if (entry.name.endsWith(".css")) files.push(file);
  }
  return files;
}
const css = (
  await Promise.all(
    (await cssFiles(path.join(root, ".next/static"))).map((file) =>
      readFile(file, "utf8"),
    ),
  )
).join("\n");
const bundle = await readFile(path.join(output, "bundle.js"));
const server = createServer((req, res) => {
  if (req.url === "/bundle.js") {
    res.setHeader("content-type", "text/javascript");
    res.end(bundle);
  } else if (req.url === "/style.css") {
    res.setHeader("content-type", "text/css");
    res.end(css);
  } else {
    res.setHeader("content-type", "text/html");
    res.end(
      '<link rel="stylesheet" href="/style.css"><div id="root"></div><script src="/bundle.js"></script>',
    );
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
});
const base = "http://127.0.0.1:" + server.address().port;
try {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    if (viewport.width < 600) {
      await page.addInitScript(() =>
        document.addEventListener("DOMContentLoaded", () =>
          document.documentElement.classList.add("dark"),
        ),
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
    }
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const frame = page.getByRole("application");
    await frame.waitFor();
    const box = await frame.boundingBox();
    assert.ok(box.width > 0 && box.height > 0);
    assert.ok(box.y >= 0 && box.y + box.height <= viewport.height);
    assert.ok(Math.abs(box.width / box.height - 4 / 3) < 0.01);
    const draw = async (x, y, w, h) => {
      await frame.waitFor();
      const box = await frame.boundingBox();
      await page.mouse.move(box.x + x * box.width, box.y + y * box.height);
      await page.mouse.down();
      await page.mouse.move(box.x + (x + w) * box.width, box.y + (y + h) * box.height, {
        steps: 10,
      });
      await page.mouse.up();
    };
    await draw(0.2, 0.3, 0.2, 0.15);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(() => !!window.saved);
    const contrast = await page.evaluate(() => {
      const c = window.saved,
        ctx = c.getContext("2d");
      const range = (x, y) => {
        const values = ctx.getImageData(
          Math.round(x * c.width),
          Math.round(y * c.height),
          32,
          32,
        ).data;
        const reds = Array.from(values).filter((_, i) => i % 4 === 0);
        return Math.max(...reds) - Math.min(...reds);
      };
      return { inside: range(0.27, 0.35), outside: range(0.05, 0.05) };
    });
    assert.ok(
      contrast.inside < 30 && contrast.outside > 100,
      "saved blur shifted or failed",
    );
    await page.reload();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await draw(0.2, 0.3, 0.2, 0.15);
    await page.getByRole("button", { name: "Black", exact: true }).click();
    await page.screenshot({
      path: path.join(output, "editor-" + viewport.width + ".png"),
    });
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(() => !!window.saved);
    const saved = await page.evaluate(() => {
      const c = window.saved,
        ctx = c.getContext("2d");
      const sample = (x, y) =>
        Array.from(
          ctx.getImageData(Math.round(x * c.width), Math.round(y * c.height), 1, 1)
            .data,
        );
      return { inside: sample(0.3, 0.375), outside: sample(0.1, 0.1) };
    });
    assert.ok(
      saved.inside.slice(0, 3).every((n) => n < 8),
      "saved black box shifted",
    );
    assert.ok(
      saved.outside.slice(0, 3).some((n) => n > 30),
      "unexpected redaction outside box",
    );
    assert.deepEqual(errors, []);
    console.log(
      viewport.width + "px: crop, draw, blur/black compressed exports aligned",
    );
    await page.reload();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const second = await frame.boundingBox();
    await page.mouse.move(
      second.x + second.width * 0.2,
      second.y + second.height * 0.2,
    );
    await page.mouse.down();
    await page.mouse.move(
      second.x + second.width * 0.4,
      second.y + second.height * 0.4,
      { steps: 5 },
    );
    await page.mouse.up();
    await page.getByRole("button", { name: "Back to crop" }).click();
    await page.getByRole("button", { name: "1:1", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    assert.equal(await frame.locator("div.absolute").count(), 0);
    console.log(viewport.width + "px: recropping clears stale boxes");
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const [w, h] of [
    [600, 1600],
    [1600, 600],
  ]) {
    await page.goto(base + "/?direct&w=" + w + "&h=" + h);
    const frame = page.getByRole("application");
    const box = await frame.boundingBox();
    assert.ok(Math.abs(box.width / box.height - w / h) < 0.01);
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4, {
      steps: 10,
    });
    await page.mouse.up();
    const result = await page.evaluate(() => {
      const preview = document.querySelector("canvas"),
        rendered = window.applyRedactions(window.source, window.boxes);
      const a = preview
        .getContext("2d")
        .getImageData(0, 0, preview.width, preview.height).data;
      const b = rendered
        .getContext("2d")
        .getImageData(0, 0, rendered.width, rendered.height).data;
      const original = window.source
        .getContext("2d")
        .getImageData(0, 0, rendered.width, rendered.height).data;
      return {
        equal: a.every((n, i) => n === b[i]),
        changed: b.some((n, i) => n !== original[i]),
        rect: window.boxes[0],
      };
    });
    assert.equal(result.equal, true, "preview and exported blur differ");
    assert.equal(result.changed, true, "blur was not applied");
    assert.ok(
      Math.abs(result.rect.x - 0.2) < 0.005 && Math.abs(result.rect.y - 0.2) < 0.005,
    );
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4, {
      steps: 5,
    });
    await page.mouse.up();
    const moved = await page.evaluate(() => window.boxes[0]);
    assert.ok(Math.abs(moved.x - 0.3) < 0.005 && Math.abs(moved.y - 0.3) < 0.005);
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.65, {
      steps: 5,
    });
    await page.mouse.up();
    const resized = await page.evaluate(() => window.boxes[0]);
    assert.ok(Math.abs(resized.w - 0.3) < 0.01 && Math.abs(resized.h - 0.35) < 0.01);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(
      () =>
        document.querySelector('[role="application"]').getBoundingClientRect().right <=
        390,
    );
    const afterResize = await page.evaluate(() => window.boxes[0]);
    assert.deepEqual(afterResize, resized);
    await page.keyboard.press("Delete");
    assert.equal(await frame.locator("div.absolute").count(), 0);
    console.log(
      w +
        "x" +
        h +
        ": blur pixels, move, resize, viewport change, keyboard deletion verified",
    );
  }
  const overlap = await page.evaluate(() => {
    const black = { id: "black", x: 0.2, y: 0.2, w: 0.3, h: 0.3, mode: "black" },
      blur = { id: "blur", x: 0.3, y: 0.3, w: 0.3, h: 0.3, mode: "blur" };
    const out = window.applyRedactions(window.source, [black, blur]);
    return Array.from(
      out
        .getContext("2d")
        .getImageData(Math.round(out.width * 0.4), Math.round(out.height * 0.4), 1, 1)
        .data,
    );
  });
  assert.deepEqual(overlap, [0, 0, 0, 255]);
  const edgeCoverage = await page.evaluate(() => {
    const r = { id: "edge", x: 0.2009, y: 0.2009, w: 0.1, h: 0.1, mode: "black" };
    const out = window.applyRedactions(window.source, [r]);
    const ctx = out.getContext("2d");
    const x = Math.floor(r.x * out.width),
      y = Math.floor(r.y * out.height);
    const right = Math.ceil((r.x + r.w) * out.width) - 1;
    const bottom = Math.ceil((r.y + r.h) * out.height) - 1;
    return [
      [x, y],
      [right, bottom],
    ].map(([x, y]) => Array.from(ctx.getImageData(x, y, 1, 1).data));
  });
  assert.deepEqual(edgeCoverage, [
    [0, 0, 0, 255],
    [0, 0, 0, 255],
  ]);
  const fallback = await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      CanvasRenderingContext2D.prototype,
      "filter",
    );
    Object.defineProperty(CanvasRenderingContext2D.prototype, "filter", {
      configurable: true,
      get: () => "none",
      set: () => {},
    });
    try {
      const out = window.applyRedactions(window.source, [
        { id: "blur", x: 0.2, y: 0.2, w: 0.3, h: 0.3, mode: "blur" },
      ]);
      return Array.from(
        out
          .getContext("2d")
          .getImageData(Math.round(out.width * 0.3), Math.round(out.height * 0.3), 1, 1)
          .data,
      );
    } finally {
      Object.defineProperty(CanvasRenderingContext2D.prototype, "filter", descriptor);
    }
  });
  assert.deepEqual(fallback, [0, 0, 0, 255]);
  const touchFrame = await page.getByRole("application").boundingBox();
  const session = await page.context().newCDPSession(page);
  const touchPoint = (n) => ({
    x: touchFrame.x + touchFrame.width * n,
    y: touchFrame.y + touchFrame.height * n,
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [touchPoint(0.2)],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [touchPoint(0.4)],
  });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const touchRect = await page.evaluate(() => window.boxes[0]);
  assert.ok(
    touchRect &&
      Math.abs(touchRect.w - 0.2) < 0.01 &&
      Math.abs(touchRect.h - 0.2) < 0.01,
  );
  console.log("touch drawing preserves image coordinates");
  console.log("overlapping black/blur and unsupported-filter fallback remain opaque");
  await page.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
