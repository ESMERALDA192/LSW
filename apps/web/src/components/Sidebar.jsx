// FIC: Navigation sidebar for DIANA Inversions terminal.
// FIC: Barra lateral de navegación para la terminal DIANA Inversions.

import React from 'react';

export default function Sidebar({ currentTab, onSelectTab }) {
  const tabs = [
    { id: 'f0', label: 'F0 · Opciones (BSM & Griegas)' },
    { id: 'f5', label: 'F5 · Estrategias (Wheel & PMCC)' },
    { id: 'history', label: 'Historial & Escenarios' }
  ];

  return (
    <nav className="sidebar" aria-label="Navegación principal">
      <div className="brand-container">
        <h1 className="brand-title">DIANA Inversions</h1>
        <p className="brand-subtitle">Terminal Cuantitativa</p>
      </div>

      <div className="nav-links">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`nav-btn ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            aria-current={currentTab === tab.id ? 'page' : undefined}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-scope">
        <strong>Alcance visible de la demo:</strong>
        <p style={{ marginTop: '0.4rem' }}>
          Cálculos cuantitativos teóricos y persistencia real en la nube.
          Alpaca Paper Trading, Docker, Backspread y Gamma Scalping se integrarán en la entrega final.
        </p>
      </div>
    </nav>
  );
}

