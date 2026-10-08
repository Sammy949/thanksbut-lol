/** Real image preparation, upload hook, card, and lightbox; offline services. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = await mkdtemp(path.join(tmpdir(), "thanksbut-images-"));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
await symlink(path.join(root, "node_modules"), path.join(output, "node_modules"));
await writeFile(
  path.join(output, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      jsx: "react-jsx",
      baseUrl: root,
      paths: { "@/*": [root + "/*"] },
    },
  }),
);
await writeFile(
  path.join(output, "services.tsx"),
  `
export function useMutation(){return async data=>{window.published=data;return {id:'synthetic-post'}}}
export function useUploadThing(){return {startUpload:async files=>{window.uploadedFile=files[0];return [{ufsUrl:'/screenshot.svg',key:'synthetic-key',name:files[0].name,size:files[0].size,type:files[0].type}]}}}
`,
);
await writeFile(
  path.join(output, "harness.tsx"),
  `
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import {TooltipProvider} from '@radix-ui/react-tooltip';
import {ArchiveCard} from '${root}/components/archive/archive-card';
import {ArchiveLightbox} from '${root}/components/archive/archive-lightbox';
import {prepareArchiveImage} from '${root}/lib/image';
import {responseToArchive} from '${root}/lib/archive-adapter';
import {useArchiveSubmission} from '${root}/hooks/use-create-archive';
window.prepareArchiveImage=prepareArchiveImage;
window.makeFile=async(width=1200,height=600,redacted=true)=>{const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.fillStyle='#ce796b';ctx.fillRect(0,0,width,height);if(redacted){ctx.fillStyle='#171715';ctx.fillRect(0,0,width/2,height)}return new File([await new Promise(r=>c.toBlob(r,'image/png'))],'final.png',{type:'image/png'})};
async function boot(){const file=await window.makeFile();const metadata=await prepareArchiveImage(file);window.prepared=metadata;
const initial=responseToArchive({id:'synthetic-post',category:'job',company:'Example organisation',image:{...metadata,url:'/screenshot.svg',key:'synthetic-key',name:'final.png',size:file.size,type:file.type},caption:'Contributor wording stays.',reactions:0,reacted:false,createdAt:1});
function App(){const [archive,setArchive]=useState(initial);const [open,setOpen]=useState(false);const submission=useArchiveSubmission();
window.replaceImage=patch=>setArchive(a=>({...a,...patch}));window.submitFinal=async()=>{const file=await window.makeFile();const image=await submission.uploadImage(file);await submission.createArchive({category:'job',image});return {sameFile:window.uploadedFile===file,image}};
return <TooltipProvider><main style={{maxWidth:640,margin:'24px auto',padding:16}}><ArchiveCard archive={archive} onOpen={()=>setOpen(true)} onReport={()=>{}}/><ArchiveLightbox archive={archive} open={open} onOpenChange={setOpen} onReport={()=>{}}/></main></TooltipProvider>}
createRoot(document.getElementById('root')).render(<App/>)}boot();
`,
);
await writeFile(
  path.join(output, "build.ts"),
  `
const r=await Bun.build({entrypoints:[${JSON.stringify(path.join(output, "harness.tsx"))}],outdir:${JSON.stringify(output)},target:'browser',plugins:[{name:'offline',setup(b){b.onResolve({filter:/^(convex\\/react|.*lib\\/uploadthing)$/},()=>({path:${JSON.stringify(path.join(output, "services.tsx"))}}))}}]});if(!r.success)throw Error(r.logs.join('\\n'));
`,
);
execFileSync("bun", [path.join(output, "build.ts")], { cwd: root, stdio: "pipe" });
async function findCss(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await findCss(target)));
    else if (entry.name.endsWith(".css")) files.push(target);
  }
  return files;
}
const css = (
  await Promise.all(
    (await findCss(path.join(root, ".next/static"))).map((f) => readFile(f, "utf8")),
  )
).join("\n");
// Also support locally cached build fonts without adding machine paths to source.
const fonts = new Map();
for (const match of css.matchAll(/url\(([^)]+\.woff2)\)/g)) {
  const url = match[1];
  if (!url.startsWith("/")) continue;
  const contents = await readFile(
    path.join(root, ".next/static/media", path.basename(url)),
  )
    .catch(() => readFile(url))
    .catch(() => null);
  if (contents) fonts.set(url, contents);
}
const bundle = await readFile(path.join(output, "harness.js"));
const fontClasses =
  (await readFile(path.join(root, ".next/server/app/index.html"), "utf8")).match(
    /<html[^>]*class="([^"]*)"/,
  )?.[1] || "";
const screenshot =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="#ce796b"/><rect width="600" height="600" fill="#171715"/><text x="660" y="170" font-size="64">Thanks, but…</text></svg>';
await writeFile(
  path.join(output, "static.tsx"),
  `import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {ProgressiveImage} from '${root}/components/archive/progressive-image';console.log(renderToStaticMarkup(<ProgressiveImage src="/cached.svg" alt="Static rejection screenshot" width={1200} height={600} blurDataUrl="data:image/png;base64,aA=="/>));`,
);
const staticHtml = execFileSync("bun", [path.join(output, "static.tsx")], {
  cwd: root,
  encoding: "utf8",
});
let cachedRequests = 0;
const server = createServer(async (req, res) => {
  if (fonts.has(req.url)) {
    res.setHeader("content-type", "font/woff2");
    res.end(fonts.get(req.url));
    return;
  }
  if (req.url?.startsWith("/_next/static/media/")) {
    const name = path.basename(new URL(req.url, "http://localhost").pathname);
    try {
      res.setHeader("content-type", "font/woff2");
      res.end(await readFile(path.join(root, ".next/static/media", name)));
    } catch {
      res.statusCode = 404;
      res.end();
    }
    return;
  }
  if (req.url === "/nojs") {
    res.setHeader("content-type", "text/html");
    res.end('<link rel="stylesheet" href="/style.css">' + staticHtml);
    return;
  }
  if (req.url === "/cached.svg" || req.url === "/screenshot.svg") {
    if (req.url === "/cached.svg") cachedRequests++;
    res.setHeader("content-type", "image/svg+xml");
    res.setHeader(
      "cache-control",
      req.url === "/cached.svg" ? "public, max-age=600" : "no-store",
    );
    res.end(screenshot);
    return;
  }
  if (req.url === "/bundle.js") {
    res.setHeader("content-type", "text/javascript");
    res.end(bundle);
  } else if (req.url === "/style.css") {
    res.setHeader("content-type", "text/css");
    res.end(css);
  } else {
    res.setHeader("content-type", "text/html");
    res.end(
      '<html class="' +
        fontClasses +
        '"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"><div id="root"></div><script src="/bundle.js"></script></html>',
    );
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
});
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    await page.route("**/screenshot.svg", async (route) => {
      await gate;
      await route.fulfill({
        contentType: "image/svg+xml",
        body: screenshot,
        headers: { "cache-control": "no-store" },
      });
    });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const card = page.locator("article [data-image-state]");
    await card.locator('[role="status"]').waitFor();
    assert.equal(await card.getAttribute("data-image-state"), "loading");
    const before = await card.boundingBox();
    const reservedHeight = await card.evaluate((el) => el.offsetHeight);
    const expectedRatio = width < 640 ? 4 / 3 : 2;
    assert.ok(
      Math.abs(before.width / before.height - expectedRatio) < 0.02,
      `Reserved card ratio: ${JSON.stringify({ width, before, css: await card.locator("img").evaluate((el) => ({ width: getComputedStyle(el).width, height: getComputedStyle(el).height, aspect: getComputedStyle(el).aspectRatio, classes: el.className })) })}`,
    );
    assert.ok(
      await card
        .locator(".archive-image-preview")
        .evaluate((el) =>
          getComputedStyle(el).backgroundImage.includes("data:image/webp"),
        ),
    );
    await page.screenshot({ path: path.join(output, `loading-${width}.png`) });
    release();
    await page.waitForFunction(
      () =>
        document.querySelector("article [data-image-state]").dataset.imageState ===
        "ready",
    );
    assert.equal(
      await card.evaluate((el) => el.offsetHeight),
      reservedHeight,
      "No card layout shift",
    );
    await page.getByRole("button", { name: "Open rejection", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await page.waitForFunction(
      () =>
        document.querySelector('[role="dialog"] [data-image-state]').dataset
          .imageState === "ready",
    );
    const inspect = await dialog.locator("[data-image-state]").boundingBox();
    assert.ok(
      Math.abs(inspect.width / inspect.height - 2) < 0.02,
      "Lightbox preserves full image",
    );
    await dialog.evaluate(
      async (el) =>
        await Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))),
    );
    await page.screenshot({ path: path.join(output, `ready-${width}.png`) });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    // A failed image has a real retry without a nested button or opening the dialog.
    let attempts = 0;
    await page.route("**/failed.svg", async (route) => {
      attempts++;
      await route.fulfill(
        attempts === 1
          ? { status: 503, body: "offline", headers: { "cache-control": "no-store" } }
          : {
              contentType: "image/svg+xml",
              body: screenshot,
              headers: { "cache-control": "no-store" },
            },
      );
    });
    await page.evaluate(() => window.replaceImage({ image: "/failed.svg" }));
    await page.getByRole("button", { name: "Retry image" }).waitFor();
    assert.equal(await page.locator("button button").count(), 0);
    assert.equal(
      await card.evaluate((el) => el.offsetHeight),
      reservedHeight,
      "Error retains the reserved layout height independently of card hover transforms",
    );
    await page.screenshot({ path: path.join(output, `error-${width}.png`) });
    const retry = page.getByRole("button", { name: "Retry image" });
    if (width === 320) {
      await retry.focus();
      await page.keyboard.press("Enter");
    } else {
      await retry.click();
    }
    await page.waitForFunction(
      () =>
        document.querySelector("article [data-image-state]").dataset.imageState ===
        "ready",
    );
    assert.equal(attempts, 2);
    assert.equal(await dialog.count(), 0);
    // Replacement resets the preview. A late old response cannot reveal the new one.
    let releaseOld, releaseNew;
    const oldGate = new Promise((r) => (releaseOld = r)),
      newGate = new Promise((r) => (releaseNew = r));
    await page.route("**/old.svg", async (route) => {
      await oldGate;
      await route
        .fulfill({ contentType: "image/svg+xml", body: screenshot })
        .catch(() => {});
    });
    await page.route("**/replacement.svg", async (route) => {
      await newGate;
      await route.fulfill({ contentType: "image/svg+xml", body: screenshot });
    });
    await page.evaluate(() => window.replaceImage({ image: "/old.svg" }));
    await page.waitForFunction(
      () =>
        document.querySelector("article [data-image-state]").dataset.imageState ===
        "loading",
    );
    await page.evaluate(() => window.replaceImage({ image: "/replacement.svg" }));
    releaseOld();
    await page.waitForTimeout(150);
    assert.equal(await card.getAttribute("data-image-state"), "loading");
    releaseNew();
    await page.waitForFunction(
      () =>
        document.querySelector("article [data-image-state]").dataset.imageState ===
        "ready",
    );
    // Older images without metadata and malformed previews have a neutral fallback.
    let releaseLegacy;
    const legacyGate = new Promise((r) => (releaseLegacy = r));
    await page.route("**/legacy.svg", async (route) => {
      await legacyGate;
      await route.fulfill({ contentType: "image/svg+xml", body: screenshot });
    });
    await page.evaluate(() =>
      window.replaceImage({
        image: "/legacy.svg",
        imageWidth: undefined,
        imageHeight: undefined,
        blurDataUrl: "https://example.com/untrusted.png",
      }),
    );
    await page.waitForFunction(
      () =>
        document.querySelector("article [data-image-state]").dataset.imageState ===
        "loading",
    );
    assert.equal(
      await card
        .locator(".archive-image-preview")
        .evaluate((el) => getComputedStyle(el).backgroundImage),
      "none",
    );
    releaseLegacy();
    await page.waitForFunction(
      () =>
        document.querySelector("article [data-image-state]").dataset.imageState ===
        "ready",
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    const portrait = screenshot.replace(
      'width="1200" height="600"',
      'width="600" height="1200"',
    );
    await page.route("**/portrait.svg", (route) =>
      route.fulfill({ contentType: "image/svg+xml", body: portrait }),
    );
    await page.evaluate(() =>
      window.replaceImage({
        image: "/portrait.svg",
        imageWidth: 600,
        imageHeight: 1200,
        blurDataUrl: undefined,
      }),
    );
    await page.waitForFunction(
      () =>
        document.querySelector("article [data-image-state]").dataset.imageState ===
        "ready",
    );
    const portraitCard = await card.boundingBox();
    assert.ok(
      Math.abs(portraitCard.width / portraitCard.height - (width < 640 ? 4 / 3 : 0.5)) <
        0.02,
    );
    await page.getByRole("button", { name: "Open rejection", exact: true }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('[role="dialog"] [data-image-state]').dataset
          .imageState === "ready",
    );
    const portraitInspect = await dialog.locator("[data-image-state]").boundingBox();
    assert.ok(Math.abs(portraitInspect.width / portraitInspect.height - 0.5) < 0.02);
    assert.ok(portraitInspect.height <= 630.5);
    await dialog.evaluate(
      async (el) =>
        await Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))),
    );
    await page.screenshot({ path: path.join(output, `portrait-${width}.png`) });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    await page.route("**/thin.svg", (route) =>
      route.fulfill({ status: 503, body: "offline" }),
    );
    await page.evaluate(() =>
      window.replaceImage({ image: "/thin.svg", imageWidth: 1200, imageHeight: 10 }),
    );
    await page.getByRole("button", { name: "Retry image" }).waitFor();
    assert.ok(
      (await card.boundingBox()).height >= 128,
      "Thin screenshots still have readable error controls",
    );
    let lazyRequests = 0;
    await page.route("**/lazy.svg", (route) => {
      lazyRequests++;
      return route.fulfill({ contentType: "image/svg+xml", body: screenshot });
    });
    await page.evaluate(() => {
      document.querySelector("main").style.marginTop = "6000px";
      window.replaceImage({ image: "/lazy.svg", imageWidth: 1200, imageHeight: 600 });
    });
    await page.waitForTimeout(200);
    assert.equal(lazyRequests, 0, "Offscreen full images stay lazy");
    await card.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () =>
        document.querySelector("article [data-image-state]").dataset.imageState ===
        "ready",
    );
    assert.equal(lazyRequests, 1);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      `PASS ${width}px: delayed preview, stable geometry, lightbox, retry, replacement race, legacy fallback`,
    );
  }
  const cachedPage = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  await cachedPage.goto(base);
  await cachedPage.waitForFunction(() => window.replaceImage);
  await cachedPage.evaluate(() => window.replaceImage({ image: "/cached.svg" }));
  await cachedPage.waitForFunction(
    () =>
      document.querySelector("article [data-image-state]").dataset.imageState ===
      "ready",
  );
  await cachedPage.getByRole("button", { name: "Open rejection", exact: true }).click();
  await cachedPage.waitForFunction(
    () =>
      document.querySelector('[role="dialog"] [data-image-state]').dataset
        .imageState === "ready",
  );
  assert.equal(cachedRequests, 1, "Lightbox reuses the cached screenshot");
  await cachedPage.close();
  console.log("PASS cached image opens without getting stuck behind its preview");

  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await nojs.goto(base + "/nojs");
  assert.equal(
    await nojs
      .locator(".archive-image-preview")
      .evaluate((el) => getComputedStyle(el).display),
    "none",
  );
  assert.equal(
    await nojs
      .getByAltText("Static rejection screenshot")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    true,
  );
  await nojs.close();
  console.log("PASS real screenshot remains visible without JavaScript");
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  await page.route("**/*.svg", (route) =>
    route.fulfill({ contentType: "image/svg+xml", body: screenshot }),
  );
  await page.goto(base);
  await page.waitForFunction(() => window.prepared);
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  assert.equal(
    await page
      .locator(".archive-image-preview")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionProperty),
    "none",
  );
  const result = await page.evaluate(() => window.submitFinal());
  assert.equal(result.sameFile, true);
  assert.equal(result.image.width, 1200);
  assert.equal(result.image.height, 600);
  assert.ok(result.image.blurDataUrl.startsWith("data:image/webp;base64,"));
  assert.equal(
    await page.evaluate(() => window.published.image.blurDataUrl),
    result.image.blurDataUrl,
  );
  // The preview is generated from the final redacted pixels, not a prior source.
  const pixels = await page.evaluate(async () => {
    const img = new Image();
    img.src = window.published.image.blurDataUrl;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return {
      width: c.width,
      height: c.height,
      left: [...ctx.getImageData(1, 2, 1, 1).data],
      right: [...ctx.getImageData(8, 2, 1, 1).data],
      length: img.src.length,
    };
  });
  assert.equal(pixels.width, 10);
  assert.equal(pixels.height, 5);
  assert.ok(pixels.left[0] < 60 && pixels.right[0] > 150);
  assert.ok(pixels.length < 4096);
  const optional = await page.evaluate(async () => {
    const file = await window.makeFile(400, 800);
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = () => null;
    const fallback = await window.prepareArchiveImage(file);
    HTMLCanvasElement.prototype.getContext = original;
    const corrupt = await window.prepareArchiveImage(
      new File(["broken"], "broken.png", { type: "image/png" }),
    );
    const NativeImage = window.Image;
    window.Image = class {
      removeAttribute() {}
      set src(value) {}
    };
    const started = performance.now();
    const timeout = await window.prepareArchiveImage(file);
    const elapsed = performance.now() - started;
    window.Image = NativeImage;
    return { fallback, corrupt, timeout, elapsed };
  });
  assert.deepEqual(optional.fallback, { width: 400, height: 800 });
  assert.deepEqual(optional.corrupt, {});
  assert.deepEqual(optional.timeout, {});
  assert.ok(optional.elapsed >= 4900 && optional.elapsed < 6500);
  await page.screenshot({ path: path.join(output, "reduced-motion.png") });
  await page.close();
  console.log(
    "PASS final-file upload, redacted preview pixels, reduced motion, canvas/decode fallback, bounded preparation",
  );
  console.log(`Screenshots: ${output}`);
} finally {
  await browser.close();
  server.close();
}
