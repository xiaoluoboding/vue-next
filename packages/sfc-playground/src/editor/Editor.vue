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
              <button title="Toggle Script Setup" class="console-btn flex" @click="activeSFC.isSetup = !activeSFC.isSetup">
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
              <button title="Toggle Style Scoped" class="console-btn flex" @click="activeSFC.isScopedStyle = !activeSFC.isScopedStyle">
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
import { watch, computed, onMounted } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'

import FileSelector from './FileSelector.vue'
import MonacoEditor from '@/components/monaco/index.vue'
import { resetSFCCode } from '@/compiler/sfcCompiler'
import { store } from '@/store'
import { debounce } from '@/utils'

const onChange = debounce((code: string) => {
  store.activeFile.code = code
}, 250)

const activeSFC = computed(() => store.activeFile.sfc)
const activeSFCCode = computed(() => store.activeSFCCode)

onMounted(() => resetSFCCode(store.activeFile))

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
</script>

<style scoped>
.editor-container {
  height: calc(100% - 35px);
  overflow: hidden;
  position: relative;
}
</style>
