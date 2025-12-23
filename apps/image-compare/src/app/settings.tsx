// oxlint-disable id-length
import { Paragraph, Title } from '@monorepo/components'
import { motion } from 'framer-motion'

export function Settings() {
  return (
    <motion.div animate={{ opacity: 1 }} className="bg-accent min-h-screen flex flex-col gap-4 items-center justify-center" initial={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -20 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <Title>Settings</Title>
      </motion.div>
      <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <Paragraph>Settings page is under construction.</Paragraph>
      </motion.div>
    </motion.div>
  )
}
