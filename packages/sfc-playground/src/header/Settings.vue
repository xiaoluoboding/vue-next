<template>
  <div
    class="settings-menu"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="menu-button"
    tabindex="-1"
    v-show="show"
    ref="settingsRef"
  >
    <div class="py-1" role="none">
      <div class="settings-menu--item" role="menuitem" tabindex="-1" id="menu-item-0">
        <div>WindiCss Pane</div>
        <Switch v-model:checked="settings.isShowWindicssPane" />
      </div>
    </div>
    <div class="py-1" role="none">
      <a href="https://github.com/vuejs/vue-next/tree/master/packages/sfc-playground" class="settings-menu--item" role="menuitem" tabindex="-1" id="menu-item-2" target="_blank">GitHub</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, inject } from 'vue'
import { useClickOutside } from '../composable/useClickOutside'
import { PLAYGROUND_SETTINGS } from '../types'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits<{
  (event: 'update:show', show: boolean): void
}>()

const settingsRef = ref<HTMLElement>()
const settings = inject(PLAYGROUND_SETTINGS, {
  isShowWindicssPane: false
})

useClickOutside(settingsRef, () => {
  if (props.show) {
    emit('update:show', false)
  }
})
</script>

<style lang="scss" scoped>
.settings-menu {
  @apply origin-top-right absolute right-4 mt-[50px] w-56;
  @apply rounded-md shadow-lg ring-1 ring-black ring-opacity-5;
  @apply divide-y divide-$border-color focus:outline-none;
  @apply bg-white dark:bg-true-gray-800;
  &--item {
    @apply flex justify-between items-center;
    @apply text-dark-700 dark:text-true-gray-100 px-4 py-2 text-sm;
    @apply hover:text-$color-branding;
  }
}
</style>
