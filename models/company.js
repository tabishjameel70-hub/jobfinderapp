const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/userapp');

const companySchema = mongoose.Schema({

    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    companyName: {
        type: String,
        required: true
    },

    industry: {
        type: String,
        required: true
    },

    companySize: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    website: {
        type: String
    },

    recruiterName: {
        type: String,
        required: true
    },

    position: {
        type: String,
        required: true
    },

    description: {
        type: String
    }

});

module.exports = mongoose.model('company', companySchema);