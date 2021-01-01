const Hypixel = require('hypixel-api-reborn');
const hypixel = new Hypixel.Client(process.env.HYPIXEL_KEY, { cache: true });
module.exports = hypixel;
