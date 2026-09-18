const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/user');
const postjobsModel = require('./models/postjobs');
const recruiterModel = require('./models/recruiter');
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
const JWT = '123erwvdghlkyrtadeg##########jfrge478945645';
const port = 3000;
app.get('/', isLoggined, checkPassion, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        const jobs = await postjobsModel.find().populate('Jobs').sort({ createdAt: -1 });
        res.render('home', { user, jobs });
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong loading the homepage");
    }
});
app.get('/candidates', isLoggined, async (req, res) => {
    const candidates = await userModel.findOne({ email: req.user.email });
    console.log(candidates);
    res.render('candidates',{candidates})
})
app.get('/user/profile', isLoggined, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    console.log(user);
    res.render('candidate-profile',{ user})
})
app.get('/signup', async (req, res) => {
    res.render('signup');
})
// Add your authentication middleware function here (e.g., isLoggedIn)
app.get("/recruiter-home", isLoggined, async (req, res) => {
    try {
        // 1. Fetch all jobs posted by this specific recruiter
        const jobs = await postjobsModel
            .find({ recruiter: req.user._id })
            .sort({ createdAt: -1 });

        // 2. Fetch the company profile data
        const recruiter = await companyModel.findOne({ recruiter: req.user._id });

        // 3. Render and provide an empty object fallback if no company profile exists yet
        res.render("recruiter", {
            jobs,
            recruiter: recruiter,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to load the feed");
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
            firmName,
            title,
            jobType,
            location,
            category,
            workplace,
            salary,
            salaryMax,
            description,
        } = req.body;

        // Find company of logged-in recruiter
        const company = await companyModel.findOne({
            recruiter: req.user._id
        });

        if (!company) {
            return res.status(404).send("Company profile not found.");
        }

        // Create job
        const createPost = await postjobsModel.create({
            firmName,
            title,
            jobType,
            location,
            category,
            workplace,
            salary,
            salaryMax,
            description,

            recruiter: req.user._id,

            // Connect job with company
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
        const jobs = await postjobsModel.find().populate('recruiter').sort({ createdAt: -1 });

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
    const jobs = await postjobsModel.find().populate('Jobs').sort({ createdAt: -1 });
    console.log(jobs)
    res.render('jobs', { jobs });
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