const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/user');
const postjobsModel = require('./models/postjobs');
const recruiterModel = require('./models/recruiter');
const ApplyModel = require('./models/apply');
const companyModel = require('./models/company');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('public')));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join('views'));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const recruiter = require('./models/recruiter');
const { asyncWrapProviders } = require('async_hooks');
const user = require('./models/user');
const JWT = '123erwvdghlkyrtadeg##########jfrge478945645';
const port = 3000;
app.get('/', isLoggined, checkPassion, async (req, res) => {
    try {

        const user = await userModel.findOne({
            email: req.user.email
        });

        // Get all jobs for homepage
        const jobs = await postjobsModel
            .find()
            .populate('recruiter')
            .populate('company')
            .sort({ createdAt: -1 });

        // Get only this recruiter's jobs
        const recruiterJobs = await postjobsModel.find({
            recruiter: req.user._id
        });

        // Get IDs of those jobs
        const jobIds = recruiterJobs.map(job => job._id);

        // Get all applications for those jobs
        const applications = await ApplyModel.find({
            job: { $in: jobIds }
        });

        res.render('home', {
            user,
            jobs,
            applications
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong loading the homepage");
    }
});
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
app.get("/recruiter-home", isLoggined, async (req, res) => {
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


        // Send everything to recruiter.ejs
        res.render("recruiter", {
            jobs,
            recruiter,
            applications
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
    bcrypt.compare(password, user.password, function (err, result) {
        // result == true
        if (err) {
            console.log('something went wrong', err);
        }
        if (result) {
            // 4. Give them their login token!
            const token = jwt.sign({ email: user.email }, JWT);
            res.cookie('token', token);
            // 5. Redirect to /home so it fetches the user data and renders home.ejs properly
            return res.status(200).redirect('/');
        } else {
            return res.redirect('/login');
        }
    });
})
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
app.post('/apply/:id', isLoggined, async (req, res) => {

    const {
        name,
        email,
        phone,
        resume,
        coverLetter
    } = req.body;

    const application = await ApplyModel.create({
        applicant: req.user._id,
        job: req.params.id,
        name,
        email,
        phone,
        resume,
        coverLetter,
        status: 'Pending'
    });
    console.log(application)
    res.redirect('/application-success');
});
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
app.get('/application-success', isLoggined, async (req, res) => {
    const application = await ApplyModel.findOne({ email: req.user.email })
    res.render('application-success', { application })
})
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
    try {
        // req.user is set by your isLoggined middleware right before this runs
        const email = req.user.email;
        const user = await userModel.findOne({ email });

        // Use redirect instead of render so the browser URL actually changes
        if (user && (!user.passion || user.passion === '')) {
            return res.redirect('/choose-passion');
        }
        next();
    } catch (error) {
        next(error);
    }
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