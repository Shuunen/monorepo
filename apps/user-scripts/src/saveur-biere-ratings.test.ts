import { expect, it } from 'vitest'
import { cleanTitle } from './saveur-biere-ratings.user'

it('sb clean title A', () => {
  expect(cleanTitle('Bière de garde')).toBe('biere de garde')
})
it('sb clean title B', () => {
  expect(cleanTitle('Bière de garde (Bière de garde) 2')).toBe('biere de garde 2')
})
it('sb clean title C', () => {
  expect(cleanTitle('Bière de garde 75cl !')).toBe('biere de garde')
})
it('sb clean title D', () => {
  expect(cleanTitle('Bière de garde 75cl ! (Bière de garde) pack de 2 bières')).toBe('biere de garde')
})
it('sb clean title E', () => {
  expect(cleanTitle('Pack Brewdog Elvis Juice - Pack de 12 bières')).toBe('brewdog elvis juice')
})
it('sb clean title F', () => {
  expect(cleanTitle('Brewdog Elvis Juice - Can')).toBe('brewdog elvis juice')
})
it('sb clean title G', () => {
  expect(cleanTitle('Fût 6L Brewdog Punk IPA')).toBe('brewdog punk ipa')
})
it('sb clean title H', () => {
  expect(cleanTitle('Pack 12 Tripel Karmeliet')).toBe('tripel karmeliet')
})
it('sb clean title I', () => {
  expect(cleanTitle('Pack Tripel Karmeliet - 12 bières et 2 verres')).toBe('tripel karmeliet')
})
it('sb clean title J', () => {
  expect(cleanTitle('Bud 25cl')).toBe('bud')
})
it('sb clean title K', () => {
  expect(cleanTitle('Tiny Rebel Cwtch - Can')).toBe('tiny rebel cwtch')
})
it('sb clean title L', () => {
  expect(cleanTitle('Basqueland Imparable IPA - Can')).toBe('basqueland imparable ipa')
})
