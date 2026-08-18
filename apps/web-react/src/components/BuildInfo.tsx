const date = import.meta.env.VITE_GIT_COMMIT_DATE;
const branch = import.meta.env.VITE_GIT_BRANCH_NAME;
const commitHash = import.meta.env.VITE_GIT_COMMIT_HASH;
const version = import.meta.env.VITE_PACKAGE_VERSION;

/**
 * Build info line: `version (branch/commit) date`.
 * Port of apps/web/src/components/BuildInfo.vue.
 */
function BuildInfo() {
  return (
    <div className="build-info-wrapper">
      <div className="build-info" title={date}>
        {version} ({branch}/{commitHash}) {date}
      </div>
    </div>
  );
}

export default BuildInfo;
