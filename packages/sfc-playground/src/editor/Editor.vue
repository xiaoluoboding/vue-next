<template>
  <FileSelector />
  <div class="editor-container">
    <SplitPane horizontal>
      <template #left>
        <div class="pane">
          <div class="pane-title">
            Template
          </div>
          <div class="pane-code">
            <MonacoEditor v-model="activeSFC.template" language="html" />
          </div>
        </div>
      </template>
      <template #right>
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
      </template>
    </SplitPane>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import FileSelector from './FileSelector.vue'
import MonacoEditor from '@/components/monaco/index.vue'
import SplitPane from '@/components/SplitPane.vue'
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
