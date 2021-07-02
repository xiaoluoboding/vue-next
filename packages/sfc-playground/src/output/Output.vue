<template>
  <SplitPane horizontal allow-push :size="outputPaneSize">
    <template #left>
      <div class="preview-pane flex flex-col h-full">
        <div class="tab-buttons h-9 box-border">
          <button
            v-for="m of modes"
            :key="m"
            :class="{ active: mode === m }"
            @click="mode = m"
          >
            {{ m }}
          </button>
        </div>

        <div class="output-container relative overflow-hidden flex-1 box-border">
          <Preview v-if="mode === 'preview'" />
          <MonacoEditor
            v-else
            v-model="store.activeFile.compiled[mode]"
            readonly
            :language="/css|windicss/.test(mode) ? 'css' : 'javascript'"
          />
        </div>
      </div>
    </template>
    <template #right>
      <div class="pane console-pane">
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
import Preview from './Preview.vue'
import Console from './Console.vue'
import MonacoEditor from '@/components/monaco/index.vue'
import { store, clearErrors } from '@/store'
import { ref } from 'vue'

const modes = ['preview', 'js', 'css', 'windicss', 'ssr'] as const

type Modes = typeof modes[number]
const mode = ref<Modes>('preview')
const outputPaneSize = ref([80, 20])

const handleClearConsole = () => clearErrors()
const handleCollapseConsole = () => outputPaneSize.value = [100, 0]
</script>

<style scoped>
.tab-buttons {
  border-bottom: 1px solid var(--border-color);
}
.tab-buttons button {
  font-size: 13px;
  font-family: var(--font-code);
  padding: 8px 16px 6px;
  @apply box-border uppercase text-true-gray-500 dark:text-cool-gray-300;
}

button.active {
  color: var(--color-branding-dark) !important;
  border-bottom: 3px solid var(--color-branding-dark);
}

.console-btn {
  @apply text-xs cursor-pointer px-2 py-1 rounded-2px;
  @apply hover:bg-gray-100 hover:dark:bg-true-gray-700
}
</style>
