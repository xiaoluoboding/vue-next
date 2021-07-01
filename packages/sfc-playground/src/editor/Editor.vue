<template>
  <FileSelector />
  <div class="editor-container">
    <SplitPane horizontal>
      <template #left>
        <div class="block">
          <div class="block-title">
            Template
          </div>
          <div class="block-code">
            <MonacoEditor v-model="activeSFC.template" language="html" />
          </div>
        </div>
      </template>
      <template #right>
        <div class="block">
          <div class="block-title">
            {{ activeSFC.isSetup ? 'Script Setup' : 'Script' }}
          </div>
          <div class="block-code">
            <MonacoEditor v-model="activeSFC.script" language="javascript" />
          </div>
        </div>
      </template>
    </SplitPane>
    <Message :err="store.errors[0]" />
  </div>
</template>

<script setup lang="ts">
import FileSelector from './FileSelector.vue'
import Message from '@/components/Message.vue'
import MonacoEditor from '@/components/monaco/index.vue'
import SplitPane from '@/components/SplitPane.vue'
import { store } from '../store'
import { debounce } from '../utils'
import { ref, watch } from 'vue'

const onChange = debounce((code: string) => {
  store.activeFile.code = code
}, 250)

const activeCode = ref(store.activeFile.code)
const activeSFC = ref(store.activeFile.sfc)

watch(
  () => store.activeFilename,
  () => {
    activeCode.value = store.activeFile.code
  }
)

watch(
  () => activeSFC.value,
  () => {
    const sfcCode = `<template>
  ${activeSFC.value.template}
</template>

${activeSFC.value.isSetup ? '<script setup>' : '<script>'}
  ${activeSFC.value.script}
<\/script>
`
    onChange(sfcCode)
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

.block {
  @apply text-gray-900 dark:text-white bg-white dark:bg-true-gray-900
}

.block .block-title {
  @apply select-none text-xs font-semibold;
  @apply px-4 py-2;
}

.block .block-code {
  @apply h-full w-full overflow-hidden;
  @apply pt-8;
  @apply absolute top-0 right-0-0 bottom-0 left-0;
}
</style>
