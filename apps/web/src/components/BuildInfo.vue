<script setup lang="ts">

const date = import.meta.env.VITE_GIT_COMMIT_DATE;
const branch = import.meta.env.VITE_GIT_BRANCH_NAME
const commit_hash = import.meta.env.VITE_GIT_COMMIT_HASH

const buildInfo = {
  date,
  branch,
  commit_hash,
  version: import.meta.env.VITE_PACKAGE_VERSION
}
</script>

<template>
  <div class="build-info-wrapper">

    <div class="build-info" :title="buildInfo.date">
      {{ buildInfo.version }} ({{ buildInfo.branch }}/{{ commit_hash }}) {{ buildInfo.date }}
    </div>
  </div>
</template>

<style scoped>
.build-info-wrapper {
  position: relative;
  width: 100%;
  left: 0;
  text-align: right;
}
.build-info {
  color: gray;
  font-size: 0.8em;
}

@media (min-width: 1024px) {
}
</style>