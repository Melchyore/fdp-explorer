<template>
  <router-view>
    <Suspense>
      <template #default>
        <resource :resource="state.document" v-if="state.document.length > 0" />
      </template>

      <template #fallback>
        Loading...
      </template>
    </Suspense>
  </router-view>
</template>

<script setup lang="ts">
  import { onBeforeMount, reactive, defineAsyncComponent } from 'vue'
  import { useRoute } from 'vue-router'

  import { getJSONGraph } from '@/lib/Utils'

  const resource = defineAsyncComponent(() => import('@/components/Resource.vue'))

  const $route = useRoute()

  const state = reactive({
    document: []
  })

  onBeforeMount(async () => {
    try {
      // @ts-ignore
      state.document = await getJSONGraph($route.params.id)
    } catch (e) {
      console.log(e)
    }
  })
</script>
