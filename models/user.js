const mongoose = require('mongoose');
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
  profileImage: {
    type: String,
  },
  applications: {
    type: String,
    deafault: null,
  },
  saveJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'postjobs'
    }
  ]
});
module.exports = mongoose.model('user', userSchema);