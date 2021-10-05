import type { Bindings } from '@comunica/types'

import * as HTTP from '../lib/HTTP'
import executeSPARQLQuery from '../lib/SPARQL'

function checkPredicateValue (triple: Bindings, value: string): boolean {
  return triple.get('?p').value === value
}

function getAccessRightsDescription (document: Array<Bindings>, subject: string) {
  for (const triple of document) {
    if (triple.get('?s').value === subject) {
      if (checkPredicateValue(triple, 'http://purl.org/dc/terms/description')) {
        return triple.get('?o').value
      }
    }
  }

  return null
}

export function getTitle (tripleStore: Array<Bindings>) {
  for (const triple of tripleStore) {
    if (checkPredicateValue(triple, 'http://purl.org/dc/terms/title')) {
      return triple.get('?o')?.value
    }
  }

  return null
}

export function getIdentifier (tripleStore: Array<Bindings>) {
  for (const triple of tripleStore) {
    if (checkPredicateValue(triple, 'http://purl.org/dc/terms/identifier')) {
      return triple.get('?o')?.value
    }
  }

  return null
}

export function getDescription (tripleStore: Array<Bindings>) {
  for (const triple of tripleStore) {
    if (checkPredicateValue(triple, 'http://purl.org/dc/terms/description')) {
      return triple.get('?o')?.value
    }
  }
}

export async function getTypes (tripleStore: Array<Bindings>) {
  const types = []

  for (const triple of tripleStore) {
    if (
      triple.get('?s')?.value === getIdentifier(tripleStore) &&
      checkPredicateValue(triple, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
    ) {
      const value = triple.get('?o')

      if (value) {
        const typeURL = value.value

        types.push(typeURL)
      }
    }
  }

  return types
}

export function getCatalogs (document: Array<Bindings>) {
  const catalogs = []

  for (const triple of document) {
    if (checkPredicateValue(triple, 'http://www.w3.org/ns/ldp#contains')) {
      catalogs.push(triple.get('?o').value)
    }
  }

  return catalogs
}

export function getIsPartOf (document: Array<Bindings>) {
  for (const triple of document) {
    if (checkPredicateValue(triple, 'http://purl.org/dc/terms/isPartOf')) {
      return triple.get('?o').value
    }
  }

  return null
}

export function getAccessRights (document: Array<Bindings>) {
  for (const triple of document) {
    if (checkPredicateValue(triple, 'http://purl.org/dc/terms/accessRights')) {
      return getAccessRightsDescription(document, triple.get('?o').value)
    }
  }
}

export function getVersion (document: Array<Bindings>) {
  for (const triple of document) {
    if (checkPredicateValue(triple, 'http://purl.org/dc/terms/hasVersion')) {
      return triple.get('?o').value
    }
  }

  return null
}

// TODO
export async function getLanguage (document: Array<Bindings>) {
  for (const triple of document) {
    if (checkPredicateValue(triple, 'http://purl.org/dc/terms/language')) {
      const object = triple.get('?o').value

      // If the language is not a literal string, then we fetch the document.
      if (HTTP.isValidHttpUrl(object)) {
        const headers = new Headers()
        headers.append('Accept', 'text/turtle')

        const response = await HTTP.get(object, headers)

        //if (response.headers.get('Content-Type')?.split(';')[0].toLowerCase() === 'text/turtle') {}
      }

      return object
    }
  }

  return null
}

// TODO
export async function getLicense (document: Array<Bindings>) {
  for (const triple of document) {
    if (checkPredicateValue(triple, 'http://purl.org/dc/terms/license')) {
      const object = triple.get('?o').value

      // If the license is not a literal string, then we fetch the document.
      if (HTTP.isValidHttpUrl(object)) {
        const headers = new Headers()
        headers.append('Accept', 'text/turtle')

        const response = await HTTP.get(object, headers)

        //if (response.headers.get('Content-Type')?.split(';')[0].toLowerCase() === 'text/turtle') {}
      }

      return object
    }
  }

  return null
}

export function getMetadataIssued (document: Array<Bindings>) {
  for (const triple of document) {
    if (checkPredicateValue(triple, 'http://rdf.biosemantics.org/ontologies/fdp-o#metadataIssued')) {
      return triple.get('?o').value
    }
  }

  return null
}

export function getLabel (document: Array<Bindings>) {
  for (const triple of document) {
    if (checkPredicateValue(triple, 'http://www.w3.org/2000/01/rdf-schema#label')) {
      return triple.get('?o').value
    }
  }

  return null
}

export function isDirectContainer (document: Array<Bindings>) {
  for (const triple of document) {
    if (
      checkPredicateValue(triple, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') &&
      triple.get('?o').value === 'http://www.w3.org/ns/ldp#DirectContainer'
    ) {
      return true
    }
  }

  return false
}