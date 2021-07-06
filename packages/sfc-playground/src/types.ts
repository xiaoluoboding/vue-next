import { InjectionKey, Ref } from 'vue'

export const IS_DARKMODE: InjectionKey<Ref<boolean>> = Symbol()

export type FileSFC = {
  isSetup: string | boolean
  isScopedCSS: boolean
  template: string
  script: string
  setupScript?: string
  style: string
}
