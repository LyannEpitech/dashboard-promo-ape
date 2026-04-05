import { Router } from 'express';
import { Octokit } from '@octokit/rest';

const router = Router();

// Stockage des webhooks configurés (en production, utiliser une base de données)
const configuredWebhooks = new Map();

// POST /api/webhook/configure - Configurer un webhook
router.post('/configure', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { org, events } = req.body;

    if (!org) {
      return res.status(400).json({ error: 'Organisation requise' });
    }

    // Utiliser le PAT pour créer le webhook
    const pat = req.session.pat;
    if (!pat) {
      return res.status(400).json({ error: 'PAT requis pour configurer les webhooks' });
    }

    const octokit = new Octokit({ auth: pat });

    // URL du webhook OpenClaw (à configurer selon ton environnement)
    const webhookUrl = process.env.OPENCLAW_WEBHOOK_URL || 'https://claw.openclaw.ai/webhook/github';

    try {
      // Créer le webhook sur l'org GitHub
      const { data: webhook } = await octokit.rest.orgs.createWebhook({
        org,
        name: 'web',
        active: true,
        events: events || ['push', 'pull_request', 'repository'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: process.env.WEBHOOK_SECRET || 'default-secret'
        }
      });

      // Sauvegarder la configuration
      configuredWebhooks.set(`${req.user.id}_${org}`, {
        org,
        webhookId: webhook.id,
        events: events || ['push', 'pull_request', 'repository'],
        url: webhookUrl,
        createdAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: `Webhook configuré pour ${org}`,
        webhook: {
          id: webhook.id,
          url: webhookUrl,
          events: webhook.events
        }
      });
    } catch (githubError) {
      console.error('Erreur création webhook GitHub:', githubError.message);
      return res.status(500).json({ 
        error: 'Erreur lors de la création du webhook',
        details: githubError.message
      });
    }

  } catch (error) {
    console.error('Erreur configuration webhook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/webhook/status - Vérifier le statut des webhooks
router.get('/status', (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const userWebhooks = [];
    for (const [key, config] of configuredWebhooks.entries()) {
      if (key.startsWith(`${req.user.id}_`)) {
        userWebhooks.push(config);
      }
    }

    res.json({
      webhooks: userWebhooks
    });

  } catch (error) {
    console.error('Erreur statut webhook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/webhook/:org - Supprimer un webhook
router.delete('/:org', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { org } = req.params;
    const pat = req.session.pat;

    if (!pat) {
      return res.status(400).json({ error: 'PAT requis' });
    }

    const config = configuredWebhooks.get(`${req.user.id}_${org}`);
    if (!config) {
      return res.status(404).json({ error: 'Webhook non trouvé' });
    }

    const octokit = new Octokit({ auth: pat });

    await octokit.rest.orgs.deleteWebhook({
      org,
      hook_id: config.webhookId
    });

    configuredWebhooks.delete(`${req.user.id}_${org}`);

    res.json({
      success: true,
      message: `Webhook supprimé pour ${org}`
    });

  } catch (error) {
    console.error('Erreur suppression webhook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;