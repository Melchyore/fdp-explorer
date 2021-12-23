import { reactive } from 'vue'

import * as HTTP from '@/lib/HTTP'
import { Graph, GraphInterface } from '@/lib/Graph'

import * as ResourceStylesheet from '@/stylesheets/Resource.xsl'
import { getJSONGraph } from '@/lib/Utils'

export default function useAddURL () {
  const state = reactive({
    uri: null as unknown as string | null,
    graph: null as unknown as GraphInterface | null,
    children: [] as Array<any>,
    isDirectContainer: false,
    fetchInitiated: false,
    fetchDone: false,
    selectedType: '',
    graphURI: null,
    types: {} as Record<string, any>,
    resource: [] as Array<Record<string, unknown>>
  })

  const onSubmit = async () => {
    state.graph = null
    state.resource = []

    const headers = new Headers()
    headers.append('Accept', 'text/turtle')

    if (state.uri) {
      //_headers.append('Accept', 'application/rdf+xml')

      /*const parser = new DOMParser()
      const xsl = parser.parseFromString(ResourceStylesheet.default, 'text/xml')
      const xsltProcessor = new XSLTProcessor()
      xsltProcessor.importStylesheet(xsl)
      const xml = parser.parseFromString(await _response.text(), 'text/xml')
      const resultDocument = xsltProcessor.transformToFragment(xml, document)

      const serializer = new XMLSerializer()

      state.resource = serializer.serializeToString(resultDocument)*/
      state.resource = await getJSONGraph(state.uri)
  
      try {
        const response = await HTTP.get(state.uri, headers)
  
        state.graph = new Graph(await response.text())
        state.graph.parse()
      } catch {}
    }

    state.uri = null
    state.fetchInitiated = false
    state.fetchDone = true
  }

  return {
    state,
    onSubmit
  }
}
