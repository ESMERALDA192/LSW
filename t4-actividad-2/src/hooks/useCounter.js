import { useState } from 'react';
export function useCounter(initial = 0) {
  const [valor, setValor] = useState(initial);
  return { valor, acumular: amount => setValor(v => v + amount), reset: () => setValor(initial) };
}
