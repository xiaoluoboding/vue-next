<template>
  <FileSelector />
  <div class="editor-container">
    <MonacoEditor v-model:code="store.activeFile.code" language="json" v-show="isImportmap" />
    <Splitpanes horizontal v-show="!isImportmap">
      <Pane size="25">
        <div class="pane">
          <div class="pane-title">
            Template
          </div>
          <div class="pane-code">
            <MonacoEditor v-model:code="activeSFC.template" language="html" />
          </div>
        </div>
      </Pane>
      <Pane size="50">
        <div class="pane">
          <div class="pane-title justify-between">
            <div>
              {{ activeSFC.isSetup ? 'Script Setup' : 'Script' }}
            </div>
            <div class="flex">
              <button title="Toggle Script Language" class="editor-btn" @click="handleToggleLang">
                <logos-javascript class="h-4 w-4" v-show="!activeSFC.isTS" />
                <logos-typescript-icon class="h-4 w-4" v-show="activeSFC.isTS" />
              </button>
              <button title="Toggle Script Setup" class="editor-btn" @click="handleToggleSetup">
                <carbon-letter-ss class="h-6 w-6" v-show="activeSFC.isSetup" />
                <carbon-s class="h-6 w-6" v-show="!activeSFC.isSetup" />
              </button>
            </div>
          </div>
          <div class="pane-code">
            <MonacoEditor v-model:code="activeSFC.script" :language="activeSFC.isTS ? 'typescript' : 'javascript'" />
          </div>
        </div>
      </Pane>
      <Pane size="25">
        <div class="pane">
          <div class="pane-title justify-between">
            <div>
              {{ activeSFC.hasScoped ? 'Style Scoped' : 'Style' }}
            </div>
            <div>
              <button title="Toggle Style Scoped" class="editor-btn flex" @click="activeSFC.hasScoped = !activeSFC.hasScoped">
                <carbon-letter-ss class="h-6 w-6" v-show="activeSFC.hasScoped" />
                <carbon-s class="h-6 w-6" v-show="!activeSFC.hasScoped" />
              </button>
            </div>
          </div>
          <div class="pane-code">
            <MonacoEditor v-model:code="activeSFC.style" language="css" />
          </div>
        </div>
      </Pane>
    </SplitPanes>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'

import FileSelector from './FileSelector.vue'
import MonacoEditor from '../components/monaco/index.vue'
import { store } from '../store'
import { debounce } from '../utils'

const onChange = debounce((code: string) => {
  store.activeFile.code = code
}, 250)

const activeSFC = computed(() => store.activeFile.sfc)
const activeSFCCode = computed(() => store.activeSFCCode)
const isImportmap = computed(() => store.activeFile.filename === 'import-map.json')

watch(
  () => store.activeFilename,
  () => !isImportmap.value && onChange(activeSFCCode.value),
  { deep: true }
)

watch(
  () => activeSFCCode.value,
  (code) => !isImportmap.value && onChange(code),
  { deep: true }
)

const handleToggleSetup = () => {
  activeSFC.value.isSetup = !activeSFC.value.isSetup
  // switch script & setup script
  let tempScript = activeSFC.value.script
  activeSFC.value.script = activeSFC.value.setupScript
  activeSFC.value.setupScript = tempScript
}

const handleToggleLang = () => {
  activeSFC.value.isTS = !activeSFC.value.isTS
}
</script>

<style scoped>
.editor-container {
  height: calc(100% - 35px);
  overflow: hidden;
  position: relative;
}
.editor-btn {
  @apply text-xs cursor-pointer px-2 py-1;
  @apply hover:bg-gray-100 hover:dark:bg-true-gray-700
}
</style>
