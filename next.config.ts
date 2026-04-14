import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      tailwindcss: path.resolve(__dirname, "cgpa-app/node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
