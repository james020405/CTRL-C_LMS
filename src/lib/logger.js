/**
 * Centralized logging utility for Ctrl C Academy
 * Only outputs logs in development mode
 * Prepared for future integration with error tracking services (e.g., Sentry)
 */

const isDev = import.meta.env.DEV;

/**
 * Log levels
 */
export const LogLevel = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
};

/**
 * Log a message (only in development)
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const log = (level, message, data = null) => {
    if (!isDev) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
        case LogLevel.DEBUG:
            data ? console.log(prefix, message, data) : console.log(prefix, message);
            break;
        case LogLevel.INFO:
            data ? console.info(prefix, message, data) : console.info(prefix, message);
            break;
        case LogLevel.WARN:
            data ? console.warn(prefix, message, data) : console.warn(prefix, message);
            break;
        case LogLevel.ERROR:
            data ? console.error(prefix, message, data) : console.error(prefix, message);
            break;
        default:
            console.log(prefix, message, data);
    }
};

/**
 * Log debug message
 */
export const debug = (message, data = null) => log(LogLevel.DEBUG, message, data);

/**
 * Log info message
 */
export const info = (message, data = null) => log(LogLevel.INFO, message, data);

/**
 * Log warning message
 */
export const warn = (message, data = null) => log(LogLevel.WARN, message, data);

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error|Object} error - Error object or additional data
 */
export const error = (message, errorObj = null) => {
    log(LogLevel.ERROR, message, errorObj);

    // Hook for future error tracking service integration
    // Example: Sentry.captureException(errorObj);
    if (!isDev && errorObj instanceof Error) {
        // In production, you would send this to an error tracking service
        // Sentry.captureException(errorObj);
    }
};

/**
 * Track a user action for analytics
 * @param {string} action - Action name
 * @param {Object} properties - Action properties
 */
export const trackAction = (action, properties = {}) => {
    if (isDev) {
        console.log('[TRACK]', action, properties);
    }
    // Hook for future analytics integration
    // Example: analytics.track(action, properties);
};

/**
 * Report a handled error (not critical but worth noting)
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 */
export const reportError = (context, errorObj) => {
    error(`Error in ${context}`, errorObj);

    // In production, send to error tracking
    // if (!isDev) {
    //     Sentry.captureException(errorObj, { tags: { context } });
    // }
};

export default {
    debug,
    info,
    warn,
    error,
    trackAction,
    reportError,
    LogLevel
};
