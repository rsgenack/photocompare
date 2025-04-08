import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a unique log file for this session
const logFileName = `app-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
const logFilePath = path.join(logsDir, logFileName);

// Log levels
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

// Write to both console and file
const writeLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  
  // Write to console with appropriate colors
  switch (level) {
    case LOG_LEVELS.DEBUG:
      console.debug('\x1b[36m%s\x1b[0m', logMessage); // Cyan
      break;
    case LOG_LEVELS.INFO:
      console.info('\x1b[32m%s\x1b[0m', logMessage); // Green
      break;
    case LOG_LEVELS.WARN:
      console.warn('\x1b[33m%s\x1b[0m', logMessage); // Yellow
      break;
    case LOG_LEVELS.ERROR:
      console.error('\x1b[31m%s\x1b[0m', logMessage); // Red
      break;
  }

  // Write to file
  fs.appendFileSync(logFilePath, logMessage);
};

// Export logging functions
export const logger = {
  debug: (message, data = null) => writeLog(LOG_LEVELS.DEBUG, message, data),
  info: (message, data = null) => writeLog(LOG_LEVELS.INFO, message, data),
  warn: (message, data = null) => writeLog(LOG_LEVELS.WARN, message, data),
  error: (message, data = null) => writeLog(LOG_LEVELS.ERROR, message, data),
};

// Log file path getter
export const getLogFilePath = () => logFilePath; 