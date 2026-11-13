import { useState } from 'react';
// Notas 4.12 y 4.13: un estado y un manejador reutilizable por formulario.
export function useForm(initialState = {}) {
  const [formulario, setFormulario] = useState(initialState);
  const onChange = (value, campo) => setFormulario(previous => ({ ...previous, [campo]: value }));
  const reset = (next = initialState) => setFormulario(next);
  return { ...formulario, formulario, onChange, reset };
}
