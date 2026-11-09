// FIC: Main Application Shell for DIANA Inversions Terminal.
// FIC: Shell principal de la aplicación para la Terminal DIANA Inversions.

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopHeader from './components/TopHeader.jsx';
import F0View from './components/F0View.jsx';
import F5View from './components/F5View.jsx';
import HistoryView from './components/HistoryView.jsx';
import { api } from './services/api.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState('f0');
  const [storageStatus, setStorageStatus] = useState({
    supabase: { status: 'checking' },
    mongodb: { status: 'checking' }
  });

  const checkStatus = async () => {
    try {
      const res = await api.getStorageStatus();
      setStorageStatus(res);
    } catch {
      setStorageStatus({
        supabase: { status: 'unavailable' },
        mongodb: { status: 'unavailable' }
      });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'f0': return 'F0 · Núcleo Cuantitativo (Black-Scholes & Griegas)';
      case 'f5': return 'F5 · Sistemas Complejos (The Wheel & PMCC)';
      case 'history': return 'Historial de Cálculos y Escenarios Guardados';
      default: return 'DIANA Inversions';
    }
  };

  return (
    <div className="terminal-layout">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
      <div className="content-area">
        <TopHeader title={getHeaderTitle()} storageStatus={storageStatus} />
        <main role="main">
          {currentTab === 'f0' && <F0View />}
          {currentTab === 'f5' && <F5View />}
          {currentTab === 'history' && <HistoryView />}
        </main>
      </div>
    </div>
  );
}
