import { reactive, watchEffect } from 'vue'
import { MagicString } from '@vue/compiler-sfc'
import dedent from 'dedent'

import { resetSFCCode, compileFile } from './compiler/sfcCompiler'
import { utoa, atou } from './utils'
import { FileSFC } from './types'
import { MAIN_FILE, WELCOME_CODE, IMPORT_MAP } from './constants'

export class File {
  filename: string
  code: string
  sfc = {
    isSetup: true,
    hasScoped: false,
    isTS: false,
    template: '<h1>{{ msg }}</h1>',
    script: `const msg = 'Hello World!'`,
    setupScript: '',
    style: ''
  } as FileSFC

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
  readonly activeSFCCode: string
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
    resetSFCCode(files[filename])
  }
} else {
  files = {
    [MAIN_FILE]: new File(MAIN_FILE, WELCOME_CODE)
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
    const isTS = activeFile.sfc.isTS
    const isSetup = activeFile.sfc.isSetup
    const hasScoped = activeFile.sfc.hasScoped
    let scriptTagMap: Record<string, string> = {
      '00': '<script>',
      '01': '<script setup>',
      '10': '<script lang="ts">',
      '11': '<script setup lang="ts">'
    }

    const sfcTemplate = dedent`
      <template>
      ${activeFile.sfc.template}
      </template>
    `

    s.append(sfcTemplate)

    const sfcScript = dedent`
      \n${scriptTagMap[~~isTS + '' + ~~isSetup]}
      ${activeFile.sfc.script}
      </script>
    `
    s.append(sfcScript)

    if (activeFile.sfc.style) {
      const sfcStyle = dedent`
        ${hasScoped ? '<style scoped>' : '<style>'}
        ${activeFile.sfc.style}
        </style>
      `
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
  const token = utoa(JSON.stringify(exportFiles()))
  history.replaceState({}, '', '#' + token)
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
    file.code = IMPORT_MAP
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
