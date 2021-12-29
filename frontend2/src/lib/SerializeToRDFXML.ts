import * as RDF from "@rdfjs/types"

const XMLWriter = require('xml-writer')

export default abstract class SerializeToRDFXML {
  public static serialize (graph: Array<RDF.Quad>): string {
    const writer = new XMLWriter()

    writer.startDocument(1.0, 'UTF-8')

    writer.startPI('xml-stylesheet')
    writer.writeAttribute('type', 'text/xsl')
    writer.writeAttribute('href', 'http://localhost:8080/Resource.xsl')
    writer.endPI()

    writer.startElementNS('rdf', 'RDF')
    writer.startAttributeNS('xmlns', 'rdf')
    writer.text('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    writer.endAttribute()

    const separateNSandLocalName = (uri: string) => {
      let index = uri.lastIndexOf('#')

      if (index <= 0) {
        index = uri.lastIndexOf('/')
      }

      const namespace = uri.substring(0, index + 1)

      return {
        namespace,
        localname: uri.substring(index + 1, uri.length),
        prefix: namespace === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' ? 'rdf' : ''
      }
    }

    graph.forEach(function (triple: RDF.Quad) {
      writer.startElementNS('rdf', 'Description')

      if (triple.subject.termType === 'BlankNode') {
        writer.startAttributeNS('rdf', 'nodeID')
      } else if (triple.subject.termType === 'NamedNode') {
        writer.startAttributeNS('rdf', 'about')
      }

      writer.text(triple.subject.value)
      writer.endAttribute()

      const parts = separateNSandLocalName(triple.predicate.value)
      const prefix = parts.prefix
      const localname = parts.localname

      writer.startElement(prefix ? `${prefix}:${localname}` : localname)
      writer.startAttribute('xmlns')
      writer.text(parts.namespace)
      writer.endAttribute()

      if (triple.object.termType === 'BlankNode') {
        writer.startAttributeNS('rdf', 'nodeID')
      } else if (triple.object.termType === 'NamedNode') {
        writer.startAttributeNS('rdf', 'resource')
      } else {
        // @ts-ignore
        if (triple.object.language) {
          writer.startAttributeNS('xml', 'lang')
          // @ts-ignore
          writer.text(triple.object.language)
          writer.endAttribute()
        } else if (
          // @ts-ignore
          triple.object.datatype &&
          // @ts-ignore
          triple.object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string'
        ) {
          writer.startAttributeNS('rdf', 'datatype')
          // @ts-ignore
          writer.text(triple.object.datatype.value)
          writer.endAttribute()
        }
      }
      writer.text(triple.object.value.toString())
      writer.endElement()

      writer.endElement()
    })

    writer.endDocument()

    return writer.toString()
  }
}