const LOCAL_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

function normalizeIp(ip: string) {
  const trimmed = ip.trim().replace(/^"|"$/g, '')

  if (trimmed.startsWith('[')) {
    return trimmed.slice(1, trimmed.indexOf(']'))
  }

  const ipv4WithPort = trimmed.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/)

  return ipv4WithPort?.[1] ?? trimmed
}

function getClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0]
  const realIp = requestHeaders.get('x-real-ip')
  const forwarded = requestHeaders.get('forwarded')?.match(/(?:^|;)\s*for=([^;]+)/i)?.[1]

  return [forwardedFor, realIp, forwarded].find(Boolean)
}

export function isLocalhostRequest(requestHeaders: Headers) {
  const clientIp = getClientIp(requestHeaders)

  return clientIp ? LOCAL_IPS.has(normalizeIp(clientIp)) : false
}
