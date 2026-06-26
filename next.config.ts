import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // UploadThing serves files from these hosts; allow next/image to optimise them.
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      // Mock placeholder artifacts (UI phase only; removed once real uploads land).
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
