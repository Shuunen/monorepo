// oxlint-disable no-dynamic-delete, max-nested-callbacks, no-array-for-each, max-lines-per-function, no-explicit-any, no-undef, no-commonjs, no-require-imports
/** biome-ignore-all lint/suspicious/noExplicitAny: it's ok here */
/** biome-ignore-all lint/correctness/noNodejsModules: it's ok here */
import { randomBytes } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { contextBridge, ipcRenderer } from 'electron'

////////////////////////////////////////////////////////
// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugins = require('./electron-plugins')

const randomId = (length = 5) => randomBytes(length).toString('hex')

const contextApi: {
  [plugin: string]: { [functionName: string]: () => Promise<any> }
} = {}

Object.keys(plugins).forEach(pluginKey => {
  Object.keys(plugins[pluginKey])
    .filter(className => className !== 'default')
    .forEach(classKey => {
      const functionList = Object.getOwnPropertyNames(plugins[pluginKey][classKey].prototype).filter(value => value !== 'constructor')
      if (!contextApi[classKey]) contextApi[classKey] = {}
      functionList.forEach(functionName => {
        if (!contextApi[classKey][functionName]) contextApi[classKey][functionName] = (...args) => ipcRenderer.invoke(`${classKey}-${functionName}`, ...args)
      })
      // Events
      if (plugins[pluginKey][classKey].prototype instanceof EventEmitter) {
        const listeners: { [key: string]: { type: string; listener: (...args: any[]) => void } } = {}
        const listenersOfTypeExist = type => Boolean(Object.values(listeners).some(listenerObj => listenerObj.type === type))
        Object.assign(contextApi[classKey], {
          addListener(type: string, callback: (...args) => void) {
            const id = randomId()
            // Deduplicate events
            if (!listenersOfTypeExist(type)) ipcRenderer.send(`event-add-${classKey}`, type)
            // oxlint-disable-next-line id-length
            const eventHandler = (_, ...args) => callback(...args)
            ipcRenderer.addListener(`event-${classKey}-${type}`, eventHandler)
            listeners[id] = { listener: eventHandler, type }
            return id
          },
          removeAllListeners(type: string) {
            Object.entries(listeners).forEach(([id, listenerObj]) => {
              if (!type || listenerObj.type === type) {
                ipcRenderer.removeListener(`event-${classKey}-${listenerObj.type}`, listenerObj.listener)
                ipcRenderer.send(`event-remove-${classKey}-${listenerObj.type}`)
                delete listeners[id]
              }
            })
          },
          removeListener(id: string) {
            if (!listeners[id]) throw new Error('Invalid id')
            const { type, listener } = listeners[id]
            ipcRenderer.removeListener(`event-${classKey}-${type}`, listener)
            delete listeners[id]
            if (!listenersOfTypeExist(type)) ipcRenderer.send(`event-remove-${classKey}-${type}`)
          },
        })
      }
    })
})

contextBridge.exposeInMainWorld('CapacitorCustomPlatform', {
  name: 'electron',
  plugins: contextApi,
})
////////////////////////////////////////////////////////
