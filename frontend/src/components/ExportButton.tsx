import { useState, useRef, useEffect } from 'react';
import './ExportButton.css';

interface ExportButtonProps {
  onExport?: (format: 'csv' | 'pdf' | 'json') => void;
}

function ExportButton({ onExport }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    if (onExport) {
      onExport(format);
    } else {
      // Export par défaut
      window.open(`/api/export/${format}`, '_blank');
    }
    setIsOpen(false);
  };

  return (
    <div className="export-button-container" ref={menuRef}>
      <button 
        className="export-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        📥 Exporter
      </button>
      
      {isOpen && (
        <div className="export-menu">
          <button 
            className="export-option"
            onClick={() => handleExport('csv')}
          >
            <span className="export-icon">📊</span>
            <span>CSV</span>
          </button>
          <button 
            className="export-option"
            onClick={() => handleExport('pdf')}
          >
            <span className="export-icon">📄</span>
            <span>PDF</span>
          </button>
          <button 
            className="export-option"
            onClick={() => handleExport('json')}
          >
            <span className="export-icon">💾</span>
            <span>JSON</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportButton;