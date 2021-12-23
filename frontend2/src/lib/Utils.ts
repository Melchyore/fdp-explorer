import * as HTTP from '@/lib/HTTP'

export function normalizeName (name: string): string {
  return name.includes('#') ? name.split('#')[1] : name.split('/').pop() ?? ''
}

export async function getJSONGraph (url: string): Promise<any> {
  if (!url.endsWith('/')) {
    url += '/'
  }

  const headers = new Headers()
  headers.append('Accept', 'application/ld+json')

  const response = await HTTP.get(url, headers)

  return JSON.parse(await response.text())
}