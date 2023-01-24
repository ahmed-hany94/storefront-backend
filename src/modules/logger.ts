import { createLogger, transports, format } from 'winston';
import { LOG_DIR } from './constants';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.File({
      filename: `${LOG_DIR}/error.log`,
      level: 'error'
    }),
    new transports.File({ filename: `${LOG_DIR}/combined.log` })
  ]
});

export { logger };
