import { useState } from 'react';
import { Button, Chip } from '@mui/material';
import { Add, Remove, RestartAlt } from '@mui/icons-material';
import { useCounter } from '../hooks/useCounter.js';
import PageHeading from '../components/PageHeading.jsx';
import { useAuth } from '../security/auth/AuthContext.jsx';
export default function HooksLab() {
  const [count, setCount] = useState(0); const counter = useCounter(10); const auth = useAuth();
  return <><PageHeading eyebrow="LABORATORIO / NOTAS 4.6–4.8" title="Hooks en acción" description="Cambia el estado y observa cómo React actualiza la interfaz."/><div className="lab-grid">{[{ title: 'useState', note: '4.6', value: count, change: n => setCount(c => c + n), reset: () => setCount(0) }, { title: 'useCounter', note: '4.7', value: counter.valor, change: counter.acumular, reset: counter.reset }].map(c => <section key={c.title} className="lab-card"><Chip size="small" label={`Nota ${c.note}`}/><h2>{c.title}</h2><p>{c.title === 'useState' ? 'Estado local dentro del componente.' : 'La lógica del contador vive en un hook reutilizable.'}</p><div className="counter-number" aria-live="polite">{c.value}</div><div className="counter-controls"><Button variant="outlined" aria-label={`Restar ${c.title}`} onClick={() => c.change(-1)}><Remove/></Button><Button startIcon={<RestartAlt/>} onClick={c.reset}>Reiniciar</Button><Button variant="contained" aria-label={`Sumar ${c.title}`} onClick={() => c.change(1)}><Add/></Button></div></section>)}</div><section className="lab-card reducer-card"><Chip label="Nota 4.8" size="small"/><h2>useReducer · Sesión</h2><p>El login utiliza acciones para pasar entre invitado, validando y autenticado. Puedes probar las transiciones desde Iniciar sesión y Cerrar sesión.</p><pre>{JSON.stringify({ status: auth.status, user: auth.user }, null, 2)}</pre></section></>;
}
