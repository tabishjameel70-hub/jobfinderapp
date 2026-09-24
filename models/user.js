const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/userapp');
const userSchema = mongoose.Schema({
  username: {
    type: String
  },
  email: String,
  password: String,
  passion: {
    type: String
  },
  role: {
  type: String,
  enum: ['user', 'admin', 'recruiter'],
  default: null
  },
  applications:{
    type: String,
    deafault: null,
  }
});
module.exports = mongoose.model('user', userSchema);