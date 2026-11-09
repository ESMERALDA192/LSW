// FIC: Web API service client connecting React to F0, F5 and Persistence endpoints.
// FIC: Cliente de servicios API web que conecta React con endpoints de F0, F5 y Persistencia.

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data?.error?.message || `Error del servidor (${res.status})`);
    error.code = data?.error?.code || 'SERVER_ERROR';
    error.status = res.status;
    error.details = data?.error?.details || [];
    throw error;
  }
  return data;
}

export const api = {
  // Diagnóstico de almacenamiento
  async getStorageStatus() {
    const res = await fetch('/storage/status');
    return handleResponse(res);
  },

  // F0: Opciones
  async calculateCall(inputs) {
    const res = await fetch('/f0/black-scholes/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    return handleResponse(res);
  },

  async calculatePut(inputs) {
    const res = await fetch('/f0/black-scholes/put', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    return handleResponse(res);
  },

  async calculateGreeks(inputs) {
    const res = await fetch('/f0/greeks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    return handleResponse(res);
  },

  // F5: Estrategias
  async calculateWheel(inputs) {
    const res = await fetch('/f5/the-wheel/cost-basis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    return handleResponse(res);
  },

  async calculatePmcc(inputs) {
    const res = await fetch('/f5/pmcc/capital-savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    return handleResponse(res);
  },

  // Persistencia: Escenarios (Supabase)
  async saveScenario(scenario) {
    const res = await fetch('/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario)
    });
    return handleResponse(res);
  },

  async listScenarios() {
    const res = await fetch('/scenarios');
    return handleResponse(res);
  },

  // Persistencia: Historial (MongoDB Atlas)
  async saveHistory(record) {
    const res = await fetch('/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return handleResponse(res);
  },

  async listHistory() {
    const res = await fetch('/history');
    return handleResponse(res);
  }
};

