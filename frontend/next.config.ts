import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  transpilePackages: ["@myriaddreamin/typst-ts-renderer", "@myriaddreamin/typst-ts-web-compiler"]
  // basePath: "/~rawick/nd"
};

export default nextConfig;
