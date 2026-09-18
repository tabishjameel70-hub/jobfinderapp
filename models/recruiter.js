const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/userapp');

const recruiterSchema = mongoose.Schema({

    title: {
        type: String
    },

    firmName: {
        type: String
    },

    jobType: {
        type: String
    },

    location: {
        type: String
    },

    category: {
        type: String
    },

    workplace: {
        type: String
    },

    salary: {
        type: Number
    },

    salaryMax: {
        type: Number
    },

    createJobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'postjobs'   // FIXED
        }
    ],
    
    company: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company'
        }
    ]

});

module.exports = mongoose.model('recruiter', recruiterSchema);