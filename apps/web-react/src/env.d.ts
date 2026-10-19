/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GIT_COMMIT_DATE?: string;
  readonly VITE_GIT_BRANCH_NAME?: string;
  readonly VITE_GIT_COMMIT_HASH?: string;
  readonly VITE_PACKAGE_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
