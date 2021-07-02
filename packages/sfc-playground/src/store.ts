import { reactive, watchEffect } from 'vue'
import { MagicString } from '@vue/compiler-sfc'
import { compileFile, MAIN_FILE } from './compiler/sfcCompiler'
import { utoa, atou } from './utils'

const welcomeCode = `
<template>
  <h1>{{ msg }}</h1>
</template>

<script setup>
const msg = 'Hello World!'
</script>
`.trim()

export const MAIN_CODE = `
import { createApp as _createApp } from "vue"

if (window.__app__) {
  window.__app__.unmount()
  document.getElementById('app').innerHTML = ''
}

document.getElementById('__sfc-styles').innerHTML = window.__css__
document.getElementById('__sfc-windicss').innerHTML = window.__windicss__
const app = window.__app__ = _createApp(__modules__["${MAIN_FILE}"].default)
app.config.errorHandler = e => console.error(e)
app.mount('#app')
`.trim()

export class File {
  filename: string
  code: string
  sfc = {
    isSetup: false,
    template: '',
    script: '',
    style: ''
  }

  compiled = {
    js: '',
    css: '',
    ssr: '',
    windicss: ''
  }

  constructor(filename: string, code: string = '') {
    this.filename = filename
    this.code = code
  }
}

interface Store {
  files: Record<string, File>
  activeFilename: string
  readonly activeFile: File
  readonly importMap: string | undefined
  errors: (string | Error)[]
  runtimeErrors: (string | Error)[]
  runtimeWarning: (string | Error)[]
}

let files: Store['files'] = {}

const savedFiles = location.hash.slice(1)
if (savedFiles) {
  const saved = JSON.parse(atou(savedFiles))
  for (const filename in saved) {
    files[filename] = new File(filename, saved[filename])
  }
} else {
  files = {
    [MAIN_FILE]: new File(MAIN_FILE, welcomeCode)
  }
}

export const store: Store = reactive({
  files,
  activeFilename: MAIN_FILE,
  get activeFile() {
    return store.files[store.activeFilename]
  },
  get importMap() {
    const file = store.files['import-map.json']
    return file && file.code
  },
  get activeSFCCode() {
    const s = new MagicString('')
    const activeFile = store.files[store.activeFilename]

    const sfcCode = `<template>
  ${activeFile.sfc.template}
<\/template>

${activeFile.sfc.isSetup ? '<script setup>' : '<script>'}
  ${activeFile.sfc.script}
<\/script>
`
    s.append(sfcCode)
    if (activeFile.sfc.style) {
      const sfcStyle = `<style>
${activeFile.sfc.style}
<\/style>`
      s.append(sfcStyle)
    }

    return s.toString()
  },
  errors: [],
  runtimeErrors: [],
  runtimeWarning: []
})

watchEffect(() => compileFile(store.activeFile))

for (const file in store.files) {
  if (file !== MAIN_FILE) {
    compileFile(store.files[file])
  }
}

watchEffect(() => {
  history.replaceState({}, '', '#' + utoa(JSON.stringify(exportFiles())))
})

export function exportFiles() {
  const exported: Record<string, string> = {}
  for (const filename in store.files) {
    exported[filename] = store.files[filename].code
  }
  return exported
}

export function setActive(filename: string) {
  store.activeFilename = filename
}

export function addFile(filename: string) {
  const file = (store.files[filename] = new File(filename))

  if (filename === 'import-map.json') {
    file.code = `
{
  "imports": {

  }
}`.trim()
  }

  setActive(filename)
}

export function deleteFile(filename: string) {
  if (confirm(`Are you sure you want to delete ${filename}?`)) {
    if (store.activeFilename === filename) {
      store.activeFilename = MAIN_FILE
    }
    delete store.files[filename]
  }
}

export function clearErrors() {
  store.errors = []
  store.runtimeErrors = []
  store.runtimeWarning = []
}
