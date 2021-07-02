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
          <div class="pane-title">
            {{ activeSFC.isSetup ? 'Script Setup' : 'Script' }}
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

const activeCode = ref(store.activeFile.code)
const activeSFC = ref(store.activeFile.sfc)
const activeSFCCode = computed(() => store.activeSFCCode)

watch(
  () => store.activeFilename,
  () => {
    activeCode.value = store.activeFile.code
  }
)

watch(
  () => activeSFCCode.value,
  (code) => {
    onChange(code)
  },
  {
    deep: true
  }
)
</script>

<style scoped>
.editor-container {
  height: calc(100% - 35px);
  overflow: hidden;
  position: relative;
}
</style>
