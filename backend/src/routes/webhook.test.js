import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import webhookRouter from '../routes/webhook.js';

describe('Webhook Routes', () => {
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
      req.user = { id: '123', accessToken: 'fake-token' };
      next();
    });
    
    app.use('/api/webhook', webhookRouter);
  });

  describe('POST /api/webhook/configure', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/webhook', webhookRouter);
      
      const response = await request(unauthApp)
        .post('/api/webhook/configure')
        .send({ org: 'Epitech' })
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should require org parameter', async () => {
      const response = await request(app)
        .post('/api/webhook/configure')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('Organisation requise');
    });

    it('should require PAT', async () => {
      const response = await request(app)
        .post('/api/webhook/configure')
        .send({ org: 'Epitech' })
        .expect(400);
      
      expect(response.body.error).toBe('PAT requis pour configurer les webhooks');
    });
  });

  describe('GET /api/webhook/status', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/webhook', webhookRouter);
      
      const response = await request(unauthApp)
        .get('/api/webhook/status')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should return webhooks list', async () => {
      const response = await request(app)
        .get('/api/webhook/status')
        .expect(200);
      
      expect(response.body.webhooks).toBeDefined();
      expect(Array.isArray(response.body.webhooks)).toBe(true);
    });
  });

  describe('DELETE /api/webhook/:org', () => {
    it('should return 401 when not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use((req, res, next) => {
        req.isAuthenticated = () => false;
        next();
      });
      unauthApp.use('/api/webhook', webhookRouter);
      
      const response = await request(unauthApp)
        .delete('/api/webhook/Epitech')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });

    it('should require PAT', async () => {
      const response = await request(app)
        .delete('/api/webhook/Epitech')
        .expect(400);
      
      expect(response.body.error).toBe('PAT requis');
    });
  });
});