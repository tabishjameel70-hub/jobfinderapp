const mongoose = require('mongoose');
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
        type: String
    },
    website: {
        type: String
    },

    recruiterName: {
        type: String,
        required: true
    },
    salary: {
        type: Number
    },
    salaryMax: {
        type: Number
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