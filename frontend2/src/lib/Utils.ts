import * as HTTP from '@/lib/HTTP'

export function normalizeName (name: string): string {
  return name.includes('#') ? name.split('#')[1] : name.split('/').pop() ?? ''
}

export function getObjectValue (obj: Record<string, string>): string {
  return obj['@id'] || obj['@value']
}

export async function getGraphWithFormat (url: string, mimeType: string): Promise<any> {
  if (!url.endsWith('/')) {
    url += '/'
  }

  const headers = new Headers()
  headers.append('Accept', mimeType)

  const response = await HTTP.get(url, headers)

  return JSON.parse(await response.text())
}