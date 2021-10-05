<template>
  <section class="h-full flex items-center justify-center px-4 pb-5">
    <div class="max-w-lg w-full h-full rounded-lg shadow-lg p-4 bg-white">
      <h3 class="font-semibold text-lg tracking-wide">
        <router-link
          :to="{ name: 'document', params: { id: document.identifier } }"
          target="_blank"
          class="text-blue-700"
        >
          {{ document.title }}
        </router-link>
      </h3>

      <div class="h-2/6">
        <p class="text-gray-500 my-1 line-clamp-2">
          {{ document.description }}
        </p>
      </div>

      <div class="mt-2 flex flex-wrap justify-start">
        <a v-for="(url, _index) in document.types" :key="_index" :href="url" class="mr-3 mb-3 inline-flex items-center font-semibold tracking-wide">
          <span class="bg-purple-200 text-purple-600 py-1 px-3 rounded-full text-xs border border-purple-400">
            {{ types[url] }}
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  defineProps({
    document: Object,
    types: Object
  })
</script>
