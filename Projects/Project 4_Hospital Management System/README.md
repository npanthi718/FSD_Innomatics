# Lumbini Nepal Hospital Management System

A comprehensive hospital management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Patient Features

- Register/Login
- Browse doctors by specialization
- View doctor profiles & availability
- Book appointments
- View and cancel appointments
- View medical history
- Access prescriptions

### Doctor Features

- Register/Login
- Set available time slots
- View and manage appointments
- Update profile
- Manage patient records
- Write prescriptions

### Admin Features

- Approve/reject doctor registrations
- Manage all users (doctors & patients)
- View all appointments
- Manage departments
- Generate reports
- System configuration

## Tech Stack

- Frontend: React.js
- Backend: Node.js & Express.js
- Database: MongoDB Atlas
- Authentication: JWT

## Setup Instructions

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create .env file in backend directory with:

   ```
   MONGO_URI= Your_MONGO_URI
   JWT_SECRET=Your_JWT_SECRET_KEY
   PORT=5000
   ```

4. Start the application:

   ```bash
   # Start backend server
   cd backend
   npm start

   # Start frontend development server
   cd ../frontend
   npm start
   ```

## Default Admin Credentials

- Email: director@lumbininepalhospital.com
- Password: director123

## Default Doctor Credentials

- Email: doctorfirstname.lastname@lumbininepalhospital.com
- Password: doctor@123

## Patient Credentials

- Email: Your email id
- Password: Your password while doing signup
