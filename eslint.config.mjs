import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".claude/**",
    "out/**",
    "build/**",
    "src/_archive/**",
    "next-env.d.ts",
  ]),
]);
