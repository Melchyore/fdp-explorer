import { onBeforeMount, reactive } from 'vue'
import _, { includes } from 'lodash'

import * as HTTP from '@/lib/HTTP'
import { normalizeName } from '@/lib/Utils'
import Predicate from '@/lib/Predicate'

type Node = {
  [key: string]: Array<Record<'@id' | '@value', string>>
} & {
  '@id': string,
  '@type': string | Array<string>
}

type Graph = Array<Node>

async function getParents (lastParent: string) {
  const parents = [] as Array<Record<string, string>>

  const getParent = async (parent: string) => {
    const headers = new Headers()
    headers.append('Accept', 'application/ld+json')

    const response = await HTTP.get(parent, headers)
    const graph = JSON.parse(await response.text())

    const parentNode = _.find(graph, '@graph')

    if (parentNode) {
      const graphNode = parentNode['@graph'] as Graph
      const node = _.find(graphNode, Predicate.IsPartOf)

      if (node) {
        const _parent = node[Predicate.IsPartOf][0]['@id']

        await getParent(_parent)
      }

      const titleParentNode = _.find(graphNode, Predicate.Title)

      if (titleParentNode) {
        parents.push({ title: titleParentNode[Predicate.Title][0]['@value'].trim(), url: parent })
      }
    }
  }

  if (lastParent && HTTP.isValidHttpUrl(lastParent)) {
    await getParent(lastParent)
  }

  return parents
}

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

export default function useResource (resource: Array<Record<string, unknown>>) {
  const state = reactive({
    title: '',
    types: [] as Array<string>,
    description: '',
    accessRights: '',
    hasVersion: '',
    conformsTo: new Map(),
    language: '',
    license: '',
    publisher: '',
    metadataIssued: '',
    isPartOf: '',
    children: {} as Record<string, Array<Record<string, string>>>,
    parents: [] as Array<Record<string, string>>,
    otherMetadata: [] as Array<[string, Array<Record<string, string>>]>
  })

  onBeforeMount(async () => {
    let childrenKey = ''
    let accessRightsKey = ''
    let publisherKey = ''
    let conformsToKey = ''

    resource.forEach((obj: Record<string, any>) => {
      if (obj['@graph']) {
        const graph = obj['@graph'] as Graph
        const id = obj['@id']
        publisherKey = _.find(obj['@graph'], Predicate.Publisher)[Predicate.Publisher][0]['@id']

        if (obj[Predicate.ConformsTo]) {
          conformsToKey = obj[Predicate.ConformsTo][0]['@id']
        }

        graph.forEach(node => {
          if (node['@id'] === id) {
            state.title = node[Predicate.Title][0]['@value']

            const description = node[Predicate.Description]
            const conformsTo = node[Predicate.ConformsTo]
            const accessRights = node[Predicate.AccessRights]
            const isPartOf = node[Predicate.IsPartOf]

            state.types = Array.from(node['@type']).map(type => type.split('#').pop()!)

            state.description = description ? description[0]['@value'] : ''
            state.hasVersion = node[Predicate.HasVersion][0]['@value']

            if (conformsTo) {
              state.conformsTo.set(conformsTo[0]['@id'].split('/').pop()!, conformsTo[0]['@id'])
            }

            state.language = node[Predicate.Language][0]['@id']
            state.license = node[Predicate.License][0]['@id']
            state.metadataIssued = node[Predicate.MetadataIssued][0]['@value']
            state.isPartOf = isPartOf ? isPartOf[0]['@id'] : ''

            //publisherKey = node['http://purl.org/dc/terms/publisher'][0]['@id']
            accessRightsKey = accessRights ? accessRights[0]['@id'] : ''
          } else {
            if (node['@type'] && node['@type'].includes(Predicate.DirectContainer)) {
              childrenKey = node['@id']
            }

            if (node['@id']) {
              if (node['@id'] === accessRightsKey) {
                state.accessRights = node[Predicate.Description][0]['@value']
              }
              
              if (node['@id'] === publisherKey) {
                state.publisher = node[Predicate.Name][0]['@value']
              }

              if (node['@id'] === conformsToKey) {
                state.conformsTo.set(node[Predicate.Label][0]['@value'], conformsToKey)
              }
            }
          }

          for (const _node in node) {
            if (![...Object.values(Predicate), '@id', '@type'].includes(_node as Predicate)) {
              const obj = node[_node]

              state.otherMetadata.push([normalizeName(_node), obj])
            }
          }
        })
      } else {
        if (childrenKey) {
          if (obj['@id'] && obj['@id'] === childrenKey) {
            const type = obj[Predicate.Title][0]['@value']

            state.children[type] = obj[Predicate.Contains]
          }
        } else {
          if (obj['@type'] && obj['@type'].includes(Predicate.DirectContainer)) {
            const type = obj[Predicate.Title][0]['@value']

            state.children[type] = obj[Predicate.Contains]
          }
        }

        if (conformsToKey) {
          if (obj['@id'] && obj['@id'] === conformsToKey) {
            state.conformsTo.set(obj[Predicate.Label][0]['@value'], conformsToKey)
          }
        }
      }
    })

    if (state.isPartOf) {
      state.parents = await getParents(state.isPartOf)
      console.log(state.parents)
    }
  })

  return {
    state
  }
}