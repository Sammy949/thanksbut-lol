import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // UploadThing serves files from these hosts; allow next/image to optimise them.
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      // Sample images used by the wall when no Convex URL is configured.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
