const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    agreement: { type: Boolean, required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
});

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    prefix: { type: String, required: true },
    address: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = { User, Hospital };
