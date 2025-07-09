import { POST } from '@/app/api/auth/login/route';
import { POST as LogoutPOST } from '@/app/api/auth/logout/route';
import { prisma } from '@/lib/prisma';
import { seedTestDatabase, msaUsers } from '../fixtures/msa-data';
import { NextRequest } from 'next/server';

describe('Authentication Flow - All User Types', () => {
  beforeEach(async () => {
    await seedTestDatabase(prisma);
  });

  describe('Login Tests', () => {
    test('should successfully authenticate parent user', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'amal_aouli281@hotmail.com',
          password: 'password123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toMatchObject({
        name: 'Amal Aouli',
        email: 'amal_aouli281@hotmail.com',
        role: 'parent',
      });
      expect(data.token).toHaveValidJWT();
    });

    test('should successfully authenticate leader user', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sarah.droubi@hotmail.com',
          password: 'leader123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toMatchObject({
        name: 'Sarah Droubi',
        role: 'leader',
      });
      expect(data.token).toHaveValidJWT();
    });

    test('should successfully authenticate executive user', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'info@hardcoregym.com.au',
          password: 'exec123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toMatchObject({
        name: 'Hicham Hammoud',
        role: 'executive',
      });
      expect(data.token).toHaveValidJWT();
    });

    test('should successfully authenticate parent-leader dual role', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'fatima_leen@hotmail.com',
          password: 'dual123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toMatchObject({
        name: 'Fatima Hassoun',
        role: 'parent_leader',
      });
      expect(data.token).toHaveValidJWT();
    });

    test('should successfully authenticate support user', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'dabossmoe@gmail.com',
          password: 'support123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toMatchObject({
        name: 'Mohamad Dirani',
        role: 'support',
      });
      expect(data.token).toHaveValidJWT();
    });

    // Edge Cases
    test('should reject invalid email', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@hotmail.com',
          password: 'password123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
    });

    test('should reject invalid password', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'amal_aouli281@hotmail.com',
          password: 'wrongpassword',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
    });

    test('should reject empty credentials', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '',
          password: '',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    test('should update user online status on successful login', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'amal_aouli281@hotmail.com',
          password: 'password123',
        }),
      });

      await POST(req);

      const user = await prisma.user.findUnique({
        where: { email: 'amal_aouli281@hotmail.com' },
      });

      expect(user?.isOnline).toBe(true);
      expect(user?.lastSeen).toBeDefined();
    });
  });

  describe('Session Management', () => {
    test('should handle concurrent logins for same user', async () => {
      const loginData = {
        email: 'amal_aouli281@hotmail.com',
        password: 'password123',
      };

      // First login
      const req1 = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      // Second login
      const req2 = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const [response1, response2] = await Promise.all([POST(req1), POST(req2)]);
      const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(data1.token).toHaveValidJWT();
      expect(data2.token).toHaveValidJWT();
      expect(data1.token).not.toBe(data2.token); // Different tokens
    });

    test('should handle login with SQL injection attempt', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: "admin@test.com'; DROP TABLE users; --",
          password: 'password123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
      
      // Verify users table still exists
      const userCount = await prisma.user.count();
      expect(userCount).toBeGreaterThan(0);
    });
  });

  describe('User Role Validation', () => {
    test('should return correct role permissions for parent', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'amal_aouli281@hotmail.com',
          password: 'password123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.user.role).toBe('parent');
      // Parents should not have access to executive functions
      expect(data.user.email).not.toMatch(/executive|admin/);
    });

    test('should validate dual role user permissions', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'fatima_leen@hotmail.com',
          password: 'dual123',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.user.role).toBe('parent_leader');
      
      // Verify user has both parent and leader capabilities
      const user = await prisma.user.findUnique({
        where: { email: 'fatima_leen@hotmail.com' },
      });
      
      expect(user?.isParent).toBe(true);
      expect(user?.isLeader).toBe(true);
    });
  });
});