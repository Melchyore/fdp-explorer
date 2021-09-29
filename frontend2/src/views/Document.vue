<template>
  <router-view>
    <section class="h-full w-4/6 flex px-4 pb-5">
      <div class="w-full h-full p-4">
        <p class="font-semibold text-3xl tracking-wide">{{ getTitle(document) }}</p>

        <p>{{ getDescription(document) }}</p>

        <br/>

        <p><strong>accessRights:</strong> {{ getAccessRights(document) }}</p>
        <p><strong>hasVersion:</strong> {{ getVersion(document) }}</p>
        <p><strong>Language:</strong> {{ language }}</p>
        <p><strong>License:</strong> <a class="text-blue-600" :href="license" target="_blank">{{ license }}</a></p>
        <p><strong>metadataIssued:</strong> {{ getMetadataIssued(document) }}</p>
      </div>
    </section>

    <card
      v-for="(catalog, index) in catalogs"
      :key="index"
      :document="catalog"
      :types="{}"
    />
  </router-view>
</template>

<script lang="ts">
  import { defineComponent, onMounted, reactive, toRefs } from 'vue'
  import { useRoute } from 'vue-router'

  import type { Bindings } from '@comunica/types'

  import Card from '../components/Card.vue'

  import executeSPARQLQuery from '../lib/SPARQL'
  import {
    getTitle,
    getDescription,
    getIdentifier,
    getCatalogs,
    getParent,
    getAccessRights,
    getVersion,
    getMetadataIssued,
    getLanguage,
    getLicense
  } from '../composables/useTripleStore'

  export default defineComponent({
    name: 'Document',

    components: {
      Card
    },

    setup () {
      const $route = useRoute()
      const params = $route.params

      const state = reactive({
        document: [] as Array<Bindings> | null,
        catalogs: [] as Array<any>,
        language: '' as string | null | undefined,
        license: '' as string | null | undefined
      })

      onMounted(async () => {
        state.document = await executeSPARQLQuery(
          // @ts-ignore
          Array.from($route.params.documents).pop(),
          'SELECT ?s ?p ?o WHERE { ?s ?p ?o }'
        )

        if (state.document) {
          const catalogs = getCatalogs(state.document)
          console.log(getParent(state.document))

          state.language = await getLanguage(state.document)
          state.license = await getLicense(state.document)

          if (catalogs.length > 0) {
            catalogs.forEach(async (url) => {
              const catalog = await executeSPARQLQuery(
                url,
                'SELECT ?s ?p ?o WHERE { ?s ?p ?o }'
              )

              if (catalog) {
                state.catalogs.push({
                  title: getTitle(catalog),
                  description: getDescription(catalog),
                  identifier: getIdentifier(catalog),
                  types: []
                })
              }
            })
          }
        }
      })

      return {
        ...toRefs(state),
        getTitle,
        getDescription,
        getAccessRights,
        getVersion,
        getMetadataIssued,
        getLanguage
      }
    }
  })
</script>
