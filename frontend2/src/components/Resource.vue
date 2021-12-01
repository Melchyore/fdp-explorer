<template>
  <section class="h-full w-4/6 flex px-4 pb-5">
    <div class="w-full h-full p-4">
      <p v-if="parents.length > 0">
        <template v-for="(parent, index) of parents" >
          <a :href="parent.identifier" class="text-blue-700">{{ parent.label }}</a>
          <span> > </span>
        </template>

        <span>{{ getLabel(resource!) }}</span>
      </p>

      <br />

      <p class="font-semibold text-3xl tracking-wide">{{ getTitle(resource!) }}</p>

      <p>{{ getDescription(resource!) }}</p>

      <br/>

      <p><strong>accessRights: </strong>{{ getAccessRights(resource) }}</p>
      <p><strong>hasVersion: </strong>{{ getVersion(resource) }}</p>
      <p><strong>Language: </strong>
        <template v-if="isValidHttpUrl(language)">
          <a class="text-blue-600" :href="language" target="_blank">{{ language }}</a>
        </template>
        <template v-else>
          {{ language }}
        </template>
      </p>
      <p><strong>License: </strong><a class="text-blue-600" :href="license" target="_blank">{{ license }}</a></p>
      <p><strong>metadataIssued: </strong>{{ getMetadataIssued(resource) }}</p>
    </div>
  </section>

  <template v-if="catalogs.length > 0">
    <card
      v-for="(catalog, index) in catalogs"
      :key="index"
      :document="catalog"
      :types="{}"
    />
  </template>

  <template v-if="datasets.length > 0">
    <card
      v-for="(dataset, index) in datasets"
      :key="index"
      :document="dataset"
      :types="{}"
    />
  </template>
</template>

<script setup lang="ts">
  import { ref, PropType, onMounted, onBeforeMount } from 'vue'

  import type { Bindings } from '@comunica/types'

  import Card from '@/components/Card.vue'

  import { isValidHttpUrl } from '../lib/HTTP'

  import executeSPARQLQuery from '../lib/SPARQL'
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
    getTypes,
getDatasets
  } from '../composables/useTripleStore'

  interface Catalog {
    title: string | null,
    description: string | null,
    identifier: string | null,
    types: Array<string>
  }

  interface Dataset extends Catalog {}

  const props = defineProps({
    resource: {
      type: Array as PropType<Array<Bindings>>,
      required: true
    }
  })

  const parents = ref<Array<Record<string, string>>>([])
  const language = ref<string>('')
  const license = ref<string>('')
  const catalogs = ref<Array<Catalog>>([])
  const datasets = ref<Array<Dataset>>([])

  const getAllParents = async (document: Array<Bindings>) => {
    const isPartOf = getIsPartOf(document)
  
    if (isPartOf) {
      const parent = await executeSPARQLQuery(
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
    if (props.resource) {
      getAllParents(props.resource)

      language.value = (await getLanguage(props.resource))!
      license.value = (await getLicense(props.resource))!

      const directContainer = isDirectContainer(props.resource)

      if (directContainer) {
        const _catalogs = getCatalogs(props.resource)

        if (_catalogs.length > 0) {
          _catalogs.forEach(async (url) => {
            const catalog = await executeSPARQLQuery(
              url,
              'SELECT ?s ?p ?o WHERE { ?s ?p ?o }'
            )

            if (catalog) {
              catalogs.value.push({
                title: getTitle(catalog),
                description: getDescription(catalog),
                identifier: getIdentifier(catalog),
                types: []
              })
            }
          })
        }
      }

      const _datasets = getDatasets(props.resource)

      if (_datasets.length > 0) {
        _datasets.forEach(async (url) => {
          const catalog = await executeSPARQLQuery(
            url,
            'SELECT ?s ?p ?o WHERE { ?s ?p ?o }'
          )

          if (catalog) {
            datasets.value.push({
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
</script>