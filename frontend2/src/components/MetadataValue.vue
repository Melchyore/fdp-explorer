<template>
  <template v-if="isValidHttpUrl(value)">
    <a class="text-blue-600" :href="value" target="_blank">{{ value }}</a>
  </template>
  <template v-else>
    {{ value }}
  </template>
</template>

<script setup lang="ts">
  import { isValidHttpUrl } from '@/lib/HTTP'

  const props = defineProps({
    value: {
      type: String,
      required: true
    }
  })
</script>