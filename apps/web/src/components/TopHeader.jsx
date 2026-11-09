// FIC: TopHeader component with real storage connectivity indicators.
// FIC: Componente TopHeader con indicadores reales de conectividad de almacenamiento.

import React from 'react';

export default function TopHeader({ title, storageStatus }) {
  const getStatusText = (status) => {
    switch (status) {
      case 'ready': return 'Conectado';
      case 'unavailable': return 'No disponible';
      case 'not_configured': return 'No configurado';
      default: return 'Verificando...';
    }
  };

  const getStatusClass = (status) => status || 'not_configured';

  return (
    <header className="top-header" role="banner">
      <div className="header-title-container">
        <h2 className="header-title">{title}</h2>
        <span className="badge-academic">Demo Académica · Equipo 3</span>
      </div>

      <div className="storage-status-group" aria-label="Estado de persistencia en la nube">
        <div className="status-badge" title="Estado de base de datos relacional Supabase">
          <span className={`status-dot ${getStatusClass(storageStatus?.supabase?.status)}`} />
          <span>Supabase:</span>
          <strong>{getStatusText(storageStatus?.supabase?.status)}</strong>
        </div>

        <div className="status-badge" title="Estado de base de datos documental MongoDB Atlas">
          <span className={`status-dot ${getStatusClass(storageStatus?.mongodb?.status)}`} />
          <span>MongoDB:</span>
          <strong>{getStatusText(storageStatus?.mongodb?.status)}</strong>
        </div>
      </div>
    </header>
  );
}

