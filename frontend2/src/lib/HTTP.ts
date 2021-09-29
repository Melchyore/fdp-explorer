type RequestOptions = {
  method: string,
  mode: RequestMode,
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

export async function get (URL: string, headers: Headers = new Headers()) {
  try {
    return await executeRequest('GET', URL, headers)
  } catch (e) {
    throw new Error(e)
  }
}

async function executeRequest (method: string, URL: string, headers: Headers, body: Record<string, unknown> = {}) {
  const options: RequestOptions = {
    method: method.toUpperCase(),
    mode: 'no-cors',
    headers
  }

  if (options.method !== 'GET') {
    options.body = JSON.stringify(body)
  }

  try {
    return await fetch(new Request(URL, options))
  } catch (e) {
    throw new Error(e)
  }
}
