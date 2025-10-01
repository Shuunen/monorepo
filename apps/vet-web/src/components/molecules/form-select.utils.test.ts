/** biome-ignore-all lint/style/useNamingConvention: it's ok here */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CodeVersion, CodeVersionLabel } from '../../utils/cvl.types'
import type { Option } from '../../utils/form.types'
import { logger } from '../../utils/logger.utils'
import { getOptionValue, handleSelect, isEqual, isOptionSelected } from './form-select.utils'

describe('form-select.utils', () => {
  beforeAll(() => {
    logger.disable()
  })

  afterAll(() => {
    logger.enable()
  })

  describe('isEqual', () => {
    it('should return true for equal string values', () => {
      expect(isEqual('test', 'test')).toBe(true)
    })

    it('should return false for different string values', () => {
      expect(isEqual('test1', 'test2')).toBe(false)
    })

    it('should return true for equal CodeVersion objects', () => {
      const codeVersion1: CodeVersion = { Code: 'TEST', Version: '1.0' }
      const codeVersion2: CodeVersion = { Code: 'TEST', Version: '1.0' }
      expect(isEqual(codeVersion1, codeVersion2)).toBe(true)
    })

    it('should return false for different CodeVersion objects', () => {
      const codeVersion1: CodeVersion = { Code: 'TEST', Version: '1.0' }
      const codeVersion2: CodeVersion = { Code: 'TEST', Version: '2.0' }
      expect(isEqual(codeVersion1, codeVersion2)).toBe(false)
    })

    it('should return false for different types', () => {
      const codeVersion: CodeVersion = { Code: 'TEST', Version: '1.0' }
      expect(isEqual(codeVersion, 'test')).toBe(false)
    })
  })

  describe('getOptionValue', () => {
    it('should return value from Option type', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      expect(getOptionValue(option)).toBe('test-value')
    })

    it('should return CodeVersion from CodeVersionLabel type', () => {
      const codeVersionLabel: CodeVersionLabel = { Code: 'TEST', label: 'Test', Version: '1.0' }
      expect(getOptionValue(codeVersionLabel)).toEqual({ Code: 'TEST', Version: '1.0' })
    })
  })

  describe('handleSelect', () => {
    const mockSetValue = vi.fn()
    const mockForm = { setValue: mockSetValue }

    beforeEach(() => {
      mockSetValue.mockClear()
    })

    it('should handle single select', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      handleSelect({
        fieldValue: 'old-value',
        form: mockForm,
        name: 'test-field',
        option,
      })

      expect(mockSetValue).toHaveBeenCalledWith('test-field', 'test-value')
    })

    it('should handle multiple select - adding value', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      handleSelect({
        fieldValue: ['existing-value'],
        form: mockForm,
        multiple: true,
        name: 'test-field',
        option,
      })

      expect(mockSetValue).toHaveBeenCalledWith('test-field', ['existing-value', 'test-value'])
    })

    it('should handle multiple select - removing value', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      handleSelect({
        fieldValue: ['existing-value', 'test-value'],
        form: mockForm,
        multiple: true,
        name: 'test-field',
        option,
      })

      expect(mockSetValue).toHaveBeenCalledWith('test-field', ['existing-value'])
    })

    it('should handle single select with CodeVersion value', () => {
      const codeVersionLabel: CodeVersionLabel = { Code: 'TEST', label: 'Test', Version: '1.0' }
      handleSelect({
        fieldValue: { Code: 'OLD', Version: '1.0' },
        form: mockForm,
        name: 'test-field',
        option: codeVersionLabel,
      })

      expect(mockSetValue).toHaveBeenCalledWith('test-field', { Code: 'TEST', Version: '1.0' })
    })

    it('should handle multiple select with CodeVersion values', () => {
      const codeVersionLabel: CodeVersionLabel = { Code: 'TEST', label: 'Test', Version: '1.0' }
      const existingValue: CodeVersion = { Code: 'EXISTING', Version: '1.0' }
      handleSelect({
        fieldValue: [existingValue],
        form: mockForm,
        multiple: true,
        name: 'test-field',
        option: codeVersionLabel,
      })

      expect(mockSetValue).toHaveBeenCalledWith('test-field', [existingValue, { Code: 'TEST', Version: '1.0' }])
    })

    it('should handle multiple select with empty fieldValue', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      handleSelect({
        fieldValue: '',
        form: mockForm,
        multiple: true,
        name: 'test-field',
        option,
      })

      expect(mockSetValue).toHaveBeenCalledWith('test-field', ['test-value'])
    })

    it('should handle multiple select with non-array fieldValue', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      handleSelect({
        fieldValue: 'existing-value',
        form: mockForm,
        multiple: true,
        name: 'test-field',
        option,
      })

      expect(mockSetValue).toHaveBeenCalledWith('test-field', ['test-value'])
    })

    it('should return true for single select', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      const result = handleSelect({
        fieldValue: 'old-value',
        form: mockForm,
        name: 'test-field',
        option,
      })

      expect(result).toBe(true)
    })

    it('should return false for multiple select', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      const result = handleSelect({
        fieldValue: ['existing-value'],
        form: mockForm,
        multiple: true,
        name: 'test-field',
        option,
      })

      expect(result).toBe(false)
    })
  })

  describe('isOptionSelected', () => {
    it('should return false when no value is provided', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      expect(isOptionSelected(option)).toBe(false)
    })

    it('should return true for matching single value', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      expect(isOptionSelected(option, 'test-value')).toBe(true)
    })

    it('should return false for non-matching single value', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      expect(isOptionSelected(option, 'other-value')).toBe(false)
    })

    it('should return true when value exists in array', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      expect(isOptionSelected(option, ['value1', 'test-value', 'value2'])).toBe(true)
    })

    it('should return false when value does not exist in array', () => {
      const option: Option = { label: 'Test', value: 'test-value' }
      expect(isOptionSelected(option, ['value1', 'value2'])).toBe(false)
    })

    it('should work with CodeVersion values', () => {
      const codeVersionLabel: CodeVersionLabel = { Code: 'TEST', label: 'Test', Version: '1.0' }
      const codeVersion: CodeVersion = { Code: 'TEST', Version: '1.0' }
      expect(isOptionSelected(codeVersionLabel, codeVersion)).toBe(true)
    })
  })
})
