/* c8 ignore start */
// oxlint-disable no-console, no-undef
const socket = new WebSocket('ws://localhost:54430')
// const socket = new WebSocket("ws://192.168.1.188:54430");

// Connection opened
socket.addEventListener('open', () => {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log('Connected to server')
  socket.send('set-progress 1')
  // socket.send("set-progress 99");
})

// Listen for messages
socket.addEventListener('message', event => {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log('Message from server:', event.data)
})

// Handle errors
socket.addEventListener('error', error => {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.error('WebSocket error:', error)
})

export const amazing = true
