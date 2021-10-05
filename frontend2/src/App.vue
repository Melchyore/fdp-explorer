<template>
  <Header />

  <div class="p-8 flex items-center justify-center">
    <div class="w-full max-w-xs mx-auto">
      <div>
        <!--<label for="price" class="block text-sm font-medium text-gray-700">Search</label>-->
        <div class="h-12 mt-1 relative rounded-md shadow-lg">
          <input v-model="state.search" type="text" name="search" id="price" class="h-full block w-full pl-2 pr-14 sm:text-sm rounded-md appearance-none focus:outline-none" placeholder="Search..." @update:modelValue="onInput" @keypress.enter="onSearchSubmit">
          <div class="absolute inset-y-0 right-1 flex items-center text-indigo-500 cursor-pointer" @click="onSearchSubmit">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <br/>

        <span v-if="state.searchDone">
          Search results: {{ state.searchResults.length }} matches
        </span>

        <br />

        <div class="w-full h-14 flex flex-wrap items-stretch select-none">
          <!--<div v-for="(count, type) in typesCount" :key="type" class="mr-1 cursor-pointer" @click="onTypeFilterClick(type)">
            <span
              :class="{ 'active-type-filter': state.selectedType === type }"
              class="bg-purple-200 text-purple-600 py-1 px-3 rounded-full text-xs"
            >
              {{ type }} {{ count }}
            </span>
          </div>-->
        </div>
      </div>
    </div>
  </div>

  <div v-if="state.searchInitiated && !state.searchDone" class="spinner ease-linear mx-auto rounded-full border-2 border-t-2 h-16 w-16"></div>

  <card
    v-for="(document, index) in state.searchResults"
    :key="index"
    :document="document"
    :types="state.types"
  />

  <router-view />
</template>

<script setup lang="ts">
  // We need this for Comunica's Actors to work.
  require('setimmediate')

  import { defineComponent, reactive, toRefs, computed, onBeforeMount } from 'vue'

  // import * as $rdf from 'rdflib'
  import type { Bindings } from '@comunica/types'
  import * as comunica from '@comunica/actor-init-sparql'
  import * as N3 from 'n3'

  import Header from './components/Header.vue'
  import Card from './components/Card.vue'

  import useSearch from './composables/useSearch'
  import { getTitle, getIdentifier, getDescription, getTypes } from './composables/useTripleStore'
  import executeSPARQLQuery from './lib/SPARQL'

  type Result = {
    uri: string,
    types: Array<string>
  }

  let typesCache = null as unknown as Cache

  onBeforeMount(async () => {
    typesCache = await caches.open('types-cache')
  })

  const { state } = useSearch()

  /* const types = computed(() => state.originalResults.map((data: Result) => {
    const _types = data.types

    return _types.map(type => extractType(type))
  }).flat())

  const typesCount = computed(() => types.value.reduce((map: Record<string, number>, val: string | undefined) => {
    if (val) {
      map[val] = (map[val] || 0) + 1
    }

    return map
  }, {})) */

  const extractType = (url: string): string | undefined => {
    const fragmentedType = url.split('/').pop()
    let _type = fragmentedType

    if (_type) {
      for (let separator of ['#', ':']) {
        if (fragmentedType?.includes(separator)) {
          _type = fragmentedType.split(separator)[1]
        }
      }
    }

    return _type
  }

  const onInput = () => {
  }

  const onTypeFilterClick = (type: string) => {
    if (state.selectedType === type) {
      state.selectedType = ''
      state.searchResults = state.originalResults
    } else {
      state.selectedType = type
      state.searchResults = state.originalResults.filter((result: Result) => result.types.some((_type) => extractType(_type) === type))
    }
  }

  const setTypes = async (tripleStore: Array<Bindings>) => {
    for (const triple of tripleStore) {
      if (
        triple.get('?s')?.value === getIdentifier(tripleStore) &&
        triple.get('?p')?.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
      ) {
        const typeURL = triple.get('?o')?.value!

        if (!state.types[typeURL]) {
          cacheType(typeURL)

          state.types[typeURL] = await getTypeLabel(typeURL) ?? typeURL
        }
      }
    }
  }

  const getTypeLabel = async (typeURL: string): Promise<string | undefined> => {
    try {
      const response = await typesCache.match(typeURL)

      if (response) {
        const result = await comunica
        .newEngine()
        .query(`
          SELECT DISTINCT ?label
          WHERE {
              <${typeURL}> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
              FILTER(LANG(?label) = "en")
          }
        `, {
          sources: [typeURL.replace('http:', 'https:')]
        }) as comunica.IQueryResultBindings

        return (await result.bindings())[0].get('?label').value
      }
    } catch {
      console.warn(typeURL)
    }
  }

  const cacheType = async (typeURL: string) => {
    if (!await typesCache.match(typeURL)) {
      const headers = new Headers()
      headers.append('Accept', 'text/turtle')

      const options = {
        method: 'GET',
        headers
      }

      try {
        const response = await fetch(typeURL, options)

        typesCache.put(typeURL, response)
      } catch (e) {
        // console.log(e)
      }
    }
  }

  const onSearchSubmit = async () => {
    state.searchInitiated = true
    state.searchDone = false
    state.searchResults = []

    const headers = new Headers()
    headers.append('Content-Type', 'application/json')

    const options = {
      method: 'POST',
      body: JSON.stringify({ q: state.search }),
      headers
    }

    const request = new Request('https://ejprd.fair-dtls.surf-hosted.nl/bbmri-fdp/search', options)

    try {
      const response = await fetch(request)
      const data = await response.json() as Array<Result>

      //state.searchResults = state.originalResults = data
      const allGraphs = [] as Array<any>

      if (data.length > 0) {
        for (const result of data) {
          try {
            const document = await executeSPARQLQuery(result.uri, 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }')

            if (document) {
              const graph = {
                title: '',
                description: '',
                identifier: '',
                types: [] as Array<string>
              }

              graph.title = getTitle(document)!
              graph.description = getDescription(document)!
              graph.identifier = getIdentifier(document)!
              graph.types = await getTypes(document)

              allGraphs.push(graph)
              setTypes(document as any)
            }
          } catch (e) {
            // console.error(e)
          }
        }
      }

      state.searchInitiated = false
      state.searchDone = true

      // @ts-ignore
      state.searchResults = Object.freeze(allGraphs)
    } catch (e) {
      console.error('error: ', e)

      state.searchInitiated = false
      state.searchDone = true
    }
  }
</script>

<style lang="postcss">
  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .active-type-filter {
    @apply bg-purple-400 text-white !important;
  }

  .spinner {
    border-top-color: rgb(99, 102, 241);
    -webkit-animation: spinner 1.5s linear infinite;
    animation: spinner 1.5s linear infinite;
  }

  @-webkit-keyframes spinner {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }

  @keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
