import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import patRouter from '../routes/pat.js';

describe('PAT Routes', () => {
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
    
    app.use('/api/pat', patRouter);
  });

  describe('POST /api/pat', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/pat', patRouter);
      
      const response = await request(unauthApp)
        .post('/api/pat')
        .send({ pat: 'ghp_test123' })
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should validate PAT format', async () => {
      const response = await request(app)
        .post('/api/pat')
        .send({ pat: 'invalid-token' })
        .expect(400);
      
      expect(response.body.error).toContain('Format invalide');
    });

    it('should require PAT in body', async () => {
      const response = await request(app)
        .post('/api/pat')
        .send({})
        .expect(400);
      
      expect(response.body.error).toContain('PAT requis');
    });
  });

  describe('GET /api/pat/orgs', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/pat', patRouter);
      
      const response = await request(unauthApp)
        .get('/api/pat/orgs')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should return 400 if no PAT in session', async () => {
      const response = await request(app)
        .get('/api/pat/orgs')
        .expect(400);
      
      expect(response.body.error).toBe('Aucun PAT enregistré');
    });
  });

  describe('POST /api/pat/select-org', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/pat', patRouter);
      
      const response = await request(unauthApp)
        .post('/api/pat/select-org')
        .send({ org: 'Epitech' })
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should require org in body', async () => {
      const response = await request(app)
        .post('/api/pat/select-org')
        .send({})
        .expect(400);
      
      expect(response.body.error).toContain('Organisation requise');
    });

    it('should select an org', async () => {
      const response = await request(app)
        .post('/api/pat/select-org')
        .send({ org: 'Epitech' })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.selectedOrg).toBe('Epitech');
    });
  });

  describe('GET /api/pat/status', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/pat', patRouter);
      
      const response = await request(unauthApp)
        .get('/api/pat/status')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should return PAT status', async () => {
      const response = await request(app)
        .get('/api/pat/status')
        .expect(200);
      
      expect(response.body.hasPat).toBe(false);
      expect(response.body.selectedOrg).toBeUndefined();
    });
  });
});