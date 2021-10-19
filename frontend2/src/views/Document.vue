<template>
  <router-view>
    <section class="h-full w-4/6 flex px-4 pb-5">
      <div class="w-full h-full p-4">
        <p v-if="parents.length > 0">
          <template v-for="(parent, index) of parents" >
            <a :href="parent.identifier" class="text-blue-700">{{ parent.label }}</a>
            <span> > </span>
          </template>

          <span>{{ getLabel(state.document!) }}</span>
        </p>

        <br />

        <p class="font-semibold text-3xl tracking-wide">{{ getTitle(state.document!) }}</p>

        <p>{{ getDescription(state.document!) }}</p>

        <br/>

        <p><strong>accessRights: </strong>{{ getAccessRights(state.document!) }}</p>
        <p><strong>hasVersion: </strong>{{ getVersion(state.document!) }}</p>
        <p><strong>Language: </strong>
          <template v-if="isValidHttpUrl(state.language!)">
            <a class="text-blue-600" :href="state.language!" target="_blank">{{ state.language }}</a>
          </template>
          <template v-else>
            {{ state.language }}
          </template>
        </p>
        <p><strong>License: </strong><a class="text-blue-600" :href="state.license!" target="_blank">{{ state.license }}</a></p>
        <p><strong>metadataIssued: </strong>{{ getMetadataIssued(state.document!) }}</p>
      </div>
    </section>

    <template v-if="state.catalogs.length > 0">
      <card
        v-for="(catalog, index) in state.catalogs"
        :key="index"
        :document="catalog"
        :types="{}"
      />
    </template>
  </router-view>
</template>

<script setup lang="ts">
  import { defineComponent, onMounted, reactive, ref } from 'vue'
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

  const $route = useRoute()
  let parents = ref<Array<Record<string, string>>>([])

  const state = reactive({
    document: [] as Array<Bindings> | null,
    catalogs: [] as Array<any>,
    language: '' as string | null | undefined,
    license: '' as string | null | undefined
  })

  const getAllParents = async (document: Array<Bindings>) => {
    const isPartOf = getIsPartOf(document)
  
    if (isPartOf) {
      const parent = await executeSPARQLQuery(
        // @ts-ignore
        isPartOf,
        'SELECT ?s ?p ?o WHERE { ?s ?p ?o }'
      )

      if (parent) {
        parents.value.unshift({
          identifier: getIdentifier(parent)!,
          label: getLabel(parent)!
        })

        getAllParents(parent)
      }
    }
  }

  onMounted(async () => {
    try {
        state.document = await executeSPARQLQuery(
        // @ts-ignore
        $route.params.id,
        'SELECT ?s ?p ?o WHERE { ?s ?p ?o }'
      )

      console.log(getTypes(state.document!))

      if (state.document) {
        getAllParents(state.document)

        state.language = await getLanguage(state.document)
        state.license = await getLicense(state.document)

        const directContainer = isDirectContainer(state.document)

        if (directContainer) {
          const catalogs = getCatalogs(state.document)

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
      }
    } catch (e) {
      console.log(e)
    }
  })
</script>
