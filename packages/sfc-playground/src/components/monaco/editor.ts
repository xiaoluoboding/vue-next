import * as monaco from 'monaco-editor'
/* __imports__ */
import vueTypes from '@vue/runtime-core/dist/runtime-core.d.ts?raw'

const setup = async () => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    noUnusedLocals: false,
    noUnusedParameters: false,
    allowUnreachableCode: true,
    allowUnusedLabels: true,
    strict: false,
    allowJs: true
  })

  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `
      declare module 'vue' { ${vueTypes} }
    `,
    'js:vue'
  )

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `
      declare module 'vue' { ${vueTypes} }
    `,
    'ts:vue'
  )

  await Promise.all([
    // load workers
    (async () => {
      const [
        { default: EditorWorker },
        { default: HtmlWorker },
        { default: CSSWorker },
        { default: TsWorker },
        { default: JSONWorker }
      ] = await Promise.all([
        import('monaco-editor/esm/vs/editor/editor.worker.js?worker'),
        import('monaco-editor/esm/vs/language/html/html.worker.js?worker'),
        import('monaco-editor/esm/vs/language/css/css.worker.js?worker'),
        import('monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'),
        import('monaco-editor/esm/vs/language/json/json.worker.js?worker')
      ])

      // @ts-expect-error
      window.MonacoEnvironment = {
        getWorker(_: any, label: string) {
          if (label === 'html') return new HtmlWorker()
          if (label === 'css') return new CSSWorker()
          if (label === 'json') return new JSONWorker()
          if (label === 'typescript' || label === 'javascript')
            return new TsWorker()
          return new EditorWorker()
        }
      }
    })()
  ])

  return { monaco }
}

export default setup
