export const SITE_NAME = 'Prometrica Academy'

export const SITE_DESCRIPTION =
  'Excellence in pharmacy education, licensing exam prep, and clinical training for pharmacists worldwide.'

/** Browser tab title: optional page segment before the site name. */
export function pageTitle(page?: string): string {
  return page ? `${page} | ${SITE_NAME}` : SITE_NAME
}

export const FAVICON_LINKS = [
  { rel: 'icon', type: 'image/x-icon',  href: '/favicon/favicon.ico' },
  { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
  { rel: 'icon', type: 'image/png', sizes: '96x96',  href: '/favicon/favicon-96x96.png' },
  { rel: 'icon', type: 'image/png', sizes: '32x32',  href: '/favicon/favicon-32x32.png' },
  { rel: 'icon', type: 'image/png', sizes: '16x16',  href: '/favicon/favicon-16x16.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-icon-180x180.png' },
  { rel: 'apple-touch-icon', sizes: '152x152', href: '/favicon/apple-icon-152x152.png' },
  { rel: 'apple-touch-icon', sizes: '144x144', href: '/favicon/apple-icon-144x144.png' },
  { rel: 'apple-touch-icon', sizes: '120x120', href: '/favicon/apple-icon-120x120.png' },
  { rel: 'apple-touch-icon', sizes: '114x114', href: '/favicon/apple-icon-114x114.png' },
  { rel: 'apple-touch-icon',                   href: '/favicon/apple-icon.png' },
  { rel: 'manifest', href: '/favicon/manifest.json' },
] as const
