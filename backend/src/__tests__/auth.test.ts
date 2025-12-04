import request from 'supertest';
import app from '../app';
import { FileStorage } from '../config/fileStorage';
import { v4 as uuidv4 } from 'uuid';

describe('Authentication API Tests', () => {
  let testUser: any;

  beforeAll(async () => {
    // Create test user
    testUser = {
      id: 'test-auth-user',
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User',
      createdAt: new Date().toISOString()
    };

    // Write test user to auth-users.json
    const existingUsers = await FileStorage.readFile('auth-users.json').catch(() => []);
    await FileStorage.writeFile('auth-users.json', [...existingUsers, testUser]);
  });

  afterAll(async () => {
    // Clean up test user
    const users = await FileStorage.readFile('auth-users.json').catch(() => []);
    const filteredUsers = users.filter((u: any) => u.id !== testUser.id);
    await FileStorage.writeFile('auth-users.json', filteredUsers);
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should fail with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: testUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid username or password');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid username or password');
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Username and password are required');
    });
  });

  describe('POST /api/auth/verify-token', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      validToken = loginResponse.body.token;
    });

    it('should verify valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-token')
        .send({ token: validToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-token')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      validToken = loginResponse.body.token;
    });

    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/users', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      validToken = loginResponse.body.token;
    });

    it('should get all users with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check that passwords are not included
      response.body.data.forEach((user: any) => {
        expect(user.password).toBeUndefined();
      });
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
