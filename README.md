# JobBoard Lite

**A modern job board platform built with Next.js, TypeScript, Supabase, and Tailwind CSS.**

Live Demo: https://taw-nextjs-jobboard-lite.vercel.app/

GitHub Repository: https://github.com/mekinza11-dot/taw-nextjs-jobboard-lite

## Project Overview

JobBoard Lite is a web-based job board application that allows employers to post and manage job listings while candidates can browse, search, and filter available opportunities.

The platform also includes job alerts through email notifications and a demo payment feature for highlighting job listings.

## Features

- **User Authentication:** Sign up, log in, and log out.
- **Job Listings:** Employers can create, edit, and delete their job posts.
- **Browse Jobs:** Candidates can view published job opportunities.
- **Search and Filters:** Search jobs by title, company, and location, and filter by category and job type.
- **Featured Jobs:** Highlight job listings using demo payment mode.
- **Job Alerts:** Subscribe to email notifications for matching jobs.
- **Email Notifications:** Receive alerts when matching jobs are posted.
- **Unsubscribe:** Users can unsubscribe from job alerts through a unique email link.
- **Employer Dashboard:** Manage job listings and view dashboard statistics.

## Technologies Used

| Technology | Purpose |
|---|---|
| Next.js 14 | Frontend and backend framework |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and responsive UI |
| Supabase | Database and authentication |
| PostgreSQL | Database |
| Resend | Email notifications |
| Vercel | Deployment |
| GitHub | Version control |

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/mekinza11-dot/taw-nextjs-jobboard-lite.git
```

### 2. Open the project folder

```bash
cd taw-nextjs-jobboard-lite
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root and add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add the required values from your Supabase and Resend accounts. Stripe variables are for the optional Stripe integration.

**Important:** Never upload `.env.local` or expose secret API keys publicly.

### 5. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Database

The project uses Supabase with PostgreSQL.

Main database tables:

- `profiles`
- `jobs`
- `payments`
- `job_alerts`

Row Level Security (RLS) policies are used to control database access.

## Payment Mode

JobBoard Lite currently includes a simulated payment feature for demonstrating featured job listings.

The demo payment flow updates the job's featured status without processing a real payment. Real Stripe payment processing requires valid Stripe credentials and configuration.

## Email Alerts

The application uses Resend to send email notifications when a newly published job matches an active job alert.

Users can subscribe using a category and keyword. Each notification includes an unsubscribe link.

**Note:** Sending emails to arbitrary recipients in production requires a verified sending domain in Resend.

## Testing Checklist

The following features have been tested:

- [x] User registration and login
- [x] Job creation
- [x] Job listing and browsing
- [x] Search and filtering
- [x] Job editing and deletion
- [x] Employer dashboard
- [x] Demo featured-job payment
- [x] Job alert subscription
- [x] Email notification delivery
- [x] Unsubscribe functionality
- [x] Production deployment
- [x] Production unsubscribe URL

## Deployment

The application is deployed on Vercel.

Live Website: https://taw-nextjs-jobboard-lite.vercel.app/

## Future Improvements

- Real Stripe payment integration
- Advanced job search and filtering
- Employer and candidate profile enhancements
- Improved analytics and reporting
- Additional email notification preferences

## Author

Developed as part of the Think AI Works internship project.


