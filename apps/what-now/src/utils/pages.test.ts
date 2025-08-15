import { CalendarIcon, CircleQuestionMarkIcon, HomeIcon, SettingsIcon } from 'lucide-react'
import { expect, it, vi } from 'vitest'
import { useActions } from './pages.utils'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock globalThis.location
Object.defineProperty(globalThis, 'location', {
  value: {
    pathname: '/',
  },
  writable: true,
})

it('useActions A should return correct actions with home page as current', () => {
  globalThis.location.pathname = '/'
  const actions = useActions()
  expect(actions).toHaveLength(4)
  expect(actions[0]).toEqual({
    disabled: true, // Current path is '/'
    handleClick: expect.any(Function),
    icon: HomeIcon,
    name: 'Tasks',
  })
  expect(actions[1]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: CalendarIcon,
    name: 'Planner',
  })
  expect(actions[2]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: SettingsIcon,
    name: 'Settings',
  })
  expect(actions[3]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: CircleQuestionMarkIcon,
    name: 'About',
  })
})

it('useActions B should return correct actions with settings page as current', () => {
  globalThis.location.pathname = '/settings'
  const actions = useActions()
  expect(actions).toHaveLength(4)
  expect(actions[0]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: HomeIcon,
    name: 'Tasks',
  })
  expect(actions[1]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: CalendarIcon,
    name: 'Planner',
  })
  expect(actions[2]).toEqual({
    disabled: true, // Current path is '/settings'
    handleClick: expect.any(Function),
    icon: SettingsIcon,
    name: 'Settings',
  })
  expect(actions[3]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: CircleQuestionMarkIcon,
    name: 'About',
  })
})

it('useActions C should return correct actions with planner page as current', () => {
  globalThis.location.pathname = '/planner'
  const actions = useActions()
  expect(actions).toHaveLength(4)
  expect(actions[0]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: HomeIcon,
    name: 'Tasks',
  })
  expect(actions[1]).toEqual({
    disabled: true, // Current path is '/planner'
    handleClick: expect.any(Function),
    icon: CalendarIcon,
    name: 'Planner',
  })
  expect(actions[2]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: SettingsIcon,
    name: 'Settings',
  })
  expect(actions[3]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: CircleQuestionMarkIcon,
    name: 'About',
  })
})

it('useActions D should return correct actions with about page as current', () => {
  globalThis.location.pathname = '/about'
  const actions = useActions()
  expect(actions).toHaveLength(4)
  expect(actions[0]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: HomeIcon,
    name: 'Tasks',
  })
  expect(actions[1]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: CalendarIcon,
    name: 'Planner',
  })
  expect(actions[2]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: SettingsIcon,
    name: 'Settings',
  })
  expect(actions[3]).toEqual({
    disabled: true, // Current path is '/about'
    handleClick: expect.any(Function),
    icon: CircleQuestionMarkIcon,
    name: 'About',
  })
})

it('useActions E should call navigate with correct path when home action is clicked', () => {
  globalThis.location.pathname = '/settings'
  mockNavigate.mockClear()
  const actions = useActions()
  const homeAction = actions[0]
  homeAction.handleClick()
  expect(mockNavigate).toHaveBeenCalledWith('/')
})

it('useActions F should call navigate with correct path when settings action is clicked', () => {
  globalThis.location.pathname = '/'
  mockNavigate.mockClear()
  const actions = useActions()
  const settingsAction = actions[2] // Settings is now at index 2
  settingsAction.handleClick()
  expect(mockNavigate).toHaveBeenCalledWith('/settings')
})

it('useActions G should call navigate with correct path when about action is clicked', () => {
  globalThis.location.pathname = '/'
  mockNavigate.mockClear()
  const actions = useActions()
  const aboutAction = actions[3] // About is now at index 3
  aboutAction.handleClick()
  expect(mockNavigate).toHaveBeenCalledWith('/about')
})

it('useActions H should call navigate with correct path when planner action is clicked', () => {
  globalThis.location.pathname = '/'
  mockNavigate.mockClear()
  const actions = useActions()
  const plannerAction = actions[1] // Planner is at index 1
  plannerAction.handleClick()
  expect(mockNavigate).toHaveBeenCalledWith('/planner')
})
