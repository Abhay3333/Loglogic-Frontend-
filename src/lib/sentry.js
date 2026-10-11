import * as Sentry from '@sentry/react'

const scrubEvent = (event) => {
  if (!event) return event
  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.Authorization
      delete event.request.headers['x-api-key']
    }
    delete event.request.query_string
    if (typeof event.request.url === 'string') {
      event.request.url = event.request.url.replace(/token=[^&\s]+/gi, 'token=[redacted]')
    }
  }
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.filter((crumb) => {
      const url = crumb?.data?.url || crumb?.data?.to || crumb?.message || ''
      return !String(url).includes('token=')
    })
  }
  return event
}

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return
  Sentry.init({
    dsn,
    release: import.meta.env.VITE_GIT_SHA || undefined,
    sendDefaultPii: false,
    beforeSend: scrubEvent
  })
}
