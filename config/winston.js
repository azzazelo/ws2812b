import appRoot from 'app-root-path'
import { createLogger, format, transports as _transports } from 'winston'

// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: 'debug',
    format: format.combine(format.colorize(), format.simple()),
    handleExceptions: true,
    json: false
  }
}

const logger = createLogger({
  // format: format.json(),
  transports: [
    new _transports.File(options.file),
    new _transports.Console(options.console)
  ],
  exitOnError: false
})

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: (message, encoding) => {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message)
  }
}

export default logger
