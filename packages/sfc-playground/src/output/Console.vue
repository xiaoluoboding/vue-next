<template>
  <div class="w-full h-full overflow-auto bg-white dark:bg-dark-500">
    <Message
      v-for="message in store.errors"
      :key="message"
      :message="message.toString()"
      type="Error"
    />
    <template v-if="store.runtimeErrors">
      <Message
        v-for="message in store.runtimeErrors"
        :key="message"
        :message="message.toString()"
        type="Runtime Error"
      />
    </template>
    <template v-if="store.runtimeWarning">
      <Message
        v-for="message in store.runtimeWarning"
        :key="message"
        :message="message.toString()"
        type="Runtime Warning"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { store } from '../store'
import Message from './Message.vue'
</script>