import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";

import packageJson from "./package.json";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "./build/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "./build/index.es.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    typescript({ tsconfig: "./tsconfig.json" }),
    resolve(),
    commonjs(),
    terser(),
  ],
};
