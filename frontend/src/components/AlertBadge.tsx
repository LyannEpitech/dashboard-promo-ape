import './AlertBadge.css';

interface AlertBadgeProps {
  type: 'inactive' | 'rush' | 'active' | 'error';
  days?: number;
  message?: string;
}

function AlertBadge({ type, days, message }: AlertBadgeProps) {
  const getContent = () => {
    switch (type) {
      case 'inactive':
        return message || `Inactif (${days}j)`;
      case 'rush':
        return message || 'Rush détecté!';
      case 'active':
        return message || 'Actif';
      case 'error':
        return message || 'Erreur';
      default:
        return message || '';
    }
  };

  return (
    <span className={`alert-badge alert-${type}`}>
      {getContent()}
    </span>
  );
}

export default AlertBadge;