export const SITE_NAME = 'Prometrica Academy'

export const SITE_DESCRIPTION =
  'Excellence in pharmacy education, licensing exam prep, and clinical training for pharmacists worldwide.'

/** Browser tab title: optional page segment before the site name. */
export function pageTitle(page?: string): string {
  return page ? `${page} | ${SITE_NAME}` : SITE_NAME
}

export const FAVICON_LINKS = [
  { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
  { rel: 'apple-touch-icon', href: '/logo.png' },
] as const
