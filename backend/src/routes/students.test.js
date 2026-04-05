import { describe, it, expect, jest } from '@jest/globals';
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
    
    // Mock authentication middleware
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
        .get('/api/students/testuser')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });
  });
});