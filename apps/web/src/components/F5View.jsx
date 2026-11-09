// FIC: F5 quantitative view: Complex strategies (The Wheel & PMCC).
// FIC: Vista cuantitativa F5: Estrategias complejas (The Wheel y PMCC).

import React, { useState } from 'react';
import { api } from '../services/api.js';

export default function F5View() {
  const [strategy, setStrategy] = useState('wheel'); // 'wheel' | 'pmcc'
  const [wheelInputs, setWheelInputs] = useState({ strike: 490, premium_collected: 4.5 });
  const [pmccInputs, setPmccInputs] = useState({ stock_price: 500, leaps_premium: 85 });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [isStale, setIsStale] = useState(false);

  const handleWheelChange = (field, val) => {
    setWheelInputs(prev => ({ ...prev, [field]: val === '' ? '' : Number(val) }));
    setIsStale(true);
    setFeedback(null);
  };

  const handlePmccChange = (field, val) => {
    setPmccInputs(prev => ({ ...prev, [field]: val === '' ? '' : Number(val) }));
    setIsStale(true);
    setFeedback(null);
  };

  const handleCalculate = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      if (strategy === 'wheel') {
        const clean = {
          strike: Number(wheelInputs.strike),
          premium_collected: Number(wheelInputs.premium_collected)
        };
        const res = await api.calculateWheel(clean);
        setResult({ strategy: 'wheel', data: res, inputs: clean });
      } else {
        const clean = {
          stock_price: Number(pmccInputs.stock_price),
          leaps_premium: Number(pmccInputs.leaps_premium)
        };
        const res = await api.calculatePmcc(clean);
        setResult({ strategy: 'pmcc', data: res, inputs: clean });
      }
      setIsStale(false);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistory = async () => {
    if (!result || isStale) return;
    setLoading(true);
    setFeedback(null);
    try {
      const id = crypto.randomUUID();
      await api.saveHistory({
        id,
        operation: result.strategy,
        inputs: result.inputs
      });
      setFeedback({ type: 'success', message: `Estrategia guardada en MongoDB Atlas (ID: ${id}).` });
    } catch (err) {
      setFeedback({ type: 'error', message: `Fallo al guardar histórico: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <div className="grid-two-panels">
        {/* Panel Izquierdo: Configuración de Estrategia */}
        <section className="panel" aria-labelledby="f5-config-heading">
          <h3 id="f5-config-heading" className="panel-header">Estrategias Cuantitativas (F5)</h3>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className={`nav-btn ${strategy === 'wheel' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setStrategy('wheel'); setResult(null); setFeedback(null); }}
            >
              The Wheel
            </button>
            <button
              type="button"
              className={`nav-btn ${strategy === 'pmcc' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setStrategy('pmcc'); setResult(null); setFeedback(null); }}
            >
              PMCC
            </button>
          </div>

          {strategy === 'wheel' ? (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Cálculo del costo base efectivo por acción al ser asignado en una venta de Put cubierta o Covered Strangle.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="wheel-strike">Precio de Ejercicio (Strike, $):</label>
                <input
                  id="wheel-strike"
                  className="form-input"
                  type="number"
                  step="any"
                  value={wheelInputs.strike}
                  onChange={(e) => handleWheelChange('strike', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="wheel-premium">Prima Total Cobrada por Acción ($):</label>
                <input
                  id="wheel-premium"
                  className="form-input"
                  type="number"
                  step="any"
                  value={wheelInputs.premium_collected}
                  onChange={(e) => handleWheelChange('premium_collected', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Poor Man's Covered Call: Comparación de requerimiento de capital de 100 acciones contra un contrato de opción LEAPS profundo ITM.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="pmcc-stock">Precio Actual de la Acción (Stock Price, $):</label>
                <input
                  id="pmcc-stock"
                  className="form-input"
                  type="number"
                  step="any"
                  value={pmccInputs.stock_price}
                  onChange={(e) => handlePmccChange('stock_price', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pmcc-leaps">Prima de Opción LEAPS ITM por Acción ($):</label>
                <input
                  id="pmcc-leaps"
                  className="form-input"
                  type="number"
                  step="any"
                  value={pmccInputs.leaps_premium}
                  onChange={(e) => handlePmccChange('leaps_premium', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="sidebar-scope" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                ⚠️ <strong>Aviso Financiero:</strong> La reducción de capital requerido en PMCC no equivale a una reducción equivalente del riesgo de mercado.
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleCalculate}
              disabled={loading}
            >
              {strategy === 'wheel' ? 'Calcular Costo Base' : 'Comparar Requerimiento de Capital'}
            </button>
          </div>

          {feedback && (
            <div className={`feedback-box ${feedback.type}`} role="status">
              {feedback.message}
            </div>
          )}
        </section>

        {/* Panel Derecho: Resultados */}
        <section className="panel" aria-labelledby="f5-results-heading">
          <div className="panel-header">
            <h3 id="f5-results-heading">Análisis Cuantitativo</h3>
            {isStale && <span style={{ color: 'var(--accent-yellow)', fontSize: '0.8rem' }}>(Parámetros modificados)</span>}
          </div>

          {!result ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Selecciona una estrategia y pulsa el botón de cálculo para evaluar los requerimientos de capital y costos base.
            </p>
          ) : (
            <div>
              {result.strategy === 'wheel' ? (
                <div>
                  <div className="result-item">
                    <span className="result-label">Estrategia:</span>
                    <strong className="result-value">The Wheel</strong>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Costo Base Efectivo:</span>
                    <strong className="result-value">
                      ${result.data.cost_basis_per_share.toFixed(2)}
                      <span className="result-unit">/ acción</span>
                    </strong>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Múltiplo de Contrato:</span>
                    <span className="result-value">100 acciones</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Costo Base por Lote:</span>
                    <strong className="result-value">${(result.data.cost_basis_per_share * 100).toFixed(2)}</strong>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="result-item">
                    <span className="result-label">Capital 100 Acciones:</span>
                    <strong className="result-value">${result.data.stock_capital.toLocaleString()}</strong>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Capital Contrato LEAPS:</span>
                    <strong className="result-value">${result.data.leaps_capital.toLocaleString()}</strong>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Capital Ahorrado:</span>
                    <strong className="result-value" style={{ color: result.data.capital_saved >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      ${result.data.capital_saved.toLocaleString()}
                    </strong>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Porcentaje de Ahorro:</span>
                    <strong className="result-value" style={{ color: result.data.savings_percent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {result.data.savings_percent.toFixed(2)}%
                    </strong>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveHistory}
                  disabled={loading || isStale}
                  title="Guardar en MongoDB Atlas"
                >
                  Guardar en Histórico (MongoDB Atlas)
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

