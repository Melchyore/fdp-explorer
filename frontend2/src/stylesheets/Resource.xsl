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
  xmlns:fdpo="http://rdf.biosemantics.org/ontologies/fdp-o#"
  xmlns:foaf="http://xmlns.com/foaf/0.1/">
    <xsl:output method="html" encoding="utf-8" indent="yes"/>
    <xsl:template match="/">
      <xsl:variable name="identifier" select="//rdf:Description/dcterms:identifier" />

      <html>
        <head>
          <style type="text/css">
            body {font-family: Verdana,Arial,Helvetica, sans-serif; font-size: 11px; }
            table {vertical-align: top;}
            tr { vertical-align: top;}
            td { vertical-align: top; font-family: Verdana,Arial,Helvetica, sans-serif; font-size: 11px; }
            .header { text-align:right; text-decoration: ; font-weight:bold; color:rgb(0,0,0); }
          </style>
        </head>

        <body>
          <xsl:element name="p">
            <xsl:attribute name="class">
              text-xl
            </xsl:attribute>

            <xsl:value-of select="//rdf:Description/rdfs:label" />
          </xsl:element>

          <xsl:element name="p">
            <xsl:value-of select="//rdf:Description/dcterms:description" />
          </xsl:element>

          <table>
            <tr>
              <td>
                accessRights
              </td>

              <td>
                <xsl:value-of select="//rdf:Description[@rdf:about= concat($identifier, '#accessRights')]/dcterms:description" />
              </td>
            </tr>

            <tr>
              <td>
                conformsTo
              </td>

              <td>
                <xsl:call-template name="makelink">
                  <xsl:with-param name="url" select="//rdf:Description/dcterms:conformsTo/@rdf:resource"/>
                </xsl:call-template>
              </td>
            </tr>

            <tr>
              <td>
                hasVersion
              </td>

              <td>
                <xsl:value-of select="//rdf:Description/dcterms:hasVersion" />
              </td>
            </tr>

            <tr>
              <td>
                identifier
              </td>

              <td>
                <xsl:call-template name="makelink">
                  <xsl:with-param name="url" select="$identifier"/>
                </xsl:call-template>
              </td>
            </tr>

            <tr>
              <td>
                type
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
                Language
              </td>

              <td>
                <xsl:variable name="language" select="//rdf:Description/dcterms:language/@rdf:resource" />
                <!--<xsl:value-of select="tokenize($language,'/')[last()]" />-->

                <xsl:call-template name="substring-after-last">
                  <xsl:with-param name="input" select="$language" />
                  <xsl:with-param name="marker" select="'/'" />
                </xsl:call-template>
              </td>
            </tr>

            <tr>
              <td>
                License
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
                Publisher
              </td>

              <td>
                <!--<xsl:value-of select="//rdf:Description[@rdf:about= concat($identifier, '#publisher')]/foaf:name" />-->

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
                metadatraIssued
              </td>

              <td>
                <xsl:value-of select="//rdf:Description/fdpo:metadataIssued" />
              </td>
            </tr>
          </table>
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