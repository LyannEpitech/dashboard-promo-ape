import { useState, useEffect } from 'react';
import './PatConfig.css';

interface Org {
  login: string;
  name: string;
  avatar_url: string;
  description: string;
}

function PatConfig() {
  const [pat, setPat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [patStatus, setPatStatus] = useState<{ hasPat: boolean; selectedOrg?: string; patUser?: { login: string; name: string } } | null>(null);

  useEffect(() => {
    checkPatStatus();
  }, []);

  const checkPatStatus = async () => {
    try {
      const response = await fetch('/api/pat/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatStatus(data);
        if (data.selectedOrg) {
          setSelectedOrg(data.selectedOrg);
        }
      }
    } catch (err) {
      console.error('Erreur vérification statut PAT:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/pat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pat })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement du PAT');
      }

      setSuccess('PAT enregistré avec succès !');
      setOrgs(data.orgs || []);
      setPatStatus({
        hasPat: true,
        patUser: data.user
      });
      setPat('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrg = async (orgLogin: string) => {
    try {
      const response = await fetch('/api/pat/select-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ org: orgLogin })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sélection de l\'organisation');
      }

      setSelectedOrg(orgLogin);
      setSuccess(`Organisation ${orgLogin} sélectionnée !`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="pat-config">
      <h2>Configuration du Personal Access Token (PAT)</h2>
      
      {patStatus?.hasPat && (
        <div className="pat-status">
          <p>✅ PAT configuré pour : <strong>{patStatus.patUser?.login}</strong></p>
          {patStatus.selectedOrg && (
            <p>Organisation sélectionnée : <strong>{patStatus.selectedOrg}</strong></p>
          )}
        </div>
      )}

      <div className="pat-info">
        <h3>Comment obtenir un PAT GitHub :</h3>
        <ol>
          <li>Allez sur <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Settings → Developer settings → Personal access tokens</a></li>
          <li>Cliquez sur "Generate new token (classic)"</li>
          <li>Cochez les scopes : <code>read:org</code>, <code>repo</code>, <code>read:user</code></li>
          <li>Générez le token et copiez-le</li>
          <li>Autorisez le token pour l'org Epitech via SSO</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="pat-form">
        <div className="form-group">
          <label htmlFor="pat">Votre Personal Access Token :</label>
          <input
            type="password"
            id="pat"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            required
          />
          <small>Le token commence par ghp_ ou github_pat_</small>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Vérification...' : 'Enregistrer le PAT'}
        </button>
      </form>

      {orgs.length > 0 && (
        <div className="orgs-section">
          <h3>Organisations accessibles :</h3>
          <div className="orgs-list">
            {orgs.map(org => (
              <div
                key={org.login}
                className={`org-card ${selectedOrg === org.login ? 'selected' : ''}`}
                onClick={() => handleSelectOrg(org.login)}
              >
                <img src={org.avatar_url} alt={org.name} className="org-avatar" />
                <div className="org-info">
                  <h4>{org.name || org.login}</h4>
                  <p>{org.description}</p>
                  <span className="org-login">@{org.login}</span>
                </div>
                {selectedOrg === org.login && <span className="selected-badge">✓ Sélectionnée</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pat-actions">
        <a href="/dashboard" className="btn-secondary">Retour au Dashboard</a>
      </div>
    </div>
  );
}

export default PatConfig;