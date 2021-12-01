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

  import type { Bindings } from '@comunica/types'

  import Card from '../components/Card.vue'

  import executeSPARQLQuery from '../lib/SPARQL'
  import { isValidHttpUrl } from '../lib/HTTP'

  import {
    getTitle,
    getDescription,
    getIdentifier,
    getCatalogs,
    getIsPartOf,
    getAccessRights,
    getVersion,
    getMetadataIssued,
    getLanguage,
    getLicense,
    getLabel,
    isDirectContainer,
    getRemainingTriples,
    getTheme,
    getTypes
  } from '../composables/useTripleStore'

  const resource = defineAsyncComponent(() => import('@/components/Resource.vue'))

  const $route = useRoute()

  const state = reactive({
    document: [] as Array<Bindings>
  })

  onBeforeMount(async () => {
    try {
      state.document = (await executeSPARQLQuery(
        // @ts-ignore
        $route.params.id,
        'SELECT ?s ?p ?o WHERE { ?s ?p ?o }'
      ))!

      console.log(getTypes(state.document!))
    } catch (e) {
      console.log(e)
    }
  })
</script>
