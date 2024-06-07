const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const bcrypt = require('bcrypt');
const { Hospital, User } = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());


const dbUsername = encodeURIComponent("rishavshrsth"); 
const dbPassword = encodeURIComponent("mongodbpass"); 
const dbName = "user";

const mongoUri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.gofv9uw.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(mongoUri);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas', err);
});

app.post('/register', async (req, res) => {
    try {
        const { HospitalName, Prefix, HospitalAddress, FirstName, LastName, Email, PhoneNumber, Username, password, agreement } = req.body;

        if (!Email || Email.trim() === "") {
            return res.status(400).json({ error: 'Email is required' });
        }

        const existingUser = await User.findOne({ email: Email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const hospital = await Hospital.create({
            name: HospitalName,
            prefix: Prefix,
            address: HospitalAddress,
        });

        const user = await User.create({
            firstName: FirstName,
            lastName: LastName,
            email: Email,
            phoneNumber: PhoneNumber,
            username: Username,
            password: hashedPassword,
            agreement: agreement,
            hospital: hospital._id,
        });

        res.status(201).json({ message: 'Registration successful', user });
    } catch (err) {
        console.error("Registration failed:", err.message);
        res.status(500).json({ error: 'Registration failed', details: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        console.error("Login failed:", err.message);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find().populate('hospital');
        res.status(200).json(users);
    } catch (err) {
        console.error("Failed to fetch users:", err.message);
        res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        const updateData = { firstName, lastName, email, phoneNumber };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (err) {
        console.error("Failed to update user:", err.message);
        res.status(500).json({ error: 'Failed to update user', details: err.message });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Failed to delete user:", err.message);
        res.status(500).json({ error: 'Failed to delete user', details: err.message });
    }
});

app.listen(1330, () => {
    console.log("Server is running on port 1330");
});
