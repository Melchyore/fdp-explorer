import { reactive } from 'vue'

export default function useSearch () {
  const state = reactive({
    search: '',
    originalResults: [],
    searchResults: [] as Array<any>,
    searchInitiated: false,
    searchDone: false,
    selectedType: '',
    types: {} as Record<string, any>
  })

  return {
    state
  }
}
