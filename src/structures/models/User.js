const { Schema, model } = require('mongoose');
const User = new Schema({
  id: String,
  uuid: String
});
module.exports = model('user', User);
