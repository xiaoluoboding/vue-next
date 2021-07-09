<template>
  <div class="switcher inline-block">
    <input type="checkbox" :checked="checked" class="toggle toggle-primary">
    <span class="toggle-mark" @click.prevent="checked = !checked"></span>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  checked: Boolean
})

const emit = defineEmits<{
  (event: 'update:checked', checked: boolean): void
}>()

watch(
  () => props.checked,
  (newVal) => emit('update:checked', newVal)
)
</script>

<style lang="scss">
.toggle {
  @apply appearance-none opacity-0 w-0 h-0 absolute;
  & ~ .toggle-mark {
    @apply flex select-none cursor-pointer items-center justify-start transition duration-200 ease-in-out;
    @apply w-10 h-5 rounded-3xl border border-dark-500 dark:border-gray-500 border-opacity-20;
    &:before {
      @apply block content transition duration-200 ease-in-out;
      @apply w-4 h-4 ml-[2px] rounded-3xl bg-dark-500 dark:bg-gray-500 bg-opacity-20;
      animation: togglemark-off .33s ease-in-out;;
    }
  }
  &:focus-visible,&:checked:focus-visible,&:checked:hover:focus-visible {
    & ~ .toggle-mark {
      box-shadow: 0 0 0 2px hsl(0 0% 100%), 0 0 0 4px hsl(219 20.3% 25.1%);
    }
  }
  &:checked {
    &,
    &:hover {
      & ~ .toggle-mark {
        @apply border-$color-branding bg-opacity-20;
        &:before {
          @apply ml-0 transform translate-x-5;
          @apply border-$color-branding bg-$color-branding;
          animation: togglemark-on .33s ease-in-out;
        }
      }
    }
  }
}

@keyframes togglemark-off {
  50% {
    @apply ml-0;
  }
}
@keyframes togglemark-on {
  50% {
    @apply ml-[2px];
  }
}
</style>