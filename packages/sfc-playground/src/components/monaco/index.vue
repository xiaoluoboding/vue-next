<template>
  <div ref="editorRef" style="height: 100%; width: 100%;"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, toRef, watch, nextTick } from 'vue'
import type { editor as Editor } from 'monaco-editor'

import setupMonaco from './editor'
import { debounce, injectStrict } from '../../utils'
import { IS_DARKMODE } from '../../types'

export default defineComponent({
  name: 'MonacoEditor',

  props: {
    code: { type: String, default: '' },
    value: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    readonly: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const editorRef = ref()
    const code = toRef(props, 'code')
    const language = toRef(props, 'language')
    const readonly = toRef(props, 'readonly')
    const isEditing = ref(false)
    let editorInstance: Editor.IStandaloneCodeEditor

    const isDarkmode = injectStrict(IS_DARKMODE)

    const setContent = (content: string) => {
      if (editorInstance) editorInstance.setValue(content)
    }

    const formatContent = () => {
      if (editorInstance) editorInstance.getAction('editor.action.formatDocument').run()
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
        } else if (language.value === 'json') {
          return 'json'
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

      watch(
        () => language.value,
        (lang) => {
          monaco.editor.setModelLanguage(model, lang)
        },
        { immediate: true }
      )

      editorInstance.onDidChangeModelContent(() => {
        const value = editorInstance.getValue()
        emit('update:code', value)
        isEditing.value = true
        debounce(() => isEditing.value = false, 333)()
      })
    }

    watch(
      () => props.code,
      (code) => {
        if (!isEditing.value || readonly.value) {
          setContent(code)
          if (/javascript/.test(language.value)) {
            nextTick(formatContent)
          }
        }
      }
    )

    onMounted(init)

    return {
      editorRef,
      isEditing
    }
  }
})
</script>
