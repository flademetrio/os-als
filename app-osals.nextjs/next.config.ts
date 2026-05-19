import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necessario para o Dockerfile multi-stage (gera .next/standalone).
  output: "standalone",
};

export default nextConfig;
