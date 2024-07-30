/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// Credits https://github.com/DuckySoLucky/hypixel-discord-chat-bridge/blob/f8a8a8e1e1c469127b8fcd03e6553b43f22b8250/src/Logger.js (Edited)
const customLevels = { event: 0, error: 1, other: 2, max: 3 };
import { createLogger, format, transports } from 'winston';

const timezone = () => {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
};

const eventTransport = new transports.File({ level: 'event', filename: './logs/event.log' });
const errorTransport = new transports.File({ level: 'error', filename: './logs/error.log' });
const otherTransport = new transports.File({ level: 'other', filename: './logs/other.log' });
const combinedTransport = new transports.File({ level: 'max', filename: './logs/combined.log' });

const eventLogger = createLogger({
  level: 'event',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [eventTransport, combinedTransport]
});

const errorLogger = createLogger({
  level: 'error',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [errorTransport, combinedTransport]
});
const otherLogger = createLogger({
  level: 'other',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [otherTransport, combinedTransport]
});

const logger = {
  event: (message: any) => {
    eventLogger.log('event', message);
    console.log(message);
  },
  error: (message: any) => {
    errorLogger.log('error', message);
    console.log(message);
  },
  other: (message: any) => {
    otherLogger.log('other', message);
    console.log(message);
  }
};

export const eventMessage = logger.event;
export const errorMessage = logger.error;
export const otherMessage = logger.other;
