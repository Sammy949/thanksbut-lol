import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // UploadThing serves files from these hosts; allow next/image to optimise them.
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
};

export default nextConfig;
