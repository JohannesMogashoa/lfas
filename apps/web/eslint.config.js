import { nextJsConfig } from "@lfas/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
    {
        ignores: ["convex/_generated/**"],
    },
    ...nextJsConfig,
]
