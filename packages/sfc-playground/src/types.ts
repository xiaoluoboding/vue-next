import { InjectionKey, Ref } from 'vue'

export const IS_DARKMODE: InjectionKey<Ref<boolean>> = Symbol()

export interface FileSFC {
  isSetup: string | boolean
  hasScoped: boolean
  isTs: boolean
  template: string
  script: string
  setupScript?: string
  style: string
}
