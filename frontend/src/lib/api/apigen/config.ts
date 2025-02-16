import type { ConfigFile } from "@rtk-query/codegen-openapi";
import { resolve } from "path";

const config: ConfigFile = {
  schemaFile: resolve(__dirname, "schema.json"),
  apiFile: "./prototype.ts",
  outputFile: "./generated.ts",
  apiImport: "prototype",
  exportName: "api",
  hooks: true,
};

export default config;
