import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) throw new Error("FATAL: JWT_SECRET not defined");
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ username, email, password });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            token: generateToken(user.id)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            username: user.username,
            token: generateToken(user.id)
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};