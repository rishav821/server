const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Hospital, User } = require('./models/User');
const jwtSecret = 'nV3$7n9L#2KzF!gYq8XbW4J&jT6rP@dZ';

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

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

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

        // Set the role to 'User' by default
        const user = await User.create({
            firstName: FirstName,
            lastName: LastName,
            email: Email,
            phoneNumber: PhoneNumber,
            username: Username,
            password: hashedPassword,
            agreement: agreement,
            hospital: hospital._id,
            role: 'User', // Set the role to 'User' by default
        });

        res.status(201).json({ message: 'Registration successful', user });
    } catch (err) {
        console.error("Registration failed:", err.message);
        res.status(500).json({ error: 'Registration failed', details: err.message });
    }
});

app.put('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phoneNumber, username, password } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.username = username || user.username;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

app.delete('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            console.error("Login failed: User not found");
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("Login failed: Incorrect password");
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Check if the user is admin, if so, set role as 'Admin', otherwise set as 'User'
        const role = user.role === 'Admin' ? 'Admin' : 'User';

        // Set the expiration time for the token
        const expiresIn = 290; // 2 minutes in seconds

        // Sign the JWT token with user information including role
        const token = jwt.sign({ id: user._id, username: user.username, role }, jwtSecret, { expiresIn });

        // Return the token and expiration time in the response
        res.status(200).json({ message: 'Login successful', token, expiresIn });
    } catch (err) {
        console.error("Login failed:", err.message);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});


app.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.listen(1330, () => {
    console.log("Server is running on port 1330");
});
