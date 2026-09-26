const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/user');
const postjobsModel = require('./models/postjobs');
const messageModel = require('./models/message');
const recruiterModel = require('./models/recruiter');
const ApplyModel = require('./models/apply');
const companyModel = require('./models/company');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('public')));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');
const multer = require('multer');
app.set('views', path.join('views'));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const recruiter = require('./models/recruiter');
const { asyncWrapProviders } = require('async_hooks');
const user = require('./models/user');
const JWT = '123erwvdghlkyrtadeg##########jfrge478945645';
const port = 3000;
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, 'public/uploads/resumes');
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }

});

const upload = multer({
    storage: storage
});
app.get('/', isLoggined, onlyUser, async (req, res) => {
    try {

        const user = await userModel.findOne({
            email: req.user.email
        });

        // Get all jobs
        const jobs = await postjobsModel
            .find()
            .populate('recruiter')
            .populate('company')
            .sort({ createdAt: -1 });

        // If recruiter, send them to recruiter dashboard
        if (req.user.role === 'recruiter') {
            return res.redirect('/recruiter-home');
        }

        // Get applications submitted by THIS user
        const applications = await ApplyModel.find({
            applicant: req.user._id
        })
            .populate('job')
            .populate('applicant');

        res.render('home', {
            user,
            jobs,
            applications
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong loading the homepage");
    }
})
app.get('/candidates', isLoggined, async (req, res) => {
    const candidates = await userModel.find({
        role: 'user'
    });
    console.log(candidates);
    res.render('candidates', { candidates });
});
app.get('/candidates/:id', async (req, res) => {
    try {
        // 1. Grab the ID from the URL parameters using req.params
        const candidate = await userModel.findOne({ _id: req.params.id });

        if (!candidate) {
            return res.status(404).send("Candidate not found");
        }

        // 2. Pass the template name and the candidate data to res.render()
        res.render('candidateProfile', { candidate: candidate });

    } catch (error) {
        res.status(500).send("Server Error");
    }
})
app.get('/user/profile', isLoggined, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    console.log(user);
    res.render('candidate-profile', { user })
})
app.get('/signup', async (req, res) => {
    res.render('signup');
})
app.get("/recruiter-home", isLoggined, onlyRecruiter, async (req, res) => {
    try {

        // Get this recruiter's jobs
        const jobs = await postjobsModel
            .find({ recruiter: req.user._id })
            .populate("recruiter")
            .populate("company")
            .sort({ createdAt: -1 });


        // Get recruiter's company information
        const recruiter = await companyModel.findOne({
            recruiter: req.user._id
        });


        // Take only the IDs of this recruiter's jobs
        const jobIds = jobs.map(job => job._id);


        // Find ALL applications submitted to those jobs
        const applications = await ApplyModel.find({
            job: { $in: jobIds }
        })
            .populate("job")
            .populate("applicant");
        const candidates = await userModel.find({
            role: 'user'
        });

        // Send everything to recruiter.ejs
        res.render("recruiter", {
            jobs,
            recruiter,
            applications,
            candidates
        });

    } catch (error) {

        console.error("Recruiter home error:", error);
        res.status(500).send("Failed to load recruiter dashboard");

    }
});
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async (err, hash) => {
            const createUser = await userModel.create({
                username,
                email,
                password: hash,
                passion: '' // explicitly set it empty on creation
            });
            const token = jwt.sign({ email }, JWT);
            res.cookie('token', token);
            // Redirect immediately to choose-passion instead of home
            res.redirect('/role');
        });
    });
});
app.get('/choose-passion', isLoggined, async (req, res) => {
    res.render('passion')
})
app.post('/passions', isLoggined, async (req, res) => {
    const { passion } = req.body;
    // Update the existing user, DO NOT create a new one
    const updatePassion = await userModel.findOneAndUpdate(
        { email: req.user.email },
        { passion: passion },
        { new: true } // Returns the updated document
    );
    console.log(updatePassion)
    res.redirect('/');
});
app.get('/role', isLoggined, (req, res) => {
    res.render('role')
})
app.post('/create', isLoggined, async (req, res) => {

    const { role } = req.body;

    const updateRole = await userModel.findOneAndUpdate(
        { email: req.user.email },
        { role: role },
        { new: true }
    );

    console.log(updateRole);

    if (role === 'user') {
        res.redirect('/choose-passion');
    } else {
        res.redirect('/company-setup');
    }
});
app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email });

    console.log(user);

    if (!user) {
        return res.redirect('/login');
    }

    bcrypt.compare(password, user.password, function (err, result) {

        if (err) {
            console.log('something went wrong', err);
            return res.redirect('/login');
        }

        if (result) {

            const token = jwt.sign(
                { email: user.email },
                JWT
            );

            res.cookie('token', token);

            // Check user's role
            if (user.role === 'recruiter') {
                return res.redirect('/recruiter-home');
            }

            if (user.role === 'user') {
                return res.redirect('/choose-passion');
            }

            // If no role has been selected yet
            return res.redirect('/role');

        } else {

            return res.redirect('/login');

        }

    });

});
app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.redirect('/login');
})
app.get('/post-job', isLoggined, async (req, res) => {
    const recruiter = await companyModel.findOne({ recruiter: req.user._id });
    res.render('postjobs', { recruiter });
})
app.post('/post-job', isLoggined, async (req, res) => {

    try {

        const {
            title,
            jobType,
            location,
            category,
            workplace,
            salary,
            salaryMax,
            description,
            requirements
        } = req.body;


        // Find logged-in recruiter's company
        const company = await companyModel.findOne({
            recruiter: req.user._id
        });

        if (!company) {
            return res.status(404).send("Company profile not found.");
        }
        // Create job
        const createPost = await postjobsModel.create({
            // Company name comes directly from company model
            firmName: company.companyName,

            title,

            jobType,

            location,

            category,

            workplace,

            salary: Number(salary),

            salaryMax: Number(salaryMax),

            description,

            requirements,

            recruiter: req.user._id,

            company: company._id

        });
        console.log(createPost);
        res.redirect('/recruiter-home');

    } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).send("Error posting job.");
    }

});
app.get('/jobDetails', async (req, res) => {
    try {
        //  Added "await" here to get the actual array
        const jobs = await postjobsModel.find().populate('recruiter').populate('company').sort({ createdAt: -1 });

        res.render('jobDetails', { jobs });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to load the feed");
    }
})
app.get('/company-setup', (req, res) => {
    res.render('company-setup')
})
app.post('/company-setup', isLoggined, async (req, res) => {
    try {
        const { companyName, industry, companySize, location, website, recruiterName, position, description } = req.body;

        const createCompany = await companyModel.create({
            companyName,
            industry,
            companySize,
            location,
            website,
            recruiterName,
            position,
            description,
            recruiter: req.user._id, // Now safely contains the logged-in user's ObjectId
        });

        console.log(createCompany);
        res.redirect('/recruiter-home');
    } catch (error) {
        console.error("Error creating company:", error);
        res.status(500).send("Error setting up company profile.");
    }
});
app.get('/profile', isLoggined, async (req, res) => {
    const recruiter = await companyModel.findOne({ recruiter: req.user._id });
    res.render('recruiter-profile', { recruiter });
})
app.get('/jobs', isLoggined, async (req, res) => {

    const jobs = await postjobsModel
        .find()
        .populate('company')
        .sort({ createdAt: -1 });

    console.log(jobs);

    res.render('jobs', { jobs });

});
app.get('/jobs/:id', isLoggined, async (req, res) => {

    const jobs = await postjobsModel
        .findById(req.params.id)
        .populate('company');

    console.log(jobs);

    res.render('job-details', { jobs });

});
app.get('/myjobs', isLoggined, async (req, res) => {
    const jobs = await postjobsModel.find({ recruiter: req.user._id }).populate('recruiter').populate('company').sort({ createdAt: -1 });
    console.log(jobs)
    res.render("my-jobs", { jobs });
})
app.get('/see-details/:id', isLoggined, async (req, res) => {
    const jobs = await postjobsModel.findById(req.params.id).populate('recruiter').populate('company').sort({ createdAt: -1 });
    console.log(jobs)
    res.render("see-details", { jobs });
})
app.get('/apply/:id', isLoggined, async (req, res) => {
    const jobs = await postjobsModel.findById(req.params.id).populate('recruiter').populate('company')
    res.render('apply', { jobs });
})
app.post(
    '/apply/:id',
    isLoggined,
    upload.single('resume'),
    async (req, res) => {

        const { name, email, phone, coverLetter } = req.body;

        const application = await ApplyModel.create({
            applicant: req.user._id,
            job: req.params.id,
            name,
            email,
            phone,
            resume: req.file.filename,
            coverLetter,
            status: 'Pending'
        });

        res.redirect('/application-success');
    }
);
app.get('/applications', isLoggined, async (req, res) => {
    const jobs = await postjobsModel.find({
        recruiter: req.user._id
    });
    const jobIds = jobs.map(job => job._id);
    const applications = await ApplyModel.find({
        job: { $in: jobIds }
    })
        .populate('job')
        .populate('applicant');
    res.render('application', { applications });
});
app.get('/applications/:id', isLoggined, async (req, res) => {
    const application = await ApplyModel.findById(req.params.id).populate('job')
        .populate('applicant');
    res.render('view-candidate', { application });
})
app.post('/applications/:id', isLoggined, async (req, res) => {
    try {
        const userStatus = await ApplyModel.findById(req.params.id);
        if (!userStatus) {
            return res.status(404).send("Application not found.");
        }
        userStatus.status = req.body.status;
        await userStatus.save();
        return res.redirect('/recruiter-home');
    } catch (error) {
        return res.status(500).send("Server Error: " + error.message);
    }
});

