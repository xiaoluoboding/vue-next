import fs from 'fs'
import path from 'path'
import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import ViteIcons from 'vite-plugin-icons'
import execa from 'execa'

const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)
const prefix = 'monaco-editor/esm/vs'

export default defineConfig({
  plugins: [
    vue(),
    copyVuePlugin(),
    WindiCSS({
      scan: {
        include: ['src/**/*.{vue,html,jsx,tsx}', 'index.html']
      }
    }),
    ViteIcons()
  ],
  define: {
    __COMMIT__: JSON.stringify(commit)
  },
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
      '@vue/compiler-sfc': '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          htmlWorker: [`${prefix}/languages/html/html.worker`],
          tsWorker: [`${prefix}/language/typescript/ts.worker`],
          editorWorker: [`${prefix}/editor/editor.worker`]
        }
      }
    }
  },
  optimizeDeps: {
    exclude: [
      'consolidate',
      'velocityjs',
      'dustjs-linkedin',
      'atpl',
      'liquor',
      'twig',
      'ejs',
      'eco',
      'jazz',
      'hamljs',
      'hamlet',
      'jqtpl',
      'whiskers',
      'haml-coffee',
      'hogan.js',
      'templayed',
      'handlebars',
      'underscore',
      'lodash',
      'walrus',
      'mustache',
      'just',
      'ect',
      'mote',
      'toffee',
      'dot',
      'bracket-template',
      'ractive',
      'htmling',
      'babel-core',
      'plates',
      'react-dom/server',
      'react',
      'vash',
      'slm',
      'marko',
      'teacup/lib/express',
      'coffee-script',
      'squirrelly',
      'twing'
    ]
  }
})

function copyVuePlugin(): Plugin {
  return {
    name: 'copy-vue',
    generateBundle() {
      const filePath = path.resolve(
        __dirname,
        '../vue/dist/vue.runtime.esm-browser.js'
      )
      if (!fs.existsSync(filePath)) {
        throw new Error(
          `vue.runtime.esm-browser.js not built. ` +
            `Run "yarn build vue -f esm-browser" first.`
        )
      }
      this.emitFile({
        type: 'asset',
        fileName: 'vue.runtime.esm-browser.js',
        source: fs.readFileSync(filePath, 'utf-8')
      })
    }
  }
}
