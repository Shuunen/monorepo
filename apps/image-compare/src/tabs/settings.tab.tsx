// oxlint-disable id-length
import { AutoForm, field, Paragraph, step, Title } from '@monorepo/components'
import { objectEqual } from '@monorepo/utils'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { setDarkTheme } from '../utils/theme.utils'

const settingsSchema = step(
  z.object({
    darkTheme: field(z.boolean(), { label: 'Dark Theme' }),
  }),
)

export function Settings() {
  /* v8 ignore start */
  function onSettingsChange(updatedSettings: Record<string, unknown>) {
    if (objectEqual(state, updatedSettings)) return
    Object.assign(state, updatedSettings)
    setDarkTheme(state.darkTheme)
    logger.info(updatedSettings)
    logger.showSuccess('Settings updated successfully.')
  }
  /* v8 ignore stop */
  return (
    <motion.div animate={{ opacity: 1 }} className="bg-accent min-h-screen flex flex-col gap-4 items-center justify-center" data-testid="settings-tab" initial={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -20 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <Title>Settings</Title>
      </motion.div>
      <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <Paragraph>You can adjust your preferences here.</Paragraph>
      </motion.div>
      <div className="flex">
        <AutoForm initialData={state} onSubmit={onSettingsChange} schemas={[settingsSchema]} showButtons={false} />
      </div>
    </motion.div>
  )
}
