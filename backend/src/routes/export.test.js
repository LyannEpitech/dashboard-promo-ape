import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import exportRouter from '../routes/export.js';

describe('Export Routes - US5', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false
    }));
    
    // Mock authentication middleware - authenticated
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = { accessToken: 'fake-token' };
      next();
    });
    
    app.use('/api/export', exportRouter);
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/export', exportRouter);
      
      const response = await request(unauthApp)
        .get('/api/export/csv')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });
  });

  describe('Routes exist', () => {
    it('GET /api/export/csv should exist', async () => {
      const response = await request(app)
        .get('/api/export/csv');
      
      // Should not be 404
      expect(response.status).not.toBe(404);
    });

    it('GET /api/export/json should exist', async () => {
      const response = await request(app)
        .get('/api/export/json');
      
      expect(response.status).not.toBe(404);
    });

    it('GET /api/export/pdf should exist', async () => {
      const response = await request(app)
        .get('/api/export/pdf');
      
      expect(response.status).not.toBe(404);
    });
  });
});