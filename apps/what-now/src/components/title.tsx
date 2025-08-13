import { h1, tw } from '@shuunen/shuutils'

const title = h1(tw('app-title -ml-2 text-5xl text-blue-300 sm:text-7xl'), 'What now')
title.title = '__unique-mark__'

export { title }
