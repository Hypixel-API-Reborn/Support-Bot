const chalk = require('chalk').white;
const color = {
  log: chalk.white,
  debug: chalk.yellow,
  error: chalk.red,
  info: chalk.greenBright
};
const moment = require('moment');
class Logger {
  /**
   * @param {string} msg
   */
  log (msg) {
    this.write(msg);
  }

  /**
   * @param {string} msg
   */
  debug (msg) {
    this.write(msg, 'debug');
  }

  /**
   * @param {string} msg
   */
  info (msg) {
    this.write(msg, 'info');
  }

  /**
   * @param {string} msg
   */
  error (msg) {
    this.write(msg, 'error');
  }

  /**
   * @param {string} msg
   * @param {'log'|'info'|'error'|'debug'} type
   */
  write (msg, type = 'log') {
    const now = moment().format('h:mm:ss');
    process.stdout.write(color[type](`[${now}] | ${this.clean(msg)}\n`));
  }

  clean (msg) {
    if (typeof msg === 'string') return msg;
    const cleaned = require('util').inspect(msg, { depth: Infinity });
    return cleaned;
  }
}
module.exports = Logger;
