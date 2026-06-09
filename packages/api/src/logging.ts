import { envString, loadRootEnv } from '@bao/env'
import pino from 'pino'

loadRootEnv(__dirname)

const logger = pino({
  level: envString('LOG_LEVEL', 'info'),
})

export default logger
