import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Pin the workspace root to THIS repo — a stray package-lock.json above the
// project dir otherwise makes Next/Turbopack infer the wrong root.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
