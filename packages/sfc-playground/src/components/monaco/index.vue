<template>
  <div ref="editorRef" style="height: 100%; width: 100%;"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, toRef, inject, watch, Ref } from 'vue'
import type { editor as Editor } from 'monaco-editor'
import setupMonaco from './editor'

import { IS_DARKMODE } from '@/types'

export default defineComponent({
  name: 'MonacoEditor',

  props: {
    modelValue: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    readonly: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const editorRef = ref()
    const code = toRef(props, 'modelValue')
    const language = toRef(props, 'language')
    const readonly = toRef(props, 'readonly')
    let editorInstance: Editor.IStandaloneCodeEditor

    const isDarkmode = inject(IS_DARKMODE) as Ref<boolean>

    const setContent = (content: string) => {
      if (editorInstance) editorInstance.setValue(content)
    }

    const init = async () => {
      const { monaco } = await setupMonaco()

      const extension = () => {
        if (language.value === 'typescript') {
          return 'ts'
        } else if (language.value === 'javascript') {
          return 'js'
        } else if (language.value === 'html') {
          return 'html'
        } else if (language.value === 'css') {
          return 'css'
        }
      }

      const model = monaco.editor.createModel(
        code.value,
        language.value,
        monaco.Uri.parse(`file:///root/${Date.now()}.${extension()}`)
      )

      editorInstance = monaco.editor.create(
        editorRef.value,
        {
          model,
          tabSize: 2,
          insertSpaces: true,
          autoClosingQuotes: 'always',
          detectIndentation: false,
          folding: false,
          automaticLayout: true,
          theme: 'vs-light',
          minimap: {
            enabled: false
          },
          readOnly: readonly.value
        }
      )

      watch(
        () => isDarkmode.value,
        (val) => {
          monaco.editor.setTheme(val ? 'vs-dark' : 'vs-light')
        },
        { immediate: true }
      )

      editorInstance.onDidChangeModelContent(() => {
        const value = editorInstance.getValue()
        emit('update:modelValue', value)
      })
    }

    watch(
      () => props.modelValue,
      (code) => {
        readonly.value && setContent(code)
      }
    )

    onMounted(init)

    return {
      editorRef
    }
  }
})
</script>
