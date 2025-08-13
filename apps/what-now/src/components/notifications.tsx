import { dom, emit, nbMsInSecond, on, sleep, tw } from '@shuunen/shuutils'

const notification = dom('button', tw('fixed right-6 top-6 cursor-pointer text-4xl opacity-0 transition duration-300 ease-in-out'), '🔔')

notification.addEventListener('click', () => {
  emit('ask-notification-perm')
  notification.classList.add('hidden')
})

on('suggest-notification', async () => {
  await sleep(Number(nbMsInSecond))
  notification.classList.add('opacity-80', 'animate-pulse')
})

export { notification }