// app.post('/applications/:id', isLoggined, async (req, res) => {
//      try {
//         const { status } = req.body;
//         const application = await ApplyModel.findOneAndUpdate(
//             { email: req.user.email },
//             { status: status },       
//             { new: true }             
//         );
//         if (!application) {
//             return res.status(404).json({ message: "Application not found" });
//         }
//         return res.status(200).json({ success: true, data: changeStatus });
//     } catch (error) {
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }

// })
app.get('/application-success', isLoggined, async (req, res) => {
    const application = await ApplyModel.findOne({ email: req.user.email })
    res.render('application-success', { application })
})
app.get('/contact-candidate/:id', isLoggined, async (req, res) => {
    const candidate = await userModel.findOne({ _id: req.params.id });

    if (!candidate) {
        return res.status(404).send("Candidate not found");
    }
    res.render('contact-candidate', { candidate: candidate })
})
app.post('/contact-candidate/:id', isLoggined, async (req, res) => {

    const { subject, message } = req.body;

    const createMessage = await messageModel.create({
        subject,
        message,
        sender: req.user._id,
        receiver: req.params.id,
        read: false
    });

    console.log(createMessage);

    res.redirect('/recruiter-home');
});
app.get('/messages', isLoggined, async (req, res) => {
    try {
        const messages = await messageModel
            .find({ receiver: req.user._id })
            .populate('sender')
            .sort({ createdAt: -1 });

        res.render('message', { messages });

    } catch (error) {
        res.status(500).send("Server Error: " + error.message);
    }
});
function isRecruiterLoggedIn(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {

        const decoded = jwt.verify(token, JWT);

        req.recruiter = decoded;

        next();

    } catch (error) {
        res.redirect('/login');
    }
}
async function checkPassion(req, res, next) {
    if (req.user.role === 'recruiter') {
        return res.redirect('/recruiter-home');
    }

    if (req.user.role === 'user') {
        return res.redirect('/');
    }

    next();
}
function onlyUser(req, res, next) {

    if (req.user.role !== 'user') {
        return res.redirect('/recruiter-home');
    }

    next();
}
function onlyRecruiter(req, res, next) {

    if (req.user.role !== 'recruiter') {
        return res.redirect('/');
    }

    next();
}
async function checkRole(req, res, next) {
    try {

        if (!req.user) {
            return res.redirect('/login');
        }

        const user = await userModel.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.redirect('/login');
        }

        if (!user.role) {
            return res.redirect('/role');
        }

        next();

    } catch (err) {
        next(err);
    }
}
async function isLoggined(req, res, next) {
    if (!req.cookies || !req.cookies.token) {
        return res.redirect('/login');
    }
    try {
        let decoded = jwt.verify(req.cookies.token, JWT);
        // Fetch the full user document so req.user contains _id
        const user = await userModel.findOne({ email: decoded.email });
        if (!user) {
            return res.redirect('/login');
        }
        req.user = user;
        next();
    } catch (err) {
        res.redirect('/login');
    }
}
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})