<template>
  <router-view>
    <div class="p-8 flex items-center justify-center">
      <div class="w-full max-w-lg mx-auto">
        <div>
          <!--<label for="price" class="block text-sm font-medium text-gray-700">Search</label>-->
          <div class="h-auto mt-1 relative rounded-md">
            <input v-model="state.uri" type="text" name="addUrl" id="addUrl" class="appearance-none rounded-none block w-full pl-3 pr-8 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Add URL" @keypress.enter="onSearchSubmit">

            <div class="absolute inset-y-0 right-1 flex items-center text-indigo-500 cursor-pointer" @click="onSearchSubmit">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-width="2" d="M16 9h-5V4H9v5H4v2h5v5h2v-5h5V9z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="state.fetchInitiated && !state.fetchDone && state.uri">
      <section class="h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-lg w-full h-full space-y-8">
          <div class="h-2/6">
            <p class="mt-2 text-center text-sm text-gray-600 truncate">
              Fetching
              <a :href="state.uri" target="_blank" class="text-blue-700">{{ state.uri }}</a>
            </p>
          </div>

          <div class="mx-auto spinner ease-linear rounded-full border-2 border-t-2 h-16 w-16"></div>
        </div>
      </section>
    </template>

    <!--<resource :resource="state.resource" v-if="state.resource.length > 0"></resource>-->
    <section class="h-full w-4/6 flex px-4 pb-5">
      <div class="w-full h-full p-4">
        <div id="resource" v-if="state.resource"></div>
      </div>
    </section>
  </router-view>
</template>

<script setup lang="ts">
  // We need this for Comunica's Actors to work.
  require('setimmediate')

  import { defineComponent, reactive, toRefs, computed, onBeforeMount, defineAsyncComponent } from 'vue'

  import useAddURL from '@/composables/useAddURL'

  import { isValidHttpUrl } from '@/lib/HTTP'

  const resource = defineAsyncComponent(() => import('@/components/Resource.vue'))

  const { state, onSubmit } = useAddURL()

  const onSearchSubmit = async () => {
    const uri = state.uri

    if (uri) {
      if (isValidHttpUrl(uri)) {
        state.fetchInitiated = true
        state.fetchDone = false
        state.children = []

        await onSubmit()
      }
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
