<template>
  <FileSelector />
  <div class="editor-container">
    <Splitpanes horizontal>
      <Pane >
        <div class="pane">
          <div class="pane-title">
            Template
          </div>
          <div class="pane-code">
            <MonacoEditor v-model:code="activeSFC.template" language="html" />
          </div>
        </div>
      </Pane>
      <Pane>
        <div class="pane">
          <div class="pane-title justify-between">
            <div>
              {{ activeSFC.isSetup ? 'Script Setup' : 'Script' }}
            </div>
            <div>
              <button title="Toggle Script Setup" class="editor-btn flex" @click="handleToggleSetup">
                <carbon-letter-ss class="h-6 w-6" v-show="activeSFC.isSetup" />
                <mdi-alpha-s class="h-6 w-6" v-show="!activeSFC.isSetup" />
              </button>
            </div>
          </div>
          <div class="pane-code">
            <MonacoEditor v-model:code="activeSFC.script" language="javascript" />
          </div>
        </div>
      </Pane>
      <Pane>
        <div class="pane">
          <div class="pane-title justify-between">
            <div>
              {{ activeSFC.isScopedStyle ? 'Style Scoped' : 'Style' }}
            </div>
            <div>
              <button title="Toggle Style Scoped" class="editor-btn flex" @click="activeSFC.isScopedStyle = !activeSFC.isScopedStyle">
                <carbon-letter-ss class="h-6 w-6" v-show="activeSFC.isScopedStyle" />
                <mdi-alpha-s class="h-6 w-6" v-show="!activeSFC.isScopedStyle" />
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
import { Splitpanes, Pane } from 'splitpanes'

import FileSelector from './FileSelector.vue'
import MonacoEditor from '@/components/monaco/index.vue'
import { store } from '@/store'
import { debounce } from '@/utils'

const onChange = debounce((code: string) => {
  store.activeFile.code = code
}, 250)

const activeSFC = computed(() => store.activeFile.sfc)
const activeSFCCode = computed(() => store.activeSFCCode)

watch(
  () => store.activeFilename,
  () => onChange(activeSFCCode.value),
  { deep: true }
)

watch(
  () => activeSFCCode.value,
  (code) => onChange(code),
  { deep: true }
)

const handleToggleSetup = () => {
  activeSFC.value.isSetup = !activeSFC.value.isSetup
  // switch script & setup script
  let tempScript = activeSFC.value.script
  activeSFC.value.script = activeSFC.value.setupScript
  activeSFC.value.setupScript = tempScript
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
