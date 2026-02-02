import request from 'supertest';
import express from 'express';
import { connect, close, clear } from './setup.js';
import authRoutes from '../src/routes/authRoutes.js';
import connectDB from '../src/config/db.js'; // We override this in setup
import helmet from 'helmet';

// 1. Setup a mini Express app just for testing
const app = express();
app.use(express.json());
app.use(helmet());
app.use('/api/auth', authRoutes);

// 2. Lifecycle Hooks
beforeAll(async () => await connect());
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Auth Endpoints', () => {
    
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token'); // JWT Token check
        expect(res.body.username).toEqual('testuser');
    });

    it('should login an existing user', async () => {
        // First register
        await request(app).post('/api/auth/register').send({
            username: 'loginUser',
            email: 'login@example.com',
            password: 'password123'
        });

        // Then login
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should fail login with wrong password', async () => {
        // Register
        await request(app).post('/api/auth/register').send({
            username: 'wrongPass',
            email: 'wrong@example.com',
            password: 'password123'
        });

        // Login wrong
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'wrong@example.com',
                password: 'WRONGPASSWORD'
            });

        expect(res.statusCode).toEqual(401);
    });
});