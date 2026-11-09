import React from 'react';
import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App.jsx';

afterEach(cleanup);

test('React se renderiza en jsdom sin presentar la preparación como aplicación terminada', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'DIANA Inversions' })).toBeTruthy();
  expect(screen.getByText('Supabase y MongoDB todavía no están conectados.')).toBeTruthy();
});
