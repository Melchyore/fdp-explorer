import type { Bindings } from '@comunica/types'
import * as comunica from '@comunica/actor-init-sparql'
import * as N3 from 'n3'
import * as $rdf from 'rdflib'

export interface GraphConstructor {
  new (_graphString: string, _parse: boolean, _store: N3.Store): GraphInterface
}

export interface GraphInterface {
  identifier: string
  types: Array<string>
  children: Set<string>

  parse: (format?: string) => void
  query: (query: string) => Promise<Array<Bindings>>
}

export class Graph implements GraphInterface {
  public identifier: string = ''
  public types: Array<string> = []
  public children: Set<string> = new Set()

  private _store = new N3.Store()
  private _parsed = false

  constructor (
    private _graphString: string,
    private _parse: boolean = false,
  ) {
    if (this._parse) {
      this.parse()
    }
  }

  private async getIdentifier (): Promise<void> {
    const result = await this.query(`
      SELECT ?id
        WHERE {
          ?uri <http://purl.org/dc/terms/identifier> ?id.
        }
    `)

    if (result.length > 0) {
      this.identifier = result[0].get('?id').value
    }
  }

  private async getTypes (): Promise<void> {
    const result = await this.query(`
      SELECT *
      WHERE {
        <${this.identifier}> a ?type.
      }
    `)

    if (result.length > 0) {
      console.log(result)
      for (const binding of result) {
        this.types.push(binding.get('?type').value)
      } 
    }
  }

  private async getChildren (): Promise<void> {
    const result = await this.query(`
      PREFIX ldp: <http://www.w3.org/ns/ldp#>

      SELECT *
      WHERE {
        <${this.identifier}> a ?type.
        ?memb ldp:membershipResource ?resource.
        ?memb ldp:hasMemberRelation ?relation.
        ?resource ?relation ?contains.
      }
    `)

    if (result.length > 0) {
      for (const binding of result) {
        this.children.add(binding.get('?contains').value)
      }
    }
  }

  public async parse (format: string = 'text/turtle'): Promise<void> {
    const parser = new N3.Parser({ format: format })

    this._store.addQuads(parser.parse(this._graphString))

    if (!this._parsed) {
      this._parsed = true

      await this.getIdentifier()
      await this.getTypes()
      await this.getChildren()
    }
  }

  public async query (query: string): Promise<Array<Bindings>> {
    if (this._store.size < 1) {
      throw new Error('You need to parse the graph first, using "parse" method before querying it.')
    }

    try {
      const result = await comunica
        .newEngine()
        .query(query, {
          sources: [this._store]
        }) as comunica.IQueryResultBindings

      return await result.bindings()
    } catch (e) {
      console.error(e)
    }

    return []
  }
}