import { Ref, unref, onMounted, onUnmounted } from 'vue'

export type UseClickOutsideOptions = {
  eventName?: string
}

export function useClickOutside(
  target: Element | Ref<Element | undefined>,
  listener: EventListener,
  options: UseClickOutsideOptions = {}
) {
  const { eventName = 'click' } = options

  const onClick = (event: Event) => {
    const element = unref(target)
    if (element && !element.contains(event.target as Node)) {
      listener(event)
    }
  }

  onMounted(() => {
    window.addEventListener(eventName, onClick, true)
  })

  onUnmounted(() => {
    window.removeEventListener(eventName, onClick, true)
  })
}
