import dedent from 'dedent'

export const MAIN_FILE = 'App.vue'

export const WELCOME_CODE = dedent(`
  <template>
    <h1>{{ msg }}</h1>
  </template>

  <script setup>
  const msg = 'Hello World!'
  </script>
`).trim()

export const MAIN_CODE = `
import { createApp as _createApp } from "vue"

if (window.__app__) {
  window.__app__.unmount()
  document.getElementById('app').innerHTML = ''
}

document.getElementById('__sfc-styles').innerHTML = window.__css__
document.getElementById('__sfc-windicss').innerHTML = window.__windicss__
const app = window.__app__ = _createApp(__modules__["${MAIN_FILE}"].default)
app.config.errorHandler = e => console.error(e)
app.mount('#app')
`.trim()

export const IMPORT_MAP = dedent`
  {
    "imports": {

    }
  }
`.trim()
