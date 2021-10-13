import type { Bindings } from '@comunica/types'
import { reactive } from 'vue'

export default function useAddURL () {
  const state = reactive({
    url: '',
    repository: [] as Array<Bindings>,
    catalogs: [] as Array<any>,
    isDirectContainer: false,
    fetchInitiated: false,
    fetchDone: false,
    selectedType: '',
    types: {} as Record<string, any>
  })

  return {
    state
  }
}
