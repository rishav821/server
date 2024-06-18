const mongoose = require('mongoose');
const validator = require('validator');

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    agreement: { type: Boolean, required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' }
});

// Hospital Schema
const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    prefix: { type: String, required: true },
    address: { type: String, required: true },
});

// Doctor Schema
const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    specialty: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true, validate: [ validator.isEmail, "Provide a valid Email!" ]},
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
});

// Patient Schema (Medical History)
const patientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    medicalHistory: [
        {
            diagnosis: { type: String, required: true },
            treatment: { type: String, required: true },
            date: { type: Date, required: true },
            doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
        }
    ]
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
    firstName: { type: String, required: true, minLength: [3, "First name is required"] },
    lastName: { type: String, required: true, minLength: [3, "Last name is required"] },
    email: { type: String, required: true, unique: true, validate: [ validator.isEmail, "Provide a valid Email!" ] },
    phoneNumber: { type: String, required: true },
    dob: { type: Date, required: [true, "DOB is required!"] },
    gender: { type: String, required: [true, "Gender is required!"], enum: ["Male", "Female"] },
    appointment_date: { type: String, required: [true, "Appointment date is required!"] },
    department: { type: String, required: [true, "Department name is required!"] },
    doctor: {
        firstName: { type: String, required: [true, "Doctor name is required!"] },
        lastName: { type: String, required: [true, "Doctor name is required!"] },
    },
    doctorId: { type: mongoose.Schema.ObjectId, ref: "Doctor", required: [true, "Doctor ID is invalid!"] },
    patientId: { type: mongoose.Schema.ObjectId, ref: "User", required: [true, "Patient ID is required!"] },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
});

// Create Models
const User = mongoose.model('User', userSchema);
const Hospital = mongoose.model('Hospital', hospitalSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = { User, Hospital, Doctor, Patient, Appointment };
