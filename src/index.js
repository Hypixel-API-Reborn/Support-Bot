const Client = require('./structures/client/Client');
const client = new Client();
client.run();
process.on('unhandledRejection', (error) => {
  client.logger.error(`Rejection: ${error}${error && error.stack ? `\n${error.stack}` : ''}`);
});
process.on('uncaughtException', (error) => {
  client.logger.error(`Uncaught exception: ${error}${error.stack ? `\n${error.stack}` : ''}`);
  process.exit(1);
});
process.on('warning', (error) => {
  client.logger.debug(`${error}${error.stack ? `\n${error.stack}` : ''}`);
});
