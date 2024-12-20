const fs = require('fs');
const moment = require('moment');
const winston = require('winston');
const WinstonDailyRotateFile = require('winston-daily-rotate-file');

const logDir = 'logs';
const { createLogger, format: { combine, prettyPrint } } = winston;

/**
 * 
 * @param {Object} error error stack
 * @param {Object} info
 */
const log = (error, functionName, info) => {
    try {
        const tsFormat = () => new Date().toLocaleTimeString();

        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

        const level = (process.env.NODE_ENV === 'development') ? 'debug' : 'info';

        const errorLogger = createLogger({
            format: combine(prettyPrint()),
            transports: [
                new winston.transports.Console({
                    timestamp: tsFormat,
                    colorize: true,
                    level: 'debug',
                }),

                new (WinstonDailyRotateFile)({
                    filename: `${logDir}/${level}-`,
                    timestamp: tsFormat,
                    datePattern: 'DD-MM-YYYY',
                    prepend: true,
                    level: level,
                    maxSize: '20m',
                    maxFiles: '31d'
                }),
            ],
        });
        errorLogger.log({
            Time: moment().format('DD MMM YYYY HH:mm:ss x'),
            level: 'error',
            error: error,
            functionName,
            info: info
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    log,
};
