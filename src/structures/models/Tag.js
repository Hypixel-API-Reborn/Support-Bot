const { Schema, model } = require('mongoose');
const Tag = new Schema({
  title: String,
  description: String
});
module.exports = model('tag', Tag);
