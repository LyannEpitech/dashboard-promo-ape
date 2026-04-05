import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './WebhookConfig.css';

interface WebhookConfigProps {
  user?: {
    username: string;
    displayName: string;
  };
}

function WebhookConfig({ user }: WebhookConfigProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [configuredWebhooks, setConfiguredWebhooks] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [availableOrgs, setAvailableOrgs] = useState<any[]>([]);

  useEffect(() => {
    fetchOrgs();
    fetchWebhookStatus();
  }, []);

  const fetchOrgs = async () => {
    try {
      const response = await fetch('/api/pat/orgs', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAvailableOrgs(data.orgs || []);
      }
    } catch (err) {
      console.error('Erreur récupération orgs:', err);
    }
  };

  const fetchWebhookStatus = async () => {
    try {
      const response = await fetch('/api/webhook/status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setConfiguredWebhooks(data.webhooks || []);
      }
    } catch (err) {
      console.error('Erreur récupération webhooks:', err);
    }
  };

  const handleConfigureWebhook = async () => {
    if (!selectedOrg) {
      setError('Veuillez sélectionner une organisation');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/webhook/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          org: selectedOrg,
          events: ['push', 'pull_request', 'repository']
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la configuration');
      }

      setSuccess(`Webhook configuré avec succès pour ${selectedOrg}`);
      fetchWebhookStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (org: string) => {
    if (!confirm(`Supprimer le webhook pour ${org} ?`)) return;

    try {
      const response = await fetch(`/api/webhook/${org}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess(`Webhook supprimé pour ${org}`);
        fetchWebhookStatus();
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="webhook-config-page">
      <Navbar user={user} />
      <div className="webhook-config">
        <h2>Configuration des Webhooks</h2>
        
        <div className="webhook-info">
          <p>Les webhooks permettent de recevoir des notifications en temps réel lorsque :</p>
          <ul>
            <li>Un étudiant push du code</li>
            <li>Une pull request est créée/mergée</li>
            <li>Un nouveau repository est créé</li>
          </ul>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="webhook-form">
          <h3>Configurer un nouveau webhook</h3>
          
          <div className="form-group">
            <label>Organisation:</label>
            <select 
              value={selectedOrg} 
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <option value="">Sélectionner une organisation</option>
              {availableOrgs.map(org => (
                <option key={org.login} value={org.login}>
                  {org.name || org.login}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleConfigureWebhook} 
            disabled={loading || !selectedOrg}
            className="btn-primary"
          >
            {loading ? 'Configuration...' : 'Configurer le webhook'}
          </button>
        </div>

        {configuredWebhooks.length > 0 && (
          <div className="configured-webhooks">
            <h3>Webhooks configurés</h3>
            {configuredWebhooks.map((webhook, index) => (
              <div key={index} className="webhook-item">
                <div className="webhook-info-item">
                  <strong>{webhook.org}</strong>
                  <span className="webhook-url">{webhook.url}</span>
                  <span className="webhook-events">
                    Événements: {webhook.events.join(', ')}
                  </span>
                </div>
                <button 
                  onClick={() => handleDeleteWebhook(webhook.org)}
                  className="btn-danger"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WebhookConfig;