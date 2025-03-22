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
   MONGO_URI=mongodb+srv://npanthi718:hospital_managemet_system@cluster0.ptnir.mongodb.net/lumbini_nepal_hospital
   JWT_SECRET=your_secret_key_is_hospital_management_system
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

- Email: admin@lumbininepalhospital.com
- Password: Admin@123

## Default Doctor Credentials

- Email: doctor@lumbininepalhospital.com
- Password: Doctor@123

## Default Patient Credentials

- Email: patient@example.com
- Password: Patient@123
