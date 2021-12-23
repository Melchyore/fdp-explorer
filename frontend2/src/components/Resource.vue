<template>
  <section class="h-full w-4/6 flex px-4 pb-5">
    <div class="w-full h-full p-4">
      <p v-if="state.parents.length > 0">
        <template v-for="(parent, index) of state.parents" :key="index">
          <router-link
            :to="{ name: 'document', params: { id: parent.url } }"
            target="_blank"
            class="text-blue-700"
          >
            {{ parent.title }}
          </router-link>

          <span> > </span>
        </template>

        <span>{{ state.title }}</span>
      </p>

      <br />

      <p class="font-semibold text-3xl tracking-wide">{{ state.title }}</p>
      <p class="font-semibold text-xl tracking-wide">Type: {{ state.types.join(', ') }}</p>

      <p>{{ state.description }}</p>

      <br/>

      <table>
        <tr>
          <td><strong>accessRights</strong></td>
          <td>{{ state.accessRights }}</td>
        </tr>

        <tr>
          <td><strong>conformsTo</strong></td>
          <td>
            <ul>
              <li v-for="[key, value] in state.conformsTo.entries()" :key="key">
                <a class="text-blue-600" :href="value" target="_blank">{{ key }}</a>
              </li>
            </ul>
          </td>
        </tr>

        <tr>
          <td><strong>hasVersion</strong></td>
          <td>{{ state.hasVersion}}</td>
        </tr>

        <tr>
          <td><strong>Language</strong></td>
          <td>
            <template v-if="isValidHttpUrl(state.language)">
              <a class="text-blue-600" :href="state.language" target="_blank">{{ state.language }}</a>
            </template>
            <template v-else>
              {{ state.language }}
            </template>
          </td>
        </tr>

        <tr>
          <td><strong>License</strong></td>
          <td><a class="text-blue-600" :href="state.license" target="_blank">{{ state.license }}</a></td>
        </tr>

        <tr>
          <td><strong>Publisher</strong></td>
          <td>{{ state.publisher }}</td>
        </tr>

        <tr>
          <td><strong>metadataIssued</strong></td>
          <td>{{ state.metadataIssued }}</td>
        </tr>
      </table>

      <br />

      <template v-for="(type, key) in state.children" :key="key">
        <p class="font-semibold text-xl tracking-wide">{{ key }}</p>

        <template v-if="type && type.length > 0">
          <template v-for="(child, index) in type" :key="index">
            <p>
              <router-link
                :to="{ name: 'document', params: { id: child['@id'] } }"
                target="_blank"
                class="text-blue-700"
              >
                {{ child['@id'].split('/').pop() }}
              </router-link>
            </p>
          </template>
        </template>
        <template v-else>
          <p>
            There are no {{ key.toLowerCase() }}.
          </p>
        </template>
      </template>

      <br />

      <template v-if="state.otherMetadata.length > 0">
        <p class="font-semibold text-xl tracking-wide">Other metadata</p>

        <table>
          <template v-for="(metadata, index) in state.otherMetadata" :key="index">
            <tr>
              <td><strong>{{ metadata[0] }}</strong></td>
              <td>{{ metadata[1] }}</td>
            </tr>
          </template>
        </table>
      </template>
    </div>
  </section>

  <!--<template v-if="catalogs.length > 0">
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
  </template>-->
</template>

<script setup lang="ts">
  import { ref, PropType, onMounted, onBeforeMount } from 'vue'

  import Card from '@/components/Card.vue'

  import { isValidHttpUrl } from '../lib/HTTP'

  import useResource from '@/composables/useResource'

  const props = defineProps({
    resource: {
      type: Array as PropType<Array<Record<string, unknown>>>,
      required: true
    }
  })

  const { state } = useResource(props.resource)
</script>

<style lang="scss">
  td {
    padding: 5px;
  }
</style>