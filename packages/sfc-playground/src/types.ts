import { InjectionKey, Ref } from 'vue'

export interface PlaygroundSettings {
  isShowWindicssPane: boolean
}

export const IS_DARKMODE: InjectionKey<Ref<boolean>> = Symbol()
export const PLAYGROUND_SETTINGS: InjectionKey<PlaygroundSettings> = Symbol(
  'PlaygroundSettings'
)

export interface FileSFC {
  isSetup: string | boolean
  hasScoped: boolean
  isTS: boolean
  template: string
  script: string
  setupScript?: string
  style: string
}
