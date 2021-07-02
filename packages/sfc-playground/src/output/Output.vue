<template>
  <SplitPane horizontal allow-push :size="outputPaneSize">
    <template #left>
      <div class="tab-buttons">
        <button v-for="m of modes" :class="{ active: mode === m }" @click="mode = m">
          {{ m }}
        </button>
      </div>

      <div class="output-container">
        <Preview v-if="mode === 'preview'" />
        <CodeMirror
          v-else
          readonly
          :mode="mode === 'css' ? 'css' : 'javascript'"
          :value="store.activeFile.compiled[mode]"
        />
      </div>
    </template>
    <template #right>
      <div class="pane">
        <div class="pane-title justify-between">
          <div>
            <span>Console</span>
          </div>
          <div class="space-x-2">
            <button title="Clear Console" class="console-btn" @click="handleClearConsole">
              <carbon-error class="h-4 w-4" />
            </button>
            <button title="Collapse Console" class="console-btn" @click="handleCollapseConsole">
              <carbon-down-to-bottom class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="pane-code">
          <Console />
        </div>
      </div>
    </template>
  </SplitPane>
</template>

<script setup lang="ts">
import SplitPane from '@/components/SplitPane.vue'
import Preview from './Preview.vue'
import Console from './Console.vue'
import CodeMirror from '../codemirror/CodeMirror.vue'
import { store, clearErrors } from '../store'
import { ref } from 'vue'

const modes = ['preview', 'js', 'css', 'windicss', 'ssr'] as const

type Modes = typeof modes[number]
const mode = ref<Modes>('preview')
const outputPaneSize = ref([80, 20])

const handleClearConsole = () => clearErrors()
const handleCollapseConsole = () => outputPaneSize.value = [100, 0]
</script>

<style scoped>
.output-container {
  height: calc(100% - 35px);
  overflow: hidden;
  position: relative;
}
.tab-buttons {
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-color);
}
.tab-buttons button {
  font-size: 13px;
  font-family: var(--font-code);
  padding: 8px 16px 6px;
  text-transform: uppercase;
  color: #999;
  box-sizing: border-box;
}

button.active {
  color: var(--color-branding-dark);
  border-bottom: 3px solid var(--color-branding-dark);
}

.console-btn {
  @apply text-xs cursor-pointer px-2 py-1 rounded-2px;
  @apply hover:bg-gray-100 hover:dark:bg-true-gray-700
}
</style>
