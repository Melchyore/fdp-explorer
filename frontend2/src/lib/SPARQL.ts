import type { Bindings } from '@comunica/types'
import * as comunica from '@comunica/actor-init-sparql'
import * as N3 from 'n3'

export default async function executeSPARQLQuery (uri: string, query: string): Promise<Array<Bindings> | null> {
  const headers = new Headers()
  headers.append('Accept', 'text/turtle')

  const options = {
    method: 'GET',
    headers: headers
  }

  if (!uri.endsWith('/')) {
    uri += '/'
  }

  const request = new Request(uri, options)

  try {
    const response = await fetch(request)

    const parser = new N3.Parser({ format: 'text/turtle' })

    const store = new N3.Store()
    store.addQuads(parser.parse(await response.text()))

    const result = await comunica
      .newEngine()
      .query(query, {
        sources: [store]
      }) as comunica.IQueryResultBindings

    return await result.bindings()
  } catch {}

  return null
}
