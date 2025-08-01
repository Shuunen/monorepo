import { logger } from './logger.utils'

async function request(method: 'DELETE' | 'GET' | 'PATCH' | 'POST', url: string, data?: Record<string, unknown>) {
  const options: RequestInit = { method }
  if (data) options.body = JSON.stringify(data)
  const response = await fetch(url, options).catch((error: unknown) => {
    logger.showError(error)
  })
  if (!response) throw new Error('no response')
  return (await response.json()) as unknown
}

export function get(url: string) {
  return request('GET', url)
}

export function setPageTitle(title: string) {
  document.title = `${title} - Stuff Finder`
}

export function clearElementsForPrint() {
  logger.info('clearing elements for print')
  const selector = ['#synology-download-notification-stack', 'synology-download-content', '[at-magnifier-wrapper]', '.shu-toast']
  const elements = Array.from(document.querySelectorAll(selector.join(',')))
  for (const element of elements) element.remove()
}
