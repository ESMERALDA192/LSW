// FIC: F0 quantitative view: Black-Scholes options, Greeks and Supabase scenarios.
// FIC: Vista cuantitativa F0: Opciones Black-Scholes, Griegas y escenarios de Supabase.

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function F0View() {
  const [params, setParams] = useState({
    spot: 100,
    strike: 100,
    time_years: 1,
    rate: 0.05,
    volatility: 0.2
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [calcResult, setCalcResult] = useState(null); // { type: 'call' | 'put' | 'greeks', data: any, inputs: any }
  const [isStale, setIsStale] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenariosList, setScenariosList] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  const fetchScenarios = async () => {
    setLoadingScenarios(true);
    try {
      const res = await api.listScenarios();
      setScenariosList(res.items || []);
    } catch {
      // Si la base no está configurada, se maneja de forma silenciosa en la lista
    } finally {
      setLoadingScenarios(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleInputChange = (field, value) => {
    setParams(prev => ({ ...prev, [field]: value === '' ? '' : Number(value) }));
    setIsStale(true);
    setFeedback(null);
  };

  const getCleanInputs = () => ({
    spot: Number(params.spot),
    strike: Number(params.strike),
    time_years: Number(params.time_years),
    rate: Number(params.rate),
    volatility: Number(params.volatility)
  });

  const handleCalculate = async (type) => {
    setLoading(true);
    setFeedback(null);
    try {
      const clean = getCleanInputs();
      let res;
      if (type === 'call') res = await api.calculateCall(clean);
      else if (type === 'put') res = await api.calculatePut(clean);
      else if (type === 'greeks') res = await api.calculateGreeks(clean);

      setCalcResult({ type, data: res, inputs: clean });
      setIsStale(false);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistory = async () => {
    if (!calcResult || isStale) return;
    setLoading(true);
    setFeedback(null);
    try {
      const id = crypto.randomUUID();
      await api.saveHistory({
        id,
        operation: calcResult.type,
        inputs: calcResult.inputs
      });
      setFeedback({ type: 'success', message: `Cálculo guardado con éxito en MongoDB Atlas (ID: ${id}).` });
    } catch (err) {
      setFeedback({ type: 'error', message: `Fallo al guardar histórico: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScenario = async (e) => {
    e.preventDefault();
    if (!scenarioName.trim()) {
      setFeedback({ type: 'error', message: 'El nombre del escenario es obligatorio (1 a 80 caracteres).' });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const id = crypto.randomUUID();
      const clean = getCleanInputs();
      await api.saveScenario({
        id,
        name: scenarioName.trim(),
        parameters: clean
      });
      setFeedback({ type: 'success', message: `Escenario "${scenarioName.trim()}" guardado en Supabase (ID: ${id}).` });
      setScenarioName('');
      await fetchScenarios();
    } catch (err) {
      setFeedback({ type: 'error', message: `Fallo al guardar escenario: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadScenario = (sc) => {
    if (sc.parameters) {
      setParams({ ...sc.parameters });
      setIsStale(true);
      setCalcResult(null);
      setFeedback({ type: 'success', message: `Parámetros cargados del escenario "${sc.name}".` });
    }
  };

  return (
    <div className="view-container">
      <div className="grid-two-panels">
        {/* Panel Izquierdo: Parámetros */}
        <section className="panel" aria-labelledby="params-heading">
          <h3 id="params-heading" className="panel-header">Parámetros de Entrada (F0)</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="f0-spot">Precio subyacente (Spot, $):</label>
            <input
              id="f0-spot"
              className="form-input"
              type="number"
              step="any"
              value={params.spot}
              onChange={(e) => handleInputChange('spot', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="f0-strike">Precio de ejercicio (Strike, $):</label>
            <input
              id="f0-strike"
              className="form-input"
              type="number"
              step="any"
              value={params.strike}
              onChange={(e) => handleInputChange('strike', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="f0-time">Tiempo al vencimiento (Años):</label>
            <input
              id="f0-time"
              className="form-input"
              type="number"
              step="any"
              value={params.time_years}
              onChange={(e) => handleInputChange('time_years', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="f0-rate">Tasa libre de riesgo (Fracción, ej. 0.05 = 5%):</label>
            <input
              id="f0-rate"
              className="form-input"
              type="number"
              step="any"
              value={params.rate}
              onChange={(e) => handleInputChange('rate', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="f0-vol">Volatilidad anualizada (Fracción, ej. 0.20 = 20%):</label>
            <input
              id="f0-vol"
              className="form-input"
              type="number"
              step="any"
              value={params.volatility}
              onChange={(e) => handleInputChange('volatility', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleCalculate('call')}
              disabled={loading}
            >
              Calcular Call
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleCalculate('put')}
              disabled={loading}
            >
              Calcular Put
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleCalculate('greeks')}
              disabled={loading}
            >
              Calcular Griegas
            </button>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

          {/* Guardar Escenario en Supabase */}
          <form onSubmit={handleSaveScenario}>
            <div className="form-group">
              <label className="form-label" htmlFor="scenario-name">Guardar como escenario nombrado (Supabase):</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="scenario-name"
                  className="form-input"
                  type="text"
                  placeholder="Ej. Caso canónico Hull"
                  maxLength={80}
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="btn-secondary"
                  disabled={loading || !scenarioName.trim()}
                >
                  Guardar
                </button>
              </div>
            </div>
          </form>

          {feedback && (
            <div className={`feedback-box ${feedback.type}`} role="status">
              {feedback.message}
            </div>
          )}
        </section>

        {/* Panel Derecho: Resultados */}
        <section className="panel" aria-labelledby="results-heading">
          <div className="panel-header">
            <h3 id="results-heading">Resultados Cuantitativos</h3>
            {isStale && <span style={{ color: 'var(--accent-yellow)', fontSize: '0.8rem' }}>(Parámetros modificados)</span>}
          </div>

          {!calcResult ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Introduce los parámetros y selecciona un cálculo para visualizar los precios teóricos o sensibilidades analíticas.
            </p>
          ) : (
            <div>
              {calcResult.type === 'call' || calcResult.type === 'put' ? (
                <div>
                  <div className="result-item">
                    <span className="result-label">Tipo de Opción:</span>
                    <strong className="result-value" style={{ textTransform: 'uppercase' }}>{calcResult.data.option_type}</strong>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Precio Teórico:</span>
                    <strong className="result-value">
                      ${calcResult.data.theoretical_price.toFixed(4)}
                      <span className="result-unit">/ unidad</span>
                    </strong>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Modelo:</span>
                    <span className="result-value" style={{ fontSize: '0.9rem' }}>{calcResult.data.model}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>Sensibilidades (Griegas)</h4>
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Métrica</th>
                        <th className="num">Call</th>
                        <th className="num">Put</th>
                        <th>Convención</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Delta (Δ)</td>
                        <td className="num">{calcResult.data.call.delta.toFixed(6)}</td>
                        <td className="num">{calcResult.data.put.delta.toFixed(6)}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{calcResult.data.units.delta}</td>
                      </tr>
                      <tr>
                        <td>Gamma (Γ)</td>
                        <td className="num">{calcResult.data.call.gamma.toFixed(6)}</td>
                        <td className="num">{calcResult.data.put.gamma.toFixed(6)}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{calcResult.data.units.gamma}</td>
                      </tr>
                      <tr>
                        <td>Theta (Θ)</td>
                        <td className="num">{calcResult.data.call.theta.toFixed(6)}</td>
                        <td className="num">{calcResult.data.put.theta.toFixed(6)}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{calcResult.data.units.theta}</td>
                      </tr>
                      <tr>
                        <td>Vega (ν)</td>
                        <td className="num">{calcResult.data.call.vega.toFixed(6)}</td>
                        <td className="num">{calcResult.data.put.vega.toFixed(6)}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{calcResult.data.units.vega}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveHistory}
                  disabled={loading || isStale}
                  title={isStale ? 'Vuelve a calcular antes de guardar' : 'Guardar en MongoDB Atlas'}
                >
                  Guardar en Histórico (MongoDB Atlas)
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Sección Inferior: Escenarios guardados en Supabase */}
      <section className="panel" aria-labelledby="scenarios-heading">
        <div className="panel-header">
          <h3 id="scenarios-heading">Escenarios Guardados en Supabase</h3>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
            onClick={fetchScenarios}
            disabled={loadingScenarios}
          >
            {loadingScenarios ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {scenariosList.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No hay escenarios registrados en Supabase. Guarda tu primer escenario desde el formulario.
          </p>
        ) : (
          <div className="table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th className="num">Spot</th>
                  <th className="num">Strike</th>
                  <th className="num">Tiempo (Años)</th>
                  <th className="num">Tasa (r)</th>
                  <th className="num">Volatilidad (σ)</th>
                  <th>Fecha UTC</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {scenariosList.map((sc) => (
                  <tr key={sc.id}>
                    <td><strong>{sc.name}</strong></td>
                    <td className="num">${sc.parameters?.spot}</td>
                    <td className="num">${sc.parameters?.strike}</td>
                    <td className="num">{sc.parameters?.time_years}</td>
                    <td className="num">{(sc.parameters?.rate * 100).toFixed(2)}%</td>
                    <td className="num">{(sc.parameters?.volatility * 100).toFixed(2)}%</td>
                    <td style={{ fontSize: '0.75rem' }}>{new Date(sc.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleLoadScenario(sc)}
                      >
                        Cargar
                      </button>
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

