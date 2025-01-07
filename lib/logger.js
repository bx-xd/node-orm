import logger from 'node-color-log';

/**
 * Custom logger module
 */
export const customLogger = {
  log: (message) => logger.color('blue').log(message),
  warning: (message) => logger.color('yellow').log(message),
  error: (message) => logger.color('red').log(message),
  success: (message) => logger.bgColor('green').color('black').log(message),
};
