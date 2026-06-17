import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: [
        "@lfas/ui",
        "@lfas/bank-statement-parser",
        "@lfas/statement-processing",
    ],
};

export default nextConfig;
