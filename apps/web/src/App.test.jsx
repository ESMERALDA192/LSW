import React from 'react';
import { afterEach, expect, test, vi, beforeEach } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App.jsx';

// FIC: Web component tests for DIANA Inversions terminal interface.
// FIC: Pruebas de componentes web para la interfaz de terminal DIANA Inversions.

beforeEach(() => {
  // Mock fetch para entorno jsdom
  globalThis.fetch = vi.fn(async (url) => {
    if (url.includes('/storage/status')) {
      return {
        ok: true,
        json: async () => ({
          supabase: { status: 'ready' },
          mongodb: { status: 'ready' }
        })
      };
    }
    if (url.includes('/scenarios')) {
      return {
        ok: true,
        json: async () => ({ items: [] })
      };
    }
    if (url.includes('/history')) {
      return {
        ok: true,
        json: async () => ({ items: [] })
      };
    }
    return { ok: true, json: async () => ({}) };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test('Renderiza la terminal financiera DIANA Inversions con navegación y estado de almacenamiento', async () => {
  render(<App />);

  // Título de marca e identidad
  expect(screen.getByRole('heading', { name: 'DIANA Inversions' })).toBeTruthy();
  expect(screen.getByText('Terminal Cuantitativa')).toBeTruthy();
  expect(screen.getByText('Demo Académica · Equipo 3')).toBeTruthy();

  // Diagnóstico de almacenamiento
  await waitFor(() => {
    expect(screen.getAllByText('Conectado').length).toBe(2);
  });

  // Formulario F0 por defecto
  expect(screen.getByLabelText(/Precio subyacente/i)).toBeTruthy();
  expect(screen.getByLabelText(/Precio de ejercicio/i)).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Calcular Call' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Calcular Put' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Calcular Griegas' })).toBeTruthy();

  // Navegación a F5
  const f5NavBtn = screen.getByRole('button', { name: /F5 · Estrategias/i });
  fireEvent.click(f5NavBtn);
  expect(screen.getByRole('heading', { name: 'Estrategias Cuantitativas (F5)' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'The Wheel' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'PMCC' })).toBeTruthy();

  // Navegación a Historial
  const historyNavBtn = screen.getByRole('button', { name: /Historial & Escenarios/i });
  fireEvent.click(historyNavBtn);
  expect(screen.getByRole('heading', { name: /Histórico de Cálculos Persistidos/i })).toBeTruthy();
});
