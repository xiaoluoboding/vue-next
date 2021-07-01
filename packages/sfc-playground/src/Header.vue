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
        <button class="share" @click="copyLink">
          <svg width="1.4em" height="1.4em" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98"/>
              <path d="M15.41 6.51l-6.82 3.98"/>
            </g>
          </svg>
        </button>  
        <button class="download" @click="downloadProject">
          <svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32" style="vertical-align:middle;">
            <path d="M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4z" fill="currentColor"></path>
            <path d="M26 14l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z" fill="currentColor"></path>
          </svg>
        </button>
        <button class="darkmode" v-if="isDarkmode" @click="isDarkmode = !isDarkmode">
          <svg width="1.4em" height="1.4em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" style="vertical-align: middle;">
            <path d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93a9.93 9.93 0 0 0 7.07-2.929a10.007 10.007 0 0 0 2.583-4.491a1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343a7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483a10.027 10.027 0 0 0 2.89 7.848a9.972 9.972 0 0 0 7.848 2.891a8.036 8.036 0 0 1-1.484 2.059z" fill="currentColor"></path>
          </svg>
        </button>
        <button class="darkmode" v-else @click="isDarkmode = !isDarkmode">
          <svg width="1.4em" height="1.4em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" style="vertical-align: middle;">
            <path d="M256 387c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4v-46.2c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"></path>
            <path d="M256 48c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4V63.4c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"></path>
            <path d="M125 256c0-8.5-6.9-15.4-15.4-15.4H63.4c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4z" fill="currentColor"></path>
            <path d="M448.6 240.6h-46.2c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4s-6.9-15.4-15.4-15.4z" fill="currentColor"></path>
            <path d="M152.5 344.1c-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5l32.7-32.7c6-6 6-15.8 0-21.8-2.9-2.9-6.8-4.5-10.9-4.5z" fill="currentColor"></path>
            <path d="M359.5 167.9c4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5z" fill="currentColor"></path>
            <path d="M130.7 108.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-2.9 2.9-4.5 6.8-4.5 10.9 0 4.1 1.6 8 4.5 10.9l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"></path>
            <path d="M370.4 348.6c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-6 6-6 15.8 0 21.8l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"></path>
            <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { downloadProject } from './download/download'
import { setVersion, resetVersion } from './compiler/sfcCompiler'
import { IS_DARKMODE } from './types'

const currentCommit = __COMMIT__
const activeVersion = ref(`@${currentCommit}`)
const publishedVersions = ref<string[]>()
const expanded = ref(false)

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
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  list-style-type: none;
  padding: 8px;
  margin: 0;
  width: 200px;
  max-height: calc(100vh - 70px);
  overflow: scroll;
}

.versions a {
  display: block;
  padding: 6px 12px;
  text-decoration: none;
  cursor: pointer;
  color: var(--base);
}

.versions a:hover {
  color: var(--color-branding);
}

.versions.expanded {
  display: block;
}

.share,
.download,
.darkmode {
  @apply my-0 mx-1 p-2;
  @apply hover:bg-gray-100 hover:dark:bg-true-gray-800;
  @apply rounded-md;
}
</style>
