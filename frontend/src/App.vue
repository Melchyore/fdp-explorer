<template>
    <Header />

    <div class="p-8 flex items-center justify-center">
      <div class="w-full max-w-xs mx-auto">
        <div>
          <!--<label for="price" class="block text-sm font-medium text-gray-700">Search</label>-->
          <div class="h-12 mt-1 relative rounded-md shadow-lg">
            <input v-model="search" type="text" name="price" id="price" class="h-full block w-full pl-2 pr-14 sm:text-sm rounded-md appearance-none focus:outline-none" placeholder="Search..." @update:modelValue="onInput" @keypress.enter="onSearchSubmit">
            <div class="absolute inset-y-0 right-1 flex items-center text-indigo-500 cursor-pointer" @click="onSearchSubmit">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <br/>

          <span v-if="searchDone">
            Search results: {{ searchResults.length }} matches
          </span>

          <br />

          <div class="w-full h-14 flex flex-wrap items-stretch select-none">
            <div v-for="(count, type) in typesCount" :key="type" class="mr-1 cursor-pointer" @click="onTypeFilterClick(type)">
              <span
                :class="{ 'active-type-filter': selectedType === type }"
                class="bg-purple-200 text-purple-600 py-1 px-3 rounded-full text-xs"
              >
                {{ type }} {{ count }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="searchInitiated && !searchDone" class="spinner ease-linear mx-auto rounded-full border-2 border-t-2 h-16 w-16"></div>

    <section v-for="(tripleStore, index) in searchResults" :key="index" class="h-full flex items-center justify-center px-4 pb-5">
      <div class="max-w-lg w-full h-full rounded-lg shadow-lg p-4 bg-white">
        <h3 class="font-semibold text-lg tracking-wide">
          <a :href="getIdentifier(tripleStore)" class="text-blue-700">
            {{ getTitle(tripleStore) }}
          </a>
        </h3>

        <div class="h-2/6">
          <p class="text-gray-500 my-1 line-clamp-2">
            {{ getDescription(tripleStore) }}
          </p>
        </div>

        <div class="mt-2 flex flex-wrap justify-start">
          <a v-for="(url, _index) in getTypes(tripleStore)" :key="_index" :href="url" class="mr-3 mb-3 inline-flex items-center font-semibold tracking-wide">
            <span class="bg-purple-200 text-purple-600 py-1 px-3 rounded-full text-xs border border-purple-400">
              {{ types[url] }}
            </span>
          </a>
        </div>
      </div>
    </section>
</template>

<script lang="ts">
  import { defineComponent, reactive, toRefs, computed, onBeforeMount } from 'vue'

  import * as $rdf from 'rdflib'
  import comunica from '@comunica/actor-init-sparql'

  import Header from './components/Header.vue'

  type Result = {
    uri: string,
    types: Array<string>
  }

  export default defineComponent({
    name: 'App',

    components: {
        Header
    },

    setup () {
      let typesCache = null as unknown as Cache

      onBeforeMount(async () => {
        typesCache = await caches.open('types-cache')
      })

      const state = reactive({
        search: '',
        originalResults: [],
        searchResults: [] as Array<any>,
        searchInitiated: false,
        searchDone: false,
        selectedType: '',
        types: {} as Record<string, any>
      })

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

      const getTitle = (tripleStore: any) => {
        for (const triple of tripleStore) {
          if (triple['?p'].value === 'http://purl.org/dc/terms/title') {
            return triple['?o'].value
          }
        }
      }

      const getIdentifier = (tripleStore: any) => {
        for (const triple of tripleStore) {
          if (triple['?p'].value === 'http://purl.org/dc/terms/identifier') {
            return triple['?o'].value
          }
        }
      }

      const getDescription = (tripleStore: any) => {
        for (const triple of tripleStore) {
          if (triple['?p'].value === 'http://purl.org/dc/terms/description') {
            return triple['?o'].value
          }
        }
      }

      const getTypes = (tripleStore: any) => {
        const types = []

        for (const triple of tripleStore) {
          if (
            triple['?s'].value === getIdentifier(tripleStore) &&
            triple['?p'].value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ) {
            types.push(triple['?o'].value)
          }
        }

        return types
      }

      const setTypes = async (tripleStore: any) => {
        for (const triple of tripleStore) {
          if (
            triple['?s'].value === getIdentifier(tripleStore) &&
            triple['?p'].value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ) {
            const typeURL = triple['?o'].value

            if (!state.types[typeURL]) {
              state.types[typeURL] = await getTypeLabel(typeURL) ?? typeURL
            }
            // cacheType(typeURL)
          }
        }
      }

      const getTypeLabel = async (typeURL: string) => {
        const store = $rdf.graph()

        const response = await typesCache.match(typeURL)

        if (response) {
            return new Promise(async (resolve) => {
              // @ts-ignore
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
                })

              console.log(result)

              /*result.bindingsStream.on('data', (data: any) => {
                resolve(data.get('?label').value)
              })*/
            })

          /*$rdf.parse(await response.text(), store, url, 'text/turtle', (err, kb) => {
            const allLabels = store.querySync($rdf.SPARQLToQuery(`SELECT DISTINCT ?label
              WHERE {
                <${url}> <http://www.w3.org/2000/01/rdf-schema#label> ?label.
              }`, false, kb))

              console.log(allLabels)

            for (const label of allLabels) {
              if (label['?label'].language === 'en') {
                labels.add(label['?label'].value)
              }
            }
          })*/
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

          for (const result of data) {
            const _headers = new Headers()
            _headers.append('Accept', 'text/turtle')

            const _options = {
                method: 'GET',
                headers: _headers
            }

            const uri = result.uri.endsWith('/') ? result.uri : `${result.uri}/`

            const _request = new Request(`${uri}?format=ttl`, _options)

            const store = $rdf.graph()

            try {
              const _response = await fetch(_request)

              $rdf.parse(await _response.text(), store, result.uri, 'text/turtle', async (err, kb) => {
                const graph = store.querySync($rdf.SPARQLToQuery('SELECT ?s ?p ?o WHERE { ?s ?p ?o . }', false, kb))

                if (graph.length > 0) {
                  allGraphs.push(graph)

                  await setTypes(graph)
                }
              })
            } catch (e) {
              console.error(e)
            }
          }

          state.searchInitiated = false
          state.searchDone = true
          state.searchResults = allGraphs
        } catch (e) {
          console.error(e)
        }
      }

      return {
        ...toRefs(state),
        onInput,
        onSearchSubmit,
        onTypeFilterClick,
        getIdentifier,
        getTitle,
        getTypes,
        getDescription,
        getTypeLabel,
        // types,
        extractType,
        // typesCount
      }
    }
  })
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
