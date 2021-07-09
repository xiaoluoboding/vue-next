<template>
  <nav class="bg-white dark:bg-true-gray-900">
    <h1 class="flex justify-center items-center">
      <img alt="logo" src="/logo.svg">
      <span text="xl" font="medium">Vue SFC Playground</span>
    </h1>
    <div class="links flex">
      <div class="version" @click.stop>
        <span class="active-version" @click="toggle">
          Version: {{ activeVersion }}
        </span>
        <ul class="versions" :class="{ expanded }">
          <li v-if="!publishedVersions"><a>loading versions...</a></li>
          <li v-for="version of publishedVersions" :key="version">
            <a @click="setVueVersion(version)">v{{ version }}</a>
          </li>
          <li><a @click="resetVueVersion">This Commit ({{ currentCommit }})</a></li>
          <li>
            <a href="https://app.netlify.com/sites/vue-sfc-playground/deploys" target="_blank">Commits History</a>
          </li>
        </ul>
      </div>
      <div class="actions flex items-center">
        <button class="actions--btn share" @click="copyLink">
          <carbon-share class="h-5 w-5" />
        </button>  
        <button class="actions--btn download" @click="downloadProject">
          <carbon-download class="h-5 w-5" />
        </button>
        <button class="actions--btn darkmode" @click="isDarkmode = !isDarkmode">
          <carbon-moon class="h-5 w-5" v-if="isDarkmode" />
          <carbon-sun class="h-5 w-5" v-else />
        </button>
        <button class="actions--btn settings" @click="isShowSettings = true">
          <carbon-settings class="h-5 w-5" />
        </button>
      </div>

      <Settings v-model:show="isShowSettings" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { downloadProject } from '@/download/download'
import { setVersion, resetVersion } from '@/compiler/sfcCompiler'
import { IS_DARKMODE } from '@/types'
import Settings from './Settings.vue'

const currentCommit = __COMMIT__
const activeVersion = ref(`@${currentCommit}`)
const publishedVersions = ref<string[]>()
const expanded = ref(false)
const isShowSettings = ref(false)

const isDarkmode = inject(IS_DARKMODE)

async function toggle() {
  expanded.value = !expanded.value
  if (!publishedVersions.value) {
    publishedVersions.value = await fetchVersions()
  }
}

async function setVueVersion(v: string) {
  activeVersion.value = `loading...`
  await setVersion(v)
  activeVersion.value = `v${v}`
  expanded.value = false
}

function resetVueVersion() {
  resetVersion()
  activeVersion.value = `@${currentCommit}`
  expanded.value = false
}

async function copyLink() {
  await navigator.clipboard.writeText(location.href)
  alert('Sharable URL has been copied to clipboard.')
}

onMounted(async () => {
  window.addEventListener('click', () => {
    expanded.value = false
  })
})

async function fetchVersions(): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/vuejs/vue-next/releases?per_page=100`
  )
  const releases: any[] = await res.json()
  const versions = releases.map(
    r => (/^v/.test(r.tag_name) ? r.tag_name.substr(1) : r.tag_name)
  )
  const minVersion = versions.findIndex(v => v === '3.0.10')
  return versions.slice(0, minVersion + 1)
}
</script>

<style>
nav {
  height: var(--nav-height);
  box-sizing: border-box;
  padding: 0 1em;
  box-shadow: 0 0 1px 1px var(--border-color);
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
}

h1 {
  margin: 0;
  line-height: var(--nav-height);
  font-weight: 500;
  display: inline-block;
  vertical-align: middle;
}

h1 img {
  height: 24px;
  vertical-align: middle;
  margin-right: 10px;
  position: relative;
  top: -2px;
}

@media (max-width: 480px) {
  h1 span {
    display: none;
  }
}

.version {
  display: inline-block;
  margin-right: 12px;
  position: relative;
}

.active-version {
  cursor: pointer;
  position: relative;
  display: inline-block;
  vertical-align: middle;
  line-height: var(--nav-height);
  padding-right: 15px;
}

.active-version:after {
  content: '';
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #aaa;
  position: absolute;
  right: 0;
  top: 22px;
}

.version:hover .active-version:after {
  border-top-color: var(--base);
}

.versions {
  display: none;
  position: absolute;
  left: 0;
  top: 40px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  list-style-type: none;
  padding: 8px;
  margin: 0;
  width: 200px;
  max-height: calc(100vh - 70px);
  overflow: scroll;
  @apply bg-white dark:bg-true-gray-800;
}

.versions a {
  display: block;
  padding: 6px 12px;
  text-decoration: none;
  cursor: pointer;
  @apply text-dark-700 dark:text-true-gray-100;
}

.versions a:hover {
  color: var(--color-branding);
}

.versions.expanded {
  display: block;
  @apply shadow-lg;
}

.actions--btn {
  @apply my-0 mx-1 p-2;
  @apply hover:bg-gray-100 hover:dark:bg-true-gray-800;
  @apply rounded-md;
  @apply h-9;
}
</style>
