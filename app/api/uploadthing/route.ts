import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

/** Next.js route handler that serves the UploadThing file router. */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
