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
            <MonacoEditor v-model="activeSFC.template" language="html" />
          </div>
        </div>
      </Pane>
      <Pane>
        <div class="pane">
          <div class="pane-title justify-between">
            <div>
              {{ activeSFC.isSetup ? 'Script Setup' : 'Script' }}
            </div>
            <!-- <div>
              <button title="Switch Setup" class="console-btn" @click="">
                <carbon-script-reference class="h-4 w-4" />
              </button>
            </div> -->
          </div>
          <div class="pane-code">
            <MonacoEditor v-model="activeSFC.script" language="javascript" />
          </div>
        </div>
      </Pane>
      <Pane>
        <div class="pane">
          <div class="pane-title">
            Style
          </div>
          <div class="pane-code">
            <MonacoEditor v-model="activeSFC.style" language="css" />
          </div>
        </div>
      </Pane>
    </SplitPanes>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
</script>

<style scoped>
.editor-container {
  height: calc(100% - 35px);
  overflow: hidden;
  position: relative;
}
</style>
