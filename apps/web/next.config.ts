import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@lfas/ui", "@lfas/bank-statement-parser"],
}

export default nextConfig
