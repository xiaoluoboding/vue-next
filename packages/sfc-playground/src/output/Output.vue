<template>
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
    <div class="h-full">
      <Splitpanes horizontal @resize="paneSize = $event[0].size">
        <Pane :size="paneSize">
          <div class="output-container relative h-full overflow-hidden flex-1 box-border">
            <Preview v-if="mode === 'preview'" />
            <MonacoEditor
              v-else
              v-model="store.activeFile.compiled[mode]"
              readonly
              :language="/css|windicss/.test(mode) ? 'css' : 'javascript'"
            />
          </div>
        </Pane>
        <Pane :size="100 - paneSize">
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
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import Preview from './Preview.vue'
import Console from './Console.vue'
import MonacoEditor from '@/components/monaco/index.vue'
import { store, clearErrors } from '@/store'
import { ref } from 'vue'

const modes = ['preview', 'js', 'css', 'windicss', 'ssr'] as const

type Modes = typeof modes[number]
const mode = ref<Modes>('preview')
const paneSize = ref(80)

const handleClearConsole = () => clearErrors()
const handleCollapseConsole = () => paneSize.value = 100
</script>

<style lang="scss" scoped>
.tab-buttons {
  @apply border-b border-$border-color;
}
.tab-buttons button {
  @apply relative;
  @apply py-2.5 px-4;
  @apply text-[13px] leading-4;
  @apply box-border uppercase text-true-gray-500 dark:text-cool-gray-300;
  font-family: var(--font-code);
}

button.active {
  color: var(--color-branding-dark) !important;

  &:before {
    @apply content h-[3px] w-full;
    @apply absolute left-0 bottom-0;
    @apply bg-$color-branding-dark;
  }
}

.console-btn {
  @apply text-xs cursor-pointer px-2 py-1 rounded-2px;
  @apply hover:bg-gray-100 hover:dark:bg-true-gray-700
}
</style>
