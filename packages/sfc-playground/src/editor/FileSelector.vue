<template>
  <div class="file-selector">
    <div
      v-for="(file, i) in Object.keys(store.files)"
      class="file"
      :class="{ active: store.activeFilename === file }"
      @click="setActive(file)">
      <span><logos-vue /></span>
      <span class="label">{{ file }}</span>
      <span v-if="i > 0" class="remove" @click.stop="deleteFile(file)">
        <carbon-close class="icon" />
      </span>
    </div>
    <div v-if="pending" class="file">
      <logos-vue />
      <input
        ref="filenameRef"
        v-model="pendingFilename"
        class="bg-transparent outline-none focus:outline-none"
        spellcheck="false"
        @keyup.enter="doneAddFile"
        @keyup.esc="cancelAddFile"
        @vnodeMounted="focus"
      />
    </div>
    <button class="add" @click="startAddFile">
      <carbon-add class="icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { store, addFile, deleteFile, setActive } from '../store'
import { ref } from 'vue'
import type { VNode } from 'vue'
import { useClickOutside } from '@/composable/useClickOutside'

const filenameRef = ref<HTMLInputElement>()
const pending = ref(false)
const pendingFilename = ref('Comp.vue')

function startAddFile() {
  pending.value = true
}

function cancelAddFile() {
  pending.value = false
}

function focus({ el }: VNode) {
  (el as HTMLInputElement).focus()
}

function doneAddFile() {
  const filename = pendingFilename.value

  if (
    !filename.endsWith('.vue') &&
    !filename.endsWith('.js') &&
    filename !== 'import-map.json'
  ) {
    store.errors = [`Playground only supports *.vue, *.js files or import-map.json.`]
    return
  }

  if (filename in store.files) {
    store.errors = [`File "${filename}" already exists.`]
    return
  }

  store.errors = []
  pending.value = false
  addFile(filename)
  pendingFilename.value = 'Comp.vue'
}

useClickOutside(filenameRef, () => {
  if (pending.value) doneAddFile()
})
</script>

<style lang="scss" scoped>
.file-selector {
  @apply flex box-border;
  @apply text-dark-600 dark:text-true-gray-300;
  @apply border-b border-$border-color;
}

.file {
  @apply inline-flex place-items-center;
  @apply cursor-pointer box-border;
  @apply px-2 border-r border-$border-color;
  @apply text-[13px] leading-4;
  font-family: var(--font-code);

  &.active {
    @apply relative text-$color-branding cursor-text;

    &:before {
      @apply content h-[3px] w-full;
      @apply absolute left-0 bottom-0;
      @apply bg-$color-branding;
    }
  }

  .label {
    @apply inline-block;
    @apply py-2.5 px-3;
  }

  input {
    @apply bg-transparent outline-none focus:outline-none;
    @apply w-32 rounded-[3px] px-1.5 py-1 ml-1.5;
  }
}

.file-selector .icon {
  @apply cursor-pointer rounded-sm;
  @apply text-dark-600 dark:text-true-gray-300;
  @apply hover:bg-gray-200 hover:dark:bg-dark-300;
}

.add {
  @apply ml-1.5 align-middle text-[20px];
}

.add:hover svg {
  color: var(--color-branding) !important;
}
</style>
