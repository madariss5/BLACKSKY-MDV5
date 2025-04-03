/**
 * Logger Utility
 * A simple logging utility with color-coded output for different log levels
 */

const chalk = require('chalk');

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Simple logger utility with colored output
 */
const logger = {
  /**
   * Log an error message
   * @param {string} message - The error message
   */
  error: (message) => {
    console.error(chalk.red(`[ERROR] ${message}`));
  },
  
  /**
   * Log a warning message
   * @param {string} message - The warning message
   */
  warn: (message) => {
    console.warn(chalk.yellow(`[WARNING] ${message}`));
  },
  
  /**
   * Log an info message
   * @param {string} message - The info message
   */
  info: (message) => {
    console.info(chalk.blue(`[INFO] ${message}`));
  },
  
  /**
   * Log a debug message
   * @param {string} message - The debug message
   */
  debug: (message) => {
    console.debug(chalk.gray(`[DEBUG] ${message}`));
  },
  
  /**
   * Log a success message
   * @param {string} message - The success message
   */
  success: (message) => {
    console.log(chalk.green(`[SUCCESS] ${message}`));
  }
};

module.exports = logger;