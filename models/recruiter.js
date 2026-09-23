const mongoose = require('mongoose');

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
            ref: 'postjobs'
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