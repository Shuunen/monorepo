import { CircleQuestionMarkIcon, HomeIcon, SettingsIcon } from 'lucide-react'
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
  expect(actions).toHaveLength(3)
  expect(actions[0]).toEqual({
    disabled: true, // Current path is '/'
    handleClick: expect.any(Function),
    icon: HomeIcon,
    name: 'Tasks',
  })
  expect(actions[1]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: SettingsIcon,
    name: 'Settings',
  })
  expect(actions[2]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: CircleQuestionMarkIcon,
    name: 'About',
  })
})

it('useActions B should return correct actions with settings page as current', () => {
  globalThis.location.pathname = '/settings'
  const actions = useActions()
  expect(actions).toHaveLength(3)
  expect(actions[0]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: HomeIcon,
    name: 'Tasks',
  })
  expect(actions[1]).toEqual({
    disabled: true, // Current path is '/settings'
    handleClick: expect.any(Function),
    icon: SettingsIcon,
    name: 'Settings',
  })
  expect(actions[2]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: CircleQuestionMarkIcon,
    name: 'About',
  })
})

it('useActions C should return correct actions with about page as current', () => {
  globalThis.location.pathname = '/about'
  const actions = useActions()
  expect(actions).toHaveLength(3)
  expect(actions[0]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: HomeIcon,
    name: 'Tasks',
  })
  expect(actions[1]).toEqual({
    disabled: false,
    handleClick: expect.any(Function),
    icon: SettingsIcon,
    name: 'Settings',
  })
  expect(actions[2]).toEqual({
    disabled: true, // Current path is '/about'
    handleClick: expect.any(Function),
    icon: CircleQuestionMarkIcon,
    name: 'About',
  })
})

it('useActions D should call navigate with correct path when home action is clicked', () => {
  globalThis.location.pathname = '/settings'
  mockNavigate.mockClear()
  const actions = useActions()
  const homeAction = actions[0]
  homeAction.handleClick()
  expect(mockNavigate).toHaveBeenCalledWith('/')
})

it('useActions E should call navigate with correct path when settings action is clicked', () => {
  globalThis.location.pathname = '/'
  mockNavigate.mockClear()
  const actions = useActions()
  const settingsAction = actions[1]
  settingsAction.handleClick()
  expect(mockNavigate).toHaveBeenCalledWith('/settings')
})

it('useActions F should call navigate with correct path when about action is clicked', () => {
  globalThis.location.pathname = '/'
  mockNavigate.mockClear()
  const actions = useActions()
  const aboutAction = actions[2]
  aboutAction.handleClick()
  expect(mockNavigate).toHaveBeenCalledWith('/about')
})
