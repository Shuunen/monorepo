import { pickOne } from './array-pick-one.js'

/**
 * Give a random word or sentence without signification
 * @returns string like `"Bolowey Opnet"`
 */
export function randomString() {
  const strings = 'Bar Alto,Sin Seguritat,Lorem Ipsum,Ciao,Sit dolor,Por erestet,Tchu la Comida,Amet Inn,Aqualeris baked,Bouquet,Zu Amarillo,Ploject,Ruhe animals,Mah Plizure,Baacon pasty,Vinci mador,Alan Awake,Malohe Sutur,A priore sur,Quel memento,Kalitat arae'.split(',')
  return pickOne(strings)
}

/**
 * Give a random boolean
 * @returns boolean like `true`
 */
export function randomBoolean() {
  // oxlint-disable-next-line no-magic-numbers
  return Math.random() > 0.5
}

/**
 * Give an email from first and last name
 * @param first the first name
 * @param last the last name
 * @returns email like `mickael.scott@gmail.com`
 */
export function randomEmail(first: string, last: string) {
  const providers = pickOne(['gmail.com', 'yahoo.de', 'hotmail.fr', 'outlook.com', 'proton.com'])
  const isShort = randomBoolean()
  // this c8 ignore next is needed because of the randomBoolean above
  /* c8 ignore next */
  const email = `${isShort ? first[0]?.toLocaleLowerCase() : first.toLocaleLowerCase()}.${last.toLocaleLowerCase()}@${providers}`
  return email
}

/**
 * Return a random number between min & max (0 & 100 if no args)
 * @param min (optional) the return number minimum included value
 * @param max (optional) the return number maximum included value
 * @returns number like : 12
 */
export function randomNumber(min = 0, max = 100) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Give a fake person with email, first name and last name
 * @returns object like `{ email: "mickael.scott@gmail.com", firstName: "Michael", lastName: "Scott" }`
 */
export function randomPerson() {
  const first = pickOne(['Michael', 'Dwight', 'Jim', 'Pam', 'Ryan', 'Andy', 'Kevin', 'Angela', 'Oscar', 'Toby'])
  const last = pickOne(['Scott', 'Schrute', 'Halpert', 'Beesly', 'Howard', 'Bernard', 'Malone', 'Martin', 'Martinez', 'Flenderson'])
  return {
    // oxlint-disable-next-line no-magic-numbers
    age: randomNumber(18, 65),
    email: randomEmail(first, last),
    firstName: first,
    // oxlint-disable-next-line no-magic-numbers
    income: randomNumber(1000, 10_000),
    lastName: last,
  }
}
