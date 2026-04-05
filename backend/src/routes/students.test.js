import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import studentsRouter from '../routes/students.js';

describe('Students Routes', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false
    }));
    
    // Mock authentication
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = { accessToken: 'fake-token' };
      next();
    });
    
    app.use('/api/students', studentsRouter);
  });

  describe('GET /api/students', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/students', studentsRouter);
      
      const response = await request(unauthApp)
        .get('/api/students')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should return students list', async () => {
      const response = await request(app)
        .get('/api/students');
      
      // Should not be 404
      expect(response.status).not.toBe(404);
    });

    it('should accept org query parameter', async () => {
      const response = await request(app)
        .get('/api/students?org=TestOrg');
      
      expect(response.status).not.toBe(404);
    });
  });

  describe('GET /api/students/:username', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/students', studentsRouter);
      
      const response = await request(unauthApp)
        .get('/api/students/student1')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should handle student request', async () => {
      const response = await request(app)
        .get('/api/students/student1');
      
      // Should not be 404
      expect(response.status).not.toBe(404);
    });
  });
});