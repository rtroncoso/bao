declare module 'pino' {
  interface Logger {
    info: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
    debug: (...args: unknown[]) => void
    warn: (...args: unknown[]) => void
  }

  interface PinoOptions {
    level?: string
  }

  function pino(options?: PinoOptions): Logger

  export default pino
}
