import request from 'supertest';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

// Mock de l'application pour les tests
const createMockApp = () => {
  const app = express();
  
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Mock user serialization
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  
  return app;
};

describe('Auth Routes', () => {
  let app;
  
  beforeEach(() => {
    app = createMockApp();
  });
  
  describe('GET /auth/github', () => {
    it('should redirect to GitHub OAuth', async () => {
      // Mock la stratégie GitHub
      passport.use(new GitHubStrategy({
        clientID: 'test-id',
        clientSecret: 'test-secret',
        callbackURL: '/auth/github/callback'
      }, (accessToken, refreshToken, profile, done) => {
        done(null, { id: '123', username: 'testuser' });
      }));
      
      app.get('/auth/github', passport.authenticate('github', { scope: ['read:org', 'read:user', 'repo'] }));
      
      const response = await request(app)
        .get('/auth/github')
        .expect(302);
      
      expect(response.headers.location).toContain('github.com');
    });
  });
  
  describe('GET /auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      app.get('/auth/me', (req, res) => {
        if (req.isAuthenticated && req.isAuthenticated()) {
          res.json({ user: req.user });
        } else {
          res.status(401).json({ error: 'Non authentifié' });
        }
      });
      
      const response = await request(app)
        .get('/auth/me')
        .expect(401);
      
      expect(response.body.error).toBe('Non authentifié');
    });
    
    it('should return user when authenticated', async () => {
      const mockUser = { id: '123', username: 'testuser', displayName: 'Test User' };
      
      app.get('/auth/me', (req, res) => {
        // Simuler un user authentifié
        req.user = mockUser;
        req.isAuthenticated = () => true;
        res.json({ user: req.user });
      });
      
      const response = await request(app)
        .get('/auth/me')
        .expect(200);
      
      expect(response.body.user).toEqual(mockUser);
    });
  });
  
  describe('GET /auth/logout', () => {
    it('should logout user successfully', async () => {
      app.get('/auth/logout', (req, res) => {
        req.logout = (cb) => cb();
        req.logout(() => {
          res.json({ message: 'Déconnecté' });
        });
      });
      
      const response = await request(app)
        .get('/auth/logout')
        .expect(200);
      
      expect(response.body.message).toBe('Déconnecté');
    });
  });
  
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
      });
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});