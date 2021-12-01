type RequestOptions = {
  method: string,
  //mode: RequestMode,
  headers: Headers,
  body?: string
}

export function isValidHttpUrl (str: string) {
  let url = null

  try {
    url = new URL(str)
  } catch (_) {
    return false
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export async function post (URL: string, headers: Headers = new Headers(), body: Record<string, unknown> = {}) {
  try {
    return await executeRequest('POST', URL, headers, body)
  } catch (e) {
    throw new Error(e)
  }
}

export async function get (URL: string, headers: Headers = new Headers(), timeout?: number) {
  try {
    return await executeRequest('GET', URL, headers, {}, timeout)
  } catch (e) {
    throw new Error(e)
  }
}

async function executeRequest (method: string, URL: string, headers: Headers, body: Record<string, unknown> = {}, timeout?: number) {
  const options: RequestOptions = {
    method: method.toUpperCase(),
    //mode: 'no-cors',
    headers
  }

  if (options.method !== 'GET') {
    options.body = JSON.stringify(body)
  }

  try {
    const request = new Request(URL, options)
    const response = await (timeout ? fetchWithTimeout(request, { timeout }) : fetch(request))

    return response
  } catch (e) {
    throw new Error(e)
  }
}

async function fetchWithTimeout(resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 8000 } = options
  
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  })

  clearTimeout(id)

  return response
}