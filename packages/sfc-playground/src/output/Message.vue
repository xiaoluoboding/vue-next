<template>
  <div class="flex items-center px-2 py-2 space-x-2 border-b dark:border-dark-200 font-mono">
    <div class="text-xs px-1 py-[3px] flex justify-center items-center bg-yellow-500 text-yellow-900 font-bold rounded whitespace-nowrap" v-if="type === 'Runtime Warning'">
      {{ type }}
    </div>
    <div class="text-xs px-1 py-[3px] flex justify-center items-center bg-red-500 text-red-900 font-bold rounded whitespace-nowrap" v-else>
      {{ type }}
    </div>
    <span class="text-xs dark:(text-light-900 text-opacity-50)">
      {{ formatMessage(message) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { CompilerError } from '@vue/compiler-sfc'

defineProps<{
  message: string
  type: string
}>()

function formatMessage(err: string | Error): string {
  if (typeof err === 'string') {
    return err
  } else {
    let msg = err.message
    const loc = (err as CompilerError).loc
    if (loc && loc.start) {
      msg = `(${loc.start.line}:${loc.start.column}) ` + msg
    }
    return msg
  }
}
</script>
