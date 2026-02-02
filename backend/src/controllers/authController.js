import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '30d' });
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

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