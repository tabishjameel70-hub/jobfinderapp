const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({

    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'postjobs',
        required: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String
    },

    resume: {
        type: String,
        required: true
    },

    coverLetter: {
        type: String
    },

    status: {
        type: String,
        enum: ['Pending', 'Shortlisted', 'Interview', 'Accepted', 'Rejected'],
        default: 'Pending'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('application', applicationSchema);