import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import projectsRouter from '../routes/projects.js';

describe('Projects Routes', () => {
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
    
    app.use('/api/projects', projectsRouter);
  });

  describe('GET /api/projects', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/projects', projectsRouter);
      
      const response = await request(unauthApp)
        .get('/api/projects')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should return projects list', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.projects).toBeDefined();
      expect(Array.isArray(response.body.projects)).toBe(true);
    });

    it('should use org from query parameter', async () => {
      const response = await request(app)
        .get('/api/projects?org=TestOrg')
        .expect(200);
      
      expect(response.body.organization).toBe('TestOrg');
    });
  });
});