<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:ss="http://semanticscience.org/resource/"
  xmlns:obo="http://purl.obolibrary.org/obo/"
  xmlns:owl="http://www.w3.org/2002/07/owl#"
  xmlns:ldp="http://www.w3.org/ns/ldp#"
  xmlns:fdpo="http://rdf.biosemantics.org/ontologies/fdp-o#"
  xmlns:foaf="http://xmlns.com/foaf/0.1/">
    <xsl:output method="html" encoding="utf-8" indent="yes"/>
    <xsl:template match="/">
      <xsl:variable name="identifier" select="//rdf:Description/dcterms:identifier" />
      <xsl:variable name="childrenNode" select="//ldp:hasMemberRelation[1]/../@rdf:about" />

      <html>
        <head>
        </head>

        <body>
          <xsl:element name="p">
            <xsl:attribute name="class">
              font-semibold text-3xl tracking-wide
            </xsl:attribute>

            <xsl:value-of select="//rdf:Description/rdfs:label" />
          </xsl:element>

          <xsl:element name="p">
            <xsl:value-of select="//rdf:Description[@rdf:about = $identifier]/dcterms:description" />
          </xsl:element>

          <br />

          <table>
            <tr>
              <td>
                <strong>accessRights</strong>
              </td>

              <td>
                <xsl:value-of select="//rdf:Description[@rdf:about= concat($identifier, '#accessRights')]/dcterms:description" />
              </td>
            </tr>

            <tr>
              <td>
                <strong>conformsTo</strong>
              </td>

              <td>
                <xsl:for-each select="//rdf:Description/dcterms:conformsTo">
                  <xsl:element name="p">
                    <xsl:call-template name="makelink">
                      <xsl:with-param name="url" select="current()/@rdf:resource"/>
                    </xsl:call-template>
                  </xsl:element>
                </xsl:for-each>
              </td>
            </tr>

            <tr>
              <td>
                <strong>hasVersion</strong>
              </td>

              <td>
                <xsl:value-of select="//rdf:Description/dcterms:hasVersion" />
              </td>
            </tr>

            <tr>
              <td>
                <strong>identifier</strong>
              </td>

              <td>
                <xsl:call-template name="makelink">
                  <xsl:with-param name="url" select="$identifier"/>
                </xsl:call-template>
              </td>
            </tr>

            <tr>
              <td>
                <strong>type</strong>
              </td>

              <td>
                <xsl:for-each select="//rdf:Description">
                  <xsl:if test="./@rdf:about = $identifier">
                    <xsl:for-each select="./rdf:type">
                      <xsl:variable name="type" select="./@rdf:resource"/>
                      <xsl:variable name="nbsp">
                        <br/>
                      </xsl:variable>
                      <xsl:value-of select="substring-after($type,'#')"/>
                      <xsl:copy-of select="$nbsp"/>
                    </xsl:for-each>
                  </xsl:if>
                </xsl:for-each>
              </td>
            </tr>

            <tr>
              <td>
                <strong>Language</strong>
              </td>

              <td>
                <xsl:variable name="language" select="//rdf:Description/dcterms:language/@rdf:resource" />

                <xsl:call-template name="substring-after-last">
                  <xsl:with-param name="input" select="$language" />
                  <xsl:with-param name="marker" select="'/'" />
                </xsl:call-template>
              </td>
            </tr>

            <tr>
              <td>
                <strong>License</strong>
              </td>

              <td>
                <xsl:variable name="license" select="//rdf:Description/dcterms:license/@rdf:resource" />

                <xsl:call-template name="makelink">
                    <xsl:with-param name="url" select="$license"/>
                </xsl:call-template>
              </td>
            </tr>

            <tr>
              <td>
                <strong>Publisher</strong>
              </td>

              <td>
                <xsl:choose>
                  <xsl:when test="//rdf:Description/dcterms:publisher/@rdf:resource">
                    <xsl:value-of select="//rdf:Description[@rdf:about= concat($identifier, '#publisher')]/foaf:name" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:variable name="nodeID" select="//rdf:Description/dcterms:publisher/@rdf:nodeID" />
                    <xsl:value-of select="//rdf:Description[@rdf:nodeID= $nodeID]/foaf:name" />
                  </xsl:otherwise>
                </xsl:choose>
              </td>
            </tr>

            <tr>
              <td>
                <strong>metadatraIssued</strong>
              </td>

              <td>
                <xsl:value-of select="//rdf:Description/fdpo:metadataIssued" />
              </td>
            </tr>
          </table>

          <br />

          <xsl:element name="p">
            <xsl:attribute name="class">
              font-semibold text-xl tracking-wide
            </xsl:attribute>

            <xsl:value-of select="//rdf:Description[@rdf:about = $childrenNode]/dcterms:title"/>
          </xsl:element>

          <xsl:for-each select="//rdf:Description[@rdf:about = $childrenNode]/ldp:contains">
            <xsl:element name="p">
              <xsl:call-template name="makelink">
                <xsl:with-param name="url" select="current()/@rdf:resource"/>
              </xsl:call-template>
            </xsl:element>
          </xsl:for-each>
        </body>
      </html>
    </xsl:template>

    <xsl:template name="makelink">
      <xsl:param name="url" />
      <xsl:element name="a">
        <xsl:attribute name="href">
            <xsl:value-of select="$url"/>
        </xsl:attribute>
        <xsl:attribute name="class">
          text-blue-700
        </xsl:attribute>
        <xsl:value-of select="$url"/>
      </xsl:element>
    </xsl:template>

    <xsl:template name="substring-after-last">
      <xsl:param name="input" />
      <xsl:param name="marker" />
      <xsl:choose>
        <xsl:when test="contains($input,$marker)">
          <xsl:call-template name="substring-after-last">
            <xsl:with-param name="input" select="substring-after($input,$marker)" />
            <xsl:with-param name="marker" select="$marker" />
          </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$input" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:template>
</xsl:stylesheet>