import {execSync} from "node:child_process";
import {fileURLToPath} from "node:url";

import react from "@vitejs/plugin-react";
import type {ConfigEnv} from "vite";
import {loadEnv} from "vite";
import {defineConfig} from "vitest/config";
import packageJson from "./package.json";

interface BuildInfo {
  commitHash: string;
  isoDate: string;
  version: string;
  refName: string;
}

function getBuildInfo(): BuildInfo | null {
  const parts = execSync("git show --no-patch --no-notes --pretty='%h;%cI;%D' HEAD")
    .toString()
    .trim()
    .split(";");

  const [commitHash, isoDate, refName] = parts;
  if (!commitHash || !isoDate || !refName) {
    return null;
  }

  return {
    commitHash,
    isoDate,
    version: packageJson.version,
    refName: refName.match("HEAD ->.+origin/(.+)")?.[1] ?? refName,
  };
}

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  const buildInfo = getBuildInfo();
  if (buildInfo) {
    process.env.VITE_GIT_COMMIT_DATE = buildInfo.isoDate;
    process.env.VITE_GIT_BRANCH_NAME = buildInfo.refName;
    process.env.VITE_GIT_COMMIT_HASH = buildInfo.commitHash;
    process.env.VITE_PACKAGE_VERSION = buildInfo.version;
  }

  return {
    plugins: [react()],
    base: "./",
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    test: {
      environment: "jsdom",
    },
  };
});
