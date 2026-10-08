/** Actual UI components, synthetic content, and offline service stubs only. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = await mkdtemp(path.join(tmpdir(), "thanksbut-flows-"));
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
const imports = [
  ["SubmissionDrawer", "components/upload/submission-drawer.tsx"],
  ["ArchiveFeed", "components/archive/archive-feed.tsx"],
  ["Hero", "components/shared/hero.tsx"],
  ["SubmissionProvider", "components/upload/submission-provider.tsx"],
  ["ErrorState", "components/shared/error-state.tsx"],
  ["AdminPage", "app/admin/page.tsx", true],
  ["ManagePage", "app/manage/[id]/page.tsx", true],
  ["useReactions", "hooks/use-reactions.ts"],
  ["useShareTarget", "hooks/use-share-target.ts"],
]
  .map(
    ([name, file, isDefault]) =>
      `import ${isDefault ? name : `{${name}}`} from ${JSON.stringify(path.join(root, file))};`,
  )
  .join("\n");
await writeFile(
  path.join(output, "backend.tsx"),
  `
export function useArchiveSubmission(){return {
 uploadImage:async file=>{window.uploads=(window.uploads||0)+1;if(window.uploadFail)throw Error('offline');return {key:'test-key',url:'/image.png',name:file.name,size:file.size,type:file.type}},
 createArchive:async data=>{if(window.publishSlow)await new Promise(r=>setTimeout(r,8000));if(window.publishFail)throw Error('offline');window.published=data;return {id:'new-test-post',manageToken:'synthetic-deletion-capability'}}
}};
`,
);
await writeFile(
  path.join(output, "navigation.tsx"),
  `
import React from 'react';
export function useSearchParams(){React.useSyncExternalStore(cb=>{window.addEventListener('popstate',cb);return()=>window.removeEventListener('popstate',cb)},()=>location.search,()=> '');return new URLSearchParams(location.search)}
export function useParams(){return {id:'test-post'}}
export default function Link({href,children,...props}){return <a href={href} {...props}>{children}</a>}
`,
);
await writeFile(
  path.join(output, "convex.tsx"),
  `
export function useQuery(){return window.fixture}
`,
);
await writeFile(
  path.join(output, "harness.tsx"),
  `
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import {Toaster} from 'sonner';import {TooltipProvider} from '@radix-ui/react-tooltip';
${imports}
const records=[{id:'test-post',category:'job',company:'Example organisation',text:'First rejection',caption:'Contributor wording stays.',reactions:2,reacted:false,createdAt:Date.now()},{id:'second-post',category:'job',text:'Second rejection',reactions:1,reacted:false,createdAt:Date.now()}];
window.fixture={...records[0],image:undefined};
window.reports=[{archiveId:'test-post',reportCount:1,firstReportedAt:Date.now(),reports:[{reason:'pii',createdAt:Date.now()}],archive:{...records[0],status:'visible',image:null}}];
const json=data=>new Response(JSON.stringify(data),{headers:{'content-type':'application/json'}});
window.fetch=async(url,options)=>{
 if(String(url)==='/api/session')return json({sessionId:'synthetic-session'});
 if(String(url)==='/api/react'){window.reactionCalls=(window.reactionCalls||0)+1;await new Promise(r=>setTimeout(r,300));if(window.reactionFail)return new Response('',{status:503});window.didReact=!window.didReact;return json({reacted:!!window.didReact,reactions:window.didReact?3:2})}
 if(String(url)==='/api/admin/session')return json({authed:true});
 if(String(url)==='/api/admin/reports')return json({items:window.reports});
 if(String(url)==='/api/admin/cleanup')return json({count:1,more:false});
 if(String(url)==='/api/admin/remove'){window.reports=[];return json({removed:false,screenshotCleanup:'pending'})}
 if(String(url)==='/api/admin/dismiss'){window.reports=[];return json({resolved:1})}
 if(String(url)==='/api/manage/delete')return json({deleted:true,screenshotCleanup:'pending'});
 if(String(url)==='/api/report'){window.reportCalls=(window.reportCalls||0)+1;return window.reportFail?new Response('',{status:429}):json({ok:true})}
 throw Error('Unexpected service request');
};
function Harness(){const [open,setOpen]=useState(false);const [category,setCategory]=useState(null);const reactions=useReactions(records);const share=useShareTarget();window.shareTarget=share;
const view=new URLSearchParams(location.search).get('view');
if(view==='admin')return <AdminPage/>;if(view==='manage')return <ManagePage/>;if(view==='error')return <ErrorState reset={()=>{}}/>;if(view==='404')return <ErrorState notFound/>;
return <SubmissionProvider><Hero/><button onClick={()=>setOpen(true)}>Open test submission</button><ArchiveFeed archives={reactions.archives.filter(a=>!category||a.category===category)} category={category} onCategoryChange={setCategory} onReact={reactions.react} onReportSubmit={async(id,reason)=>{const response=await fetch('/api/report');if(!response.ok)throw Error('Too many attempts. Wait a minute, then try again.')}}/><SubmissionDrawer open={open} onOpenChange={setOpen}/></SubmissionProvider>}
createRoot(document.getElementById('root')).render(<TooltipProvider><Harness/><Toaster/></TooltipProvider>);
`,
);
await writeFile(
  path.join(output, "build.ts"),
  `
const result=await Bun.build({entrypoints:[${JSON.stringify(path.join(output, "harness.tsx"))}],outdir:${JSON.stringify(output)},target:'browser',define:{'process.env.NEXT_PUBLIC_CONVEX_URL':'"https://example.convex.cloud"'},plugins:[{name:'offline-services',setup(build){
build.onResolve({filter:/hooks\\/use-create-archive$/},()=>({path:${JSON.stringify(path.join(output, "backend.tsx"))}}));
build.onResolve({filter:/^next\\/(navigation|link)$/},()=>({path:${JSON.stringify(path.join(output, "navigation.tsx"))}}));
build.onResolve({filter:/^convex\\/react$/},()=>({path:${JSON.stringify(path.join(output, "convex.tsx"))}}));
}}]});if(!result.success)throw new Error(result.logs.join('\\n'));
`,
);
execFileSync("bun", [path.join(output, "build.ts")], { cwd: root, stdio: "pipe" });
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
const bundle = await readFile(path.join(output, "harness.js"));
const server = createServer((req, res) => {
  if (req.url === "/bundle.js") {
    res.setHeader("content-type", "text/javascript");
    res.end(bundle);
  } else if (req.url === "/style.css") {
    res.setHeader("content-type", "text/css");
    res.end(css);
  } else {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(
      '<meta charset="utf-8"><link rel="stylesheet" href="/style.css"><div id="root"></div><script src="/bundle.js"></script>',
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
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
      console.error("Browser error:", error.message);
    });
    await page.goto(base);
    await page
      .getByText("Loading archive count", { exact: true })
      .waitFor({ timeout: 5000 })
      .catch(async (error) => {
        console.error(await page.locator("body").innerText());
        throw error;
      });
    await page.getByRole("button", { name: "Open test submission" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await dialog.getByRole("button", { name: "Archive Yours", exact: true }).click();
    await dialog.locator("#text-error").waitFor();
    await dialog.getByLabel("Rejection text").fill("Example rejection text");
    await dialog.getByLabel("Organisation (optional)").fill("x".repeat(81));
    await dialog.getByRole("button", { name: "Archive Yours", exact: true }).click();
    await dialog.locator("#company-error").waitFor();
    assert.equal(await dialog.locator("#text-error").count(), 0);
    await dialog.getByLabel("Organisation (optional)").fill("Example organisation");
    await page.evaluate(() => (window.publishFail = true));
    await dialog.getByRole("button", { name: "Archive Yours", exact: true }).click();
    await page.getByText("Couldn't publish your submission", { exact: true }).waitFor();
    assert.equal(
      await dialog.getByLabel("Rejection text").inputValue(),
      "Example rejection text",
    );
    await page.evaluate(() => {
      window.publishFail = false;
      window.publishSlow = true;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(Error("denied")) },
      });
    });
    await dialog.getByRole("button", { name: "Archive Yours", exact: true }).click();
    await page.keyboard.press("Escape");
    assert.equal(await dialog.isVisible(), true);
    await dialog
      .getByText(
        "This is taking longer than usual. Your submission is still pending.",
        { exact: true },
      )
      .waitFor();
    await dialog.getByText("Your rejection is on the wall.", { exact: true }).waitFor();
    await dialog
      .getByRole("button", { name: "Copy private deletion link", exact: true })
      .last()
      .click();
    const privateLink = dialog.getByRole("textbox", { name: "Private deletion link" });
    await privateLink.waitFor();
    assert.ok((await privateLink.inputValue()).includes("/manage/new-test-post#"));
    await dialog
      .getByRole("button", { name: "View your rejection" })
      .scrollIntoViewIfNeeded();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await dialog.screenshot({
      path: path.join(output, `success-${viewport.width}.png`),
    });
    await dialog.getByRole("button", { name: "View your rejection" }).click();
    await page.waitForURL("**/?a=new-test-post");
    assert.equal(await page.evaluate(() => window.shareTarget), "new-test-post");
    await page.evaluate(() => {
      history.pushState(null, "", "/?a=second-post");
      dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.waitForFunction(() => window.shareTarget === "second-post");
    await page.getByRole("radio", { name: "Scholarships", exact: true }).click();
    await page.getByText("No scholarship rejections yet.", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Browse all rejections" }).click();
    await page
      .getByRole("button", { name: "Open rejection", exact: true })
      .first()
      .click();
    await page.getByRole("button", { name: "Next rejection" }).click();
    await page
      .getByRole("dialog")
      .getByText("Second rejection", { exact: true })
      .waitFor();
    // Next is disabled at the last entry; put keyboard focus back in the dialog.
    await page.getByRole("dialog").focus();
    await page.keyboard.press("ArrowLeft");
    await page
      .getByRole("dialog")
      .getByText("First rejection", { exact: true })
      .waitFor();
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (url) => {
            window.copiedPublicLink = url;
          },
        },
      });
    });
    const share = page
      .getByRole("dialog")
      .getByRole("button", { name: "Share rejection", exact: true });
    await share.click();
    assert.equal(
      await page.evaluate(() => window.copiedPublicLink),
      `${base}/?a=test-post`,
    );
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(Error("denied")) },
      });
    });
    const prompted = new Promise((resolve) =>
      page.once("dialog", async (prompt) => {
        const value = prompt.defaultValue();
        await prompt.dismiss();
        resolve(value);
      }),
    );
    await share.focus();
    await page.keyboard.press("Enter");
    assert.equal(await prompted, `${base}/?a=test-post`);
    await page.evaluate(() => (window.reactionFail = true));
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "React with a tear-smile" })
      .click();
    await page.getByText("Couldn't save your reaction", { exact: true }).waitFor();
    await page.waitForFunction(
      () => !document.querySelector('[role="dialog"] [aria-busy="true"]'),
    );
    assert.equal(
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "React with a tear-smile" })
        .getAttribute("aria-pressed"),
      "false",
    );
    await page.evaluate(() => (window.reactionFail = false));
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "React with a tear-smile" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Remove your tear-smile reaction" })
      .waitFor();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Report", exact: true })
      .click();
    await page.getByLabel("Contains personal information", { exact: true }).click();
    await page.evaluate(() => (window.reportFail = true));
    await page.getByRole("button", { name: "Send report" }).click();
    await page
      .getByText("Too many attempts. Wait a minute, then try again.", { exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("radio", { name: "Contains personal information" })
        .getAttribute("aria-checked"),
      "true",
    );
    await page.evaluate(() => (window.reportFail = false));
    await page.getByRole("button", { name: "Send report" }).click();
    await page.getByText("Report received", { exact: true }).waitFor();
    await page.goto(base);
    await page.getByRole("button", { name: "Open test submission" }).click();
    const fileInput = page.getByRole("dialog").locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "unsupported.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
    await page.locator("#image-error").waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Continue to hide details", exact: true })
        .count(),
      0,
    );
    const imageData = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 384;
      c.getContext("2d").fillRect(0, 0, 512, 384);
      return c.toDataURL("image/png").split(",")[1];
    });
    await fileInput.setInputFiles({
      name: "synthetic.png",
      mimeType: "image/png",
      buffer: Buffer.from(imageData, "base64"),
    });
    await page
      .getByRole("button", { name: "Continue to hide details", exact: true })
      .click();
    await page.getByRole("button", { name: "Use screenshot", exact: true }).click();
    await page.getByAltText("Screenshot preview").waitFor();
    assert.equal(
      await page.evaluate(() => window.uploads || 0),
      0,
      "Preparing a screenshot must not upload it",
    );
    await page.evaluate(() => (window.publishFail = true));
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Archive Yours", exact: true })
      .click();
    await page.getByText("Couldn't publish your submission", { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.uploads), 1);
    await page.evaluate(() => (window.publishFail = false));
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Archive Yours", exact: true })
      .click();
    await page.getByText("Your rejection is on the wall.", { exact: true }).waitFor();
    assert.equal(
      await page.evaluate(() => window.uploads),
      1,
      "Publication retry should reuse the completed upload",
    );
    await page.goto(base + "/?view=admin");
    await page
      .getByText("1 screenshot cleanup job pending.", { exact: false })
      .waitFor();
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    await page
      .getByText("This post is no longer available.", { exact: true })
      .waitFor();
    await page.getByText("No open reports.", { exact: true }).waitFor();
    await page.goto(base + "/?view=manage#synthetic-deletion-capability");
    await page.getByRole("button", { name: "Remove post", exact: true }).click();
    await page
      .getByText("Screenshot cleanup is pending and will be retried.", { exact: false })
      .waitFor();
    await page.goto(base + "/?view=error");
    assert.equal(await page.getByText("404", { exact: true }).count(), 0);
    assert.equal(
      await page.getByText("503 Service Unavailable", { exact: true }).count(),
      0,
    );
    await page.goto(base + "/?view=404");
    await page.getByText("404", { exact: true }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Try again" }).count(), 0);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      `PASS ${viewport.width}px: validation, publication/retry, private-link fallback, navigation, filtered empty, browsing, reactions, reporting, admin, deletion, errors`,
    );
  }
  console.log("Screenshots: " + output);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
