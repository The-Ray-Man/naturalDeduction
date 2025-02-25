import * as dotenv from "dotenv";
import { defineConfig } from "orval";

dotenv.config({ path: ".env" });

const baseurl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/";

export default defineConfig({
  nethmap: {
    output: {
      mode: "split",
      target: "src/lib/api/endpoints/index.ts",
      schemas: "src/lib/api/model",
      client: "react-query",
      baseUrl: baseurl,
      mock: false,
      prettier: true,
      override: {
        useNativeEnums: false,
      },
    },
    input: {
      target: "src/lib/api/schema.json",
    },
  },
});
