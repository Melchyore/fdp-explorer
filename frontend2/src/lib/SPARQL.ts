import type { Bindings } from '@comunica/types'
import * as comunica from '@comunica/actor-init-sparql'
import * as N3 from 'n3'

import * as HTTP from '@/lib/HTTP'
import { Graph, GraphInterface } from '@/lib/Graph'

export default async function executeSPARQLQuery (uri: string, query: string): Promise<GraphInterface | undefined> {
  const headers = new Headers()
  headers.append('Accept', 'text/turtle')

  if (!uri.endsWith('/')) {
    uri += '/'
  }

  try {
    const response = await HTTP.get(uri, headers)

    /*const parser = new N3.Parser({ format: 'text/turtle' })

    const store = new N3.Store()
    store.addQuads(parser.parse(await response.text()))

    const result = await comunica
      .newEngine()
      .query(query, {
        sources: [store]
      }) as comunica.IQueryResultBindings

    return await result.bindings()*/

    const graph = new Graph(await response.text())
    graph.parse()

    return graph
  } catch {}
}
