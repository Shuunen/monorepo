import { rangedScore } from './number-ranged-score.js'

const priceRules = { isHigherBetter: false, scoreMax: 2, scoreMin: 0, valueMax: 10_000, valueMin: 5000 }
it('rangedScore price A', () => {
  expect(rangedScore(priceRules, 2000)).toBe(2)
})
it('rangedScore price B', () => {
  expect(rangedScore(priceRules, 5000)).toBe(2)
})
it('rangedScore price C', () => {
  expect(rangedScore(priceRules, 6000)).toBe(1.6)
})
it('rangedScore price D', () => {
  expect(rangedScore(priceRules, 7500)).toBe(1)
})
it('rangedScore price E', () => {
  expect(rangedScore(priceRules, 8000)).toBe(0.8)
})
it('rangedScore price F', () => {
  expect(rangedScore(priceRules, 10_000)).toBe(0)
})
it('rangedScore price G', () => {
  expect(rangedScore(priceRules, 11_000)).toBe(0)
})

const batteryRules = { isHigherBetter: true, scoreMax: 100, scoreMin: 0, valueMax: 10, valueMin: 0 }
it('rangedScore battery A', () => {
  expect(rangedScore(batteryRules, 0)).toBe(0)
})
it('rangedScore battery B', () => {
  expect(rangedScore(batteryRules, 1)).toBe(10)
})
it('rangedScore battery C', () => {
  expect(rangedScore(batteryRules, 2)).toBe(20)
})
it('rangedScore battery D', () => {
  expect(rangedScore(batteryRules, 3)).toBe(30)
})
it('rangedScore battery E', () => {
  expect(rangedScore(batteryRules, 4)).toBe(40)
})
it('rangedScore battery F', () => {
  expect(rangedScore(batteryRules, 5)).toBe(50)
})
it('rangedScore battery G', () => {
  expect(rangedScore(batteryRules, 6)).toBe(60)
})
it('rangedScore battery H', () => {
  expect(rangedScore(batteryRules, 7)).toBe(70)
})
it('rangedScore battery I', () => {
  expect(rangedScore(batteryRules, 8)).toBe(80)
})
it('rangedScore battery J', () => {
  expect(rangedScore(batteryRules, 9)).toBe(90)
})
it('rangedScore battery K', () => {
  expect(rangedScore(batteryRules, 10)).toBe(100)
})
it('rangedScore battery L', () => {
  expect(rangedScore(batteryRules, 11)).toBe(100)
})
it('rangedScore battery M', () => {
  expect(rangedScore(batteryRules, -5)).toBe(0)
})

const weightRules = { isHigherBetter: false, scoreMax: 100, scoreMin: 0, valueMax: 5, valueMin: -5 }
it('rangedScore weight A', () => {
  expect(rangedScore(weightRules, -5)).toBe(100)
})
it('rangedScore weight B', () => {
  expect(rangedScore(weightRules, -4)).toBe(90)
})
it('rangedScore weight C', () => {
  expect(rangedScore(weightRules, 0)).toBe(50)
})
it('rangedScore weight D', () => {
  expect(rangedScore(weightRules, 4)).toBe(10)
})
