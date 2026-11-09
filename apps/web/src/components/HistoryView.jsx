// FIC: History and Scenarios view querying real cloud records from MongoDB Atlas and Supabase.
// FIC: Vista de historial y escenarios que consulta registros reales de MongoDB Atlas y Supabase.

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function HistoryView() {
  const [historyItems, setHistoryItems] = useState([]);
  const [scenariosItems, setScenariosItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hRes, sRes] = await Promise.allSettled([
        api.listHistory(),
        api.listScenarios()
      ]);

      if (hRes.status === 'fulfilled') {
        setHistoryItems(hRes.value.items || []);
      } else {
        setHistoryItems([]);
      }

      if (sRes.status === 'fulfilled') {
        setScenariosItems(sRes.value.items || []);
      } else {
        setScenariosItems([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatResult = (item) => {
    if (!item.result) return '-';
    if (item.operation === 'call' || item.operation === 'put') {
      return `$${item.result.theoretical_price?.toFixed(4)} (${item.result.option_type?.toUpperCase()})`;
    }
    if (item.operation === 'greeks') {
      return `Δ Call: ${item.result.call?.delta?.toFixed(4)}, Put: ${item.result.put?.delta?.toFixed(4)}`;
    }
    if (item.operation === 'wheel') {
      return `Costo Base: $${item.result.cost_basis_per_share?.toFixed(2)}`;
    }
    if (item.operation === 'pmcc') {
      return `Ahorro: $${item.result.capital_saved?.toLocaleString()} (${item.result.savings_percent?.toFixed(1)}%)`;
    }
    return JSON.stringify(item.result);
  };

  const formatInputs = (inputs) => {
    if (!inputs) return '-';
    return Object.entries(inputs)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
  };

  return (
    <div className="view-container">
      {/* Sección 1: Historial de Cálculos en MongoDB Atlas */}
      <section className="panel" style={{ marginBottom: '1.5rem' }} aria-labelledby="history-heading">
        <div className="panel-header">
          <h3 id="history-heading">Histórico de Cálculos Persistidos (MongoDB Atlas)</h3>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadData}
            disabled={loading}
            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
          >
            {loading ? 'Consultando...' : 'Actualizar Registros'}
          </button>
        </div>

        {error && (
          <div className="feedback-box error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {historyItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No hay registros de cálculos guardados aún en la colección `calculation_history` de MongoDB Atlas.
          </p>
        ) : (
          <div className="table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Operación</th>
                  <th>Parámetros de Entrada</th>
                  <th>Resultado Recalculado</th>
                  <th>Versión</th>
                  <th>Fecha UTC</th>
                  <th>UUID</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ textTransform: 'uppercase', color: 'var(--accent-blue)' }}>
                        {item.operation}
                      </strong>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{formatInputs(item.inputs)}</td>
                    <td style={{ fontWeight: 600 }}>{formatResult(item)}</td>
                    <td style={{ fontSize: '0.75rem' }}>v{item.calculation_version}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {item.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sección 2: Escenarios Registrados en Supabase */}
      <section className="panel" aria-labelledby="supabase-summary-heading">
        <div className="panel-header">
          <h3 id="supabase-summary-heading">Escenarios Registrados (Supabase PostgreSQL)</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total: {scenariosItems.length} escenarios
          </span>
        </div>

        {scenariosItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No hay escenarios guardados en la tabla `public.scenarios` de Supabase.
          </p>
        ) : (
          <div className="table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Nombre del Escenario</th>
                  <th className="num">Spot</th>
                  <th className="num">Strike</th>
                  <th className="num">Tiempo (Años)</th>
                  <th className="num">Tasa</th>
                  <th className="num">Volatilidad</th>
                  <th>Fecha de Creación</th>
                  <th>UUID</th>
                </tr>
              </thead>
              <tbody>
                {scenariosItems.map((sc) => (
                  <tr key={sc.id}>
                    <td><strong>{sc.name}</strong></td>
                    <td className="num">${sc.parameters?.spot}</td>
                    <td className="num">${sc.parameters?.strike}</td>
                    <td className="num">{sc.parameters?.time_years}</td>
                    <td className="num">{sc.parameters?.rate}</td>
                    <td className="num">{sc.parameters?.volatility}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(sc.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {sc.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

