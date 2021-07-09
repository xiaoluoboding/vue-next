<template>
  <Header />
  <div class="wrapper">
    <Splitpanes class="default-theme">
      <Pane size="50">
        <Editor />
      </Pane>
      <Pane size="50">
        <Output />
      </Pane>
    </Splitpanes>
  </div>
</template>

<script setup lang="ts">
import { provide, reactive } from 'vue'
import Header from './header/index.vue'
import Editor from './editor/Editor.vue'
import Output from './output/Output.vue'

import { useDark } from './composable/useDark'
import { IS_DARKMODE, PLAYGROUND_SETTINGS } from './types'

const settings = reactive({
  isShowWindicssPane: false
})

provide(IS_DARKMODE, useDark())
provide(PLAYGROUND_SETTINGS, settings)
</script>

<style>
body {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--base);
  margin: 0;
  --base: #444;
  --nav-height: 50px;
  --font-code: 'Source Code Pro', monospace;
  --color-branding: #3ca877;
  --color-branding-dark: #416f9c;
  --border-color: rgba(200, 200, 200, .12);
  @apply bg-gray-100 dark:bg-gray-900;
}

.wrapper {
  height: calc(100vh - var(--nav-height));
}

button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
  outline: none;
}

button:focus {
  outline: none !important;
}
</style>
