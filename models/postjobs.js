const mongoose = require('mongoose');

const postJobSchema = mongoose.Schema({
   recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recruiter'
    },

    title: {
        type: String,
    },

    location: {
        type: String
    },

    jobType: {
        type: String
    },

    workplace: {
        type: String
    },

    category: {
        type: String
    },

    salary: {
        type: Number
    },

    salaryMax: {
        type: Number
    },

    description: {
        type: String
    },

    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        required: true
    },
    Jobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'recruiter'
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('postjobs', postJobSchema);