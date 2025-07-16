import { state } from './state.utils'

it('state A default', () => {
  expect(state).toMatchInlineSnapshot(`
    {
      "credentials": {
        "bucketId": "",
        "collectionId": "",
        "databaseId": "",
        "wrap": "",
      },
      "display": "card",
      "items": [],
      "itemsTimestamp": 0,
      "sound": "",
      "status": "loading",
      "theme": "light",
    }
  `)
})
