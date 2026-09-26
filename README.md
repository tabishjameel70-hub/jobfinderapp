# 🧡 JobFinder

> A full-stack job recruitment platform built with **Node.js, Express, MongoDB, Mongoose, EJS, and Tailwind CSS**.

JobFinder connects **job seekers and recruiters** in one platform. Job seekers can discover available jobs, submit applications with resumes and cover letters, track application statuses, manage their profiles, and communicate with recruiters. Recruiters can create company profiles, publish jobs, review applications, manage candidates, and contact applicants.

---

## ✨ Features

### 👤 Job Seekers

* 🔐 User signup and login
* 👤 Candidate profile
* 🖼️ Profile image upload
* 💼 Select professional passion
* 🔎 Browse available jobs
* 📄 View detailed job information
* 📝 Apply for jobs
* 📎 Upload resumes
* ✉️ Submit cover letters
* 📊 Track application status
* 💬 Receive messages from recruiters

### 🏢 Recruiters

* 🔐 Recruiter authentication
* 🏢 Create company profile
* 💼 Create and publish job listings
* 📋 View jobs posted by the recruiter
* 👥 View candidates
* 📄 Review submitted applications
* 📎 Access applicant resumes
* 🔄 Update application status
* 💬 Contact candidates
* 📊 Recruiter dashboard

### ⚙️ Backend

* JWT-based authentication
* Password hashing with bcrypt
* MongoDB database
* Mongoose models and relationships
* Express routing
* Middleware-based authentication
* Multer file uploads
* Job/application relationships using MongoDB ObjectIds
* Populated recruiter, company, applicant, and job data

---

## 🛠️ Tech Stack

| Technology        | Purpose                |
| ----------------- | ---------------------- |
| **Node.js**       | Backend runtime        |
| **Express.js**    | Web server and routing |
| **MongoDB**       | Database               |
| **Mongoose**      | MongoDB ODM            |
| **EJS**           | Server-side rendering  |
| **Tailwind CSS**  | UI styling             |
| **JWT**           | Authentication         |
| **bcrypt**        | Password hashing       |
| **Multer**        | File uploads           |
| **Cookie Parser** | Authentication cookies |

---

## 📂 Project Structure

```text
jobfinderapp/
│
├── models/
│   ├── user.js
│   ├── recruiter.js
│   ├── company.js
│   ├── postjobs.js
│   ├── apply.js
│   └── message.js
│
├── public/
│   └── uploads/
│
├── views/
│   ├── signup.ejs
│   ├── login.ejs
│   ├── home.ejs
│   ├── jobs.ejs
│   ├── job-details.ejs
│   ├── apply.ejs
│   ├── recruiter.ejs
│   ├── candidates.ejs
│   └── ...
│
├── main.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🔄 Application Flow

### Job Seeker

```text
Sign Up
   ↓
Choose Role
   ↓
Choose Passion
   ↓
Job Finder Dashboard
   ↓
Browse Jobs
   ↓
View Job Details
   ↓
Apply
   ↓
Upload Resume + Cover Letter
   ↓
Application Submitted
   ↓
Track Application Status
```

### Recruiter

```text
Sign Up
   ↓
Choose Recruiter
   ↓
Create Company Profile
   ↓
Recruiter Dashboard
   ↓
Post Job
   ↓
Receive Applications
   ↓
Review Candidates
   ↓
Update Application Status
   ↓
Contact Candidate
```

---

## 🗄️ Database Models

JobFinder uses MongoDB with Mongoose to manage relationships between different parts of the application.

### User

Stores:

* Username
* Email
* Password
* Role
* Passion
* Profile image

### Company

Stores recruiter/company information such as:

* Company name
* Industry
* Company size
* Location
* Website
* Recruiter name
* Position
* Description

### Job

Stores:

* Job title
* Company
* Recruiter
* Location
* Job type
* Workplace
* Category
* Salary range
* Description
* Requirements

### Application

Stores:

* Applicant
* Job
* Applicant name
* Email
* Phone
* Resume
* Cover letter
* Application status

### Message

Stores communication between recruiters and candidates.

---

## 🔐 Authentication

JobFinder uses **JWT authentication with cookies**.

Passwords are hashed using **bcrypt** before being stored in MongoDB.

Authenticated requests are protected using middleware that verifies the user's JWT and retrieves the corresponding user from the database.

---

## 📎 File Uploads

JobFinder uses **Multer** for file uploads.

Uploaded files are separated into different directories:

```text
public/uploads/
│
├── resumes/
│
└── profile-images/
```

Resume uploads support:

```text
PDF
DOC
DOCX
```

Profile images support common image formats.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/tabishjameel70-hub/jobfinderapp.git
```

### 2. Open the project

```bash
cd jobfinderapp
```

### 3. Install dependencies

```bash
npm install
```

> `node_modules` is intentionally not included in the repository. Running `npm install` creates it automatically from `package.json` and `package-lock.json`.

### 4. Start MongoDB

Make sure MongoDB is running locally.

The application currently uses MongoDB for storing users, companies, jobs, applications, and messages.

### 5. Configure environment variables

Create a `.env` file:

```env
JWT_SECRET=your_secret_key
```

Never commit `.env` to GitHub.

### 6. Start the application

```bash
node main.js
```

The application runs on:

```text
http://localhost:3000
```

---

## 🔒 Git Ignore

Sensitive and generated files should not be committed.

```gitignore
node_modules/
.env
public/uploads/
```

---

## 🖥️ Screenshots

Add screenshots of your application here:

### 🏠 Job Seeker Dashboard

```text
Add screenshot here
```

### 💼 Job Listings

```text
Add screenshot here
```

### 📝 Job Application

```text
Add screenshot here
```

### 🏢 Recruiter Dashboard

```text
Add screenshot here
```

### 👤 Candidate Profile

```text
Add screenshot here
```

---

## 🚀 Future Improvements

Some potential improvements for future versions include:

* 🔍 Advanced job search and filtering
* ⭐ Save/bookmark jobs
* 🔔 Application notifications
* 📧 Email notifications
* 🧑‍💼 More detailed recruiter profiles
* 📊 Advanced recruiter analytics
* 🔎 Candidate search and filtering
* 🛡️ Improved file validation and security
* ☁️ Cloud-based file storage
* 📱 Further responsive UI improvements
* 🌐 Deployment with a production MongoDB database

---

## 🎯 Project Goal

JobFinder was created as a practical full-stack project to demonstrate how a real-world recruitment platform can be built using **Node.js, Express, MongoDB, Mongoose, EJS, and Tailwind CSS**.

The project focuses on implementing complete workflows rather than only creating static pages — from authentication and job creation to applications, candidate management, file uploads, application statuses, and recruiter-candidate communication.

---

## 👨‍💻 Author

**Tabish Jameel**

GitHub: [@tabishjameel70-hub](https://github.com/tabishjameel70-hub)

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

### 📌 Repository

[View JobFinder on GitHub](https://github.com/tabishjameel70-hub/jobfinderapp)

````

### One thing I'd change on your GitHub page

Your repo currently has **no description, website, or topics** according to GitHub.

I'd set the repository description to:

> **A full-stack job recruitment platform built with Node.js, Express, MongoDB, Mongoose, EJS & Tailwind CSS.**

And add topics such as:

```text
nodejs
express
mongodb
mongoose
ejs
tailwindcss
javascript
job-portal
jobfinder
recruitment
full-stack
web-development
````

That will make the repository look much more like a finished portfolio project rather than just a code dump.
