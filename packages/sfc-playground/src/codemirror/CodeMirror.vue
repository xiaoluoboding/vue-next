<template>
  <div class="editor" ref="el"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits, watchEffect, inject, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { debounce } from '../utils'
import CodeMirror from './codemirror'
import { IS_DARKMODE } from '@/types'

const el = ref()
const isDarkmode = inject(IS_DARKMODE) as Ref<boolean>
const activeTheme = computed(() => isDarkmode.value ? 'material-darker' : 'default')

const props = defineProps({
  mode: {
    type: String,
    default: 'htmlmixed'
  },
  value: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<(e: 'change', value: string) => void>()

onMounted(() => {
  const addonOptions = {
    autoCloseBrackets: true,
    autoCloseTags: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  }

  const editor = CodeMirror(el.value!, {
    value: '',
    mode: props.mode,
    readOnly: props.readonly,
    tabSize: 2,
    lineWrapping: true,
    lineNumbers: true,
    theme: activeTheme.value,
    ...addonOptions
  })

  editor.on('change', () => {
    emit('change', editor.getValue())
  })

  watchEffect(() => {
    editor.setValue(props.value)
  })
  watchEffect(() => {
    editor.setOption('mode', props.mode)
  })
  watch(
    () => isDarkmode.value,
    () => {
      editor.setOption('theme', activeTheme.value)
    }
  )

  window.addEventListener(
    'resize',
    debounce(() => {
      editor.refresh()
    })
  )

  setTimeout(() => {
    editor.refresh()
  }, 50)
})
</script>

<style>
.editor {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #fff;
}

.dark .editor {
  background-color: #171717;
}

.CodeMirror {
  font-family: 'Source Code Pro', monospace;
  height: 100%;
}
</style>
